import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  AlertaFlujo,
  AlertaSeveridad,
  EstadoFlujoPeriodoResponse,
  MetricasFlujoPeriodo,
  PasoEstado,
  PasoStatus,
  PeriodoCierreStatus,
} from "@/modules/workflow/types/workflow";

type WorkflowDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
};

const db = supabase as unknown as WorkflowDb;

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapPaso(raw: Record<string, unknown>): PasoStatus {
  return {
    pasoNumero: Number(raw.paso_numero ?? raw.pasoNumero ?? 0),
    titulo: String(raw.titulo ?? ""),
    descripcion: String(raw.descripcion ?? ""),
    estado: String(raw.estado ?? "PENDIENTE") as PasoEstado,
    rutaModulo: String(raw.ruta_modulo ?? raw.rutaModulo ?? "/"),
  };
}

function mapAlerta(raw: Record<string, unknown>): AlertaFlujo {
  return {
    id: String(raw.id ?? `alerta-${raw.paso_relacionado ?? 0}-${String(raw.mensaje ?? "").slice(0, 24)}`),
    severidad: String(raw.severidad ?? "INFO") as AlertaSeveridad,
    mensaje: String(raw.mensaje ?? ""),
    accionTexto: String(raw.accion_texto ?? raw.accionTexto ?? "Ver detalle"),
    accionRuta: String(raw.accion_ruta ?? raw.accionRuta ?? "/workflow"),
    pasoRelacionado: Number(raw.paso_relacionado ?? raw.pasoRelacionado ?? 0),
  };
}

function mapMetricas(raw: Record<string, unknown>): MetricasFlujoPeriodo {
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
    estadoRce: raw.estado_rce != null ? String(raw.estado_rce) : null,
  };
}

function mapPeriodoCierre(raw: Record<string, unknown>): PeriodoCierreStatus {
  return {
    pasoActual: Number(raw.paso_actual ?? 1),
    paso1RucOk: Boolean(raw.paso_1_ruc_ok),
    paso2SireOk: Boolean(raw.paso_2_sire_ok),
    paso3ProvisionOk: Boolean(raw.paso_3_provision_ok),
    paso4CajaOk: Boolean(raw.paso_4_caja_ok),
    paso5LibrosCerrados: Boolean(raw.paso_5_libros_cerrados),
    observaciones: asRecord(raw.observaciones),
  };
}

function mapEstadoFlujoPeriodo(raw: Record<string, unknown>): EstadoFlujoPeriodoResponse {
  const pasosRaw = raw.pasos;
  const alertasRaw = raw.alertas;

  return {
    contribuyenteId: String(raw.contribuyente_id ?? ""),
    periodo: String(raw.periodo ?? ""),
    porcentajeAvance: Number(raw.porcentaje_avance ?? 0),
    pasoSugerido: Number(raw.paso_sugerido ?? 1),
    pasos: Array.isArray(pasosRaw)
      ? pasosRaw.map((p) => mapPaso(p as Record<string, unknown>))
      : [],
    alertas: Array.isArray(alertasRaw)
      ? alertasRaw.map((a) => mapAlerta(a as Record<string, unknown>))
      : [],
    diarioCuadrado: Boolean(raw.diario_cuadrado),
    metricas: mapMetricas(asRecord(raw.metricas)),
    periodoCierre: mapPeriodoCierre(asRecord(raw.periodo_cierre)),
  };
}

export async function fetchEstadoFlujoPeriodo(
  contribuyenteId: string,
  periodo: string,
): Promise<EstadoFlujoPeriodoResponse> {
  const periodoClean = cleanPeriodo(periodo);
  const { data, error } = await db.rpc("fn_obtener_estado_flujo_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean,
  });
  throwIfSupabaseError(error, "Error al obtener estado del flujo contable");
  return mapEstadoFlujoPeriodo(asRecord(data));
}

export async function marcarPasoWorkflow(
  contribuyenteId: string,
  periodo: string,
  paso: number,
  completado: boolean,
): Promise<PeriodoCierreStatus> {
  const periodoClean = cleanPeriodo(periodo);
  const { data, error } = await db.rpc("fn_avanzar_paso_workflow", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean,
    p_paso: paso,
    p_completado: completado,
  });
  throwIfSupabaseError(error, "Error al actualizar paso del workflow");
  const payload = asRecord(data);
  return mapPeriodoCierre(asRecord(payload.periodo_cierre));
}
