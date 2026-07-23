import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { parsearArchivoImportacion } from "@/modules/importador/services/excelTemplateService";
import {
  buscarDuplicadosEnBd,
  crearLoteImportacion,
  fetchContribuyenteIdByRucImport,
  procesarLoteImportacion,
} from "@/modules/importador/services/importadorService";
import {
  parsePdfInvoice,
  parsedPdfToImportRow,
} from "@/modules/importador/services/pdfOcrParser";
import type {
  FilaImportNormalizada,
  ImportacionOrigen,
  ImportacionTipoLote,
  PreflightSummary,
  ProcesarLoteResult,
} from "@/modules/importador/types/importador";
import { ejecutarPreflightValidacion } from "@/modules/importador/utils/preflightValidator";

export type ImportadorPhase =
  | "idle"
  | "parsing"
  | "validating"
  | "ready"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export interface UseImportadorState {
  phase: ImportadorPhase;
  fileName: string | null;
  origen: ImportacionOrigen | null;
  tipoLote: ImportacionTipoLote | null;
  preflight: PreflightSummary | null;
  progress: number;
  error: string | null;
  lastResult: ProcesarLoteResult | null;
}

const initialState: UseImportadorState = {
  phase: "idle",
  fileName: null,
  origen: null,
  tipoLote: null,
  preflight: null,
  progress: 0,
  error: null,
  lastResult: null,
};

function tipoLoteFromPlantilla(tipo: string, override?: ImportacionTipoLote): ImportacionTipoLote {
  if (override) return override;
  if (tipo === "VENTAS") return "VENTAS";
  if (tipo === "ASIENTOS") return "ASIENTOS_MANUALES";
  return "COMPRAS";
}

export function useImportador() {
  const qc = useQueryClient();
  const [state, setState] = useState<UseImportadorState>(initialState);

  const reset = useCallback(() => setState(initialState), []);

  const parseAndValidate = useCallback(
    async (params: {
      file: File;
      contribuyenteId: string;
      periodoActivo: string;
      tipoLoteOverride?: ImportacionTipoLote;
    }) => {
      setState((s) => ({
        ...s,
        phase: "parsing",
        fileName: params.file.name,
        progress: 10,
        error: null,
        preflight: null,
        lastResult: null,
      }));

      try {
        const ext = params.file.name.split(".").pop()?.toLowerCase() ?? "";
        let filas: FilaImportNormalizada[] = [];
        let origen: ImportacionOrigen;
        let tipoLote: ImportacionTipoLote;

        if (ext === "pdf") {
          origen = "PDF_OCR";
          const invoice = await parsePdfInvoice(params.file);
          filas = [parsedPdfToImportRow(invoice, 2)];
          tipoLote = params.tipoLoteOverride ?? "COMPRAS";
        } else {
          const parsed = await parsearArchivoImportacion(params.file);
          origen = parsed.origen;
          filas = parsed.filas;
          tipoLote = tipoLoteFromPlantilla(parsed.tipoDetectado, params.tipoLoteOverride);
        }

        setState((s) => ({ ...s, phase: "validating", progress: 40 }));

        const duplicadosBd = await buscarDuplicadosEnBd({
          contribuyenteId: params.contribuyenteId,
          tipoLote,
          periodo: params.periodoActivo,
        });

        const preflight = ejecutarPreflightValidacion({
          filas,
          tipoLote,
          periodoActivo: params.periodoActivo.replace(/\D/g, "").slice(0, 6),
          duplicadosEnBd: duplicadosBd,
        });

        setState({
          phase: "ready",
          fileName: params.file.name,
          origen,
          tipoLote,
          preflight,
          progress: 100,
          error: null,
          lastResult: null,
        });

        return preflight;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al procesar archivo";
        setState((s) => ({ ...s, phase: "error", error: message, progress: 0 }));
        toast.error(message);
        throw err;
      }
    },
    [],
  );

  const confirmImport = useMutation({
    mutationFn: async (params: {
      contribuyenteId: string;
      periodoActivo: string;
    }) => {
      if (!state.preflight || !state.origen || !state.tipoLote || !state.fileName) {
        throw new Error("No hay datos validados para importar");
      }

      setState((s) => ({ ...s, phase: "uploading", progress: 20 }));

      const loteId = await crearLoteImportacion({
        contribuyenteId: params.contribuyenteId,
        origen: state.origen,
        tipoLote: state.tipoLote,
        nombreArchivo: state.fileName,
        periodoContable: params.periodoActivo,
        filasPreflight: state.preflight.filas,
      });

      setState((s) => ({ ...s, phase: "processing", progress: 60 }));

      const result = await procesarLoteImportacion(loteId);

      setState((s) => ({
        ...s,
        phase: "done",
        progress: 100,
        lastResult: result,
      }));

      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Importación completada: ${result.registrosExitosos} registro(s) procesado(s), ${result.registrosConError} con error`,
      );
      void qc.invalidateQueries({ queryKey: ["registros_sire"] });
      void qc.invalidateQueries({ queryKey: ["sire-core"] });
      void qc.invalidateQueries({ queryKey: ["importador"] });
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, phase: "error", error: err.message }));
      toast.error(err.message);
    },
  });

  return {
    state,
    reset,
    parseAndValidate,
    confirmImport,
    resolveContribuyenteId: fetchContribuyenteIdByRucImport,
  };
}
