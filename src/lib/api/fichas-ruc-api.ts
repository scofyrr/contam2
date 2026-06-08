/**
 * Ficha RUC vía Django REST — tabla plana `public.fichas_ruc` (61 columnas).
 *
 * POST/PATCH: cuerpo JSON plano en la raíz (snake_case) + tablas hijas en camelCase.
 * GET: acepta respuesta envuelta `{ ficha, payload }` o fila plana directa.
 */

import type {
  EstablecimientoAnexo,
  FichaRuc,
  PersonaVinculada,
  RepresentanteLegal,
  TributoAfecto,
} from "@/lib/contribuyentes-types";
import { dbToFicha } from "@/lib/ficha-ruc-mapper";
import { ApiError, apiRequest, formatApiError } from "@/lib/api/http-client";

export { formatApiError };

/** Columnas DateField en Django / PostgreSQL. */
const DATE_COLUMNS = new Set([
  "fecha_inscripcion",
  "fecha_inicio_actividades",
  "fecha_baja",
  "fecha_nacimiento",
  "fecha_inscripcion_rrpp",
]);

/** Campos que deben serializarse como boolean JSON (no string vacío). */
const BOOLEAN_COLUMNS = new Set(["comprobantes_electronicos"]);

type FichaRucFlatRow = Record<string, unknown>;

/** Respuesta Django actual: plano + payload anidado opcional. */
type FichaRucApiResponse = {
  ruc?: string;
  ficha?: FichaRucFlatRow;
  payload?: Partial<FichaRuc> & Record<string, unknown>;
  updated_at?: string;
} & FichaRucFlatRow;

function s(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function dateForApi(value: unknown): string | null {
  const text = s(value);
  if (!text || text.toLowerCase() === "null") return null;
  return text.slice(0, 10);
}

function boolForApi(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "boolean") return value;
  const t = s(value).toLowerCase();
  return t === "si" || t === "sí" || t === "true" || t === "1" || t === "yes";
}

function textForApi(value: unknown): string | null {
  const text = s(value);
  return text || null;
}

function sanitizeFlatValue(key: string, value: unknown): unknown {
  if (DATE_COLUMNS.has(key)) return dateForApi(value);
  if (BOOLEAN_COLUMNS.has(key)) return boolForApi(value);
  if (value === undefined) return null;
  if (typeof value === "string") return textForApi(value);
  return value ?? null;
}

function domicilioExtra(d: FichaRuc["domicilioFiscal"]): Record<string, string> {
  const raw = d as Record<string, unknown>;
  return {
    ubigeo: s(raw.ubigeo),
    nombre_zona: s(raw.nombreZona),
    nombre_via: s(raw.nombreVia),
    km: s(raw.km),
    manzana: s(raw.manzana),
    lote: s(raw.lote),
    departamento_interno: s(raw.departamentoInterno),
    interior: s(raw.interior),
  };
}

