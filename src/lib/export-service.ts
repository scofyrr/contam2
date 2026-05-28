import type {
  ChartCatalogId,
  ChartsResponse,
  KpisResponse,
  LibroDiarioLinea,
  RegistroSire,
} from "@/lib/sire-types";
import { CHART_CATALOG } from "@/lib/sire-types";
import { libroToExportRow, registroToExportRow } from "@/lib/sire-data";

export type ExportOptions = {
  /** IDs de gráficos a incluir (data-export-chart). Vacío = todos visibles */
  chartIds?: ChartCatalogId[];
  includeRegistros?: boolean;
  includeLibro?: boolean;
  includeKpis?: boolean;
};

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportPack = {
  titulo: string;
  periodo?: string;
  registros: RegistroSire[];
  libro: LibroDiarioLinea[];
  kpis: KpisResponse;
  charts: ChartsResponse;
};

function chartDataSheets(charts: ChartsResponse, ids: ChartCatalogId[]) {
  const sheets: { name: string; rows: Record<string, unknown>[] }[] = [];
  const has = (id: ChartCatalogId) => ids.length === 0 || ids.includes(id);

  if (has("chart-ventas-compras") || has("chart-utilidad") || has("chart-igv")) {
    sheets.push({
      name: "Resumen_periodos",
      rows: charts.utilidadPorPeriodo.map((u, i) => ({
        Periodo: u.periodo,
        Ventas: charts.ventasPorPeriodo[i]?.total ?? 0,
        Compras: charts.comprasPorPeriodo[i]?.total ?? 0,
        Utilidad: u.utilidad,
        IGV_Ventas: charts.igvPorPeriodo[i]?.igvVentas ?? 0,
        IGV_Compras: charts.igvPorPeriodo[i]?.igvCompras ?? 0,
      })),
    });
  }
  if (has("chart-mix")) {
    sheets.push({ name: "Mix", rows: charts.mixVentasCompras });
  }
  if (has("chart-tipo-cdp")) {
    sheets.push({ name: "Tipo_CDP", rows: charts.porTipoComprobante });
  }
  if (has("chart-estado")) {
    sheets.push({ name: "Estado_val", rows: charts.porEstadoValidacion });
  }
  if (has("chart-top-contrapartes")) {
    sheets.push({ name: "Top_contrapartes", rows: charts.topContrapartes });
  }
  if (has("chart-importe")) {
    sheets.push({ name: "Importe_total", rows: charts.importeTotalPorPeriodo });
  }
  return sheets;
}

