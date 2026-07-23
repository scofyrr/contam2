export type RegimenTributario = "NRUS" | "RER" | "RMT" | "RG";

export type EstudioRol = "ADMIN" | "CONTADOR" | "ASISTENTE" | "AUDITOR";

export type FormatoLibroDiario =
  | "FORMATO_5_2_SIMPLIFICADO"
  | "FORMATO_5_1_DIARIO"
  | "NO_APLICA";

export interface EstudioContable {
  id: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
  createdAt: string;
  updatedAt: string;
}

export interface ContribuyenteAnexo {
  id: string;
  contribuyenteId: string;
  codigoAnexo: string;
  tipoEstablecimiento: string | null;
  direccion: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  estado: string;
}

export interface ContribuyenteRepresentante {
  id: string;
  contribuyenteId: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  cargo: string | null;
  fechaDesde: string | null;
  estado: string;
}

export interface ContribuyenteTributo {
  id: string;
  contribuyenteId: string;
  codigoTributo: string;
  descripcionTributo: string | null;
  fechaAfectacion: string | null;
  estado: string;
}

export interface ContribuyenteIngresosAnuales {
  id: string;
  contribuyenteId: string;
  ejercicio: number;
  ingresosBrutosSoles: number;
  uitMonto: number;
  ingresosBrutosUit: number;
}

export interface Contribuyente {
  id: string;
  estudioId: string | null;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  estadoContribuyente: string | null;
  condicionDomicilio: string | null;
  codigoRegimen: RegimenTributario | null;
  direccionFiscal: string | null;
  ubigeo: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  sistemaEmision: string | null;
  sistemaContabilidad: string | null;
  actividadEconomicaPrincipal: string | null;
  fechaInicioActividades: string | null;
  esAgenteRetencion: boolean;
  esAgentePercepcion: boolean;
  esBuenContribuyente: boolean;
  estado: string;
  createdAt: string;
  updatedAt: string;
  anexos: ContribuyenteAnexo[];
  representantes: ContribuyenteRepresentante[];
  tributos: ContribuyenteTributo[];
  ingresosAnuales: ContribuyenteIngresosAnuales[];
}

export interface FichaRucAnexoInput {
  codigoAnexo: string;
  tipoEstablecimiento?: string | null;
  direccion?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  estado?: string | null;
}

export interface FichaRucRepresentanteInput {
  tipoDocumento?: string | null;
  numeroDocumento: string;
  nombreCompleto: string;
  cargo?: string | null;
  fechaDesde?: string | null;
  estado?: string | null;
}

export interface FichaRucTributoInput {
  codigoTributo: string;
  descripcionTributo?: string | null;
  fechaAfectacion?: string | null;
  estado?: string | null;
}

export interface FichaRucDecolecta {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string | null;
  estadoContribuyente?: string | null;
  condicionDomicilio?: string | null;
  codigoRegimen?: RegimenTributario | null;
  direccionFiscal?: string | null;
  ubigeo?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  sistemaEmision?: string | null;
  sistemaContabilidad?: string | null;
  actividadEconomicaPrincipal?: string | null;
  fechaInicioActividades?: string | null;
  esAgenteRetencion?: boolean;
  esAgentePercepcion?: boolean;
  esBuenContribuyente?: boolean;
  estado?: string | null;
  otros?: string | null;
  anexos?: FichaRucAnexoInput[];
  representantes?: FichaRucRepresentanteInput[];
  tributos?: FichaRucTributoInput[];
  ingresosAnuales?: Record<string, number>;
}

export interface LibroObligado {
  codigo: string;
  nombre: string;
  obligatorio: boolean;
  formatoPle?: string;
  descripcion?: string;
  destacado?: boolean;
}

export interface ProfilingUmbralesUit {
  simplificado: number;
  intermedio: number;
  completo: number;
}

export interface ProfilingResult {
  contribuyenteId: string;
  ruc: string;
  razonSocial: string;
  ejercicio: number;
  codigoRegimen: RegimenTributario | null;
  estadoContribuyente: string | null;
  condicionDomicilio: string | null;
  ingresosBrutosSoles: number;
  uitMonto: number;
  ingresosBrutosUit: number;
  formatoLibroDiario: FormatoLibroDiario;
  umbralesUit: ProfilingUmbralesUit;
  librosObligados: LibroObligado[];
  evaluadoAt: string;
}

export interface UpsertContribuyenteResult {
  ok: boolean;
  contribuyenteId: string;
  ruc: string;
  estudioId: string;
  updatedAt: string;
}

export interface EstudioUsuario {
  id: string;
  estudioId: string;
  userId: string;
  rol: EstudioRol;
  activo: boolean;
  estudio?: EstudioContable;
}
