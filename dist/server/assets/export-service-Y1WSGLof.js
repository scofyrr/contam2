import { a0 as registroToExportRow, J as libroToExportRow } from "./router-DdOnzL1Y.js";
const CHART_THEME = {
  gain: "#16a34a",
  loss: "#dc2626",
  neutral: "#3b82f6",
  periodRef: "#93c5fd",
  periodCurrent: "#1d4ed8",
  ventas: "#16a34a",
  compras: "#dc2626",
  igvVentas: "#3b82f6",
  igvCompras: "#6366f1",
  grid: "hsl(var(--border))"
};
const CHART_CATALOG = [
  { id: "chart-ventas-compras", label: "Ventas vs compras", sheet: "Graf_VentasCompras" },
  { id: "chart-utilidad", label: "Utilidad neta", sheet: "Graf_Utilidad" },
  { id: "chart-utilidad-bars", label: "Utilidad por periodo (barras)", sheet: "Graf_UtilidadBarras" },
  { id: "chart-igv", label: "IGV y saldo fiscal", sheet: "Graf_IGV" },
  { id: "chart-mix", label: "Mix ventas/compras", sheet: "Graf_Mix" },
  { id: "chart-importe", label: "Importe total", sheet: "Graf_Importe" },
  { id: "chart-composicion", label: "Composición mensual", sheet: "Graf_Composicion" },
  { id: "chart-tipo-cdp", label: "Por tipo comprobante", sheet: "Graf_TipoCDP" },
  { id: "chart-estado", label: "Estado validación", sheet: "Graf_Estado" },
  { id: "chart-top-contrapartes", label: "Top contrapartes", sheet: "Graf_Contrapartes" },
  { id: "chart-radar", label: "Radar comparativo", sheet: "Graf_Radar" }
];
function stamp() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function chartDataSheets(charts, ids) {
  const sheets = [];
  const has = (id) => ids.length === 0 || ids.includes(id);
  if (has("chart-ventas-compras") || has("chart-utilidad") || has("chart-igv")) {
    sheets.push({
      name: "Resumen_periodos",
      rows: charts.utilidadPorPeriodo.map((u, i) => ({
        Periodo: u.periodo,
        Ventas: charts.ventasPorPeriodo[i]?.total ?? 0,
        Compras: charts.comprasPorPeriodo[i]?.total ?? 0,
        Utilidad: u.utilidad,
        IGV_Ventas: charts.igvPorPeriodo[i]?.igvVentas ?? 0,
        IGV_Compras: charts.igvPorPeriodo[i]?.igvCompras ?? 0
      }))
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
async function exportToExcel(pack, options = {}) {
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const wb = XLSX.utils.book_new();
  const suffix = pack.periodo ? `_${pack.periodo}` : `_${stamp()}`;
  const chartIds = options.chartIds ?? [];
  if (options.includeRegistros !== false) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pack.registros.map(registroToExportRow)),
      "Registros SIRE"
    );
  }
  if (options.includeLibro !== false && pack.libro.length > 0) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pack.libro.map(libroToExportRow)),
      "Libro Diario"
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
        { Indicador: "Ratio IGV", Valor: pack.kpis.ratioIgv }
      ]),
      "KPIs"
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
        Utilidad: u.utilidad
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsCharts, "Datos_graficos");
  }
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `${pack.titulo}${suffix}.xlsx`
  );
}
function setupStyleOverrides() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {
    };
  }
  const originalGetComputedStyle = window.getComputedStyle;
  const originalIframeDescriptor = Object.getOwnPropertyDescriptor(
    HTMLIFrameElement.prototype,
    "contentWindow"
  );
  const colorCache = /* @__PURE__ */ new Map();
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });
  function resolveModernColorToRgba(colorStr) {
    if (!colorStr) return colorStr;
    if (!colorStr.includes("oklch") && !colorStr.includes("oklab")) {
      return colorStr;
    }
    if (colorCache.has(colorStr)) {
      return colorCache.get(colorStr);
    }
    try {
      if (ctx) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        const resolved = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        colorCache.set(colorStr, resolved);
        return resolved;
      }
    } catch (e) {
      console.warn("Failed to resolve modern color:", colorStr, e);
    }
    return "rgba(0, 0, 0, 0)";
  }
  function wrapGetComputedStyle(originalFn) {
    return function(el, pseudoElt) {
      const style = originalFn(el, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return function(propertyName) {
              const val2 = target.getPropertyValue(propertyName);
              if (typeof val2 === "string" && (val2.includes("oklch") || val2.includes("oklab"))) {
                return resolveModernColorToRgba(val2);
              }
              return val2;
            };
          }
          const val = Reflect.get(target, prop);
          if (typeof val === "function") {
            return val.bind(target);
          }
          if (typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
            return resolveModernColorToRgba(val);
          }
          return val;
        }
      });
    };
  }
  window.getComputedStyle = wrapGetComputedStyle(originalGetComputedStyle);
  if (originalIframeDescriptor && originalIframeDescriptor.get) {
    const originalGet = originalIframeDescriptor.get;
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
      ...originalIframeDescriptor,
      get() {
        const win = originalGet.call(this);
        if (win && !win.__getComputedStyleOverridden) {
          win.__getComputedStyleOverridden = true;
          try {
            win.getComputedStyle = wrapGetComputedStyle(win.getComputedStyle);
          } catch (err) {
            console.warn("Failed to override iframe getComputedStyle", err);
          }
        }
        return win;
      }
    });
  }
  return function restore() {
    window.getComputedStyle = originalGetComputedStyle;
    if (originalIframeDescriptor) {
      Object.defineProperty(
        HTMLIFrameElement.prototype,
        "contentWindow",
        originalIframeDescriptor
      );
    }
  };
}
async function captureChartImages(chartIds) {
  const html2canvas = (await import("./html2canvas.esm-C17pzFXx.js")).default;
  const selector = chartIds && chartIds.length > 0 ? chartIds.map((id) => `[data-export-chart="${id}"]`).join(",") : "[data-export-chart]";
  const nodes = document.querySelectorAll(selector);
  const shots = [];
  const restore = setupStyleOverrides();
  try {
    for (const el of nodes) {
      const title = el.querySelector("[data-chart-title]")?.textContent?.trim() ?? "Gráfico";
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false
      });
      shots.push({ title, dataUrl: canvas.toDataURL("image/png") });
    }
  } finally {
    restore();
  }
  return shots;
}
async function exportToPdf(pack, options = {}) {
  const chartIds = options.chartIds;
  const { jsPDF } = await import("./jspdf.es.min-Deg6Vxwk.js").then((n) => n.j);
  const autoTable = (await import("./jspdf.plugin.autotable-Do1qGbTG.js")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const suffix = pack.periodo ? `_${pack.periodo}` : `_${stamp()}`;
  let y = 14;
  doc.setFontSize(16);
  doc.text(pack.titulo, 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generado: ${(/* @__PURE__ */ new Date()).toLocaleString("es-PE")} | Periodo: ${pack.periodo || "Todos"} | Registros: ${pack.registros.length} | Líneas diario: ${pack.libro.length}`,
    14,
    y
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
        ["Ratio IGV", pack.kpis.ratioIgv.toFixed(2)]
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74] }
    });
    y = doc.lastAutoTable?.finalY ?? y;
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
      r.estado_validacion ?? "pendiente"
    ]);
    autoTable(doc, {
      startY: y,
      head: [["Periodo", "Tipo", "Comprobante", "Contraparte", "Total", "Estado"]],
      body: regRows,
      theme: "striped",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    y = doc.lastAutoTable?.finalY ?? y;
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
        (l.glosa ?? "").slice(0, 40)
      ]),
      theme: "striped",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 163, 74] }
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
async function exportRegistrosExcel(registros, periodo) {
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(registros.map(registroToExportRow)),
    "Registros SIRE"
  );
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const suffix = periodo ? `_${periodo}` : `_${stamp()}`;
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `CONTAM_Registros_SIRE${suffix}.xlsx`
  );
}
async function exportLibroPdf(libro, periodo) {
  const { jsPDF } = await import("./jspdf.es.min-Deg6Vxwk.js").then((n) => n.j);
  const autoTable = (await import("./jspdf.plugin.autotable-Do1qGbTG.js")).default;
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
      l.tipo_registro ?? ""
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [22, 163, 74] }
  });
  doc.save(`CONTAM_Libro_Diario${suffix}.pdf`);
}
async function exportLibroExcel(libro, periodo) {
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(libro.map(libroToExportRow));
  XLSX.utils.book_append_sheet(wb, ws, "Libro Diario");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const suffix = periodo ? `_${periodo}` : `_${stamp()}`;
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `CONTAM_Libro_Diario${suffix}.xlsx`
  );
}
async function exportContribuyentesExcel(list) {
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const wb = XLSX.utils.book_new();
  const rows = list.map((c) => ({
    ruc: c.ruc,
    razon_social: c.razonSocial,
    estado: c.estado,
    cat1ra: c.cat1ra,
    cat2da: c.cat2da,
    cat3ra: c.cat3ra,
    cat4ta_retenciones: c.cat4taRetenciones,
    cat4ta_cta_propia: c.cat4taCtaPropia,
    cat5ta: c.cat5ta,
    fecha_vencimiento_declaracion: c.fechaVencimientoDeclaracion ?? ""
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Contribuyentes");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `CONTAM_Contribuyentes_${stamp()}.xlsx`
  );
}
export {
  CHART_CATALOG as C,
  CHART_THEME as a,
  exportLibroExcel as b,
  exportLibroPdf as c,
  exportRegistrosExcel as d,
  exportContribuyentesExcel as e,
  exportToExcel as f,
  exportToPdf as g
};