/** FichaRuc (UI anidada) → cuerpo plano para POST/PATCH Django. */
export function fichaToApiFlatBody(ficha: FichaRuc): Record<string, unknown> {
  const g = ficha.general;
  const m = ficha.modificacionContribuyente;
  const d = ficha.domicilioFiscal;
  const p = ficha.personaNatural;
  const e = ficha.empresa;
  const extra = domicilioExtra(d);
  const ruc = s(ficha.ruc).replace(/\D/g, "").slice(0, 11);

  const row: Record<string, unknown> = {
    ruc,
    razon_social: s(g.razonSocial) || "",
    nombre_comercial: textForApi(m.nombreComercial),
    tipo_contribuyente: textForApi(g.tipoContribuyente),
    estado_contribuyente: textForApi(g.estadoContribuyente),
    condicion_domicilio_fiscal: textForApi(g.condicionDomicilioFiscal),
    dependencia_sunat: textForApi(g.dependenciaSunat),
    tipo_representacion: textForApi(m.tipoRepresentacion),
    fecha_inscripcion: dateForApi(g.fechaInscripcion),
    fecha_inicio_actividades: dateForApi(g.fechaInicioActividades),
    emisor_electronico_desde: textForApi(g.emisorElectronicoDesde),
    fecha_baja: dateForApi(g.fechaBaja),
    comprobantes_electronicos: boolForApi(g.comprobantesElectronicos),
    sistema_emision_comprobantes: textForApi(m.sistemaEmisionComprobantes),
    sistema_contabilidad: textForApi(m.sistemaContabilidad),
    actividad_comercio_exterior: textForApi(m.actividadComercioExterior),
    actividad_economica_principal: textForApi(m.actividadEconomicaPrincipal),
    actividad_economica_secundaria1: textForApi(m.actividadEconomicaSecundaria1),
    actividad_economica_secundaria2: textForApi(m.actividadEconomicaSecundaria2),
    actividad_economica: textForApi(d.actividadEconomica),
    condicion_inmueble: textForApi(d.condicionInmueble),
    licencia_municipal: textForApi(d.licenciaMunicipal),
    numero_partida_registral: textForApi(e.numeroPartidaRegistral),
    tomo_ficha_folio_asiento: textForApi(e.tomoFichaFolioAsiento),
    fecha_inscripcion_rrpp: dateForApi(e.fechaInscripcionRrPp),
    fecha_nacimiento: dateForApi(p.fechaNacimientoSucesion),
    sexo: textForApi(p.sexo),
    documento_identidad: textForApi(p.documentoIdentidad),
    nacionalidad: textForApi(p.nacionalidad),
    pais_procedencia: textForApi(p.paisProcedencia),
    pais_origen_capital: textForApi(e.paisOrigenCapital),
    origen_capital: textForApi(e.origenCapital),
    cond_domiciliado: textForApi(p.condDomiciliado),
    codigo_profesion_oficio: textForApi(m.codigoProfesionOficio),
    departamento: textForApi(d.departamento),
    provincia: textForApi(d.provincia),
    distrito: textForApi(d.distrito),
    ubigeo: textForApi(extra.ubigeo) || null,
    tipo_via: textForApi(d.tipoNombreVia),
    nombre_via: textForApi(extra.nombre_via) || null,
    numero: textForApi(d.nroKmMzLote),
    km: textForApi(extra.km) || null,
    manzana: textForApi(extra.manzana) || null,
    lote: textForApi(extra.lote) || null,
    departamento_interno: textForApi(extra.departamento_interno) || null,
    interior: textForApi(extra.interior) || null,
    tipo_zona: textForApi(d.tipoNombreZona),
    nombre_zona: textForApi(extra.nombre_zona) || null,
    otras_referencias: textForApi(d.otrasReferencias),
    numero_fax: textForApi(m.numeroFax),
    telefono_fijo1: textForApi(m.telefonoFijo1),
    telefono_fijo2: textForApi(m.telefonoFijo2),
    telefono_movil1: textForApi(m.telefonoMovil1),
    telefono_movil2: textForApi(m.telefonoMovil2),
    correo_electronico1: textForApi(m.correoElectronico1),
    correo_electronico2: textForApi(m.correoElectronico2),
    pasaporte: textForApi(p.pasaporte),
    tributosAfectos: sanitizeTributos(ficha.tributosAfectos),
    representantesLegales: sanitizeRepresentantes(ficha.representantesLegales),
    personasVinculadas: sanitizePersonas(ficha.personasVinculadas),
    establecimientosAnexos: sanitizeEstablecimientos(ficha.establecimientosAnexos),
  };

  for (const [key, val] of Object.entries(row)) {
    if (
      key === "tributosAfectos" ||
      key === "representantesLegales" ||
      key === "personasVinculadas" ||
      key === "establecimientosAnexos"
    ) {
      continue;
    }
    row[key] = sanitizeFlatValue(key, val);
  }

  return row;
}

function sanitizeTributos(rows: TributoAfecto[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    id: s(row.id) || undefined,
    tributo: s(row.tributo) || "",
    fechaAlta: dateForApi(row.fechaAlta),
    afectoDesde: dateForApi(row.afectoDesde),
    exoneracionDesde: dateForApi(row.exoneracionDesde),
    hasta: dateForApi(row.hasta),
    marcaExoneracion: boolForApi(row.marcaExoneracion) ? "SI" : "NO",
    modificacion: s(row.modificacion) || "",
  }));
}

