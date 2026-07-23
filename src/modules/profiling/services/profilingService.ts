import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  Contribuyente,
  ContribuyenteAnexo,
  ContribuyenteIngresosAnuales,
  ContribuyenteRepresentante,
  ContribuyenteTributo,
  EstudioContable,
  EstudioUsuario,
  FichaRucDecolecta,
  FormatoLibroDiario,
  LibroObligado,
  ProfilingResult,
  RegimenTributario,
  UpsertContribuyenteResult,
} from "@/modules/profiling/types/profiling";

type ProfilingDb = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>,
  ) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as ProfilingDb;

type ContribuyenteRow = {
  id: string;
  estudio_id: string | null;
  ruc: string;
  razon_social: string;
  nombre_comercial: string | null;
  estado_contribuyente: string | null;
  condicion_domicilio: string | null;
  codigo_regimen: RegimenTributario | null;
  direccion_fiscal: string | null;
  ubigeo: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  sistema_emision: string | null;
  sistema_contabilidad: string | null;
  actividad_economica_principal: string | null;
  fecha_inicio_actividades: string | null;
  es_agente_retencion: boolean;
  es_agente_percepcion: boolean;
  es_buen_contribuyente: boolean;
  estado: string;
  created_at: string;
  updated_at: string;
};

type AnexoRow = {
  id: string;
  contribuyente_id: string;
  codigo_anexo: string;
  tipo_establecimiento: string | null;
  direccion: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  estado: string;
};

type RepresentanteRow = {
  id: string;
  contribuyente_id: string;
  tipo_documento: string;
  numero_documento: string;
  nombre_completo: string;
  cargo: string | null;
  fecha_desde: string | null;
  estado: string;
};

type TributoRow = {
  id: string;
  contribuyente_id: string;
  codigo_tributo: string;
  descripcion_tributo: string | null;
  fecha_afectacion: string | null;
  estado: string;
};

type IngresosRow = {
  id: string;
  contribuyente_id: string;
  ejercicio: number;
  ingresos_brutos_soles: number;
  uit_monto: number;
  ingresos_brutos_uit: number;
};

type ProfilingRpcRow = {
  contribuyente_id: string;
  ruc: string;
  razon_social: string;
  ejercicio: number;
  codigo_regimen: RegimenTributario | null;
  estado_contribuyente: string | null;
  condicion_domicilio: string | null;
  ingresos_brutos_soles: number;
  uit_monto: number;
  ingresos_brutos_uit: number;
  formato_libro_diario: FormatoLibroDiario;
  umbrales_uit: { simplificado: number; intermedio: number; completo: number };
  libros_obligados: Array<{
    codigo: string;
    nombre: string;
    obligatorio: boolean;
    formato_ple?: string;
    descripcion?: string;
    destacado?: boolean;
  }>;
  evaluado_at: string;
};

function mapAnexo(row: AnexoRow): ContribuyenteAnexo {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoAnexo: row.codigo_anexo,
    tipoEstablecimiento: row.tipo_establecimiento,
    direccion: row.direccion,
    departamento: row.departamento,
    provincia: row.provincia,
    distrito: row.distrito,
    estado: row.estado,
  };
}

function mapRepresentante(row: RepresentanteRow): ContribuyenteRepresentante {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    tipoDocumento: row.tipo_documento,
    numeroDocumento: row.numero_documento,
    nombreCompleto: row.nombre_completo,
    cargo: row.cargo,
    fechaDesde: row.fecha_desde,
    estado: row.estado,
  };
}

function mapTributo(row: TributoRow): ContribuyenteTributo {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoTributo: row.codigo_tributo,
    descripcionTributo: row.descripcion_tributo,
    fechaAfectacion: row.fecha_afectacion,
    estado: row.estado,
  };
}

function mapIngresos(row: IngresosRow): ContribuyenteIngresosAnuales {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    ejercicio: row.ejercicio,
    ingresosBrutosSoles: Number(row.ingresos_brutos_soles),
    uitMonto: Number(row.uit_monto),
    ingresosBrutosUit: Number(row.ingresos_brutos_uit),
  };
}

function mapContribuyente(
  row: ContribuyenteRow,
  anexos: ContribuyenteAnexo[],
  representantes: ContribuyenteRepresentante[],
  tributos: ContribuyenteTributo[],
  ingresos: ContribuyenteIngresosAnuales[],
): Contribuyente {
  return {
    id: row.id,
    estudioId: row.estudio_id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    nombreComercial: row.nombre_comercial,
    estadoContribuyente: row.estado_contribuyente,
    condicionDomicilio: row.condicion_domicilio,
    codigoRegimen: row.codigo_regimen,
    direccionFiscal: row.direccion_fiscal,
    ubigeo: row.ubigeo,
    departamento: row.departamento,
    provincia: row.provincia,
    distrito: row.distrito,
    sistemaEmision: row.sistema_emision,
    sistemaContabilidad: row.sistema_contabilidad,
    actividadEconomicaPrincipal: row.actividad_economica_principal,
    fechaInicioActividades: row.fecha_inicio_actividades,
    esAgenteRetencion: row.es_agente_retencion,
    esAgentePercepcion: row.es_agente_percepcion,
    esBuenContribuyente: row.es_buen_contribuyente,
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    anexos,
    representantes,
    tributos,
    ingresosAnuales: ingresos,
  };
}

