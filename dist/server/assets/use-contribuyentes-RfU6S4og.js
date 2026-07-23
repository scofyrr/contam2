import { U as reactExports, L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { b as bulkUpsertContribuyentes, a as fetchContribuyentes, u as upsertContribuyente, d as deleteContribuyente, f as fetchContribuyenteByRuc } from "./contribuyentes-service-ZRfErUKW.js";
import { ac as supabase, ad as throwIfSupabaseError, a9 as sanitizePayload, x as formatSupabaseError } from "./router-CQNpPKTf.js";
import { a as apiRequest, A as ApiError, u as useDjangoApi, f as formatApiError } from "./http-client-BAKcXjQw.js";
function uid() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function emptyContribuyente() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ruc: "",
    razonSocial: "",
    otros: "",
    cat1ra: false,
    cat2da: false,
    cat3ra: false,
    cat4taRetenciones: false,
    cat4taCtaPropia: false,
    cat5ta: false,
    fechaVencimientoDeclaracion: "",
    estado: "ACTIVO",
    claveSol: { usuario: "", clave: "" },
    afpNet: { usuario: "", clave: "" },
    validezCpe: { usuario: "", clave: "" },
    clavesSire: { usuario: "", clave: "" },
    createdAt: now,
    updatedAt: now
  };
}
function emptyTributoAfecto() {
  return {
    id: uid(),
    tributo: "",
    fechaAlta: "",
    afectoDesde: "",
    marcaExoneracion: "",
    exoneracionDesde: "",
    hasta: "",
    modificacion: ""
  };
}
function emptyRepresentante() {
  return {
    id: uid(),
    tipoNroDoc: "",
    apellidosNombres: "",
    fechaNacimiento: "",
    cargo: "",
    fechaDesde: "",
    nroOrdenRepresentacion: ""
  };
}
function emptyPersonaVinculada() {
  return {
    id: uid(),
    tipoNroDoc: "",
    apellidosNombres: "",
    fechaNacimiento: "",
    vinculo: "",
    fechaDesde: "",
    residencia: "",
    porcentaje: ""
  };
}
function emptyEstablecimiento() {
  return {
    id: uid(),
    codigo: "",
    tipo: "",
    denominacion: "",
    ubigeo: "",
    domicilio: "",
    otrasReferencias: "",
    condLegal: "",
    licenciaMunicipal: "",
    actEcon: "",
    modificacion: ""
  };
}
function emptyFichaRuc(ruc, razonSocial = "") {
  return {
    ruc,
    general: {
      razonSocial,
      tipoContribuyente: "",
      fechaInscripcion: "",
      fechaInicioActividades: "",
      estadoContribuyente: "",
      dependenciaSunat: "",
      condicionDomicilioFiscal: "",
      emisorElectronicoDesde: "",
      comprobantesElectronicos: "",
      fechaBaja: ""
    },
    modificacionContribuyente: {
      nombreComercial: "",
      tipoRepresentacion: "",
      actividadEconomicaPrincipal: "",
      actividadEconomicaSecundaria1: "",
      actividadEconomicaSecundaria2: "",
      sistemaEmisionComprobantes: "",
      sistemaContabilidad: "",
      codigoProfesionOficio: "",
      actividadComercioExterior: "",
      numeroFax: "",
      telefonoFijo1: "",
      telefonoFijo2: "",
      telefonoMovil1: "",
      telefonoMovil2: "",
      correoElectronico1: "",
      correoElectronico2: ""
    },
    domicilioFiscal: {
      actividadEconomica: "",
      departamento: "",
      provincia: "",
      distrito: "",
      tipoNombreZona: "",
      tipoNombreVia: "",
      nroKmMzLote: "",
      otrasReferencias: "",
      condicionInmueble: "",
      licenciaMunicipal: ""
    },
    personaNatural: {
      documentoIdentidad: "",
      fechaNacimientoSucesion: "",
      sexo: "",
      pasaporte: "",
      nacionalidad: "",
      paisProcedencia: "",
      condDomiciliado: ""
    },
    empresa: {
      fechaInscripcionRrPp: "",
      numeroPartidaRegistral: "",
      tomoFichaFolioAsiento: "",
      origenCapital: "",
      paisOrigenCapital: ""
    },
    tributosAfectos: [],
    representantesLegales: [],
    personasVinculadas: [],
    establecimientosAnexos: [],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function validateRuc(ruc) {
  const clean = ruc.replace(/\D/g, "");
  if (clean.length !== 11) return "El RUC debe tener 11 dígitos numéricos";
  return null;
}
function validateFichaRequired(ficha) {
  if (!ficha.general.razonSocial.trim()) {
    return "Apellidos y Nombres o Razón Social es obligatorio";
  }
  if (!ficha.general.tipoContribuyente.trim()) {
    return "Tipo de Contribuyente es obligatorio";
  }
  if (!ficha.general.fechaInscripcion.trim()) {
    return "Fecha de Inscripción es obligatoria";
  }
  return null;
}
function s$1(value) {
  return value == null ? "" : String(value).trim();
}
function dateOrEmpty(value) {
  const t = s$1(value);
  return t ? t.slice(0, 10) : "";
}
function splitDoc(combined) {
  const text = s$1(combined);
  if (!text) return { tipo: "", numero: "" };
  if (text.includes(" - ")) {
    const [a, b] = text.split(" - ", 2);
    return { tipo: a.trim(), numero: b.trim() };
  }
  const parts = text.split(/\s+/, 2);
  return parts.length === 2 ? { tipo: parts[0], numero: parts[1] } : { tipo: text, numero: "" };
}
function joinDoc(tipo, numero) {
  if (tipo && numero) return `${tipo} - ${numero}`;
  return tipo || numero;
}
function boolFromUi(value) {
  if (value === null || value === void 0 || value === "") return null;
  if (typeof value === "boolean") return value;
  const t = s$1(value).toLowerCase();
  return t === "si" || t === "sí" || t === "true" || t === "1";
}
function fichaToDbRow(ficha) {
  const g = ficha.general;
  const m = ficha.modificacionContribuyente;
  const d = ficha.domicilioFiscal;
  const p = ficha.personaNatural;
  const e = ficha.empresa;
  const ruc = s$1(ficha.ruc).replace(/\D/g, "").slice(0, 11);
  return {
    ruc,
    razon_social: s$1(g.razonSocial),
    nombre_comercial: s$1(m.nombreComercial),
    tipo_contribuyente: s$1(g.tipoContribuyente),
    estado_contribuyente: s$1(g.estadoContribuyente),
    condicion_domicilio_fiscal: s$1(g.condicionDomicilioFiscal),
    dependencia_sunat: s$1(g.dependenciaSunat),
    tipo_representacion: s$1(m.tipoRepresentacion),
    fecha_inscripcion: dateOrEmpty(g.fechaInscripcion) || null,
    fecha_inicio_actividades: dateOrEmpty(g.fechaInicioActividades) || null,
    emisor_electronico_desde: dateOrEmpty(g.emisorElectronicoDesde) || null,
    fecha_baja: dateOrEmpty(g.fechaBaja) || null,
    comprobantes_electronicos: boolFromUi(g.comprobantesElectronicos),
    sistema_emision_comprobantes: s$1(m.sistemaEmisionComprobantes),
    sistema_contabilidad: s$1(m.sistemaContabilidad),
    actividad_comercio_exterior: s$1(m.actividadComercioExterior),
    actividad_economica_principal: s$1(m.actividadEconomicaPrincipal),
    actividad_economica_secundaria1: s$1(m.actividadEconomicaSecundaria1),
    actividad_economica_secundaria2: s$1(m.actividadEconomicaSecundaria2),
    actividad_economica: s$1(d.actividadEconomica),
    condicion_inmueble: s$1(d.condicionInmueble),
    licencia_municipal: s$1(d.licenciaMunicipal),
    numero_partida_registral: s$1(e.numeroPartidaRegistral),
    tomo_ficha_folio_asiento: s$1(e.tomoFichaFolioAsiento),
    fecha_inscripcion_rrpp: dateOrEmpty(e.fechaInscripcionRrPp) || null,
    fecha_nacimiento: dateOrEmpty(p.fechaNacimientoSucesion) || null,
    sexo: s$1(p.sexo),
    documento_identidad: s$1(p.documentoIdentidad),
    nacionalidad: s$1(p.nacionalidad),
    pais_procedencia: s$1(p.paisProcedencia),
    pais_origen_capital: s$1(e.paisOrigenCapital),
    origen_capital: s$1(e.origenCapital),
    cond_domiciliado: s$1(p.condDomiciliado),
    codigo_profesion_oficio: s$1(m.codigoProfesionOficio),
    departamento: s$1(d.departamento),
    provincia: s$1(d.provincia),
    distrito: s$1(d.distrito),
    tipo_via: s$1(d.tipoNombreVia),
    numero: s$1(d.nroKmMzLote),
    tipo_zona: s$1(d.tipoNombreZona),
    otras_referencias: s$1(d.otrasReferencias),
    numero_fax: s$1(m.numeroFax),
    telefono_fijo1: s$1(m.telefonoFijo1),
    telefono_fijo2: s$1(m.telefonoFijo2),
    telefono_movil1: s$1(m.telefonoMovil1),
    telefono_movil2: s$1(m.telefonoMovil2),
    correo_electronico1: s$1(m.correoElectronico1),
    correo_electronico2: s$1(m.correoElectronico2),
    pasaporte: s$1(p.pasaporte)
  };
}
function tributosToDb(ruc, rows) {
  return rows.map((row, i) => ({
    ruc,
    tributo: s$1(row.tributo),
    fecha_alta: dateOrEmpty(row.fechaAlta) || null,
    afecto_desde: dateOrEmpty(row.afectoDesde) || null,
    exoneracion_desde: dateOrEmpty(row.exoneracionDesde) || null,
    hasta: dateOrEmpty(row.hasta) || null,
    marca_exoneracion: boolFromUi(row.marcaExoneracion),
    modificacion: s$1(row.modificacion),
    orden: i
  }));
}
function representantesToDb(ruc, rows) {
  return rows.map((row, i) => {
    const doc = splitDoc(row.tipoNroDoc);
    return {
      ruc,
      tipo_documento: doc.tipo,
      numero_documento: doc.numero,
      apellidos_nombres: s$1(row.apellidosNombres),
      cargo: s$1(row.cargo),
      fecha_desde: dateOrEmpty(row.fechaDesde) || null,
      fecha_nacimiento: dateOrEmpty(row.fechaNacimiento) || null,
      numero_orden_representacion: s$1(row.nroOrdenRepresentacion),
      orden: i
    };
  });
}
function personasToDb(ruc, rows) {
  return rows.map((row, i) => {
    const doc = splitDoc(row.tipoNroDoc);
    const pct = s$1(row.porcentaje);
    return {
      ruc,
      tipo_documento: doc.tipo,
      numero_documento: doc.numero,
      apellidos_nombres: s$1(row.apellidosNombres),
      fecha_desde: dateOrEmpty(row.fechaDesde) || null,
      fecha_nacimiento: dateOrEmpty(row.fechaNacimiento) || null,
      porcentaje: pct ? Number(pct) : null,
      orden: i
    };
  });
}
function establecimientosToDb(ruc, rows) {
  return rows.map((row, i) => ({
    ruc,
    codigo: s$1(row.codigo),
    tipo: s$1(row.tipo),
    denominacion: s$1(row.denominacion),
    ubigeo: s$1(row.ubigeo),
    domicilio: s$1(row.domicilio),
    otras_referencias: s$1(row.otrasReferencias),
    condicion_legal: s$1(row.condLegal),
    licencia_municipal: s$1(row.licenciaMunicipal),
    actividad_economica: s$1(row.actEcon),
    modificacion: s$1(row.modificacion),
    orden: i
  }));
}
function dbToFicha(row, tributos, representantes, personas, establecimientos) {
  const ruc = s$1(row.ruc);
  return {
    ruc,
    updatedAt: s$1(row.updated_at),
    general: {
      razonSocial: s$1(row.razon_social),
      tipoContribuyente: s$1(row.tipo_contribuyente),
      fechaInscripcion: dateOrEmpty(row.fecha_inscripcion),
      fechaInicioActividades: dateOrEmpty(row.fecha_inicio_actividades),
      estadoContribuyente: s$1(row.estado_contribuyente),
      dependenciaSunat: s$1(row.dependencia_sunat),
      condicionDomicilioFiscal: s$1(row.condicion_domicilio_fiscal),
      emisorElectronicoDesde: dateOrEmpty(row.emisor_electronico_desde),
      comprobantesElectronicos: typeof row.comprobantes_electronicos === "boolean" ? row.comprobantes_electronicos ? "SI" : "NO" : row.comprobantes_electronicos ? "SI" : "NO",
      fechaBaja: dateOrEmpty(row.fecha_baja)
    },
    modificacionContribuyente: {
      nombreComercial: s$1(row.nombre_comercial),
      tipoRepresentacion: s$1(row.tipo_representacion),
      actividadEconomicaPrincipal: s$1(row.actividad_economica_principal),
      actividadEconomicaSecundaria1: s$1(row.actividad_economica_secundaria1),
      actividadEconomicaSecundaria2: s$1(row.actividad_economica_secundaria2),
      sistemaEmisionComprobantes: s$1(row.sistema_emision_comprobantes),
      sistemaContabilidad: s$1(row.sistema_contabilidad),
      codigoProfesionOficio: s$1(row.codigo_profesion_oficio),
      actividadComercioExterior: s$1(row.actividad_comercio_exterior),
      numeroFax: s$1(row.numero_fax),
      telefonoFijo1: s$1(row.telefono_fijo1),
      telefonoFijo2: s$1(row.telefono_fijo2),
      telefonoMovil1: s$1(row.telefono_movil1),
      telefonoMovil2: s$1(row.telefono_movil2),
      correoElectronico1: s$1(row.correo_electronico1),
      correoElectronico2: s$1(row.correo_electronico2)
    },
    domicilioFiscal: {
      actividadEconomica: s$1(row.actividad_economica),
      departamento: s$1(row.departamento),
      provincia: s$1(row.provincia),
      distrito: s$1(row.distrito),
      tipoNombreZona: s$1(row.tipo_zona),
      tipoNombreVia: s$1(row.tipo_via),
      nroKmMzLote: s$1(row.numero),
      otrasReferencias: s$1(row.otras_referencias),
      condicionInmueble: s$1(row.condicion_inmueble),
      licenciaMunicipal: s$1(row.licencia_municipal)
    },
    personaNatural: {
      documentoIdentidad: s$1(row.documento_identidad),
      fechaNacimientoSucesion: dateOrEmpty(row.fecha_nacimiento),
      sexo: s$1(row.sexo),
      pasaporte: s$1(row.pasaporte),
      nacionalidad: s$1(row.nacionalidad),
      paisProcedencia: s$1(row.pais_procedencia),
      condDomiciliado: s$1(row.cond_domiciliado)
    },
    empresa: {
      fechaInscripcionRrPp: dateOrEmpty(row.fecha_inscripcion_rrpp),
      numeroPartidaRegistral: s$1(row.numero_partida_registral),
      tomoFichaFolioAsiento: s$1(row.tomo_ficha_folio_asiento),
      origenCapital: s$1(row.origen_capital),
      paisOrigenCapital: s$1(row.pais_origen_capital)
    },
    tributosAfectos: tributos.map((t) => ({
      id: String(t.id ?? ""),
      tributo: s$1(t.tributo),
      fechaAlta: dateOrEmpty(t.fecha_alta),
      afectoDesde: dateOrEmpty(t.afecto_desde),
      marcaExoneracion: t.marca_exoneracion ? "SI" : "NO",
      exoneracionDesde: dateOrEmpty(t.exoneracion_desde),
      hasta: dateOrEmpty(t.hasta),
      modificacion: s$1(t.modificacion)
    })),
    representantesLegales: representantes.map((r) => ({
      id: String(r.id ?? ""),
      tipoNroDoc: joinDoc(s$1(r.tipo_documento), s$1(r.numero_documento)),
      apellidosNombres: s$1(r.apellidos_nombres),
      fechaNacimiento: dateOrEmpty(r.fecha_nacimiento),
      cargo: s$1(r.cargo),
      fechaDesde: dateOrEmpty(r.fecha_desde),
      nroOrdenRepresentacion: s$1(r.numero_orden_representacion)
    })),
    personasVinculadas: personas.map((p) => ({
      id: String(p.id ?? ""),
      tipoNroDoc: joinDoc(s$1(p.tipo_documento), s$1(p.numero_documento)),
      apellidosNombres: s$1(p.apellidos_nombres),
      fechaNacimiento: dateOrEmpty(p.fecha_nacimiento),
      vinculo: "",
      fechaDesde: dateOrEmpty(p.fecha_desde),
      residencia: "",
      porcentaje: p.porcentaje != null ? String(p.porcentaje) : ""
    })),
    establecimientosAnexos: establecimientos.map((e) => ({
      id: String(e.id ?? ""),
      codigo: s$1(e.codigo),
      tipo: s$1(e.tipo),
      denominacion: s$1(e.denominacion),
      ubigeo: s$1(e.ubigeo),
      domicilio: s$1(e.domicilio),
      otrasReferencias: s$1(e.otras_referencias),
      condLegal: s$1(e.condicion_legal),
      licenciaMunicipal: s$1(e.licencia_municipal),
      actEcon: s$1(e.actividad_economica),
      modificacion: s$1(e.modificacion)
    }))
  };
}
const DATE_COLUMNS = /* @__PURE__ */ new Set([
  "fecha_inscripcion",
  "fecha_inicio_actividades",
  "fecha_baja",
  "fecha_nacimiento",
  "fecha_inscripcion_rrpp"
]);
const BOOLEAN_COLUMNS = /* @__PURE__ */ new Set(["comprobantes_electronicos"]);
function s(value) {
  if (value == null) return "";
  return String(value).trim();
}
function dateForApi(value) {
  const text = s(value);
  if (!text || text.toLowerCase() === "null") return null;
  return text.slice(0, 10);
}
function boolForApi(value) {
  if (value === null || value === void 0 || value === "") return false;
  if (typeof value === "boolean") return value;
  const t = s(value).toLowerCase();
  return t === "si" || t === "sí" || t === "true" || t === "1" || t === "yes";
}
function textForApi(value) {
  const text = s(value);
  return text || null;
}
function sanitizeFlatValue(key, value) {
  if (DATE_COLUMNS.has(key)) return dateForApi(value);
  if (BOOLEAN_COLUMNS.has(key)) return boolForApi(value);
  if (value === void 0) return null;
  if (typeof value === "string") return textForApi(value);
  return value ?? null;
}
function domicilioExtra(d) {
  const raw = d;
  return {
    ubigeo: s(raw.ubigeo),
    nombre_zona: s(raw.nombreZona),
    nombre_via: s(raw.nombreVia),
    km: s(raw.km),
    manzana: s(raw.manzana),
    lote: s(raw.lote),
    departamento_interno: s(raw.departamentoInterno),
    interior: s(raw.interior)
  };
}
function fichaToApiFlatBody(ficha) {
  const g = ficha.general;
  const m = ficha.modificacionContribuyente;
  const d = ficha.domicilioFiscal;
  const p = ficha.personaNatural;
  const e = ficha.empresa;
  const extra = domicilioExtra(d);
  const ruc = s(ficha.ruc).replace(/\D/g, "").slice(0, 11);
  const row = {
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
    establecimientosAnexos: sanitizeEstablecimientos(ficha.establecimientosAnexos)
  };
  for (const [key, val] of Object.entries(row)) {
    if (key === "tributosAfectos" || key === "representantesLegales" || key === "personasVinculadas" || key === "establecimientosAnexos") {
      continue;
    }
    row[key] = sanitizeFlatValue(key, val);
  }
  return row;
}
function sanitizeTributos(rows) {
  return rows.map((row) => ({
    id: s(row.id) || void 0,
    tributo: s(row.tributo) || "",
    fechaAlta: dateForApi(row.fechaAlta),
    afectoDesde: dateForApi(row.afectoDesde),
    exoneracionDesde: dateForApi(row.exoneracionDesde),
    hasta: dateForApi(row.hasta),
    marcaExoneracion: boolForApi(row.marcaExoneracion) ? "SI" : "NO",
    modificacion: s(row.modificacion) || ""
  }));
}
function sanitizeRepresentantes(rows) {
  return rows.map((row) => ({
    id: s(row.id) || void 0,
    tipoNroDoc: s(row.tipoNroDoc) || "",
    apellidosNombres: s(row.apellidosNombres) || "",
    fechaNacimiento: dateForApi(row.fechaNacimiento),
    cargo: s(row.cargo) || "",
    fechaDesde: dateForApi(row.fechaDesde),
    nroOrdenRepresentacion: s(row.nroOrdenRepresentacion) || ""
  }));
}
function sanitizePersonas(rows) {
  return rows.map((row) => ({
    id: s(row.id) || void 0,
    tipoNroDoc: s(row.tipoNroDoc) || "",
    apellidosNombres: s(row.apellidosNombres) || "",
    fechaNacimiento: dateForApi(row.fechaNacimiento),
    vinculo: s(row.vinculo) || "",
    fechaDesde: dateForApi(row.fechaDesde),
    residencia: s(row.residencia) || "",
    porcentaje: s(row.porcentaje) || ""
  }));
}
function sanitizeEstablecimientos(rows) {
  return rows.map((row) => ({
    id: s(row.id) || void 0,
    codigo: s(row.codigo) || "",
    tipo: s(row.tipo) || "",
    denominacion: s(row.denominacion) || "",
    ubigeo: s(row.ubigeo) || "",
    domicilio: s(row.domicilio) || "",
    otrasReferencias: s(row.otrasReferencias) || "",
    condLegal: s(row.condLegal) || "",
    licenciaMunicipal: s(row.licenciaMunicipal) || "",
    actEcon: s(row.actEcon) || "",
    modificacion: s(row.modificacion) || ""
  }));
}
function isNestedFicha(value) {
  return typeof value === "object" && value !== null && "general" in value && typeof value.general === "object";
}
function isFlatFichaRow(row) {
  return typeof row.ruc === "string" && ("razon_social" in row || "razonSocial" in row);
}
function tributosUiToDb(rows) {
  return rows.map((t) => ({
    id: t.id,
    tributo: t.tributo,
    fecha_alta: t.fechaAlta ?? t.fecha_alta,
    afecto_desde: t.afectoDesde ?? t.afecto_desde,
    exoneracion_desde: t.exoneracionDesde ?? t.exoneracion_desde,
    hasta: t.hasta,
    marca_exoneracion: boolForApi(t.marcaExoneracion ?? t.marca_exoneracion),
    modificacion: t.modificacion
  }));
}
function representantesUiToDb(rows) {
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
      numero_orden_representacion: r.nroOrdenRepresentacion ?? r.numero_orden_representacion
    };
  });
}
function personasUiToDb(rows) {
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
      porcentaje: p.porcentaje
    };
  });
}
function establecimientosUiToDb(rows) {
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
    modificacion: e.modificacion
  }));
}
function rowToFicha(row) {
  const ruc = s(row.ruc ?? row.ficha?.ruc).replace(/\D/g, "").slice(0, 11);
  if (isNestedFicha(row.payload)) {
    const nested = row.payload;
    return {
      ...nested,
      ruc: ruc || nested.ruc,
      updatedAt: s(row.updated_at) || nested.updatedAt || ""
    };
  }
  const flat = isFlatFichaRow(row.ficha ?? row) ? row.ficha ?? row : {};
  const payloadChildren = row.payload ?? {};
  const tributosRaw = payloadChildren.tributosAfectos ?? row.tributosAfectos ?? [];
  const representantesRaw = payloadChildren.representantesLegales ?? row.representantesLegales ?? [];
  const personasRaw = payloadChildren.personasVinculadas ?? row.personasVinculadas ?? [];
  const establecimientosRaw = payloadChildren.establecimientosAnexos ?? row.establecimientosAnexos ?? [];
  if (Object.keys(flat).length > 0) {
    return dbToFicha(
      flat,
      tributosUiToDb(tributosRaw),
      representantesUiToDb(representantesRaw),
      personasUiToDb(personasRaw),
      establecimientosUiToDb(establecimientosRaw)
    );
  }
  if (isNestedFicha(row)) {
    const nested = row;
    return { ...nested, ruc: ruc || nested.ruc };
  }
  throw new Error("Respuesta de ficha RUC sin datos planos ni payload anidado.");
}
async function fetchFichaByRucViaApi(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  try {
    const row = await apiRequest(`/fichas-ruc/${clean}/`, { method: "GET" });
    return rowToFicha(row);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}
async function fetchAllFichasViaApi() {
  const rows = await apiRequest("/fichas-ruc/", { method: "GET" });
  const out = {};
  for (const row of rows) {
    const ficha = rowToFicha(row);
    out[ficha.ruc] = ficha;
  }
  return out;
}
async function upsertFichaRucViaApi(ficha) {
  const ruc = ficha.ruc.replace(/\D/g, "").slice(0, 11);
  if (ruc.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos");
  }
  const datosPlanos = fichaToApiFlatBody({
    ...ficha,
    ruc,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const existing = await fetchFichaByRucViaApi(ruc).catch(() => null);
  if (existing) {
    const row2 = await apiRequest(`/fichas-ruc/${ruc}/`, {
      method: "PATCH",
      body: JSON.stringify(datosPlanos)
    });
    return rowToFicha(row2);
  }
  const row = await apiRequest("/fichas-ruc/", {
    method: "POST",
    body: JSON.stringify(datosPlanos)
  });
  return rowToFicha(row);
}
const CHILD_TABLES = [
  "tributos_afectos",
  "representantes_legales",
  "otras_personas_vinculadas",
  "establecimientos_anexos"
];
async function loadFichaChildren(ruc) {
  const [t, r, p, e] = await Promise.all([
    supabase.from("tributos_afectos").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("representantes_legales").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("otras_personas_vinculadas").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("establecimientos_anexos").select("*").eq("ruc", ruc).order("orden")
  ]);
  throwIfSupabaseError(t.error, "Error al leer tributos afectos");
  throwIfSupabaseError(r.error, "Error al leer representantes legales");
  throwIfSupabaseError(p.error, "Error al leer personas vinculadas");
  throwIfSupabaseError(e.error, "Error al leer establecimientos anexos");
  return {
    tributos: t.data ?? [],
    representantes: r.data ?? [],
    personas: p.data ?? [],
    establecimientos: e.data ?? []
  };
}
async function saveFichaChildren(ruc, ficha) {
  await Promise.all(
    CHILD_TABLES.map((table) => supabase.from(table).delete().eq("ruc", ruc))
  );
  const inserts = [
    { table: "tributos_afectos", rows: tributosToDb(ruc, ficha.tributosAfectos) },
    { table: "representantes_legales", rows: representantesToDb(ruc, ficha.representantesLegales) },
    { table: "otras_personas_vinculadas", rows: personasToDb(ruc, ficha.personasVinculadas) },
    { table: "establecimientos_anexos", rows: establecimientosToDb(ruc, ficha.establecimientosAnexos) }
  ];
  for (const { table, rows } of inserts) {
    if (!rows.length) continue;
    const { error } = await supabase.from(table).insert(rows);
    throwIfSupabaseError(error, `Error al guardar ${table}`);
  }
}
async function fetchFichaByRuc(ruc) {
  if (useDjangoApi()) {
    return fetchFichaByRucViaApi(ruc);
  }
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("fichas_ruc").select("*").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al leer ficha RUC");
  if (!data) return null;
  const children = await loadFichaChildren(clean);
  return dbToFicha(
    data,
    children.tributos,
    children.representantes,
    children.personas,
    children.establecimientos
  );
}
async function fetchAllFichas() {
  if (useDjangoApi()) {
    return fetchAllFichasViaApi();
  }
  const { data: cabeceras, error: cabErr } = await supabase.from("fichas_ruc").select("*");
  throwIfSupabaseError(cabErr, "Error al cargar fichas RUC");
  if (!cabeceras || cabeceras.length === 0) return {};
  const rucs = cabeceras.map((r) => r.ruc);
  const [tRes, rRes, pRes, eRes] = await Promise.all([
    supabase.from("tributos_afectos").select("*").in("ruc", rucs).order("orden"),
    supabase.from("representantes_legales").select("*").in("ruc", rucs).order("orden"),
    supabase.from("otras_personas_vinculadas").select("*").in("ruc", rucs).order("orden"),
    supabase.from("establecimientos_anexos").select("*").in("ruc", rucs).order("orden")
  ]);
  throwIfSupabaseError(tRes.error, "Error al cargar tributos afectos");
  throwIfSupabaseError(rRes.error, "Error al cargar representantes legales");
  throwIfSupabaseError(pRes.error, "Error al cargar personas vinculadas");
  throwIfSupabaseError(eRes.error, "Error al cargar establecimientos anexos");
  const tributosMap = groupByRuc(tRes.data ?? []);
  const representantesMap = groupByRuc(rRes.data ?? []);
  const personasMap = groupByRuc(pRes.data ?? []);
  const establecimientosMap = groupByRuc(eRes.data ?? []);
  const out = {};
  for (const row of cabeceras) {
    const ruc = String(row.ruc);
    const ficha = dbToFicha(
      row,
      tributosMap[ruc] ?? [],
      representantesMap[ruc] ?? [],
      personasMap[ruc] ?? [],
      establecimientosMap[ruc] ?? []
    );
    out[ruc] = ficha;
  }
  return out;
}
function groupByRuc(rows) {
  const map = {};
  for (const row of rows) {
    const ruc = String(row.ruc ?? "");
    if (!ruc) continue;
    (map[ruc] ??= []).push(row);
  }
  return map;
}
async function upsertFichaRuc(ficha) {
  if (useDjangoApi()) {
    return upsertFichaRucViaApi(ficha);
  }
  const ruc = ficha.ruc.replace(/\D/g, "").slice(0, 11);
  if (ruc.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos");
  }
  const row = sanitizePayload(fichaToDbRow({ ...ficha, ruc }));
  const { data, error } = await supabase.from("fichas_ruc").upsert(row, { onConflict: "ruc" }).select("*").single();
  throwIfSupabaseError(error, "Error al guardar ficha RUC");
  await saveFichaChildren(ruc, ficha);
  const children = await loadFichaChildren(ruc);
  return dbToFicha(
    data,
    children.tributos,
    children.representantes,
    children.personas,
    children.establecimientos
  );
}
const HYDRATE_FLAG = "contam_contribuyentes_supabase_hydrated_v1";
const KEY_CONTRIBUYENTES = "contam_contribuyentes_v1";
function parseCredenciales(raw) {
  const obj = raw ?? {};
  return { usuario: String(obj.usuario ?? ""), clave: String(obj.clave ?? "") };
}
function normalizeLegacyContribuyente(raw) {
  const base = emptyContribuyente();
  const legacyCats = raw.categorias ?? {};
  return {
    ...base,
    id: raw.id != null ? String(raw.id) : void 0,
    ruc: String(raw.ruc ?? "").replace(/\D/g, "").slice(0, 11),
    razonSocial: String(raw.razonSocial ?? raw.razon_social ?? ""),
    estado: raw.estado ?? base.estado,
    otros: String(raw.otros ?? ""),
    fechaVencimientoDeclaracion: String(
      raw.fechaVencimientoDeclaracion ?? raw.fecha_vencimiento_declaracion ?? ""
    ),
    cat1ra: Boolean(raw.cat1ra ?? legacyCats.cat1ra ?? false),
    cat2da: Boolean(raw.cat2da ?? legacyCats.cat2da ?? false),
    cat3ra: Boolean(raw.cat3ra ?? legacyCats.cat3ra ?? false),
    cat4taRetenciones: Boolean(
      raw.cat4taRetenciones ?? raw.cat4ta_retenciones ?? legacyCats.cat4taRetenciones ?? false
    ),
    cat4taCtaPropia: Boolean(
      raw.cat4taCtaPropia ?? raw.cat4ta_cta_propia ?? legacyCats.cat4taCtaPropia ?? false
    ),
    cat5ta: Boolean(raw.cat5ta ?? legacyCats.cat5ta ?? false),
    claveSol: parseCredenciales(raw.claveSol ?? raw.clave_sol),
    afpNet: parseCredenciales(raw.afpNet ?? raw.afp_net),
    validezCpe: parseCredenciales(raw.validezCpe ?? raw.validez_cpe),
    clavesSire: parseCredenciales(raw.clavesSire ?? raw.claves_sire),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : base.createdAt,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : base.updatedAt
  };
}
function readLocalStorageContribuyentes() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_CONTRIBUYENTES);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((item) => normalizeLegacyContribuyente(item));
  } catch {
    return null;
  }
}
function isContribuyentesHydrated() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(HYDRATE_FLAG) === "1";
}
function markContribuyentesHydrated() {
  if (typeof window === "undefined") return;
  localStorage.setItem(HYDRATE_FLAG, "1");
}
async function hydrateContribuyentesOnce() {
  if (typeof window === "undefined") {
    return { migrated: 0, skipped: true, source: "none" };
  }
  if (isContribuyentesHydrated()) {
    return { migrated: 0, skipped: true, source: "none" };
  }
  const stored = readLocalStorageContribuyentes();
  if (!stored?.length) {
    markContribuyentesHydrated();
    return { migrated: 0, skipped: false, source: "none" };
  }
  const migrated = await bulkUpsertContribuyentes(stored);
  markContribuyentesHydrated();
  return { migrated, skipped: false, source: "localStorage" };
}
const KEY_FICHAS = "contam_fichas_ruc_v1";
function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
function loadFichas() {
  return readJson(KEY_FICHAS, {});
}
function saveFichas(fichas) {
  writeJson(KEY_FICHAS, fichas);
}
function formatRequestError(e, fallback) {
  if (useDjangoApi()) {
    return formatApiError(e, fallback ?? "Error de comunicación con el servidor");
  }
  return formatSupabaseError(e);
}
const ContribuyentesContext = reactExports.createContext(null);
function ContribuyentesProvider({ children }) {
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [contribuyentes, setContribuyentes] = reactExports.useState([]);
  const [fichas, setFichas] = reactExports.useState({});
  const refresh = reactExports.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await hydrateContribuyentesOnce();
      const list = await fetchContribuyentes();
      setContribuyentes(list);
      try {
        const remoteFichas = await fetchAllFichas();
        if (Object.keys(remoteFichas).length > 0) {
          setFichas(remoteFichas);
          saveFichas(remoteFichas);
        } else {
          setFichas(loadFichas());
        }
      } catch {
        setFichas(loadFichas());
      }
    } catch (e) {
      const message = formatRequestError(e);
      setError(message);
      setContribuyentes([]);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void refresh();
  }, [refresh]);
  const upsertContribuyente$1 = reactExports.useCallback(async (c) => {
    const saved = await upsertContribuyente(c);
    setContribuyentes((prev) => {
      const idx = prev.findIndex((x) => x.ruc === saved.ruc);
      if (idx >= 0) {
        return prev.map((x, i) => i === idx ? saved : x);
      }
      return [...prev, saved].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
    });
    setFichas((prev) => {
      if (prev[saved.ruc]) return prev;
      const ficha = emptyFichaRuc(saved.ruc, saved.razonSocial);
      const next = { ...prev, [saved.ruc]: ficha };
      saveFichas(next);
      return next;
    });
    return saved;
  }, []);
  const removeContribuyente = reactExports.useCallback(async (ruc) => {
    await deleteContribuyente(ruc);
    setContribuyentes((prev) => prev.filter((x) => x.ruc !== ruc));
    setFichas((prev) => {
      const next = { ...prev };
      delete next[ruc];
      saveFichas(next);
      return next;
    });
  }, []);
  const getFicha = reactExports.useCallback((ruc) => fichas[ruc], [fichas]);
  const saveFicha = reactExports.useCallback(async (ficha) => {
    const saved = await upsertFichaRuc(ficha);
    setFichas((prev) => {
      const next = { ...prev, [saved.ruc]: saved };
      saveFichas(next);
      return next;
    });
    const contrib = await fetchContribuyenteByRuc(saved.ruc);
    if (contrib && saved.general.razonSocial.trim()) {
      const updated = await upsertContribuyente({
        ...contrib,
        razonSocial: saved.general.razonSocial.trim()
      });
      setContribuyentes(
        (prev) => prev.map((c) => c.ruc === updated.ruc ? updated : c)
      );
    }
    return saved;
  }, []);
  const value = reactExports.useMemo(
    () => ({
      loading,
      error,
      contribuyentes,
      fichas,
      upsertContribuyente: upsertContribuyente$1,
      removeContribuyente,
      getFicha,
      saveFicha,
      refresh
    }),
    [
      loading,
      error,
      contribuyentes,
      fichas,
      upsertContribuyente$1,
      removeContribuyente,
      getFicha,
      saveFicha,
      refresh
    ]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ContribuyentesContext.Provider, { value, children });
}
function useContribuyentes() {
  const ctx = reactExports.useContext(ContribuyentesContext);
  if (!ctx) {
    throw new Error("useContribuyentes debe usarse dentro de ContribuyentesProvider");
  }
  return ctx;
}
function useContribuyentesKpis(contribuyentes) {
  return reactExports.useMemo(() => {
    const total = contribuyentes.length;
    const activos = contribuyentes.filter((c) => c.estado === "ACTIVO").length;
    const inactivos = contribuyentes.filter((c) => c.estado === "INACTIVO").length;
    const deBaja = contribuyentes.filter((c) => c.estado === "DE_BAJA").length;
    return { total, activos, inactivos, deBaja };
  }, [contribuyentes]);
}
export {
  ContribuyentesProvider as C,
  emptyEstablecimiento as a,
  emptyFichaRuc as b,
  emptyPersonaVinculada as c,
  emptyRepresentante as d,
  emptyContribuyente as e,
  emptyTributoAfecto as f,
  establecimientosToDb as g,
  fetchAllFichas as h,
  fetchFichaByRuc as i,
  fichaToDbRow as j,
  formatRequestError as k,
  upsertFichaRuc as l,
  useContribuyentes as m,
  useContribuyentesKpis as n,
  validateRuc as o,
  representantesToDb as r,
  tributosToDb as t,
  uid as u,
  validateFichaRequired as v
};
