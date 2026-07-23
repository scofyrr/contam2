import { a as createLucideIcon } from "./index-CwvZaaA2.js";
import { u as useQuery } from "./useQuery-yGnE4xdj.js";
import { ab as supabase, ac as throwIfSupabaseError, aq as useQueryClient } from "./router-DdOnzL1Y.js";
import { u as useMutation } from "./useMutation-CF5vIByn.js";
import { U as reactExports } from "./server-BtEtmoed.js";
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);
const db = supabase;
function cleanPeriodo(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function mapPaso(raw) {
  return {
    pasoNumero: Number(raw.paso_numero ?? raw.pasoNumero ?? 0),
    titulo: String(raw.titulo ?? ""),
    descripcion: String(raw.descripcion ?? ""),
    estado: String(raw.estado ?? "PENDIENTE"),
    rutaModulo: String(raw.ruta_modulo ?? raw.rutaModulo ?? "/")
  };
}
function mapAlerta(raw) {
  return {
    id: String(raw.id ?? `alerta-${raw.paso_relacionado ?? 0}-${String(raw.mensaje ?? "").slice(0, 24)}`),
    severidad: String(raw.severidad ?? "INFO"),
    mensaje: String(raw.mensaje ?? ""),
    accionTexto: String(raw.accion_texto ?? raw.accionTexto ?? "Ver detalle"),
    accionRuta: String(raw.accion_ruta ?? raw.accionRuta ?? "/workflow"),
    pasoRelacionado: Number(raw.paso_relacionado ?? raw.pasoRelacionado ?? 0)
  };
}
function mapMetricas(raw) {
  return {
    rcePendientesProvision: Number(raw.rce_pendientes_provision ?? 0),
    rviePendientesProvision: Number(raw.rvie_pendientes_provision ?? 0),
    comprasPendientesTesoreria: Number(raw.compras_pendientes_tesoreria ?? 0),
    ventasPendientesTesoreria: Number(raw.ventas_pendientes_tesoreria ?? 0),
    inconsistenciasSireBloqueantes: Number(raw.inconsistencias_sire_bloqueantes ?? 0),
    inconsistenciasSireAlertas: Number(raw.inconsistencias_sire_alertas ?? 0),
    totalAsientosDiario: Number(raw.total_asientos_diario ?? 0),
    sumaDebe: Number(raw.suma_debe ?? 0),
    sumaHaber: Number(raw.suma_haber ?? 0),
    regimenTributario: raw.regimen_tributario != null ? String(raw.regimen_tributario) : null,
    estadoRvie: raw.estado_rvie != null ? String(raw.estado_rvie) : null,
    estadoRce: raw.estado_rce != null ? String(raw.estado_rce) : null
  };
}
function mapPeriodoCierre(raw) {
  return {
    pasoActual: Number(raw.paso_actual ?? 1),
    paso1RucOk: Boolean(raw.paso_1_ruc_ok),
    paso2SireOk: Boolean(raw.paso_2_sire_ok),
    paso3ProvisionOk: Boolean(raw.paso_3_provision_ok),
    paso4CajaOk: Boolean(raw.paso_4_caja_ok),
    paso5LibrosCerrados: Boolean(raw.paso_5_libros_cerrados),
    observaciones: asRecord(raw.observaciones)
  };
}
function mapEstadoFlujoPeriodo(raw) {
  const pasosRaw = raw.pasos;
  const alertasRaw = raw.alertas;
  return {
    contribuyenteId: String(raw.contribuyente_id ?? ""),
    periodo: String(raw.periodo ?? ""),
    porcentajeAvance: Number(raw.porcentaje_avance ?? 0),
    pasoSugerido: Number(raw.paso_sugerido ?? 1),
    pasos: Array.isArray(pasosRaw) ? pasosRaw.map((p) => mapPaso(p)) : [],
    alertas: Array.isArray(alertasRaw) ? alertasRaw.map((a) => mapAlerta(a)) : [],
    diarioCuadrado: Boolean(raw.diario_cuadrado),
    metricas: mapMetricas(asRecord(raw.metricas)),
    periodoCierre: mapPeriodoCierre(asRecord(raw.periodo_cierre))
  };
}
async function fetchEstadoFlujoPeriodo(contribuyenteId, periodo) {
  const periodoClean = cleanPeriodo(periodo);
  const { data, error } = await db.rpc("fn_obtener_estado_flujo_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean
  });
  throwIfSupabaseError(error, "Error al obtener estado del flujo contable");
  return mapEstadoFlujoPeriodo(asRecord(data));
}
async function marcarPasoWorkflow(contribuyenteId, periodo, paso, completado) {
  const periodoClean = cleanPeriodo(periodo);
  const { data, error } = await db.rpc("fn_avanzar_paso_workflow", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean,
    p_paso: paso,
    p_completado: completado
  });
  throwIfSupabaseError(error, "Error al actualizar paso del workflow");
  const payload = asRecord(data);
  return mapPeriodoCierre(asRecord(payload.periodo_cierre));
}
const workflowQueryKeys = {
  all: ["workflow"],
  estado: (contribuyenteId, periodo) => ["workflow", "estado", contribuyenteId, periodo]
};
function invalidateWorkflowQueries(queryClient, contribuyenteId, periodo) {
  if (contribuyenteId && periodo) {
    void queryClient.invalidateQueries({
      queryKey: workflowQueryKeys.estado(contribuyenteId, periodo)
    });
  } else {
    void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });
  }
}
function useWorkflowWizard(contribuyenteId, periodo, enabled = true) {
  const queryClient = useQueryClient();
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";
  const isReady = enabled && !!contribuyenteId && periodoClean.length === 6;
  const estadoQuery = useQuery({
    queryKey: workflowQueryKeys.estado(contribuyenteId, periodoClean),
    queryFn: () => fetchEstadoFlujoPeriodo(contribuyenteId, periodoClean),
    enabled: isReady,
    staleTime: 15e3,
    refetchOnWindowFocus: true,
    refetchInterval: 6e4
  });
  const marcarPasoMutation = useMutation({
    mutationFn: ({
      paso,
      completado
    }) => marcarPasoWorkflow(contribuyenteId, periodoClean, paso, completado),
    onSuccess: () => {
      invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
      void queryClient.invalidateQueries({ queryKey: ["contabilidad"] });
      void queryClient.invalidateQueries({ queryKey: ["tesoreria"] });
      void queryClient.invalidateQueries({ queryKey: ["libro-mayor"] });
      void queryClient.invalidateQueries({ queryKey: ["compras-ventas"] });
    }
  });
  reactExports.useEffect(() => {
    if (!isReady || !contribuyenteId) return;
    const channel = supabase.channel(`workflow-${contribuyenteId}-${periodoClean}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "periodos_cierre_status",
        filter: `contribuyente_id=eq.${contribuyenteId}`
      },
      () => {
        invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
      }
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "compras_rce",
        filter: `contribuyente_id=eq.${contribuyenteId}`
      },
      () => {
        invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
      }
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ventas_rvie",
        filter: `contribuyente_id=eq.${contribuyenteId}`
      },
      () => {
        invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
      }
    ).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [contribuyenteId, periodoClean, isReady, queryClient]);
  return {
    estado: estadoQuery.data,
    isLoading: estadoQuery.isLoading,
    isFetching: estadoQuery.isFetching,
    isError: estadoQuery.isError,
    error: estadoQuery.error,
    refetch: estadoQuery.refetch,
    marcarPaso: marcarPasoMutation.mutateAsync,
    isMarcandoPaso: marcarPasoMutation.isPending
  };
}
const PASO_ESTADO_COLORS = {
  COMPLETADO: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
  EN_PROGRESO: "border-yellow-400/70 bg-yellow-400/10 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.25)]",
  PENDIENTE: "border-slate-600/60 bg-slate-800/40 text-slate-400",
  BLOQUEADO: "border-slate-700/80 bg-slate-950/60 text-slate-500"
};
const ALERTA_SEVERIDAD_COLORS = {
  INFO: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  ADVERTENCIA: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  BLOQUEANTE: "border-red-500/60 bg-red-950/40 text-red-200"
};
export {
  ALERTA_SEVERIDAD_COLORS as A,
  PASO_ESTADO_COLORS as P,
  ArrowRight as a,
  useWorkflowWizard as u
};
