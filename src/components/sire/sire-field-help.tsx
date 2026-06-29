import { FieldHelper } from "@/components/ui/field-helper";

export const SIRE_FIELD_HELP: Record<string, string> = {
  ruc: "RUC del contribuyente emisor (11 dígitos). Debe existir en el módulo Contribuyentes.",
  razon_social: "Denominación o razón social tal como figura en SUNAT para el RUC indicado.",
  periodo: "Periodo tributario en formato AAAAMM (ej. 202506 = junio 2026).",
  cod_tipo_cdp: "Código SUNAT del comprobante: 01 Factura, 03 Boleta, 07 NC, 08 ND, etc.",
  serie_cdp: "Serie del comprobante según formato SUNAT (ej. F001, B001).",
  nro_cdp_inicial: "Número correlativo inicial del comprobante. Use N° Final solo para rangos.",
  tipo_doc_contraparte: "Tipo de documento del proveedor/cliente: 6=RUC, 1=DNI, 0=No domiciliado.",
  nro_doc_contraparte: "Número de documento de identidad de la contraparte comercial.",
  nombre_contraparte: "Nombre o razón social del proveedor (compras) o cliente (ventas).",
  importe_total: "Importe total del comprobante en la moneda indicada, incluyendo IGV si aplica.",
  cod_moneda: "Moneda de la operación: PEN (soles), USD o EUR según el comprobante.",
};

export function SireFieldHelper({ field, errors }: { field: string; errors: string[] }) {
  const help = SIRE_FIELD_HELP[field];
  const hasError = errors.includes(field);

  if (hasError) {
    return (
      <FieldHelper variant="error">
        Campo obligatorio para el registro SIRE. {help}
      </FieldHelper>
    );
  }

  if (!help) return null;
  return <FieldHelper className="mt-0.5">{help}</FieldHelper>;
}

export const SIRE_SECTION_HELP = {
  contribuyente: "Identifique al contribuyente cuyo RUC reportará este comprobante en RVIE o RCE.",
  documento: "Datos del comprobante de pago según estructura extendida SUNAT (35 columnas).",
  contraparte: "Proveedor en compras o cliente en ventas. Requerido para trazabilidad fiscal.",
  montos: "Valores monetarios del comprobante. El importe total debe cuadrar con base imponible + IGV.",
} as const;
