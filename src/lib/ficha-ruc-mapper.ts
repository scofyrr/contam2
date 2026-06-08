import type {
  EstablecimientoAnexo,
  FichaRuc,
  PersonaVinculada,
  RepresentanteLegal,
  TributoAfecto,
} from "@/lib/contribuyentes-types";

function s(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function dateOrEmpty(value: unknown): string {
  const t = s(value);
  return t ? t.slice(0, 10) : "";
}

function splitDoc(combined: string): { tipo: string; numero: string } {
  const text = s(combined);
  if (!text) return { tipo: "", numero: "" };
  if (text.includes(" - ")) {
    const [a, b] = text.split(" - ", 2);
    return { tipo: a.trim(), numero: b.trim() };
  }
  const parts = text.split(/\s+/, 2);
  return parts.length === 2 ? { tipo: parts[0], numero: parts[1] } : { tipo: text, numero: "" };
}

function joinDoc(tipo: string, numero: string): string {
  if (tipo && numero) return `${tipo} - ${numero}`;
  return tipo || numero;
}

function boolFromUi(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  const t = s(value).toLowerCase();
  return t === "si" || t === "sí" || t === "true" || t === "1";
}

/** FichaRuc UI → fila `fichas_ruc` + tablas hijas (por RUC). */
export function fichaToDbRow(ficha: FichaRuc): Record<string, unknown> {
  const g = ficha.general;
  const m = ficha.modificacionContribuyente;
  const d = ficha.domicilioFiscal;
  const p = ficha.personaNatural;
  const e = ficha.empresa;
  const ruc = s(ficha.ruc).replace(/\D/g, "").slice(0, 11);

  return {
    ruc,
    razon_social: s(g.razonSocial),
    nombre_comercial: s(m.nombreComercial),
    tipo_contribuyente: s(g.tipoContribuyente),
    estado_contribuyente: s(g.estadoContribuyente),
    condicion_domicilio_fiscal: s(g.condicionDomicilioFiscal),
    dependencia_sunat: s(g.dependenciaSunat),
    tipo_representacion: s(m.tipoRepresentacion),
    fecha_inscripcion: dateOrEmpty(g.fechaInscripcion) || null,
    fecha_inicio_actividades: dateOrEmpty(g.fechaInicioActividades) || null,
    emisor_electronico_desde: dateOrEmpty(g.emisorElectronicoDesde) || null,
    fecha_baja: dateOrEmpty(g.fechaBaja) || null,
    comprobantes_electronicos: boolFromUi(g.comprobantesElectronicos),
    sistema_emision_comprobantes: s(m.sistemaEmisionComprobantes),
    sistema_contabilidad: s(m.sistemaContabilidad),
    actividad_comercio_exterior: s(m.actividadComercioExterior),
    actividad_economica_principal: s(m.actividadEconomicaPrincipal),
    actividad_economica_secundaria1: s(m.actividadEconomicaSecundaria1),
    actividad_economica_secundaria2: s(m.actividadEconomicaSecundaria2),
    actividad_economica: s(d.actividadEconomica),
    condicion_inmueble: s(d.condicionInmueble),
    licencia_municipal: s(d.licenciaMunicipal),
    numero_partida_registral: s(e.numeroPartidaRegistral),
    tomo_ficha_folio_asiento: s(e.tomoFichaFolioAsiento),
    fecha_inscripcion_rrpp: dateOrEmpty(e.fechaInscripcionRrPp) || null,
    fecha_nacimiento: dateOrEmpty(p.fechaNacimientoSucesion) || null,
    sexo: s(p.sexo),
    documento_identidad: s(p.documentoIdentidad),
    nacionalidad: s(p.nacionalidad),
    pais_procedencia: s(p.paisProcedencia),
    pais_origen_capital: s(e.paisOrigenCapital),
    origen_capital: s(e.origenCapital),
    cond_domiciliado: s(p.condDomiciliado),
    codigo_profesion_oficio: s(m.codigoProfesionOficio),
    departamento: s(d.departamento),
    provincia: s(d.provincia),
    distrito: s(d.distrito),
    tipo_via: s(d.tipoNombreVia),
    numero: s(d.nroKmMzLote),
    tipo_zona: s(d.tipoNombreZona),
    otras_referencias: s(d.otrasReferencias),
    numero_fax: s(m.numeroFax),
    telefono_fijo1: s(m.telefonoFijo1),
    telefono_fijo2: s(m.telefonoFijo2),
    telefono_movil1: s(m.telefonoMovil1),
    telefono_movil2: s(m.telefonoMovil2),
    correo_electronico1: s(m.correoElectronico1),
    correo_electronico2: s(m.correoElectronico2),
    pasaporte: s(p.pasaporte),
  };
}

export function tributosToDb(ruc: string, rows: TributoAfecto[]) {
  return rows.map((row, i) => ({
    ruc,
    tributo: s(row.tributo),
    fecha_alta: dateOrEmpty(row.fechaAlta) || null,
    afecto_desde: dateOrEmpty(row.afectoDesde) || null,
    exoneracion_desde: dateOrEmpty(row.exoneracionDesde) || null,
    hasta: dateOrEmpty(row.hasta) || null,
    marca_exoneracion: boolFromUi(row.marcaExoneracion),
    modificacion: s(row.modificacion),
    orden: i,
  }));
}

export function representantesToDb(ruc: string, rows: RepresentanteLegal[]) {
  return rows.map((row, i) => {
    const doc = splitDoc(row.tipoNroDoc);
    return {
      ruc,
      tipo_documento: doc.tipo,
      numero_documento: doc.numero,
      apellidos_nombres: s(row.apellidosNombres),
      cargo: s(row.cargo),
      fecha_desde: dateOrEmpty(row.fechaDesde) || null,
      fecha_nacimiento: dateOrEmpty(row.fechaNacimiento) || null,
      numero_orden_representacion: s(row.nroOrdenRepresentacion),
      orden: i,
    };
  });
}

export function personasToDb(ruc: string, rows: PersonaVinculada[]) {
  return rows.map((row, i) => {
    const doc = splitDoc(row.tipoNroDoc);
    const pct = s(row.porcentaje);
    return {
      ruc,
      tipo_documento: doc.tipo,
      numero_documento: doc.numero,
      apellidos_nombres: s(row.apellidosNombres),
      fecha_desde: dateOrEmpty(row.fechaDesde) || null,
      fecha_nacimiento: dateOrEmpty(row.fechaNacimiento) || null,
      porcentaje: pct ? Number(pct) : null,
      orden: i,
    };
  });
}

export function establecimientosToDb(ruc: string, rows: EstablecimientoAnexo[]) {
  return rows.map((row, i) => ({
    ruc,
    codigo: s(row.codigo),
    tipo: s(row.tipo),
    denominacion: s(row.denominacion),
    ubigeo: s(row.ubigeo),
    domicilio: s(row.domicilio),
    otras_referencias: s(row.otrasReferencias),
    condicion_legal: s(row.condLegal),
    licencia_municipal: s(row.licenciaMunicipal),
    actividad_economica: s(row.actEcon),
    modificacion: s(row.modificacion),
    orden: i,
  }));
}

/** Fila BD + hijos → FichaRuc UI. */
export function dbToFicha(
  row: Record<string, unknown>,
  tributos: Record<string, unknown>[],
  representantes: Record<string, unknown>[],
  personas: Record<string, unknown>[],
  establecimientos: Record<string, unknown>[],
): FichaRuc {
  const ruc = s(row.ruc);
  return {
    ruc,
    updatedAt: s(row.updated_at),
    general: {
      razonSocial: s(row.razon_social),
      tipoContribuyente: s(row.tipo_contribuyente),
      fechaInscripcion: dateOrEmpty(row.fecha_inscripcion),
      fechaInicioActividades: dateOrEmpty(row.fecha_inicio_actividades),
      estadoContribuyente: s(row.estado_contribuyente),
      dependenciaSunat: s(row.dependencia_sunat),
      condicionDomicilioFiscal: s(row.condicion_domicilio_fiscal),
      emisorElectronicoDesde: dateOrEmpty(row.emisor_electronico_desde),
      comprobantesElectronicos:
        typeof row.comprobantes_electronicos === "boolean"
          ? row.comprobantes_electronicos
            ? "SI"
            : "NO"
          : row.comprobantes_electronicos
            ? "SI"
            : "NO",
      fechaBaja: dateOrEmpty(row.fecha_baja),
    },
    modificacionContribuyente: {
      nombreComercial: s(row.nombre_comercial),
      tipoRepresentacion: s(row.tipo_representacion),
      actividadEconomicaPrincipal: s(row.actividad_economica_principal),
      actividadEconomicaSecundaria1: s(row.actividad_economica_secundaria1),
      actividadEconomicaSecundaria2: s(row.actividad_economica_secundaria2),
      sistemaEmisionComprobantes: s(row.sistema_emision_comprobantes),
      sistemaContabilidad: s(row.sistema_contabilidad),
      codigoProfesionOficio: s(row.codigo_profesion_oficio),
      actividadComercioExterior: s(row.actividad_comercio_exterior),
      numeroFax: s(row.numero_fax),
      telefonoFijo1: s(row.telefono_fijo1),
      telefonoFijo2: s(row.telefono_fijo2),
      telefonoMovil1: s(row.telefono_movil1),
      telefonoMovil2: s(row.telefono_movil2),
      correoElectronico1: s(row.correo_electronico1),
      correoElectronico2: s(row.correo_electronico2),
    },
    domicilioFiscal: {
      actividadEconomica: s(row.actividad_economica),
      departamento: s(row.departamento),
      provincia: s(row.provincia),
      distrito: s(row.distrito),
      tipoNombreZona: s(row.tipo_zona),
      tipoNombreVia: s(row.tipo_via),
      nroKmMzLote: s(row.numero),
      otrasReferencias: s(row.otras_referencias),
      condicionInmueble: s(row.condicion_inmueble),
      licenciaMunicipal: s(row.licencia_municipal),
    },
    personaNatural: {
      documentoIdentidad: s(row.documento_identidad),
      fechaNacimientoSucesion: dateOrEmpty(row.fecha_nacimiento),
      sexo: s(row.sexo),
      pasaporte: s(row.pasaporte),
      nacionalidad: s(row.nacionalidad),
      paisProcedencia: s(row.pais_procedencia),
      condDomiciliado: s(row.cond_domiciliado),
    },
    empresa: {
      fechaInscripcionRrPp: dateOrEmpty(row.fecha_inscripcion_rrpp),
      numeroPartidaRegistral: s(row.numero_partida_registral),
      tomoFichaFolioAsiento: s(row.tomo_ficha_folio_asiento),
      origenCapital: s(row.origen_capital),
      paisOrigenCapital: s(row.pais_origen_capital),
    },
    tributosAfectos: tributos.map((t) => ({
      id: String(t.id ?? ""),
      tributo: s(t.tributo),
      fechaAlta: dateOrEmpty(t.fecha_alta),
      afectoDesde: dateOrEmpty(t.afecto_desde),
      marcaExoneracion: t.marca_exoneracion ? "SI" : "NO",
      exoneracionDesde: dateOrEmpty(t.exoneracion_desde),
      hasta: dateOrEmpty(t.hasta),
      modificacion: s(t.modificacion),
    })),
    representantesLegales: representantes.map((r) => ({
      id: String(r.id ?? ""),
      tipoNroDoc: joinDoc(s(r.tipo_documento), s(r.numero_documento)),
      apellidosNombres: s(r.apellidos_nombres),
      fechaNacimiento: dateOrEmpty(r.fecha_nacimiento),
      cargo: s(r.cargo),
      fechaDesde: dateOrEmpty(r.fecha_desde),
      nroOrdenRepresentacion: s(r.numero_orden_representacion),
    })),
    personasVinculadas: personas.map((p) => ({
      id: String(p.id ?? ""),
      tipoNroDoc: joinDoc(s(p.tipo_documento), s(p.numero_documento)),
      apellidosNombres: s(p.apellidos_nombres),
      fechaNacimiento: dateOrEmpty(p.fecha_nacimiento),
      vinculo: "",
      fechaDesde: dateOrEmpty(p.fecha_desde),
      residencia: "",
      porcentaje: p.porcentaje != null ? String(p.porcentaje) : "",
    })),
    establecimientosAnexos: establecimientos.map((e) => ({
      id: String(e.id ?? ""),
      codigo: s(e.codigo),
      tipo: s(e.tipo),
      denominacion: s(e.denominacion),
      ubigeo: s(e.ubigeo),
      domicilio: s(e.domicilio),
      otrasReferencias: s(e.otras_referencias),
      condLegal: s(e.condicion_legal),
      licenciaMunicipal: s(e.licencia_municipal),
      actEcon: s(e.actividad_economica),
      modificacion: s(e.modificacion),
    })),
  };
}

export const FICHA_RUC_COLUMNS = "*";
