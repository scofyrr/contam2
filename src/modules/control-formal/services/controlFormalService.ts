import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  ContingenciaLibro,
  LegalizacionNotarial,
  LibroAfectado,
  MotivoContingencia,
  RegistrarContingenciaPayload,
  RegistrarContingenciaResult,
  SemaforoAlerta,
  SemaforoContingenciasResult,
  TipoLlevadoLibro,
} from "@/modules/control-formal/types/controlFormal";

type CfDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as CfDb;

type LegalizacionRow = {
  id: string;
  contribuyente_id: string;
  codigo_libro_tabla8: string;
  nombre_libro: string;
  numero_legalizacion: string;
  notaria_juzgado: string;
  fecha_legalizacion: string;
  folios_desde: number;
  folios_hasta: number;
  tipo_llevado: TipoLlevadoLibro;
  estado: LegalizacionNotarial["estado"];
  created_at: string;
  updated_at: string;
};

type ContingenciaRow = {
  id: string;
  contribuyente_id: string;
  fecha_ocurrencia: string;
  fecha_denuncia_policial: string | null;
  numero_denuncia_policial: string | null;
  comisaria: string | null;
  motivo: ContingenciaLibro["motivo"];
  libros_afectados: LibroAfectado[] | unknown;
  fecha_limite_comunicacion_15d: string;
  fecha_comunicacion_sunat: string | null;
  numero_expediente_sunat: string | null;
  fecha_limite_reconstruccion_60d: string;
  fecha_finalizacion_reconstruccion: string | null;
  prorroga_solicitada: boolean;
  fecha_solicitud_prorroga: string | null;
  estado_contingencia: ContingenciaLibro["estadoContingencia"];
  observaciones: string | null;
  created_at: string;
  updated_at: string;
};

function parseLibrosAfectados(raw: unknown): LibroAfectado[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      codigoLibroTabla8: String(o.codigoLibroTabla8 ?? o.codigo_libro_tabla8 ?? ""),
      nombreLibro: String(o.nombreLibro ?? o.nombre_libro ?? ""),
      foliosAfectados: o.foliosAfectados ? String(o.foliosAfectados) : o.folios_afectados ? String(o.folios_afectados) : undefined,
      observaciones: o.observaciones ? String(o.observaciones) : undefined,
    };
  });
}

