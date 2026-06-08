export type CuentaFinancieraTipo = "CAJA_CHICA" | "BANCO";

export type CuentaFinanciera = {
  id: string;
  ruc: string;
  nombre: string;
  tipo: CuentaFinancieraTipo;
  cuenta_contable: string;
  banco: string | null;
  numero_cuenta: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Catálogo simplificado medios de pago SUNAT (tabla 17). */
export const MEDIOS_PAGO_SUNAT = [
  { codigo: "001", label: "Depósito en cuenta" },
  { codigo: "002", label: "Giro" },
  { codigo: "003", label: "Transferencia de fondos" },
  { codigo: "004", label: "Orden de pago" },
  { codigo: "005", label: "Tarjeta de débito" },
  { codigo: "006", label: "Tarjeta de crédito emitida en el país" },
  { codigo: "008", label: "Efectivo por operaciones en las que no existe obligación de utilizar medio de pago" },
  { codigo: "009", label: "Efectivo" },
] as const;