function mapProfilingResult(row: ProfilingRpcRow): ProfilingResult {
  const libros: LibroObligado[] = (row.libros_obligados ?? []).map((l) => ({
    codigo: l.codigo,
    nombre: l.nombre,
    obligatorio: l.obligatorio,
    formatoPle: l.formato_ple,
    descripcion: l.descripcion,
    destacado: l.destacado,
  }));

  return {
    contribuyenteId: row.contribuyente_id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    ejercicio: row.ejercicio,
    codigoRegimen: row.codigo_regimen,
    estadoContribuyente: row.estado_contribuyente,
    condicionDomicilio: row.condicion_domicilio,
    ingresosBrutosSoles: Number(row.ingresos_brutos_soles ?? 0),
    uitMonto: Number(row.uit_monto),
    ingresosBrutosUit: Number(row.ingresos_brutos_uit ?? 0),
    formatoLibroDiario: row.formato_libro_diario,
    umbralesUit: row.umbrales_uit ?? { simplificado: 300, intermedio: 500, completo: 1700 },
    librosObligados: libros,
    evaluadoAt: row.evaluado_at,
  };
}

function fichaToRpcPayload(payload: FichaRucDecolecta): Record<string, unknown> {
  return {
    ruc: payload.ruc.replace(/\D/g, "").slice(0, 11),
    razon_social: payload.razonSocial,
    nombre_comercial: payload.nombreComercial ?? null,
    estado_contribuyente: payload.estadoContribuyente ?? null,
    condicion_domicilio: payload.condicionDomicilio ?? null,
    codigo_regimen: payload.codigoRegimen ?? null,
    direccion_fiscal: payload.direccionFiscal ?? null,
    ubigeo: payload.ubigeo ?? null,
    departamento: payload.departamento ?? null,
    provincia: payload.provincia ?? null,
    distrito: payload.distrito ?? null,
    sistema_emision: payload.sistemaEmision ?? null,
    sistema_contabilidad: payload.sistemaContabilidad ?? null,
    actividad_economica_principal: payload.actividadEconomicaPrincipal ?? null,
    fecha_inicio_actividades: payload.fechaInicioActividades ?? null,
    es_agente_retencion: payload.esAgenteRetencion ?? false,
    es_agente_percepcion: payload.esAgentePercepcion ?? false,
    es_buen_contribuyente: payload.esBuenContribuyente ?? false,
    estado: payload.estado ?? "ACTIVO",
    otros: payload.otros ?? "",
    anexos: (payload.anexos ?? []).map((a) => ({
      codigo_anexo: a.codigoAnexo,
      tipo_establecimiento: a.tipoEstablecimiento ?? null,
      direccion: a.direccion ?? null,
      departamento: a.departamento ?? null,
      provincia: a.provincia ?? null,
      distrito: a.distrito ?? null,
      estado: a.estado ?? "ACTIVO",
    })),
    representantes: (payload.representantes ?? []).map((r) => ({
      tipo_documento: r.tipoDocumento ?? "DNI",
      numero_documento: r.numeroDocumento,
      nombre_completo: r.nombreCompleto,
      cargo: r.cargo ?? null,
      fecha_desde: r.fechaDesde ?? null,
      estado: r.estado ?? "ACTIVO",
    })),
    tributos: (payload.tributos ?? []).map((t) => ({
      codigo_tributo: t.codigoTributo,
      descripcion_tributo: t.descripcionTributo ?? null,
      fecha_afectacion: t.fechaAfectacion ?? null,
      estado: t.estado ?? "VIGENTE",
    })),
    ingresos_anuales: payload.ingresosAnuales ?? {},
  };
}

export async function fetchProfilingRuc(
  contribuyenteId: string,
  ejercicio: number,
): Promise<ProfilingResult> {
  const { data, error } = await db.rpc("fn_evaluar_libros_obligados", {
    p_contribuyente_id: contribuyenteId,
    p_ejercicio: ejercicio,
  });

  throwIfSupabaseError(error, "Error al evaluar libros obligados");

  if (!data) {
    throw new Error("La evaluación de profiling no devolvió resultados");
  }

  return mapProfilingResult(data as ProfilingRpcRow);
}