function mapContingencia(row: ContingenciaRow): ContingenciaLibro {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    fechaOcurrencia: row.fecha_ocurrencia,
    fechaDenunciaPolicial: row.fecha_denuncia_policial,
    numeroDenunciaPolicial: row.numero_denuncia_policial,
    comisaria: row.comisaria,
    motivo: row.motivo,
    librosAfectados: parseLibrosAfectados(row.libros_afectados),
    fechaLimiteComunicacion15d: row.fecha_limite_comunicacion_15d,
    fechaComunicacionSunat: row.fecha_comunicacion_sunat,
    numeroExpedienteSunat: row.numero_expediente_sunat,
    fechaLimiteReconstruccion60d: row.fecha_limite_reconstruccion_60d,
    fechaFinalizacionReconstruccion: row.fecha_finalizacion_reconstruccion,
    prorrogaSolicitada: row.prorroga_solicitada,
    fechaSolicitudProrroga: row.fecha_solicitud_prorroga,
    estadoContingencia: row.estado_contingencia,
    observaciones: row.observaciones,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function countFoliosUtilizados(legalizacionId: string): Promise<number> {
  const { count, error } = await db
    .from("control_folios")
    .select("id", { count: "exact", head: true })
    .eq("legalizacion_id", legalizacionId)
    .in("estado_folio", ["IMPRESO", "ANULADO", "RESERVADO"]);

  throwIfSupabaseError(error, "Error al contar folios");
  return count ?? 0;
}

function mapLegalizacion(row: LegalizacionRow, foliosUtilizados: number): LegalizacionNotarial {
  const totalFolios = row.folios_hasta - row.folios_desde + 1;
  const porcentaje = totalFolios > 0 ? Math.round((foliosUtilizados / totalFolios) * 10000) / 100 : 0;
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoLibroTabla8: row.codigo_libro_tabla8,
    nombreLibro: row.nombre_libro,
    numeroLegalizacion: row.numero_legalizacion,
    notariaJuzgado: row.notaria_juzgado,
    fechaLegalizacion: row.fecha_legalizacion,
    foliosDesde: row.folios_desde,
    foliosHasta: row.folios_hasta,
    tipoLlevado: row.tipo_llevado,
    estado: row.estado,
    totalFolios,
    foliosUtilizados,
    porcentajeUtilizado: porcentaje,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchLegalizaciones(contribuyenteId: string): Promise<LegalizacionNotarial[]> {
  const { data, error } = await db
    .from("legalizaciones_notariales")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .order("fecha_legalizacion", { ascending: false });

  throwIfSupabaseError(error, "Error al cargar legalizaciones");

  const rows = (data ?? []) as unknown as LegalizacionRow[];
  const result: LegalizacionNotarial[] = [];

  for (const row of rows) {
    const utilizados = await countFoliosUtilizados(row.id);
    result.push(mapLegalizacion(row, utilizados));
  }

  return result;
}

export async function registrarLegalizacionNotarial(
  legalizacion: Partial<LegalizacionNotarial> & {
    contribuyenteId: string;
    codigoLibroTabla8: string;
    nombreLibro: string;
    numeroLegalizacion: string;
    notariaJuzgado: string;
    fechaLegalizacion: string;
    foliosDesde: number;
    foliosHasta: number;
  },
): Promise<LegalizacionNotarial> {
  const row = {
    contribuyente_id: legalizacion.contribuyenteId,
    codigo_libro_tabla8: legalizacion.codigoLibroTabla8,
    nombre_libro: legalizacion.nombreLibro,
    numero_legalizacion: legalizacion.numeroLegalizacion,
    notaria_juzgado: legalizacion.notariaJuzgado,
    fecha_legalizacion: legalizacion.fechaLegalizacion,
    folios_desde: legalizacion.foliosDesde,
    folios_hasta: legalizacion.foliosHasta,
    tipo_llevado: legalizacion.tipoLlevado ?? "HOJAS_SUELTAS",
    estado: legalizacion.estado ?? "ACTIVO",
  };

  const { data, error } = await db.from("legalizaciones_notariales").insert(row).select("*").single();
  throwIfSupabaseError(error, "Error al registrar legalización");

  const inserted = data as unknown as LegalizacionRow;
  return mapLegalizacion(inserted, 0);
}

export async function fetchContingencias(contribuyenteId: string): Promise<ContingenciaLibro[]> {
  const { data, error } = await db
    .from("contingencias_libros")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .order("fecha_ocurrencia", { ascending: false });

  throwIfSupabaseError(error, "Error al cargar contingencias");
  return ((data ?? []) as unknown as ContingenciaRow[]).map(mapContingencia);
}

export async function registrarContingencia(
  payload: RegistrarContingenciaPayload,
): Promise<RegistrarContingenciaResult> {
  const librosJson = payload.librosAfectados.map((l) => ({
    codigo_libro_tabla8: l.codigoLibroTabla8,
    nombre_libro: l.nombreLibro,
    folios_afectados: l.foliosAfectados ?? null,
    observaciones: l.observaciones ?? null,
  }));

  const { data, error } = await db.rpc("fn_registrar_contingencia_libro", {
    p_contribuyente_id: payload.contribuyenteId,
    p_fecha_ocurrencia: payload.fechaOcurrencia,
    p_motivo: payload.motivo,
    p_libros_afectados: librosJson,
    p_num_denuncia: payload.numeroDenunciaPolicial ?? null,
    p_comisaria: payload.comisaria ?? null,
  });

  throwIfSupabaseError(error, "Error al registrar contingencia");

  if (!data) throw new Error("Sin respuesta al registrar contingencia");

  const row = data as Record<string, unknown>;

  if (payload.observaciones && row.contingencia_id) {
    await db
      .from("contingencias_libros")
      .update({ observaciones: payload.observaciones })
      .eq("id", String(row.contingencia_id));
  }

  return {
    ok: Boolean(row.ok),
    contingenciaId: String(row.contingencia_id),
    fechaLimiteComunicacion15d: String(row.fecha_limite_comunicacion_15d),
    fechaLimiteReconstruccion60d: String(row.fecha_limite_reconstruccion_60d),
    estadoContingencia: String(row.estado_contingencia) as ContingenciaLibro["estadoContingencia"],
  };
}

function mapSemaforoAlerta(raw: Record<string, unknown>): SemaforoAlerta {
  return {
    contingenciaId: String(raw.contingencia_id),
    motivo: String(raw.motivo) as MotivoContingencia,
    estado: String(raw.estado) as ContingenciaLibro["estadoContingencia"],
    fechaOcurrencia: String(raw.fecha_ocurrencia),
    fechaLimiteComunicacion: String(raw.fecha_limite_comunicacion),
    fechaLimiteReconstruccion: String(raw.fecha_limite_reconstruccion),
    fechaComunicacionSunat: raw.fecha_comunicacion_sunat ? String(raw.fecha_comunicacion_sunat) : null,
    fechaFinalizacionReconstruccion: raw.fecha_finalizacion_reconstruccion
      ? String(raw.fecha_finalizacion_reconstruccion)
      : null,
    numeroDenunciaPolicial: raw.numero_denuncia_policial ? String(raw.numero_denuncia_policial) : null,
    librosAfectados: parseLibrosAfectados(raw.libros_afectados),
    diasHabilesTranscurridos: raw.dias_habiles_transcurridos != null ? Number(raw.dias_habiles_transcurridos) : null,
    diasRestantesComunicacion:
      raw.dias_restantes_comunicacion != null ? Number(raw.dias_restantes_comunicacion) : null,
    diasRestantesReconstruccion:
      raw.dias_restantes_reconstruccion != null ? Number(raw.dias_restantes_reconstruccion) : null,
    semaforo: String(raw.semaforo) as SemaforoAlerta["semaforo"],
    fechaLimite: String(raw.fecha_limite),
  };
}

export async function fetchSemaforoContingencias(
  contribuyenteId: string,
): Promise<SemaforoContingenciasResult> {
  const { data, error } = await db.rpc("fn_obtener_semaforo_contingencias", {
    p_contribuyente_id: contribuyenteId,
  });

  throwIfSupabaseError(error, "Error al obtener semáforo");

  if (!data) throw new Error("Semáforo vacío");

  const row = data as Record<string, unknown>;
  const resumenRaw = (row.resumen ?? {}) as Record<string, unknown>;
  const alertasRaw = (row.alertas ?? []) as Record<string, unknown>[];

  return {
    contribuyenteId: String(row.contribuyente_id),
    fechaEvaluacion: String(row.fecha_evaluacion),
    resumen: {
      totalActivas: Number(resumenRaw.total_activas ?? 0),
      rojas: Number(resumenRaw.rojas ?? 0),
      amarillas: Number(resumenRaw.amarillas ?? 0),
      verdes: Number(resumenRaw.verdes ?? 0),
    },
    alertas: alertasRaw.map(mapSemaforoAlerta),
  };
}

export async function fetchContribuyenteIdByRucCf(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
