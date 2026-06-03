import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatSupabaseError } from "@/lib/supabase-error";

type ExportButtonsProps = {
  label?: string;
  disabled?: boolean;
  onExportExcel?: () => Promise<void>;
  onExportPdf?: () => Promise<void>;
  onImportExcel?: (file: File) => Promise<void>;
  importAccept?: string;
  compact?: boolean;
  prominent?: boolean;
};

export function ExportButtons({
  label = "Exportar",
  disabled,
  onExportExcel,
  onExportPdf,
  onImportExcel,
  importAccept = ".xlsx,.xls,.csv",
  compact,
  prominent,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | "import" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (kind: "excel" | "pdf" | "import", fn: () => Promise<void>) => {
    setLoading(kind);
    try {
      await fn();
      if (kind === "excel") toast.success("Excel descargado");
      else if (kind === "pdf") toast.success("PDF descargado");
      else toast.success("Importación completada");
    } catch (e) {
      console.error(e);
      toast.error(formatSupabaseError(e));
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

  const importClass = prominent
    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-md font-semibold"
    : "border-blue-600 text-blue-700 hover:bg-blue-50";

  const handleFile = (file: File | undefined) => {
    if (!file || !onImportExcel) return;
    void run("import", () => onImportExcel(file));
  };

  if (compact || prominent) {
    return (
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={importAccept}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {onImportExcel && (
          <Button
            size={prominent ? "default" : "sm"}
            disabled={disabled || loading !== null}
            onClick={() => fileRef.current?.click()}
            className={cn(importClass)}
          >
            {loading === "import" ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            Importar
          </Button>
        )}
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
    <>
      <input
        ref={fileRef}
        type="file"
        accept={importAccept}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
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
          <DropdownMenuLabel>Reportes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onImportExcel && (
            <DropdownMenuItem
              onClick={() => fileRef.current?.click()}
              className="text-blue-700 focus:text-blue-800"
            >
              <Upload className="size-4 mr-2 text-blue-600" />
              Importar Excel/CSV
            </DropdownMenuItem>
          )}
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
              PDF
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
