import type {
  Contribuyente,
  CategoriasTributarias,
  EstablecimientoAnexo,
  FichaRuc,
  PersonaVinculada,
  RepresentanteLegal,
  TributoAfecto,
} from "@/lib/contribuyentes-types";

export function uid(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyCategorias(): CategoriasTributarias {
  return {
    cat1ra: false,
    cat2da: false,
    cat3ra: false,
    cat4taRetenciones: false,
    cat4taCtaPropia: false,
    cat5ta: false,
  };
}

export function emptyContribuyente(): Contribuyente {
  const now = new Date().toISOString();
  return {
    ruc: "",
    razonSocial: "",
    otros: "",
    categorias: emptyCategorias(),
    fechaVencimientoDeclaracion: "",
    estado: "ACTIVO",
    claveSol: { usuario: "", clave: "" },
    afpNet: { usuario: "", clave: "" },
    validezCpe: { usuario: "", clave: "" },
    clavesSire: { usuario: "", clave: "" },
    createdAt: now,
    updatedAt: now,
  };
}

export function emptyTributoAfecto(): TributoAfecto {
  return {
    id: uid(),
    tributo: "",
    fechaAlta: "",
    afectoDesde: "",
    marcaExoneracion: "",
    exoneracionDesde: "",
    hasta: "",
    modificacion: "",
  };
}

export function emptyRepresentante(): RepresentanteLegal {
  return {
    id: uid(),
    tipoNroDoc: "",
    apellidosNombres: "",
    fechaNacimiento: "",
    cargo: "",
    fechaDesde: "",
    nroOrdenRepresentacion: "",
  };
}

export function emptyPersonaVinculada(): PersonaVinculada {
  return {
    id: uid(),
    tipoNroDoc: "",
    apellidosNombres: "",
    fechaNacimiento: "",
    vinculo: "",
    fechaDesde: "",
    residencia: "",
    porcentaje: "",
  };
}

export function emptyEstablecimiento(): EstablecimientoAnexo {
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
    modificacion: "",
  };
}

export function emptyFichaRuc(ruc: string, razonSocial = ""): FichaRuc {
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
      fechaBaja: "",
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
      correoElectronico2: "",
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
      licenciaMunicipal: "",
    },
    personaNatural: {
      documentoIdentidad: "",
      fechaNacimientoSucesion: "",
      sexo: "",
      pasaporte: "",
      nacionalidad: "",
      paisProcedencia: "",
      condDomiciliado: "",
    },
    empresa: {
      fechaInscripcionRrPp: "",
      numeroPartidaRegistral: "",
      tomoFichaFolioAsiento: "",
      origenCapital: "",
      paisOrigenCapital: "",
    },
    tributosAfectos: [],
    representantesLegales: [],
    personasVinculadas: [],
    establecimientosAnexos: [],
    updatedAt: new Date().toISOString(),
  };
}

export function validateRuc(ruc: string): string | null {
  const clean = ruc.replace(/\D/g, "");
  if (clean.length !== 11) return "El RUC debe tener 11 dígitos numéricos";
  return null;
}

export function validateFichaRequired(ficha: FichaRuc): string | null {
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
