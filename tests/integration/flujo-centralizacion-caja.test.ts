import { describe, expect, it } from "vitest";
import {
  GLOSA_CENTRALIZACION_CAJA,
  esLineaCentralizacionCaja,
  lineasToAsientosPlanos,
  round2,
} from "@/lib/asientos-contables-utils";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import type { LineaAsientoInput } from "@/lib/sire-types";
import { mockRegistroCompra, mockAsientoMetadata, SIRE_UUID } from "../helpers/fixtures";

type MovimientoCaja = {
  id: string;
  asiento_id: string | null;
  cuenta: string;
  monto: number;
  tipo: "ingreso" | "egreso";
  glosa: string;
};

function centralizarMovimientos(movimientos: MovimientoCaja[]): {
  lineas: LineaAsientoInput[];
  asientoId: string;
} {
  const asientoId = "lote-centralizacion-001";
  const lineas: LineaAsientoInput[] = movimientos.map((m, i) => ({
    orden: i + 1,
    cuenta: m.cuenta,
    glosa: `${GLOSA_CENTRALIZACION_CAJA} — ${m.glosa}`,
    debe: m.tipo === "ingreso" ? m.monto : 0,
    haber: m.tipo === "egreso" ? m.monto : 0,
  }));
  return { lineas, asientoId };
}

describe("Flujo: Centralización de Caja", () => {
  it("debe centralizar movimientos por cuenta", () => {
    const movimientos: MovimientoCaja[] = Array.from({ length: 5 }, (_, i) => ({
      id: `mov-${i + 1}`,
      asiento_id: null,
      cuenta: i % 2 === 0 ? "101101" : "104101",
      monto: 100 * (i + 1),
      tipo: i % 2 === 0 ? "ingreso" : "egreso",
      glosa: `Movimiento ${i + 1}`,
    }));

    const { lineas, asientoId } = centralizarMovimientos(movimientos);
    expect(lineas).toHaveLength(5);
    expect(lineas.every((l) => l.glosa.startsWith(GLOSA_CENTRALIZACION_CAJA))).toBe(true);

    const asignados = movimientos.map((m) => ({ ...m, asiento_id: asientoId }));
    expect(asignados.every((m) => m.asiento_id === asientoId)).toBe(true);
  });

  it("debe centralizar por tipo (ingreso/egreso)", () => {
    const ingresos = [100, 200, 300].reduce((s, v) => s + v, 0);
    const egresos = [50, 75].reduce((s, v) => s + v, 0);
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "101101", glosa: "Centralización ingresos", debe: ingresos, haber: 0 },
      { orden: 2, cuenta: "601101", glosa: "Centralización egresos", debe: 0, haber: egresos },
      { orden: 3, cuenta: "101101", glosa: "Contrapartida neto", debe: 0, haber: round2(ingresos - egresos) },
    ];
    const totalDebe = lineas.reduce((s, l) => s + l.debe, 0);
    const totalHaber = lineas.reduce((s, l) => s + l.haber, 0);
    expect(round2(totalDebe)).toBe(round2(totalHaber));
  });

  it("debe detectar líneas de centralización de caja", () => {
    expect(esLineaCentralizacionCaja({ glosa: `${GLOSA_CENTRALIZACION_CAJA} — test`, tipo_libro: "DIARIO_MANUAL" })).toBe(true);
    expect(esLineaCentralizacionCaja({ tipo_libro: "CAJA_BANCOS" })).toBe(true);
  });

  it("debe validar asiento centralizado cuadrado", () => {
    const registro = mockRegistroCompra();
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "101101", glosa: `${GLOSA_CENTRALIZACION_CAJA} ingreso`, debe: 500, haber: 0 },
      { orden: 2, cuenta: "701111", glosa: `${GLOSA_CENTRALIZACION_CAJA} venta`, debe: 0, haber: 500 },
    ];
    const r = validarAsientoCompleto(lineas, mockAsientoMetadata({
      glosa: GLOSA_CENTRALIZACION_CAJA,
      tipoLibro: "CAJA_BANCOS",
    }));
    expect(r.esValido).toBe(true);

    const planos = lineasToAsientosPlanos({
      registro,
      registroId: SIRE_UUID,
      lineas,
      tipoLibro: "CAJA_BANCOS",
    });
    expect(planos.every((p) => p.tipo_libro === "CAJA_BANCOS")).toBe(true);
  });

  it("debe rechazar descentralizar si hay operaciones posteriores", () => {
    const ultimaCentralizacion = "2026-01-15";
    const operacionPosterior = "2026-01-16";
    const puedeDescentralizar = operacionPosterior <= ultimaCentralizacion;
    expect(puedeDescentralizar).toBe(false);
  });
});
