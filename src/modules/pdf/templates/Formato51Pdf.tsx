import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import {
  PdfInstitutionalHeader,
  PdfPageFooter,
  pdfBaseStyles,
} from "@/modules/pdf/components/PdfInstitutionalLayout";
import type { Formato51PdfProps } from "@/modules/pdf/types/pdfReport";
import { formatPdfDate, formatPdfMoney, truncatePdfText } from "@/modules/pdf/utils/formatPdf";

const ROWS_PER_PAGE = 28;

const col = StyleSheet.create({
  cuo: { width: "11%" },
  fecha: { width: "7%" },
  glosa: { width: "18%" },
  libro: { width: "7%" },
  sust: { width: "9%" },
  doc: { width: "9%" },
  cuenta: { width: "9%" },
  denom: { width: "14%" },
  debe: { width: "8%" },
  haber: { width: "8%" },
});

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
      <Text style={[col.cuo, pdfBaseStyles.cell]}>CUO</Text>
      <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Fecha</Text>
      <Text style={[col.glosa, pdfBaseStyles.cell]}>Glosa</Text>
      <Text style={[col.libro, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Tabla 8</Text>
      <Text style={[col.sust, pdfBaseStyles.cell]}>N° Sust.</Text>
      <Text style={[col.doc, pdfBaseStyles.cell]}>N° Doc.</Text>
      <Text style={[col.cuenta, pdfBaseStyles.cell]}>Cuenta</Text>
      <Text style={[col.denom, pdfBaseStyles.cell]}>Denominación</Text>
      <Text style={[col.debe, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Debe</Text>
      <Text style={[col.haber, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Haber</Text>
    </View>
  );
}

export function Formato51PdfDocument({ meta, data, qrDataUrl }: Formato51PdfProps) {
  const pages = chunkRows(data.filas, ROWS_PER_PAGE);
  const isLastPage = (idx: number) => idx === pages.length - 1;

  return (
    <Document
      title={`Libro Diario 5.1 — ${meta.contribuyente.ruc} — ${meta.periodo}`}
      author="CONTAM ERP"
      subject="Formato 5.1 Libro Diario SUNAT"
    >
      {pages.map((pageRows, pageIdx) => {
        const pageDebe = pageRows.reduce((s, r) => s + Number(r.debe), 0);
        const pageHaber = pageRows.reduce((s, r) => s + Number(r.haber), 0);

        return (
          <Page key={pageIdx} size="A4" orientation="landscape" style={pdfBaseStyles.page}>
            <PdfInstitutionalHeader
              meta={meta}
              qrDataUrl={pageIdx === 0 ? qrDataUrl : undefined}
              titulo="FORMATO 5.1 — LIBRO DIARIO"
              subtitulo={`Periodo ${meta.periodo} | ${data.filas.length} línea(s) | ${data.cuadrado ? "CUADRADO ✓" : "DESCUADRADO ⚠"}`}
            />

            <TableHeader />

            {pageRows.length === 0 ? (
              <View style={pdfBaseStyles.tableRow} wrap={false}>
                <Text style={[pdfBaseStyles.cell, { width: "100%", textAlign: "center" }]}>
                  Sin movimientos registrados en el periodo.
                </Text>
              </View>
            ) : (
              pageRows.map((row, idx) => (
                <View
                  key={`${row.cuo}-${row.correlativoLinea}-${idx}`}
                  style={[pdfBaseStyles.tableRow, idx % 2 === 1 ? pdfBaseStyles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[col.cuo, pdfBaseStyles.cell, pdfBaseStyles.cellMono]}>
                    {truncatePdfText(row.cuo, 14)}
                  </Text>
                  <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {formatPdfDate(row.fechaOperacion)}
                  </Text>
                  <Text style={[col.glosa, pdfBaseStyles.cell]}>
                    {truncatePdfText(row.glosa, 36)}
                  </Text>
                  <Text style={[col.libro, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {row.codigoLibroTabla8}
                  </Text>
                  <Text style={[col.sust, pdfBaseStyles.cell, pdfBaseStyles.cellMono]}>
                    {truncatePdfText(row.numeroCorrelativoSustentatorio ?? "—", 12)}
                  </Text>
                  <Text style={[col.doc, pdfBaseStyles.cell, pdfBaseStyles.cellMono]}>
                    {truncatePdfText(row.numeroDocumentoSustentatorio ?? "—", 12)}
                  </Text>
                  <Text style={[col.cuenta, pdfBaseStyles.cell, pdfBaseStyles.cellMono]}>
                    {row.cuentaCodigo}
                  </Text>
                  <Text style={[col.denom, pdfBaseStyles.cell]}>
                    {truncatePdfText(row.cuentaDenominacion, 28)}
                  </Text>
                  <Text style={[col.debe, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {row.debe > 0 ? formatPdfMoney(row.debe) : "—"}
                  </Text>
                  <Text style={[col.haber, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {row.haber > 0 ? formatPdfMoney(row.haber) : "—"}
                  </Text>
                </View>
              ))
            )}

            {isLastPage(pageIdx) && data.filas.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 6,
                  paddingTop: 4,
                  borderTopWidth: 1.5,
                  borderTopColor: "#10b981",
                  paddingHorizontal: 3,
                }}
                wrap={false}
              >
                <Text style={{ width: "74%", fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                  TOTALES GENERALES DEL PERIODO
                </Text>
                <Text
                  style={{
                    width: "13%",
                    textAlign: "right",
                    fontFamily: "Helvetica-Bold",
                    fontSize: 7.5,
                    color: "#059669",
                  }}
                >
                  {formatPdfMoney(data.totalDebe)}
                </Text>
                <Text
                  style={{
                    width: "13%",
                    textAlign: "right",
                    fontFamily: "Helvetica-Bold",
                    fontSize: 7.5,
                    color: "#059669",
                  }}
                >
                  {formatPdfMoney(data.totalHaber)}
                </Text>
              </View>
            ) : null}

            <PdfPageFooter
              meta={meta}
              pageDebe={pageDebe}
              pageHaber={pageHaber}
              showPageTotals={pageRows.length > 0}
            />
          </Page>
        );
      })}
    </Document>
  );
}
