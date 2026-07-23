import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Minus,
  Plus,
  Printer,
  X,
} from "lucide-react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { ClientOnly } from "@/components/common/ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PdfDownloadButton } from "@/modules/pdf/components/PdfDownloadButton";
import { downloadBlob } from "@/modules/pdf/utils/pdfEngine";
import { buildQrPayload, generateQrDataUrl } from "@/modules/pdf/utils/qrCode";
import type { PdfReportMeta } from "@/modules/pdf/types/pdfReport";

export interface CsvExportConfig {
  fileName: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ReportViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileName: string;
  meta?: PdfReportMeta;
  buildDocument: (qrDataUrl?: string) => ReactElement<DocumentProps>;
  csvExport?: CsvExportConfig;
  excelExport?: CsvExportConfig;
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function exportCsv(config: CsvExportConfig) {
  const lines = [
    config.headers.join(","),
    ...config.rows.map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, config.fileName.endsWith(".csv") ? config.fileName : `${config.fileName}.csv`);
}

function exportExcel(config: CsvExportConfig) {
  const ws = XLSX.utils.aoa_to_sheet([config.headers, ...config.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, config.fileName.endsWith(".xlsx") ? config.fileName : `${config.fileName}.xlsx`);
}

function PdfPreviewFrame({
  blobUrl,
  zoom,
}: {
  blobUrl: string | null;
  zoom: number;
}) {
  if (!blobUrl) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <Loader2 className="size-8 animate-spin mr-2" />
        Renderizando vista previa…
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto flex justify-center p-4">
      <iframe
        title="Vista previa PDF"
        src={`${blobUrl}#zoom=${Math.round(zoom * 100)}`}
        className="bg-white shadow-2xl border border-slate-700/50 rounded-lg"
        style={{
          width: `${Math.min(920 * zoom, 1200)}px`,
          height: `${Math.min(680 * zoom, 900)}px`,
          minHeight: "60vh",
        }}
      />
    </div>
  );
}

export function ReportViewerModal({
  open,
  onOpenChange,
  title,
  fileName,
  meta,
  buildDocument,
  csvExport,
  excelExport,
}: ReportViewerModalProps) {
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoomIdx, setZoomIdx] = useState(2);
  const blobRef = useRef<string | null>(null);

  const zoom = ZOOM_STEPS[zoomIdx] ?? 1;

  const prepareQr = useCallback(async () => {
    if (!meta) return undefined;
    const payload = buildQrPayload({
      verificationCode: meta.verificationCode,
      ruc: meta.contribuyente.ruc,
      periodo: meta.periodo,
      codigoLibro: meta.codigoLibro,
    });
    return generateQrDataUrl(payload);
  }, [meta]);

  const generatePreview = useCallback(async () => {
    setLoading(true);
    try {
      const qrDataUrl = meta ? await prepareQr() : undefined;
      const doc = buildDocument(qrDataUrl);
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      blobRef.current = url;
      setBlobUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al generar PDF");
      setBlobUrl(null);
    } finally {
      setLoading(false);
    }
  }, [buildDocument, meta, prepareQr]);

  useEffect(() => {
    if (open) {
      void generatePreview();
    } else {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      setBlobUrl(null);
    }

    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [open, generatePreview]);

  const handlePrint = useCallback(() => {
    if (!blobUrl) return;
    const w = window.open(blobUrl, "_blank", "noopener,noreferrer");
    w?.addEventListener("load", () => w.print());
  }, [blobUrl]);

  const toolbar = useMemo(
    () => (
      <div className="glass-report-toolbar flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1 mr-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 glass-button"
            disabled={zoomIdx <= 0}
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            aria-label="Reducir zoom"
          >
            <Minus className="size-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 glass-button"
            disabled={zoomIdx >= ZOOM_STEPS.length - 1}
            onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            aria-label="Aumentar zoom"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="glass-button gap-1.5"
          disabled={!blobUrl}
          onClick={handlePrint}
        >
          <Printer className="size-3.5" />
          Imprimir
        </Button>

        <PdfDownloadButton
          buildDocument={buildDocument}
          fileName={fileName}
          prepareQr={meta ? prepareQr : undefined}
          label="PDF"
          variant="glass-cobalt"
          className="h-8 px-3 text-sm"
        />

        {csvExport ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-button gap-1.5"
            onClick={() => {
              exportCsv(csvExport);
              toast.success("CSV exportado");
            }}
          >
            <Download className="size-3.5" />
            CSV
          </Button>
        ) : null}

        {excelExport ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-button gap-1.5"
            onClick={() => {
              exportExcel(excelExport);
              toast.success("Excel exportado");
            }}
          >
            <FileSpreadsheet className="size-3.5" />
            Excel
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onOpenChange(false)}
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </Button>
      </div>
    ),
    [
      zoom,
      zoomIdx,
      blobUrl,
      handlePrint,
      buildDocument,
      fileName,
      meta,
      prepareQr,
      csvExport,
      excelExport,
      onOpenChange,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[96vw] w-[96vw] h-[94vh] p-0 gap-0 overflow-hidden",
          "glass-panel border-slate-800/80 bg-brand-slate-950/95",
        )}
      >
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-slate-800/80 shrink-0">
          <DialogTitle className="text-emerald-300 font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {toolbar}

        <div className="glass-report-viewport flex-1 min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
              <Loader2 className="size-8 animate-spin text-emerald-400 mr-2" />
              <span className="text-slate-300 text-sm">Generando PDF vectorial…</span>
            </div>
          ) : null}

          <ClientOnly
            fallback={
              <div className="flex h-full items-center justify-center p-8">
                <div className="glass-shimmer h-64 w-full max-w-2xl rounded-xl" />
              </div>
            }
          >
            <PdfPreviewFrame blobUrl={blobUrl} zoom={zoom} />
          </ClientOnly>
        </div>
      </DialogContent>
    </Dialog>
  );
}
