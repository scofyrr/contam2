import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExportButtonsProps = {
  label?: string;
  disabled?: boolean;
  onExportExcel?: () => Promise<void>;
  onExportPdf?: () => Promise<void>;
  compact?: boolean;
  prominent?: boolean;
};

export function ExportButtons({
  label = "Exportar",
  disabled,
  onExportExcel,
  onExportPdf,
  compact,
  prominent,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  const run = async (kind: "excel" | "pdf", fn: () => Promise<void>) => {
    setLoading(kind);
    try {
      await fn();
      toast.success(kind === "excel" ? "Excel descargado" : "PDF descargado");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setLoading(null);
    }
  };

  const excelClass = prominent
    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md font-semibold"
    : "border-emerald-600 text-emerald-700 hover:bg-emerald-50";

  const pdfClass = prominent
    ? "bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-md font-semibold"
    : "border-red-600 text-red-700 hover:bg-red-50";

  if (compact || prominent) {
    return (
      <div className="flex flex-wrap gap-2">
        {onExportExcel && (
          <Button
            size={prominent ? "default" : "sm"}
            disabled={disabled || loading !== null}
            onClick={() => run("excel", onExportExcel)}
            className={cn(excelClass)}
          >
            {loading === "excel" ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-4 mr-2" />
            )}
            Excel
          </Button>
        )}
        {onExportPdf && (
          <Button
            size={prominent ? "default" : "sm"}
            disabled={disabled || loading !== null}
            onClick={() => run("pdf", onExportPdf)}
            className={cn(pdfClass)}
          >
            {loading === "pdf" ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <FileText className="size-4 mr-2" />
            )}
            PDF
          </Button>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || loading !== null}>
          {loading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Download className="size-4 mr-2" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Descargar reporte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onExportExcel && (
          <DropdownMenuItem
            onClick={() => run("excel", onExportExcel)}
            className="text-emerald-700 focus:text-emerald-800"
          >
            <FileSpreadsheet className="size-4 mr-2 text-emerald-600" />
            Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {onExportPdf && (
          <DropdownMenuItem
            onClick={() => run("pdf", onExportPdf)}
            className="text-red-700 focus:text-red-800"
          >
            <FileText className="size-4 mr-2 text-red-600" />
            PDF (tablas + gráficos)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
