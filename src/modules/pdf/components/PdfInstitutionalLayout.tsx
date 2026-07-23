import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { PdfReportMeta } from "@/modules/pdf/types/pdfReport";
import { formatPdfDate, formatPdfPeriodo, truncatePdfText } from "@/modules/pdf/utils/formatPdf";

export const pdfBaseStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 52,
    paddingHorizontal: 28,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#10b981",
    paddingBottom: 8,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "55%",
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  brandTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },
  brandSub: {
    fontSize: 7,
    color: "#475569",
    marginTop: 2,
  },
  metaBlock: {
    alignItems: "flex-end",
    maxWidth: "42%",
  },
  metaLine: {
    fontSize: 7,
    color: "#334155",
    marginBottom: 2,
    textAlign: "right",
  },
  metaBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  qrBlock: {
    alignItems: "center",
    marginTop: 4,
  },
  qrImage: {
    width: 52,
    height: 52,
  },
  qrCaption: {
    fontSize: 5.5,
    color: "#64748b",
    marginTop: 2,
    textAlign: "center",
  },
  titleBanner: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: "#0f172a",
  },
  subtitleText: {
    fontSize: 7,
    textAlign: "center",
    color: "#475569",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 3,
    paddingHorizontal: 3,
    minHeight: 14,
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    fontSize: 6.5,
    color: "#1e293b",
  },
  cellRight: {
    textAlign: "right",
  },
  cellCenter: {
    textAlign: "center",
  },
  cellMono: {
    fontFamily: "Courier",
    fontSize: 6,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 6,
    color: "#64748b",
  },
  footerTotals: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  signatureBlock: {
    alignItems: "center",
    width: 120,
  },
  signatureImage: {
    width: 80,
    height: 28,
    objectFit: "contain",
    marginBottom: 2,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: "#94a3b8",
    width: "100%",
    paddingTop: 2,
    fontSize: 6,
    textAlign: "center",
    color: "#475569",
  },
  pageNumber: {
    fontSize: 6,
    color: "#64748b",
  },
});

export function PdfInstitutionalHeader({
  meta,
  qrDataUrl,
  titulo,
  subtitulo,
}: {
  meta: PdfReportMeta;
  qrDataUrl?: string;
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <View>
      <View style={pdfBaseStyles.headerRow}>
        <View style={pdfBaseStyles.brandBlock}>
          {meta.logoUrl ? (
            <Image src={meta.logoUrl} style={pdfBaseStyles.logo} />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#10b981",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Helvetica-Bold" }}>C</Text>
            </View>
          )}
          <View>
            <Text style={pdfBaseStyles.brandTitle}>CONTAM ERP</Text>
            <Text style={pdfBaseStyles.brandSub}>
              {truncatePdfText(meta.contribuyente.razonSocial, 48)}
            </Text>
            <Text style={pdfBaseStyles.brandSub}>RUC {meta.contribuyente.ruc}</Text>
          </View>
        </View>

        <View style={pdfBaseStyles.metaBlock}>
          <Text style={pdfBaseStyles.metaLine}>
            <Text style={pdfBaseStyles.metaBold}>Periodo: </Text>
            {formatPdfPeriodo(meta.periodo)}
          </Text>
          <Text style={pdfBaseStyles.metaLine}>
            <Text style={pdfBaseStyles.metaBold}>Libro Tabla 8: </Text>
            {meta.codigoLibro}
          </Text>
          <Text style={pdfBaseStyles.metaLine}>
            <Text style={pdfBaseStyles.metaBold}>Generado: </Text>
            {formatPdfDate(meta.generatedAt.slice(0, 10))}
          </Text>
          {qrDataUrl ? (
            <View style={pdfBaseStyles.qrBlock}>
              <Image src={qrDataUrl} style={pdfBaseStyles.qrImage} />
              <Text style={pdfBaseStyles.qrCaption}>{meta.verificationCode.slice(0, 24)}…</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={pdfBaseStyles.titleBanner}>
        <Text style={pdfBaseStyles.titleText}>{titulo}</Text>
        {subtitulo ? <Text style={pdfBaseStyles.subtitleText}>{subtitulo}</Text> : null}
      </View>
    </View>
  );
}

export function PdfPageFooter({
  pageDebe,
  pageHaber,
  showPageTotals,
  meta,
  pageLabel = true,
}: {
  pageDebe?: number;
  pageHaber?: number;
  showPageTotals?: boolean;
  meta: PdfReportMeta;
  pageLabel?: boolean;
}) {
  return (
    <View style={pdfBaseStyles.footer} fixed>
      <View style={{ maxWidth: "55%" }}>
        {showPageTotals && pageDebe !== undefined && pageHaber !== undefined ? (
          <Text style={pdfBaseStyles.footerTotals}>
            Totales página — Debe: S/ {pageDebe.toFixed(2)} | Haber: S/ {pageHaber.toFixed(2)}
          </Text>
        ) : null}
        <Text style={pdfBaseStyles.footerText}>
          Código verificación: {meta.verificationCode}
        </Text>
        <Text style={pdfBaseStyles.footerText}>
          Documento generado por CONTAM ERP — Uso interno / sustento SUNAT
        </Text>
      </View>

      <View style={pdfBaseStyles.signatureBlock}>
        {meta.firmaDigitalUrl ? (
          <Image src={meta.firmaDigitalUrl} style={pdfBaseStyles.signatureImage} />
        ) : null}
        <Text style={pdfBaseStyles.signatureLine}>
          {meta.elaboradoPor ?? "Contador(a) Responsable"}
        </Text>
      </View>

      {pageLabel ? (
        <Text
          style={pdfBaseStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}`}
        />
      ) : null}
    </View>
  );
}
