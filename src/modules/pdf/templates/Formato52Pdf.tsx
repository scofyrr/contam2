import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import {
  PdfInstitutionalHeader,
  PdfPageFooter,
  pdfBaseStyles,
} from "@/modules/pdf/components/PdfInstitutionalLayout";
import type { Formato52PdfProps } from "@/modules/pdf/types/pdfReport";
import { TABLA9_COLUMNAS } from "@/modules/contabilidad/types/contabilidad";
import { formatPdfDate, formatPdfMoney } from "@/modules/pdf/utils/formatPdf";

const ROWS_PER_PAGE = 22;

type ElementoKey = keyof typeof TABLA9_COLUMNAS;

const ELEMENTO_LABELS: Record<ElementoKey, string> = {
  activo: "ACTIVO",
  pasivo: "PASIVO",
  patrimonio: "PATRIMONIO",
  gastos: "GASTOS",
  ingresos: "INGRESOS",
};

const ELEMENTO_COLORS: Record<ElementoKey, string> = {
  activo: "#059669",
  pasivo: "#dc2626",
  patrimonio: "#2563eb",
  gastos: "#d97706",
  ingresos: "#7c3aed",
};

function sumRecord(rec: Record<string, number>): number {
  return Object.values(rec).reduce((s, v) => s + Number(v), 0);
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks.length ? chunks : [[]];
}

function MatrizHeader({ columnas }: { columnas: string[] }) {
  const cellW = `${Math.max(6, Math.floor(88 / Math.max(columnas.length, 1)))}%`;
  return (
    <View style={{ flexDirection: "row", marginBottom: 1 }} wrap={false}>
      <Text style={{ width: "10%", fontSize: 6, fontFamily: "Helvetica-Bold" }}>Fecha</Text>
      <Text style={{ width: "6%", fontSize: 6, fontFamily: "Helvetica-Bold" }}>Mes</Text>
      {columnas.map((c) => (
        <Text
          key={c}
          style={{ width: cellW, fontSize: 5.5, fontFamily: "Helvetica-Bold", textAlign: "right" }}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

function MatrizRow({
  fecha,
  mes,
  columnas,
  valores,
  alt,
}: {
  fecha: string;
  mes: string;
  columnas: string[];
  valores: Record<string, number>;
  alt: boolean;
}) {
  const cellW = `${Math.max(6, Math.floor(88 / Math.max(columnas.length, 1)))}%`;
  return (
    <View
      style={[
        pdfBaseStyles.tableRow,
        alt ? pdfBaseStyles.tableRowAlt : {},
        { paddingVertical: 2 },
      ]}
      wrap={false}
    >
      <Text style={{ width: "10%", fontSize: 6 }}>{formatPdfDate(fecha)}</Text>
      <Text style={{ width: "6%", fontSize: 6, textAlign: "center" }}>{mes}</Text>
      {columnas.map((c) => (
        <Text key={c} style={{ width: cellW, fontSize: 5.5, textAlign: "right" }}>
          {valores[c] ? formatPdfMoney(valores[c]).replace("S/ ", "") : "—"}
        </Text>
      ))}
    </View>
  );
}

export function Formato52PdfDocument({ meta, data, qrDataUrl }: Formato52PdfProps) {
  const elementos = Object.keys(TABLA9_COLUMNAS) as ElementoKey[];
  const pages = chunkRows(data.filas, ROWS_PER_PAGE);

  return (
    <Document
      title={`Libro Diario Simplificado 5.2 — ${meta.contribuyente.ruc}`}
      author="CONTAM ERP"
      subject="Formato 5.2 Tabla 9 SUNAT"
    >
      {elementos.map((elemento) => {
        const columnas = data.tabla9[elemento] ?? TABLA9_COLUMNAS[elemento];
        const elementoPages = pages.length ? pages : [[]];

        return elementoPages.map((pageRows, pageIdx) => (
          <Page key={`${elemento}-${pageIdx}`} size="A4" orientation="landscape" style={pdfBaseStyles.page}>
            {pageIdx === 0 && elemento === "activo" ? (
              <PdfInstitutionalHeader
                meta={meta}
                qrDataUrl={qrDataUrl}
                titulo="FORMATO 5.2 — LIBRO DIARIO SIMPLIFICADO"
                subtitulo={`Tabla 9 SUNAT — Periodo ${meta.periodo}`}
              />
            ) : (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                  FORMATO 5.2 — {meta.periodo}
                </Text>
              </View>
            )}

            <View
              style={{
                backgroundColor: ELEMENTO_COLORS[elemento],
                paddingVertical: 4,
                paddingHorizontal: 6,
                marginBottom: 4,
                borderRadius: 2,
              }}
              wrap={false}
            >
              <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                ELEMENTO: {ELEMENTO_LABELS[elemento]} — Columnas Tabla 9
              </Text>
            </View>

            <MatrizHeader columnas={columnas} />

            {pageRows.length === 0 ? (
              <View style={pdfBaseStyles.tableRow} wrap={false}>
                <Text style={{ fontSize: 6, width: "100%", textAlign: "center" }}>
                  Sin movimientos en el periodo para este elemento.
                </Text>
              </View>
            ) : (
              pageRows.map((row, idx) => (
                <MatrizRow
                  key={`${row.fechaOperacion}-${idx}`}
                  fecha={row.fechaOperacion}
                  mes={row.mes}
                  columnas={columnas}
                  valores={row[elemento]}
                  alt={idx % 2 === 1}
                />
              ))
            )}

            {pageIdx === elementoPages.length - 1 ? (
              <View
                style={{
                  marginTop: 6,
                  paddingTop: 4,
                  borderTopWidth: 1,
                  borderTopColor: ELEMENTO_COLORS[elemento],
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
                wrap={false}
              >
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                  Subtotal {ELEMENTO_LABELS[elemento]}:{" "}
                  {formatPdfMoney(
                    data.filas.reduce((s, r) => s + sumRecord(r[elemento]), 0),
                  )}
                </Text>
              </View>
            ) : null}

            <PdfPageFooter meta={meta} showPageTotals={false} />
          </Page>
        ));
      })}
    </Document>
  );
}
