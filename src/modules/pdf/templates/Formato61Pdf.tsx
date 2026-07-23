import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import {
  PdfInstitutionalHeader,
  PdfPageFooter,
  pdfBaseStyles,
} from "@/modules/pdf/components/PdfInstitutionalLayout";
import type { Formato61PdfProps } from "@/modules/pdf/types/pdfReport";
import type { CuentaMayorizada, FilaLibroMayorF61 } from "@/modules/libro-mayor/types/libroMayor";
import { formatPdfDate, formatPdfMoney, truncatePdfText } from "@/modules/pdf/utils/formatPdf";

const ROWS_PER_PAGE = 22;

const col = StyleSheet.create({
  fecha: { width: "9%" },
  cuo: { width: "14%" },
  glosa: { width: "32%" },
  debe: { width: "12%" },
  haber: { width: "12%" },
  saldo: { width: "13%" },
});

const cuentaHeader = StyleSheet.create({
  block: {
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 2,
  },
  codigo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
  },
  meta: {
    fontSize: 6.5,
    color: "#334155",
    marginTop: 2,
  },
});

function chunkRows<T>(rows: T[], size: number): T[][] {
  if (rows.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
}

type PageSlice = {
  cuenta: CuentaMayorizada;
  rows: FilaLibroMayorF61[];
  chunkIndex: number;
  chunkTotal: number;
  globalPageIndex: number;
};

function buildPageSlices(cuentas: CuentaMayorizada[]): PageSlice[] {
  const slices: PageSlice[] = [];
  let globalIdx = 0;

  for (const cuenta of cuentas) {
    const chunks = chunkRows(cuenta.filas, ROWS_PER_PAGE);
    chunks.forEach((rows, chunkIndex) => {
      slices.push({
        cuenta,
        rows,
        chunkIndex,
        chunkTotal: chunks.length,
        globalPageIndex: globalIdx++,
      });
    });
  }

  if (slices.length === 0) {
    slices.push({
      cuenta: {
        codigoCuenta: "—",
        denominacion: "Sin movimientos",
        saldoInicial: 0,
        totalDebe: 0,
        totalHaber: 0,
        saldoFinal: 0,
        naturalezaSaldo: "NEUTRO",
        filas: [],
      },
      rows: [],
      chunkIndex: 0,
      chunkTotal: 1,
      globalPageIndex: 0,
    });
  }

  return slices;
}

function TableHeader() {
  return (
    <View style={pdfBaseStyles.tableHeader} wrap={false}>
      <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>Fecha</Text>
      <Text style={[col.cuo, pdfBaseStyles.cell]}>CUO Diario</Text>
      <Text style={[col.glosa, pdfBaseStyles.cell]}>Glosa / Operación</Text>
      <Text style={[col.debe, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Debe</Text>
      <Text style={[col.haber, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Haber</Text>
      <Text style={[col.saldo, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>Saldo</Text>
    </View>
  );
}

function CuentaBanner({ cuenta, chunkIndex, chunkTotal }: { cuenta: CuentaMayorizada; chunkIndex: number; chunkTotal: number }) {
  return (
    <View style={cuentaHeader.block} wrap={false}>
      <Text style={cuentaHeader.codigo}>
        {cuenta.codigoCuenta} — {cuenta.denominacion}
        {chunkTotal > 1 ? ` (continuación ${chunkIndex + 1}/${chunkTotal})` : ""}
      </Text>
      <Text style={cuentaHeader.meta}>
        Saldo inicial: {formatPdfMoney(cuenta.saldoInicial)} | Debe periodo: {formatPdfMoney(cuenta.totalDebe)} | Haber periodo: {formatPdfMoney(cuenta.totalHaber)} | Saldo final ({cuenta.naturalezaSaldo}): {formatPdfMoney(Math.abs(cuenta.saldoFinal))}
      </Text>
    </View>
  );
}

export function Formato61PdfDocument({ meta, data, qrDataUrl }: Formato61PdfProps) {
  const slices = buildPageSlices(data.cuentas);
  const totalPages = slices.length;
  const lastPageIdx = totalPages - 1;

  return (
    <Document
      title={`Libro Mayor 6.1 — ${meta.contribuyente.ruc} — ${meta.periodo}`}
      author="CONTAM ERP"
      subject="Formato 6.1 Libro Mayor SUNAT 060100"
    >
      {slices.map((slice, idx) => {
        const pageDebe = slice.rows.reduce((s, r) => s + r.debe, 0);
        const pageHaber = slice.rows.reduce((s, r) => s + r.haber, 0);

        return (
          <Page key={`${slice.cuenta.codigoCuenta}-${slice.chunkIndex}`} size="A4" orientation="landscape" style={pdfBaseStyles.page}>
            {idx === 0 ? (
              <PdfInstitutionalHeader
                meta={meta}
                qrDataUrl={qrDataUrl}
                titulo="FORMATO 6.1: LIBRO MAYOR"
                subtitulo={`Código Tabla 8: 060100 | Periodo ${meta.periodo} | Nivel ${data.nivelCuenta} dígitos | ${data.cuentas.length} cuenta(s)`}
              />
            ) : (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                  FORMATO 6.1 — LIBRO MAYOR — {meta.periodo}
                </Text>
              </View>
            )}

            <CuentaBanner cuenta={slice.cuenta} chunkIndex={slice.chunkIndex} chunkTotal={slice.chunkTotal} />
            <TableHeader />

            {slice.rows.length === 0 ? (
              <View style={pdfBaseStyles.tableRow} wrap={false}>
                <Text style={[pdfBaseStyles.cell, { width: "100%", textAlign: "center" }]}>
                  Sin movimientos para esta cuenta en el periodo.
                </Text>
              </View>
            ) : (
              slice.rows.map((row, rowIdx) => (
                <View
                  key={`${row.cuo}-${row.correlativoLinea}-${rowIdx}`}
                  style={[pdfBaseStyles.tableRow, rowIdx % 2 === 1 ? pdfBaseStyles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[col.fecha, pdfBaseStyles.cell, pdfBaseStyles.cellCenter]}>
                    {formatPdfDate(row.fechaOperacion)}
                  </Text>
                  <Text style={[col.cuo, pdfBaseStyles.cell, pdfBaseStyles.cellMono]}>
                    {row.cuo}
                    {row.correlativoLinea != null ? `-${String(row.correlativoLinea).padStart(3, "0")}` : ""}
                  </Text>
                  <Text style={[col.glosa, pdfBaseStyles.cell]}>
                    {truncatePdfText(row.glosa, 55)}
                  </Text>
                  <Text style={[col.debe, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {row.debe > 0 ? formatPdfMoney(row.debe) : "—"}
                  </Text>
                  <Text style={[col.haber, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {row.haber > 0 ? formatPdfMoney(row.haber) : "—"}
                  </Text>
                  <Text style={[col.saldo, pdfBaseStyles.cell, pdfBaseStyles.cellRight]}>
                    {formatPdfMoney(row.saldoLinea)}
                  </Text>
                </View>
              ))
            )}

            {idx === lastPageIdx && data.cuentas.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 8,
                  paddingTop: 4,
                  borderTopWidth: 1.5,
                  borderTopColor: "#10b981",
                  paddingHorizontal: 3,
                }}
                wrap={false}
              >
                <Text style={{ width: "55%", fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                  TOTALES GENERALES DEL LIBRO MAYOR
                </Text>
                <Text style={{ width: "15%", textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 7.5, color: "#059669" }}>
                  {formatPdfMoney(data.totalDebeGeneral)}
                </Text>
                <Text style={{ width: "15%", textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 7.5, color: "#059669" }}>
                  {formatPdfMoney(data.totalHaberGeneral)}
                </Text>
                <Text style={{ width: "15%", textAlign: "right", fontSize: 7, color: data.cuadrado ? "#059669" : "#dc2626" }}>
                  {data.cuadrado ? "CUADRADO ✓" : "DESCUADRADO ⚠"}
                </Text>
              </View>
            ) : null}

            <PdfPageFooter
              meta={meta}
              pageDebe={pageDebe}
              pageHaber={pageHaber}
              showPageTotals={slice.rows.length > 0}
            />

            <Text
              style={{
                position: "absolute",
                bottom: 8,
                right: 28,
                fontSize: 6,
                color: "#64748b",
              }}
              render={() => `Página ${idx + 1} de ${totalPages}`}
              fixed
            />
          </Page>
        );
      })}
    </Document>
  );
}