export async function exportToExcel(pack: ExportPack, options: ExportOptions = {}) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const suffix = pack.periodo ? `_${pack.periodo}` : `_${stamp()}`;
  const chartIds = options.chartIds ?? [];

  if (options.includeRegistros !== false) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pack.registros.map(registroToExportRow)),
      "Registros SIRE",
    );
  }

  if (options.includeLibro !== false && pack.libro.length > 0) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pack.libro.map(libroToExportRow)),
      "Libro Diario",
    );
  }

  if (options.includeKpis !== false) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Indicador: "Ventas totales (base)", Valor: pack.kpis.ventasTotales },
        { Indicador: "Compras totales (base)", Valor: pack.kpis.comprasTotales },
        { Indicador: "Utilidad neta", Valor: pack.kpis.utilidadNeta },
        { Indicador: "IGV ventas", Valor: pack.kpis.igvVentas },
        { Indicador: "IGV compras", Valor: pack.kpis.igvCompras },
        { Indicador: "Ratio IGV", Valor: pack.kpis.ratioIgv },
      ]),
      "KPIs",
    );
  }

  for (const sheet of chartDataSheets(pack.charts, chartIds)) {
    const meta = CHART_CATALOG.find((c) => c.sheet === sheet.name);
    const name = (meta?.sheet ?? sheet.name).slice(0, 31);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet.rows), name);
  }

  if (chartIds.length === 0) {
    const wsCharts = XLSX.utils.json_to_sheet(
      pack.charts.utilidadPorPeriodo.map((u, i) => ({
        Periodo: u.periodo,
        "Base ventas": pack.charts.ventasPorPeriodo[i]?.total ?? 0,
        "Base compras": pack.charts.comprasPorPeriodo[i]?.total ?? 0,
        Utilidad: u.utilidad,
      })),
    );
    XLSX.utils.book_append_sheet(wb, wsCharts, "Datos_graficos");
  }

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${pack.titulo}${suffix}.xlsx`,
  );
}

async function captureChartImages(
  chartIds?: ChartCatalogId[],
): Promise<{ title: string; dataUrl: string }[]> {
  const html2canvas = (await import("html2canvas")).default;
  const selector =
    chartIds && chartIds.length > 0
      ? chartIds.map((id) => `[data-export-chart="${id}"]`).join(",")
      : "[data-export-chart]";
  const nodes = document.querySelectorAll<HTMLElement>(selector);
  const shots: { title: string; dataUrl: string }[] = [];

  for (const el of nodes) {
    const title =
      el.querySelector("[data-chart-title]")?.textContent?.trim() ?? "Gráfico";
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });
    shots.push({ title, dataUrl: canvas.toDataURL("image/png") });
  }

  return shots;
}

export async function exportToPdf(pack: ExportPack, options: ExportOptions = {}) {
  const chartIds = options.chartIds;
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const suffix = pack.periodo ? `_${pack.periodo}` : `_${stamp()}`;
  let y = 14;

  doc.setFontSize(16);
  doc.text(pack.titulo, 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generado: ${new Date().toLocaleString("es-PE")} | Periodo: ${pack.periodo || "Todos"} | Registros: ${pack.registros.length} | Líneas diario: ${pack.libro.length}`,
    14,
    y,
  );
  y += 10;
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.text("Indicadores clave", 14, y);
  y += 4;

  if (options.includeKpis !== false) {
    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor (S/)"]],
      body: [
        ["Ventas totales", pack.kpis.ventasTotales.toFixed(2)],
        ["Compras totales", pack.kpis.comprasTotales.toFixed(2)],
        ["Utilidad neta", pack.kpis.utilidadNeta.toFixed(2)],
        ["Ratio IGV", pack.kpis.ratioIgv.toFixed(2)],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] },
    });
    y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
    y += 10;
  }

  if (options.includeRegistros !== false && pack.registros.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(12);
    doc.text("Registros SIRE (muestra)", 14, y);
    y += 4;

    const regRows = pack.registros.slice(0, 25).map((r) => [
    r.periodo,
    r.tipo,
    `${r.cod_tipo_cdp}-${r.serie_cdp ?? ""}-${r.nro_cdp_inicial}`,
    (r.nombre_contraparte ?? "").slice(0, 28),
    Number(r.importe_total).toFixed(2),
    r.estado_validacion ?? "pendiente",
  ]);

    autoTable(doc, {
      startY: y,
      head: [["Periodo", "Tipo", "Comprobante", "Contraparte", "Total", "Estado"]],
      body: regRows,
      theme: "striped",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
    y += 10;
  }

  if (options.includeLibro !== false && pack.libro.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(12);
    doc.text("Libro diario (muestra)", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Cuenta", "Debe", "Haber", "Glosa"]],
      body: pack.libro.slice(0, 30).map((l) => [
        l.fecha_asiento,
        l.cuenta_contable,
        l.debe > 0 ? l.debe.toFixed(2) : "",
        l.haber > 0 ? l.haber.toFixed(2) : "",
        (l.glosa ?? "").slice(0, 40),
      ]),
      theme: "striped",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 163, 74] },
    });
  }

  const charts = await captureChartImages(chartIds);
  for (const shot of charts) {
    doc.addPage();
    doc.setFontSize(13);
    doc.text(shot.title, 14, 16);
    const imgW = 180;
    const imgH = 100;
    doc.addImage(shot.dataUrl, "PNG", 14, 22, imgW, imgH);
  }

  doc.save(`${pack.titulo}${suffix}.pdf`);
}

export async function exportRegistrosExcel(registros: RegistroSire[], periodo?: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(registros.map(registroToExportRow)),
    "Registros SIRE",
  );
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const suffix = periodo ? `_${periodo}` : `_${stamp()}`;
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `CONTAM_Registros_SIRE${suffix}.xlsx`,
  );
}

export async function exportLibroPdf(
  libro: LibroDiarioLinea[],
  periodo?: string,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  const suffix = periodo ? `_${periodo}` : `_${stamp()}`;
  doc.setFontSize(14);
  doc.text("Libro Diario — CONTAM", 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [["Fecha", "Cuenta", "Debe", "Haber", "Glosa", "Tipo"]],
    body: libro.map((l) => [
      l.fecha_asiento,
      l.cuenta_contable,
      l.debe > 0 ? l.debe.toFixed(2) : "",
      l.haber > 0 ? l.haber.toFixed(2) : "",
      (l.glosa ?? "").slice(0, 50),
      l.tipo_registro ?? "",
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [22, 163, 74] },
  });
  doc.save(`CONTAM_Libro_Diario${suffix}.pdf`);
}

export async function exportLibroExcel(libro: LibroDiarioLinea[], periodo?: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(libro.map(libroToExportRow));
  XLSX.utils.book_append_sheet(wb, ws, "Libro Diario");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const suffix = periodo ? `_${periodo}` : `_${stamp()}`;
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `CONTAM_Libro_Diario${suffix}.xlsx`,
  );
}