function sanitizeRepresentantes(rows: RepresentanteLegal[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    id: s(row.id) || undefined,
    tipoNroDoc: s(row.tipoNroDoc) || "",
    apellidosNombres: s(row.apellidosNombres) || "",
    fechaNacimiento: dateForApi(row.fechaNacimiento),
    cargo: s(row.cargo) || "",
    fechaDesde: dateForApi(row.fechaDesde),
    nroOrdenRepresentacion: s(row.nroOrdenRepresentacion) || "",
  }));
}

function sanitizePersonas(rows: PersonaVinculada[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    id: s(row.id) || undefined,
    tipoNroDoc: s(row.tipoNroDoc) || "",
    apellidosNombres: s(row.apellidosNombres) || "",
    fechaNacimiento: dateForApi(row.fechaNacimiento),
    vinculo: s(row.vinculo) || "",
    fechaDesde: dateForApi(row.fechaDesde),
    residencia: s(row.residencia) || "",
    porcentaje: s(row.porcentaje) || "",
  }));
}

function sanitizeEstablecimientos(rows: EstablecimientoAnexo[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    id: s(row.id) || undefined,
    codigo: s(row.codigo) || "",
    tipo: s(row.tipo) || "",
    denominacion: s(row.denominacion) || "",
    ubigeo: s(row.ubigeo) || "",
    domicilio: s(row.domicilio) || "",
    otrasReferencias: s(row.otrasReferencias) || "",
    condLegal: s(row.condLegal) || "",
    licenciaMunicipal: s(row.licenciaMunicipal) || "",
    actEcon: s(row.actEcon) || "",
    modificacion: s(row.modificacion) || "",
  }));
}

function isNestedFicha(value: unknown): value is FichaRuc {
  return (
    typeof value === "object" &&
    value !== null &&
    "general" in value &&
    typeof (value as FichaRuc).general === "object"
  );
}

function isFlatFichaRow(row: Record<string, unknown>): boolean {
  return typeof row.ruc === "string" && ("razon_social" in row || "razonSocial" in row);
}

function tributosUiToDb(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((t) => ({
    id: t.id,
    tributo: t.tributo,
    fecha_alta: t.fechaAlta ?? t.fecha_alta,
    afecto_desde: t.afectoDesde ?? t.afecto_desde,
    exoneracion_desde: t.exoneracionDesde ?? t.exoneracion_desde,
    hasta: t.hasta,
    marca_exoneracion: boolForApi(t.marcaExoneracion ?? t.marca_exoneracion),
    modificacion: t.modificacion,
  }));
}

function representantesUiToDb(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const doc = s(r.tipoNroDoc ?? r.tipo_nro_doc);
    let tipo = s(r.tipo_documento);
    let numero = s(r.numero_documento);
    if (doc.includes(" - ")) {
      [tipo, numero] = doc.split(" - ", 2);
    }
    return {
      id: r.id,
      tipo_documento: tipo,
      numero_documento: numero,
      apellidos_nombres: r.apellidosNombres ?? r.apellidos_nombres,
      fecha_nacimiento: r.fechaNacimiento ?? r.fecha_nacimiento,
      cargo: r.cargo,
      fecha_desde: r.fechaDesde ?? r.fecha_desde,
      numero_orden_representacion: r.nroOrdenRepresentacion ?? r.numero_orden_representacion,
    };
  });
}

function personasUiToDb(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((p) => {
    const doc = s(p.tipoNroDoc ?? p.tipo_nro_doc);
    let tipo = s(p.tipo_documento);
    let numero = s(p.numero_documento);
    if (doc.includes(" - ")) {
      [tipo, numero] = doc.split(" - ", 2);
    }
    return {
      id: p.id,
      tipo_documento: tipo,
      numero_documento: numero,
      apellidos_nombres: p.apellidosNombres ?? p.apellidos_nombres,
      fecha_nacimiento: p.fechaNacimiento ?? p.fecha_nacimiento,
      fecha_desde: p.fechaDesde ?? p.fecha_desde,
      porcentaje: p.porcentaje,
    };
  });
}

