import type { TraceabilityChain } from "@/modules/contabilidad/asientos/types/traceability";

function hashSimulado(chain: TraceabilityChain): string {
  const raw = `${chain.id}-${chain.metadata.fechaConsulta}-${chain.nodos.length}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h << 5) - h + raw.charCodeAt(i);
  return Math.abs(h).toString(16).padStart(8, "0").toUpperCase();
}

export async function exportTraceabilityPdf(
  chain: TraceabilityChain,
  mode: "auditoria" | "ejecutivo" = "auditoria",
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const origin = chain.nodoOrigen;

  doc.setFillColor(7, 12, 27);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(200, 169, 90);
  doc.setFontSize(14);
  doc.text("CONTAM — Trazabilidad Contable", 14, 12);
  doc.setFontSize(9);
  doc.setTextColor(232, 237, 245);
  doc.text(`${origin.metadata.serie ?? ""}-${origin.metadata.numero ?? ""} · RUC ${chain.ruc}`, 14, 20);

  doc.setTextColor(0);
  let y = 36;
  doc.setFontSize(11);
  doc.text(`Estado: ${chain.resumen.estadoActual}`, 14, y);
  y += 6;
  doc.text(`Monto original: S/ ${chain.resumen.montoOriginal.toFixed(2)}`, 14, y);
  y += 6;
  doc.text(`Completado: ${chain.resumen.porcentajeCompletado}% · ${chain.resumen.diasTranscurridos} días`, 14, y);
  y += 10;

  if (mode === "ejecutivo") {
    autoTable(doc, {
      startY: y,
      head: [["Nodo", "Fecha", "Monto", "Estado"]],
      body: chain.nodos.map((n) => [n.titulo, n.fechaFormateada, n.monto.toFixed(2), n.estado]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 169, 90] },
    });
  } else {
    for (const node of chain.nodos) {
      if (y > 250) {
        doc.addPage();
        y = 14;
      }
      doc.setFontSize(10);
      doc.setTextColor(0, 180, 255);
      doc.text(`${node.titulo} — ${node.fechaFormateada}`, 14, y);
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text(node.descripcion.slice(0, 90), 14, y);
      y += 5;
      doc.setTextColor(0);
      doc.text(`Monto: S/ ${node.monto.toFixed(2)} · ${node.estado}`, 14, y);
      y += 4;

      const lineas = node.metadata.lineasContables ?? [];
      if (lineas.length) {
        autoTable(doc, {
          startY: y,
          head: [["Cuenta", "Denominación", "Debe", "Haber"]],
          body: lineas.map((l) => [
            l.cuentaCodigo,
            l.cuentaDenominacion.slice(0, 30),
            l.debe > 0 ? l.debe.toFixed(2) : "",
            l.haber > 0 ? l.haber.toFixed(2) : "",
          ]),
          theme: "striped",
          styles: { fontSize: 7 },
          headStyles: { fillColor: [26, 37, 64] },
        });
        y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
        y += 6;
      } else {
        y += 4;
      }
    }

    if (chain.resumen.erroresDetectados.length) {
      if (y > 240) {
        doc.addPage();
        y = 14;
      }
      doc.setFontSize(10);
      doc.setTextColor(255, 107, 107);
      doc.text("Problemas de integridad", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Severidad", "Descripción", "Detalle"]],
        body: chain.resumen.erroresDetectados.map((e) => [e.severidad, e.descripcion, e.detalle.slice(0, 60)]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [255, 107, 107] },
      });
      y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
    }
  }

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    `Generado: ${new Date().toLocaleString("es-PE")} · Hash: ${hashSimulado(chain)} · ${chain.metadata.tiempoConstruccion}ms`,
    14,
    pageH - 8,
  );

  doc.save(`trazabilidad_${chain.id.slice(0, 8)}_${mode}.pdf`);
}

export function exportTraceabilityCsv(chain: TraceabilityChain) {
  const rows: string[][] = [["Nodo", "Tipo", "Fecha", "Cuenta", "Denominación", "Debe", "Haber"]];
  for (const node of chain.nodos) {
    const lineas = node.metadata.lineasContables ?? [];
    if (!lineas.length) {
      rows.push([node.titulo, node.type, node.fechaFormateada, "", "", "", String(node.monto)]);
    } else {
      for (const l of lineas) {
        rows.push([
          node.titulo,
          node.type,
          node.fechaFormateada,
          l.cuentaCodigo,
          l.cuentaDenominacion,
          String(l.debe),
          String(l.haber),
        ]);
      }
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trazabilidad_${chain.id.slice(0, 8)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTraceabilityJson(chain: TraceabilityChain) {
  const blob = new Blob([JSON.stringify(chain, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trazabilidad_${chain.id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
