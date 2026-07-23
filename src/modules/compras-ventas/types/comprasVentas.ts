export type DestinoIgv =
  | "DESTINO_1_GRAVADO"
  | "DESTINO_2_MIXTO"
  | "DESTINO_3_NO_GRAVADO"
  | "SIN_CREDITO_FISCAL";

export type EstadoProvision =
  | "PENDIENTE"
  | "PROVISIONADO"
  | "LIQUIDADO_PARCIAL"
  | "PAGADO"
  | "ANULADO";

export type TipoComprobanteSunat = "01" | "03" | "07" | "08";

export interface DetraccionInfo {
  tieneDetraccion: boolean;
  constanciaNum: string | null;
  fechaDetraccion: string | null;
  porcentaje: number;
  monto: number;
}

export interface PercepcionInfo {
  tienePercepcion: boolean;
  monto: number;
}

export interface RetencionInfo {
  tieneRetencion: boolean;
  monto: number;
}

export interface CompraRce {
  id: string;
  contribuyenteId: string;
  periodoId: string | null;
  registroSireId: string | null;
  tipoComprobante: string;
  serie: string | null;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  rucProveedor: string | null;
  razonSocialProveedor: string | null;
  moneda: string;
  tipoCambio: number;
  destinoIgv: DestinoIgv;
  baseImponible: number;
  igv: number;
  igvCreditoFiscal: number;
  igvCostoGasto: number;
  valorNoGravado: number;
  otrosCargos: number;
  total: number;
  detraccion: DetraccionInfo;
  retencion: RetencionInfo;
  percepcion: PercepcionInfo;
  estadoProvision: EstadoProvision;
  comprobanteRefSerie: string | null;
  comprobanteRefNumero: string | null;
  comprobanteRefFecha: string | null;
  periodo: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoOperacionVenta = "GRAVADA" | "EXONERADA" | "INAFECTA" | "EXPORTACION" | "MIXTA";

export interface VentaRvie {
  id: string;
  contribuyenteId: string;
  periodoId: string | null;
  registroSireId: string | null;
  tipoComprobante: string;
  serie: string | null;
  numero: string;
  fechaEmision: string;
  rucCliente: string | null;
  razonSocialCliente: string | null;
  moneda: string;
  tipoCambio: number;
  baseImponibleGravada: number;
  igv: number;
  valorExonerado: number;
  valorInafecto: number;
  exportacion: number;
  icbper: number;
  total: number;
  detraccion: DetraccionInfo;
  percepcion: PercepcionInfo;
  retencion: RetencionInfo;
  estadoProvision: EstadoProvision;
  comprobanteRefSerie: string | null;
  comprobanteRefNumero: string | null;
  periodo: string;
  tipoOperacion: TipoOperacionVenta;
  createdAt: string;
  updatedAt: string;
}

export interface ResumenFiscal {
  contribuyenteId: string;
  periodo: string;
  debitoFiscalIgvVentas: number;
  creditoFiscalDestino1: number;
  creditoFiscalDestino2Prorrata: number;
  igvCostoDestino3: number;
  igvSinCreditoFiscal: number;
  creditoFiscalTotal: number;
  igvAPagarEstimado: number;
  saldoFavorEstimado: number;
  cantidadCompras: number;
  cantidadVentas: number;
  evaluadoAt: string;
}

export interface FiltrosTablaComprobantes {
  busqueda?: string;
  destinoIgv?: DestinoIgv;
  estadoProvision?: EstadoProvision;
  soloConDetraccion?: boolean;
}

export interface ClasificarDestinoResult {
  ok: boolean;
  compraId: string;
  destinoIgv: DestinoIgv;
  igvCreditoFiscal: number;
  igvCostoGasto: number;
  igvOriginal: number;
}

export const DESTINO_IGV_LABELS: Record<DestinoIgv, string> = {
  DESTINO_1_GRAVADO: "Destino 1 — Gravado (100% CF)",
  DESTINO_2_MIXTO: "Destino 2 — Mixto (Prorrata)",
  DESTINO_3_NO_GRAVADO: "Destino 3 — No Gravado",
  SIN_CREDITO_FISCAL: "Sin Crédito Fiscal",
};

export const DESTINO_IGV_COLORS: Record<DestinoIgv, string> = {
  DESTINO_1_GRAVADO: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
  DESTINO_2_MIXTO: "border-amber-500/50 bg-amber-500/15 text-amber-300",
  DESTINO_3_NO_GRAVADO: "border-red-500/50 bg-red-500/15 text-red-300",
  SIN_CREDITO_FISCAL: "border-slate-500/50 bg-slate-500/15 text-slate-400",
};