function establecimientosUiToDb(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((e) => ({
    id: e.id,
    codigo: e.codigo,
    tipo: e.tipo,
    denominacion: e.denominacion,
    ubigeo: e.ubigeo,
    domicilio: e.domicilio,
    otras_referencias: e.otrasReferencias ?? e.otras_referencias,
    condicion_legal: e.condLegal ?? e.condicion_legal,
    licencia_municipal: e.licenciaMunicipal ?? e.licencia_municipal,
    actividad_economica: e.actEcon ?? e.actividad_economica,
    modificacion: e.modificacion,
  }));
}

/** Reconstruye FichaRuc anidada desde fila plana + hijos (UI o BD). */
export function rowToFicha(row: FichaRucApiResponse): FichaRuc {
  const ruc = s(row.ruc ?? row.ficha?.ruc).replace(/\D/g, "").slice(0, 11);

  if (isNestedFicha(row.payload)) {
    const nested = row.payload as FichaRuc;
    return {
      ...nested,
      ruc: ruc || nested.ruc,
      updatedAt: s(row.updated_at) || nested.updatedAt || "",
    };
  }

  const flat: FichaRucFlatRow = isFlatFichaRow(row.ficha ?? row)
    ? (row.ficha ?? row)
    : {};

  const payloadChildren = row.payload ?? {};
  const tributosRaw =
    (payloadChildren.tributosAfectos as Record<string, unknown>[] | undefined) ??
    (row.tributosAfectos as Record<string, unknown>[] | undefined) ??
    [];
  const representantesRaw =
    (payloadChildren.representantesLegales as Record<string, unknown>[] | undefined) ??
    (row.representantesLegales as Record<string, unknown>[] | undefined) ??
    [];
  const personasRaw =
    (payloadChildren.personasVinculadas as Record<string, unknown>[] | undefined) ??
    (row.personasVinculadas as Record<string, unknown>[] | undefined) ??
    [];
  const establecimientosRaw =
    (payloadChildren.establecimientosAnexos as Record<string, unknown>[] | undefined) ??
    (row.establecimientosAnexos as Record<string, unknown>[] | undefined) ??
    [];

  if (Object.keys(flat).length > 0) {
    return dbToFicha(
      flat,
      tributosUiToDb(tributosRaw),
      representantesUiToDb(representantesRaw),
      personasUiToDb(personasRaw),
      establecimientosUiToDb(establecimientosRaw),
    );
  }

  if (isNestedFicha(row)) {
    const nested = row as unknown as FichaRuc;
    return { ...nested, ruc: ruc || nested.ruc };
  }

  throw new Error("Respuesta de ficha RUC sin datos planos ni payload anidado.");
}

export async function fetchFichaByRucViaApi(ruc: string): Promise<FichaRuc | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  try {
    const row = await apiRequest<FichaRucApiResponse>(`/fichas-ruc/${clean}/`, { method: "GET" });
    return rowToFicha(row);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function fetchAllFichasViaApi(): Promise<Record<string, FichaRuc>> {
  const rows = await apiRequest<FichaRucApiResponse[]>("/fichas-ruc/", { method: "GET" });
  const out: Record<string, FichaRuc> = {};
  for (const row of rows) {
    const ficha = rowToFicha(row);
    out[ficha.ruc] = ficha;
  }
  return out;
}

/**
 * Crea o actualiza enviando columnas planas en la raíz del JSON (sin `{ payload }`).
 */
export async function upsertFichaRucViaApi(ficha: FichaRuc): Promise<FichaRuc> {
  const ruc = ficha.ruc.replace(/\D/g, "").slice(0, 11);
  if (ruc.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos");
  }

  const datosPlanos = fichaToApiFlatBody({
    ...ficha,
    ruc,
    updatedAt: new Date().toISOString(),
  });

  const existing = await fetchFichaByRucViaApi(ruc).catch(() => null);

  if (existing) {
    const row = await apiRequest<FichaRucApiResponse>(`/fichas-ruc/${ruc}/`, {
      method: "PATCH",
      body: JSON.stringify(datosPlanos),
    });
    return rowToFicha(row);
  }

  const row = await apiRequest<FichaRucApiResponse>("/fichas-ruc/", {
    method: "POST",
    body: JSON.stringify(datosPlanos),
  });
  return rowToFicha(row);
}
