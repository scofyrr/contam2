export type EstadoCliente = "ACTIVO" | "INACTIVO" | "DE_BAJA";

export type CredencialesPortal = {
  usuario: string;
  clave: string;
};

/** Maestro `contribuyentes` — 18 columnas físicas (camelCase en UI) */
export type Contribuyente = {
  id?: string;
  ruc: string;
  razonSocial: string;
  estado: EstadoCliente;
  otros?: string;
  fechaVencimientoDeclaracion?: string | null;
  cat1ra: boolean;
  cat2da: boolean;
  cat3ra: boolean;
  cat4taRetenciones: boolean;
  cat4taCtaPropia: boolean;
  cat5ta: boolean;
  claveSol: CredencialesPortal;
  afpNet: CredencialesPortal;
  validezCpe: CredencialesPortal;
  clavesSire: CredencialesPortal;
  createdAt?: string;
  updatedAt?: string;
};

export type TributoAfecto = {
  id: string;
  tributo: string;
  fechaAlta: string;
  afectoDesde: string;
  marcaExoneracion: string;
  exoneracionDesde: string;
  hasta: string;
  modificacion: string;
};

export type RepresentanteLegal = {
  id: string;
  tipoNroDoc: string;
  apellidosNombres: string;
  fechaNacimiento: string;
  cargo: string;
  fechaDesde: string;
  nroOrdenRepresentacion: string;
};

export type PersonaVinculada = {
  id: string;
  tipoNroDoc: string;
  apellidosNombres: string;
  fechaNacimiento: string;
  vinculo: string;
  fechaDesde: string;
  residencia: string;
  porcentaje: string;
};

export type EstablecimientoAnexo = {
  id: string;
  codigo: string;
  tipo: string;
  denominacion: string;
  ubigeo: string;
  domicilio: string;
  otrasReferencias: string;
  condLegal: string;
  licenciaMunicipal: string;
  actEcon: string;
  modificacion: string;
};

export type FichaRuc = {
  ruc: string;
  general: {
    razonSocial: string;
    tipoContribuyente: string;
    fechaInscripcion: string;
    fechaInicioActividades: string;
    estadoContribuyente: string;
    dependenciaSunat: string;
    condicionDomicilioFiscal: string;
    emisorElectronicoDesde: string;
    comprobantesElectronicos: string;
    fechaBaja: string;
  };
  modificacionContribuyente: {
    nombreComercial: string;
    tipoRepresentacion: string;
    actividadEconomicaPrincipal: string;
    actividadEconomicaSecundaria1: string;
    actividadEconomicaSecundaria2: string;
    sistemaEmisionComprobantes: string;
    sistemaContabilidad: string;
    codigoProfesionOficio: string;
    actividadComercioExterior: string;
    numeroFax: string;
    telefonoFijo1: string;
    telefonoFijo2: string;
    telefonoMovil1: string;
    telefonoMovil2: string;
    correoElectronico1: string;
    correoElectronico2: string;
  };
  domicilioFiscal: {
    actividadEconomica: string;
    departamento: string;
    provincia: string;
    distrito: string;
    tipoNombreZona: string;
    tipoNombreVia: string;
    nroKmMzLote: string;
    otrasReferencias: string;
    condicionInmueble: string;
    licenciaMunicipal: string;
  };
  personaNatural: {
    documentoIdentidad: string;
    fechaNacimientoSucesion: string;
    sexo: string;
    pasaporte: string;
    nacionalidad: string;
    paisProcedencia: string;
    condDomiciliado: string;
  };
  empresa: {
    fechaInscripcionRrPp: string;
    numeroPartidaRegistral: string;
    tomoFichaFolioAsiento: string;
    origenCapital: string;
    paisOrigenCapital: string;
  };
  tributosAfectos: TributoAfecto[];
  representantesLegales: RepresentanteLegal[];
  personasVinculadas: PersonaVinculada[];
  establecimientosAnexos: EstablecimientoAnexo[];
  updatedAt: string;
};
