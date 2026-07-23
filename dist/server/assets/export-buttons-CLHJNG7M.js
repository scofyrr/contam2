import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { D as DropdownMenu, e as DropdownMenuTrigger, a as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, b as DropdownMenuItem } from "./dropdown-menu-IQZlPG59.js";
import { aj as toast, x as formatSupabaseError } from "./router-BRL0s0LD.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { L as LoaderCircle } from "./loader-circle-OqnuRBje.js";
import { U as Upload } from "./upload-B8cCOVxr.js";
import { F as FileSpreadsheet } from "./file-spreadsheet-CREGzpL3.js";
import { F as FileText } from "./file-text-BTjS5wgu.js";
import { D as Download } from "./download-BBwbUiAc.js";
function ExportButtons({
  label = "Exportar",
  disabled,
  onExportExcel,
  onExportPdf,
  onImportExcel,
  importAccept = ".xlsx,.xls,.csv",
  compact,
  prominent
}) {
  const [loading, setLoading] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const run = async (kind, fn) => {
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
  const excelClass = prominent ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md font-semibold" : "border-emerald-600 text-emerald-700 hover:bg-emerald-50";
  const pdfClass = prominent ? "bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-md font-semibold" : "border-red-600 text-red-700 hover:bg-red-50";
  const importClass = prominent ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-md font-semibold" : "border-blue-600 text-blue-700 hover:bg-blue-50";
  const handleFile = (file) => {
    if (!file || !onImportExcel) return;
    void run("import", () => onImportExcel(file));
  };
  if (compact || prominent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: importAccept,
          className: "hidden",
          onChange: (e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }
        }
      ),
      onImportExcel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: prominent ? "default" : "sm",
          disabled: disabled || loading !== null,
          onClick: () => fileRef.current?.click(),
          className: cn(importClass),
          children: [
            loading === "import" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4 mr-2" }),
            "Importar"
          ]
        }
      ),
      onExportExcel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: prominent ? "default" : "sm",
          disabled: disabled || loading !== null,
          onClick: () => run("excel", onExportExcel),
          className: cn(excelClass),
          children: [
            loading === "excel" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4 mr-2" }),
            "Excel"
          ]
        }
      ),
      onExportPdf && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: prominent ? "default" : "sm",
          disabled: disabled || loading !== null,
          onClick: () => run("pdf", onExportPdf),
          className: cn(pdfClass),
          children: [
            loading === "pdf" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4 mr-2" }),
            "PDF"
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: importAccept,
        className: "hidden",
        onChange: (e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: disabled || loading !== null, children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4 mr-2" }),
        label
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Reportes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        onImportExcel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuItem,
          {
            onClick: () => fileRef.current?.click(),
            className: "text-blue-700 focus:text-blue-800",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4 mr-2 text-blue-600" }),
              "Importar Excel/CSV"
            ]
          }
        ),
        onExportExcel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuItem,
          {
            onClick: () => run("excel", onExportExcel),
            className: "text-emerald-700 focus:text-emerald-800",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4 mr-2 text-emerald-600" }),
              "Excel (.xlsx)"
            ]
          }
        ),
        onExportPdf && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuItem,
          {
            onClick: () => run("pdf", onExportPdf),
            className: "text-red-700 focus:text-red-800",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4 mr-2 text-red-600" }),
              "PDF"
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  ExportButtons as E
};
