import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchComprobantesSire,
  fetchEstadoFuentePeriodo,
  fetchInconsistencias,
  fetchResumenPeriodo,
  generarYDescargarTxtSire,
  persistirEstadoFuenteSync,
  sincronizarPropuestaSire,
} from "@/modules/sire/services/sireService";
import {
  SireSyncError,
  type SireSyncRequest,
  type SireSyncResponse,
  type SireTipoRegistro,
} from "@/modules/sire/types/sire-core";

const SECRETS_HELP_COMMAND = `# 1) Portal SOL (e-menu.sunat.gob.pe) → Empresas → Credenciales API SUNAT
#    Copie Client ID y Client Secret generados para el RUC 20602438342

npx supabase secrets set SUNAT_CLIENT_ID="su_client_id"
npx supabase secrets set SUNAT_CLIENT_SECRET="su_client_secret"

# 2) En la app: Contribuyentes → OSMICE E.I.R.L. → Central de credenciales → CLAVE SOL
#    Usuario SOL (ej. MODDATOS) + Clave SOL del portal SUNAT`;

export const sireCoreQueryKeys = {
  all: ["sire-core"] as const,
  resumen: (contribuyenteId: string | null, periodo: string) =>
    ["sire-core", "resumen", contribuyenteId, periodo] as const,
  comprobantes: (
    contribuyenteId: string | null,
    periodo: string,
    tipo: SireTipoRegistro | "ALL",
  ) => ["sire-core", "comprobantes", contribuyenteId, periodo, tipo] as const,
  inconsistencias: (contribuyenteId: string | null, periodo: string) =>
    ["sire-core", "inconsistencias", contribuyenteId, periodo] as const,
  estadoFuente: (contribuyenteId: string | null, periodo: string) =>
    ["sire-core", "estado-fuente", contribuyenteId, periodo] as const,
};

async function invalidateSireRelatedQueries(
  qc: ReturnType<typeof useQueryClient>,
  contribuyenteId: string,
  periodo: string,
  tipoRegistro?: SireTipoRegistro,
) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  await Promise.all([
    qc.invalidateQueries({ queryKey: sireCoreQueryKeys.all }),
    qc.invalidateQueries({ queryKey: sireCoreQueryKeys.resumen(contribuyenteId, periodoClean) }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, "ALL"),
    }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.inconsistencias(contribuyenteId, periodoClean),
    }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.estadoFuente(contribuyenteId, periodoClean),
    }),
    tipoRegistro
      ? qc.invalidateQueries({
          queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, tipoRegistro),
        })
      : Promise.resolve(),
    qc.invalidateQueries({ queryKey: ["compras-ventas"] }),
    qc.invalidateQueries({ queryKey: ["compras_rce"] }),
    qc.invalidateQueries({ queryKey: ["ventas_rvie"] }),
    qc.invalidateQueries({ queryKey: ["workflow"] }),
    qc.invalidateQueries({ queryKey: ["registros_sire_cabecera"] }),
    qc.invalidateQueries({ queryKey: ["sire"] }),
  ]);
}

function copySecretsCommand() {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(SECRETS_HELP_COMMAND);
    toast.message("Comando copiado al portapapeles");
  }
}

function notifySyncSuccess(result: SireSyncResponse) {
  const baseMsg = `🟢 SIRE sincronizado con SUNAT real (${result.insertados} nuevos, ${result.actualizados} actualizados)`;
  const msg =
    result.inconsistencias > 0
      ? `${baseMsg} — ${result.inconsistencias} inconsistencia(s) detectada(s)`
      : baseMsg;

  toast.success(msg, { duration: 8000 });

  if (result.advertenciaFallback) {
    toast.message(result.advertenciaFallback, { duration: 10000 });
  }
}

function notifySyncSimulation(result: SireSyncResponse) {
  const motivo =
    result.advertenciaSimulacion ||
    result.error ||
    "Token API no configurado o error en la API externa";

  toast.warning(
    `⚠️ Modo Simulación Activo: Se cargaron datos de prueba locales. Motivo: ${motivo}`,
    { duration: 12000 },
  );

  if (result.inconsistencias > 0) {
    toast.message(`${result.inconsistencias} inconsistencia(s) detectada(s) en los datos simulados.`);
  }
}

function notifySyncError(error: SireSyncError | Error) {
  if (error instanceof SireSyncError) {
    const isConfig =
      error.fuente === "ERROR_CONFIGURACION" ||
      error.httpStatus === 400 ||
      error.httpStatus === 401 ||
      error.httpStatus === 403;

    if (isConfig) {
      toast.error(`🔴 Error de Conexión SUNAT: ${error.message}`, {
        duration: 15000,
        action: {
          label: "Copiar comando",
          onClick: copySecretsCommand,
        },
      });
      return;
    }

    toast.error(`🔴 Error de Conexión SUNAT: ${error.message}`, {
      duration: 12000,
      description: error.detalle ? error.detalle.slice(0, 180) : undefined,
    });
    return;
  }

  toast.error(`🔴 Error de Conexión SUNAT: ${error.message || "Sincronización SIRE fallida"}`, {
    duration: 10000,
    action: {
      label: "Copiar comando",
      onClick: copySecretsCommand,
    },
  });
}

export function useSireResumenPeriodo(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  return useQuery({
    queryKey: sireCoreQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () => fetchResumenPeriodo(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useSireComprobantesPeriodo(
  contribuyenteId: string | null,
  periodo: string,
  tipoRegistro: SireTipoRegistro,
  enabled = true,
) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  return useQuery({
    queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, tipoRegistro),
    queryFn: () =>
      fetchComprobantesSire({
        contribuyenteId: contribuyenteId!,
        periodo: periodoClean,
        tipoRegistro,
      }),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSireInconsistenciasPeriodo(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  return useQuery({
    queryKey: sireCoreQueryKeys.inconsistencias(contribuyenteId, periodoClean),
    queryFn: () =>
      fetchInconsistencias({
        contribuyenteId: contribuyenteId!,
        periodo: periodoClean,
        soloPendientes: true,
      }),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
  });
}

export function useSireEstadoFuentePeriodo(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  return useQuery({
    queryKey: sireCoreQueryKeys.estadoFuente(contribuyenteId, periodoClean),
    queryFn: () => fetchEstadoFuentePeriodo(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useSireSync() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (request: SireSyncRequest) => sincronizarPropuestaSire(request),
    onSuccess: async (result) => {
      if (result.fuente === "DECOLECTA" || result.fuente === "SUNAT_DIRECTO") {
        notifySyncSuccess(result);
      } else if (result.fuente === "SIMULACION") {
        notifySyncSimulation(result);
      } else {
        toast.error(`🔴 Error de Conexión SUNAT: ${result.error ?? "Fuente de sync desconocida"}`);
      }

      await invalidateSireRelatedQueries(
        qc,
        result.contribuyenteId,
        result.periodo,
        result.tipoRegistro,
      );
    },
    onError: (error: Error, variables) => {
      if (error instanceof SireSyncError) {
        persistirEstadoFuenteSync(variables.contribuyenteId, variables.periodo, {
          fuente: error.fuente,
          ultimoError: error.message,
          tipoRegistro: variables.tipoRegistro,
        });
      }

      notifySyncError(error);
    },
  });
}

export function useDescargarTxtSire() {
  return useMutation({
    mutationFn: generarYDescargarTxtSire,
    onSuccess: (archivo) => {
      toast.success(`Archivo ${archivo.nombreArchivo} descargado`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo generar el archivo TXT");
    },
  });
}