export async function saveFichaRucDecolecta(
  estudioId: string,
  payload: FichaRucDecolecta,
): Promise<UpsertContribuyenteResult> {
  const { data, error } = await db.rpc("fn_upsert_contribuyente_full", {
    p_estudio_id: estudioId,
    p_data: fichaToRpcPayload(payload),
  });

  throwIfSupabaseError(error, "Error al guardar ficha RUC");

  if (!data) {
    throw new Error("El guardado de ficha RUC no devolvió respuesta");
  }

  const row = data as {
    ok: boolean;
    contribuyente_id: string;
    ruc: string;
    estudio_id: string;
    updated_at: string;
  };

  return {
    ok: row.ok,
    contribuyenteId: row.contribuyente_id,
    ruc: row.ruc,
    estudioId: row.estudio_id,
    updatedAt: row.updated_at,
  };
}

export async function fetchContribuyenteById(contribuyenteId: string): Promise<Contribuyente | null> {
  const { data: row, error } = await supabase
    .from("contribuyentes")
    .select("*")
    .eq("id", contribuyenteId)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al cargar contribuyente");

  if (!row) return null;

  const typedRow = row as unknown as ContribuyenteRow;

  const [anexosRes, reprRes, tribRes, ingRes] = await Promise.all([
    db
      .from("contribuyente_anexos")
      .select("*")
      .eq("contribuyente_id", contribuyenteId)
      .order("codigo_anexo"),
    db
      .from("contribuyente_representantes")
      .select("*")
      .eq("contribuyente_id", contribuyenteId)
      .order("nombre_completo"),
    db
      .from("contribuyente_tributos")
      .select("*")
      .eq("contribuyente_id", contribuyenteId)
      .order("codigo_tributo"),
    db
      .from("contribuyente_ingresos_anuales")
      .select("*")
      .eq("contribuyente_id", contribuyenteId)
      .order("ejercicio", { ascending: false }),
  ]);

  throwIfSupabaseError(anexosRes.error, "Error al cargar anexos");
  throwIfSupabaseError(reprRes.error, "Error al cargar representantes");
  throwIfSupabaseError(tribRes.error, "Error al cargar tributos");
  throwIfSupabaseError(ingRes.error, "Error al cargar ingresos anuales");

  return mapContribuyente(
    typedRow,
    (anexosRes.data ?? []).map((r) => mapAnexo(r as unknown as AnexoRow)),
    (reprRes.data ?? []).map((r) => mapRepresentante(r as unknown as RepresentanteRow)),
    (tribRes.data ?? []).map((r) => mapTributo(r as unknown as TributoRow)),
    (ingRes.data ?? []).map((r) => mapIngresos(r as unknown as IngresosRow)),
  );
}

export async function fetchContribuyenteByRuc(ruc: string): Promise<Contribuyente | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  if (clean.length !== 11) return null;

  const { data, error } = await supabase
    .from("contribuyentes")
    .select("id")
    .eq("ruc", clean)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al buscar contribuyente por RUC");

  if (!data?.id) return null;
  return fetchContribuyenteById(data.id);
}

type EstudioRow = {
  id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial: string | null;
  estado: EstudioContable["estado"];
  created_at: string;
  updated_at: string;
};

type EstudioUsuarioRow = {
  id: string;
  estudio_id: string;
  user_id: string;
  rol: EstudioUsuario["rol"];
  activo: boolean;
  estudios_contables: EstudioRow | EstudioRow[] | null;
};

function mapEstudio(row: EstudioRow): EstudioContable {
  return {
    id: row.id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    nombreComercial: row.nombre_comercial,
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchEstudiosForCurrentUser(): Promise<EstudioUsuario[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await db
    .from("estudio_usuarios")
    .select(
      "id, estudio_id, user_id, rol, activo, estudios_contables(id, ruc, razon_social, nombre_comercial, estado, created_at, updated_at)",
    )
    .eq("user_id", user.id)
    .eq("activo", true);

  throwIfSupabaseError(error, "Error al cargar estudios del usuario");

  return ((data ?? []) as unknown as EstudioUsuarioRow[]).map((row) => {
    const estudioRaw = row.estudios_contables;
    const estudioRow = Array.isArray(estudioRaw) ? estudioRaw[0] : estudioRaw;

    return {
      id: row.id,
      estudioId: row.estudio_id,
      userId: row.user_id,
      rol: row.rol,
      activo: row.activo,
      estudio: estudioRow ? mapEstudio(estudioRow) : undefined,
    };
  });
}

export async function fetchUitValor(ejercicio: number): Promise<number | null> {
  const { data, error } = await db
    .from("uit_valores")
    .select("monto")
    .eq("ejercicio", ejercicio)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al cargar valor UIT");
  const row = data as unknown as { monto: number } | null;
  return row?.monto != null ? Number(row.monto) : null;
}
