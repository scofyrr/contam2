import type { AlertaAuditoria, AuditoriaFilters, AuditoriaRegistro } from "@/modules/auditoria/types/auditoria";
import { auditoriaService } from "@/modules/auditoria/services/auditoria-service";

function filtersLabel(filters: AuditoriaFilters): string[] {
  const lines: string[] = [];
  if (filters.modulo) lines.push(`Módulo: ${filters.modulo}`);
  if (filters.accion) lines.push(`Acción: ${filters.accion}`);
  if (filters.ruc) lines.push(`RUC: ${filters.ruc}`);
  if (filters.periodo) lines.push(`Período: ${filters.periodo}`);
  if (filters.severity) lines.push(`Severidad: ${filters.severity}`);
  if (filters.fechaDesde) lines.push(`Desde: ${filters.fechaDesde}`);
  if (filters.fechaHasta) lines.push(`Hasta: ${filters.fechaHasta}`);
  if (filters.busqueda) lines.push(`Búsqueda: ${filters.busqueda}`);
  return lines;
}

export async function exportarAuditoriaPDF(filters: AuditoriaFilters): Promise<Blob> {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 500 });
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("Reporte de Auditoría — CONTAM", 14, 16);
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString("es-PE")}`, 14, 24);

  let y = 30;
  for (const line of filtersLabel(filters)) {
    doc.text(line, 14, y);
    y += 5;
  }

  autoTable(doc, {
    startY: y + 4,
    head: [["Fecha", "Usuario", "Severidad", "Acción", "Módulo", "Tabla", "RUC"]],
    body: data.map((r) => [
      new Date(r.createdAt).toLocaleString("es-PE"),
      r.usuarioEmail ?? "—",
      r.severity,
      r.accion,
      r.modulo,
      r.tablaAfectada,
      r.rucAfectado ?? "—",
    ]),
    styles: { fontSize: 7 },
    foot: [[`Total registros: ${data.length}`, "", "", "", "", "", ""]],
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pages}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 8);
  }

  return doc.output("blob");
}

export async function exportarAuditoriaCSV(filters: AuditoriaFilters): Promise<Blob> {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 5000 });
  const headers = ["id", "fecha", "usuario", "severidad", "accion", "modulo", "tabla", "registro_id", "ruc", "periodo"];
  const rows = data.map((r) =>
    [
      r.id,
      r.createdAt,
      r.usuarioEmail ?? "",
      r.severity,
      r.accion,
      r.modulo,
      r.tablaAfectada,
      r.registroId,
      r.rucAfectado ?? "",
      r.periodoAfectado ?? "",
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows].join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

export async function exportarAuditoriaExcel(filters: AuditoriaFilters): Promise<Blob> {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 5000 });
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(
    data.map((r) => ({
      ID: r.id,
      Fecha: r.createdAt,
      Usuario: r.usuarioEmail,
      Severidad: r.severity,
      Accion: r.accion,
      Modulo: r.modulo,
      Tabla: r.tablaAfectada,
      Registro: r.registroId,
      RUC: r.rucAfectado,
      Periodo: r.periodoAfectado,
    })),
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Auditoria");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function exportarAlertaDetalle(alertaId: string): Promise<Blob> {
  const alertas = await auditoriaService.obtenerAlertas(false);
  const alerta = alertas.find((a) => a.id === alertaId);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Detalle de Alerta de Auditoría", 14, 20);
  if (!alerta) {
    doc.text("Alerta no encontrada", 14, 32);
    return doc.output("blob");
  }
  writeAlertaPdf(doc, alerta);
  return doc.output("blob");
}

function writeAlertaPdf(doc: import("jspdf").jsPDF, alerta: AlertaAuditoria) {
  doc.setFontSize(10);
  let y = 32;
  const lines = [
    `Tipo: ${alerta.tipo}`,
    `Severidad: ${alerta.severidad}`,
    `Título: ${alerta.titulo}`,
    `Descripción: ${alerta.descripcion}`,
    `Módulo: ${alerta.modulo ?? "—"}`,
    `Fecha: ${new Date(alerta.createdAt).toLocaleString("es-PE")}`,
    `Estado: ${alerta.resuelta ? "Resuelta" : "Activa"}`,
  ];
  for (const line of lines) {
    doc.text(line, 14, y);
    y += 8;
  }
  if (alerta.detalles) {
    y += 4;
    doc.text("Detalles:", 14, y);
    y += 6;
    doc.setFont("courier", "normal");
    doc.text(JSON.stringify(alerta.detalles, null, 2).slice(0, 800), 14, y);
  }
}

export async function exportarAuditoria(
  filters: AuditoriaFilters,
  formato: "PDF" | "CSV" | "EXCEL",
): Promise<Blob> {
  if (formato === "PDF") return exportarAuditoriaPDF(filters);
  if (formato === "CSV") return exportarAuditoriaCSV(filters);
  return exportarAuditoriaExcel(filters);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function descargarAuditoria(filters: AuditoriaFilters, formato: "PDF" | "CSV" | "EXCEL") {
  const blob = await exportarAuditoria(filters, formato);
  const ext = formato === "PDF" ? "pdf" : formato === "CSV" ? "csv" : "xlsx";
  downloadBlob(blob, `CONTAM_Auditoria_${new Date().toISOString().slice(0, 10)}.${ext}`);
}
