import { useCallback, useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/modules/pdf/utils/pdfEngine";

export interface PdfDownloadButtonProps {
  /** Factory del documento @react-pdf/renderer */
  buildDocument: (qrDataUrl?: string) => ReactElement<DocumentProps>;
  fileName: string;
  label?: string;
  /** Genera QR antes de renderizar (async) */
  prepareQr?: () => Promise<string | undefined>;
  variant?: "default" | "glass" | "glass-primary" | "glass-cobalt";
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PdfDownloadButton({
  buildDocument,
  fileName,
  label = "Descargar PDF",
  prepareQr,
  variant = "glass-primary",
  className,
  disabled,
  onSuccess,
  onError,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const qrDataUrl = prepareQr ? await prepareQr() : undefined;
      const doc = buildDocument(qrDataUrl);
      const blob = await pdf(doc).toBlob();
      downloadBlob(blob, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
      onSuccess?.();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [loading, disabled, prepareQr, buildDocument, fileName, onSuccess, onError]);

  const variantClass =
    variant === "glass"
      ? "glass-button"
      : variant === "glass-primary"
        ? "glass-button glass-button-primary text-white border-0"
        : variant === "glass-cobalt"
          ? "glass-button glass-button-cobalt text-white border-0"
          : undefined;

  return (
    <Button
      type="button"
      variant={variant.startsWith("glass") ? "ghost" : "default"}
      className={cn(variantClass, "gap-2", className)}
      disabled={disabled || loading}
      onClick={() => void handleDownload()}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Download className="size-4" aria-hidden />
      )}
      {loading ? "Generando PDF…" : label}
    </Button>
  );
}
