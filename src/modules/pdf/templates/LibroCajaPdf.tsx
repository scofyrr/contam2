import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import {
  PdfInstitutionalHeader,
  PdfPageFooter,
  pdfBaseStyles,
} from "@/modules/pdf/components/PdfInstitutionalLayout";
import type { LibroCajaPdfProps } from "@/modules/pdf/types/pdfReport";
import { MEDIOS_PAGO_TABLA1 } from "@/modules/tesoreria/types/tesoreria";
import { formatPdfDate, formatPdfMoney, padCorrelativo, truncatePdfText } from "@/modules/pdf/utils/formatPdf";

const ROWS_PER_PAGE = 26;

const col = StyleSheet.create({
  corr: { width: "5%" },
  fecha: { width: "8%" },
  tipo: { width: "7%" },
  medio: { width: "8%" },
  contraparte: { width: "14%" },
  glosa: { width: "20%" },
  cuenta: { width: "14%" },
  ingreso: { width: "8%" },
  egreso: { width: "8%" },
  saldo: { width: "8%" },
});

function labelMedioPago(codigo: string): string {
  const found = MEDIOS_PAGO_TABLA1.find((m) => m.codigo === codigo);
  return found ? found.codigo : codigo || "—";
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks.length ? chunks : [[]];
}

function TableHeader() {
  return (
    <View style={pdfBaseStyles.tableHeader} wrap={false}>
      <Text style={[col.corr, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>N°</Text>
      <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Fecha</Text>
      <Text style={[col.tipo, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Tipo</Text>
      <Text style={[col.medio, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Medio Pago</Text>
      <Text style={[col.contraparte, pdfBaseStyles.cell]}>Contraparte</Text>
      <Text style={[col.glosa, pdfBaseStyles.cell]}>Glosa</Text>
      <Text style={[col.cuenta, pdfBaseStyles.cell]}>Cuenta Financiera</Text>
      <Text style={[col.ingreso, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Ingreso</Text>
      <Text style={[col.egreso, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Egreso</Text>
      <Text style={[col.saldo, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Saldo</Text>
    </View>
  );
}

export function LibroCajaPdfDocument({ meta, data, qrDataUrl }: LibroCajaPdfProps) {
  const pages = chunkRows(data.movimientos, ROWS_PER_PAGE);
  const isLastPage = (idx: number) => idx === pages.length - 1;

  return (
    <Document
      title={`Libro Caja y Bancos 010100 — ${meta.contribuyente.ruc}`}
      author="CONTAM ERP"
      subject="Libro Caja y Bancos Código 010100 SUNAT"
    >
      {pages.map((pageRows, pageIdx) => {
        const pageIngresos = pageRows.reduce((s, r) => s + Number(r.ingreso), 0);
        const pageEgresos = pageRows.reduce((s, r) => s + Number(r.egreso), 0);

        return (
          <Page key={pageIdx} size="A4" orientation="landscape" style={pdfBaseStyles.page}>
            <PdfInstitutionalHeader
              meta={meta}
              qrDataUrl={pageIdx === 0 ? qrDataUrl : undefined}
              titulo="LIBRO CAJA Y BANCOS — CÓDIGO 010100"
              subtitulo={
                data.cuentaFinanciera
                  ? `Cuenta: ${data.cuentaFinanciera} | Periodo ${meta.periodo}`
                  : `Periodo ${meta.periodo} | ${data.movimientos.length} movimiento(s)`
              }
            />

            <TableHeader />

            {pageRows.length === 0 ? (
              <View style={pdfBaseStyles.tableRow} wrap={false}>
                <Text style={[pdfBaseStyles.cell, { width: "100%", textAlign: "center" }]}>
                  Sin movimientos de caja en el periodo.
                </Text>
              </View>
            ) : (
              pageRows.map((mov, idx) => (
                <View
                  key={mov.id}
                  style={[pdfBaseStyles.tableRow, idx % 2 === 1 ? pdfBaseStyles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[col.corr, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {mov.numeroCorrelativoCaja != null
                      ? padCorrelativo(mov.numeroCorrelativoCaja, 5)
                      : "—"}
                  </Text>
                  <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {formatPdfDate(mov.fechaOperacion)}
                  </Text>
                  <Text style={[col.tipo, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {mov.tipoMovimiento ?? "—"}
                  </Text>
                  <Text style={[col.medio, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {labelMedioPago(mov.medioPagoTabla1)}
                  </Text>
                  <Text style={[col.contraparte, pdfBaseStyles.cell]}>
                    {truncatePdfText(
                      mov.razonSocialContraparte ?? mov.rucDniContraparte ?? "—",
                      24,
                    )}
                  </Text>
                  <Text style={[col.glosa, pdfBaseStyles.cell]}>
                    {truncatePdfText(mov.glosa, 40)}
                  </Text>
                  <Text style={[col.cuenta, pdfBaseStyles.cell]}>
                    {truncatePdfText(mov.nombreCuenta ?? "—", 22)}
                  </Text>
                  <Text style={[col.ingreso, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {mov.ingreso > 0 ? formatPdfMoney(mov.ingreso) : "—"}
                  </Text>
                  <Text style={[col.egreso, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {mov.egreso > 0 ? formatPdfMoney(mov.egreso) : "—"}
                  </Text>
                  <Text style={[col.saldo, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {mov.saldoAcumulado != null ? formatPdfMoney(mov.saldoAcumulado) : "—"}
                  </Text>
                </View>
              ))
            )}

            {isLastPage(pageIdx) ? (
              <View style={{ marginTop: 8 }} wrap={false}>
                <View
                  style={{
                    flexDirection: "row",
                    borderTopWidth: 1,
                    borderTopColor: "#3b82f6",
                    paddingTop: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ width: "66%", fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                    TOTALES DEL PERIODO
                  </Text>
                  <Text
                    style={{
                      width: "11%",
                      textAlign: "right",
                      fontFamily: "Helvetica-Bold",
                      fontSize: 7.5,
                      color: "#059669",
                    }}
                  >
                    {formatPdfMoney(data.totalIngresos)}
                  </Text>
                  <Text
                    style={{
                      width: "11%",
                      textAlign: "right",
                      fontFamily: "Helvetica-Bold",
                      fontSize: 7.5,
                      color: "#dc2626",
                    }}
                  >
                    {formatPdfMoney(data.totalEgresos)}
                  </Text>
                  <Text
                    style={{
                      width: "12%",
                      textAlign: "right",
                      fontFamily: "Helvetica-Bold",
                      fontSize: 7.5,
                      color: "#2563eb",
                    }}
                  >
                    {formatPdfMoney(data.saldoFinal)}
                  </Text>
                </View>
              </View>
            ) : null}

            <PdfPageFooter
              meta={meta}
              showPageTotals={pageRows.length > 0}
              pageDebe={pageIngresos}
              pageHaber={pageEgresos}
            />
          </Page>
        );
      })}
    </Document>
  );
}
