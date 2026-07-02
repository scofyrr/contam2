import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  asientoTemplateEngine,
} from "@/modules/contabilidad/diario/services/asiento-template-engine";
import {
  calcularDiferenciasCambio,
  generarAsientoDiferenciaCambio,
} from "@/modules/contabilidad/diario/services/diferencia-cambio-service";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import { guardarAsientoManual } from "@/lib/libro-diario-service";
import { fetchPcgeCuentasActivas } from "@/lib/pcge-service";
import type { LineaAsientoInput } from "@/lib/sire-types";
import type { AsientoMetadata } from "@/modules/contabilidad/diario/types/templates";

export function usePlantillasAsiento() {
  return useQuery({
    queryKey: ["diario", "plantillas"],
    queryFn: () => asientoTemplateEngine.listarPlantillas(),
    staleTime: Infinity,
  });
}

export function useEvaluarPlantilla(templateId: string | null, parametros: Record<string, unknown>) {
  return useQuery({
    queryKey: ["diario", "plantilla-preview", templateId, parametros],
    queryFn: () => asientoTemplateEngine.evaluarTemplate(templateId!, parametros),
    enabled: !!templateId,
  });
}

export function useValidarAsiento(
  lineas: LineaAsientoInput[],
  metadata: AsientoMetadata,
  enabled = true,
) {
  const cuentasQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas,
    staleTime: 300_000,
  });

  return useQuery({
    queryKey: ["diario", "validacion", lineas, metadata],
    queryFn: () => {
      const cuentas = new Set((cuentasQuery.data ?? []).map((c) => c.codigo_cuenta.replace(/\./g, "")));
      return validarAsientoCompleto(lineas, metadata, { cuentasValidas: cuentas });
    },
    enabled: enabled && lineas.length > 0 && !cuentasQuery.isLoading,
  });
}

export function useDiferenciasCambio(ruc: string | null, moneda = "USD") {
  return useQuery({
    queryKey: ["diario", "diferencia-cambio", ruc, moneda],
    queryFn: () => calcularDiferenciasCambio(ruc!, moneda),
    enabled: !!ruc?.trim(),
    staleTime: 120_000,
  });
}

export function useGenerarAsientoDC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { ruc: string; periodo: string; resumen: Awaited<ReturnType<typeof calcularDiferenciasCambio>> }) =>
      generarAsientoDiferenciaCambio(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
  });
}

export function useGuardarAsientoDesdePlantilla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      ruc: string;
      periodo: string;
      fecha: string;
      glosa: string;
      templateId: string;
      parametros: Record<string, unknown>;
    }) => {
      const evaluacion = asientoTemplateEngine.evaluarTemplate(params.templateId, params.parametros);
      if (!evaluacion.cuadra) throw new Error(evaluacion.errores.join("; "));
      const lineas = asientoTemplateEngine.aLineasAsiento(evaluacion, params.glosa);
      await guardarAsientoManual({
        ruc: params.ruc,
        periodo: params.periodo,
        fecha: params.fecha,
        glosa: params.glosa,
        lineas,
      });
      return evaluacion;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
  });
}

export { asientoTemplateEngine, validarAsientoCompleto, calcularDiferenciasCambio };
