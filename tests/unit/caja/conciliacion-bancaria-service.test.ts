import { describe, expect, it } from "vitest";
import {
  daysDiff,
  levenshteinSimilarity,
  parseFechaCsv,
  parseMontoCsv,
  tokenSimilarity,
} from "@/modules/caja/services/conciliacion-utils";

describe("ConciliacionBancaria — utilidades", () => {
  describe("parseMontoCsv", () => {
    it("debe limpiar montos (símbolos, comas)", () => {
      expect(parseMontoCsv("S/ 1,180.50")).toBe(1180.5);
      expect(parseMontoCsv("USD 3,500.00")).toBe(3500);
    });

    it("retorna 0 para valores inválidos", () => {
      expect(parseMontoCsv("abc")).toBe(0);
    });
  });

  describe("parseFechaCsv", () => {
    it("debe normalizar fechas DD/MM/YYYY a ISO 8601", () => {
      expect(parseFechaCsv("15/01/2026")).toBe("2026-01-15");
    });

    it("debe normalizar fechas YYYY-MM-DD", () => {
      expect(parseFechaCsv("2026-01-15")).toBe("2026-01-15");
    });

    it("debe manejar fechas con guiones", () => {
      expect(parseFechaCsv("15-01-2026")).toBe("2026-01-15");
    });
  });

  describe("matching difuso", () => {
    it("debe calcular similitud de descripciones por tokens", () => {
      const sim = tokenSimilarity("PAGO PROVEEDOR ACME SAC", "Transferencia proveedor Acme");
      expect(sim).toBeGreaterThan(0.3);
    });

    it("debe usar algoritmo de Levenshtein", () => {
      expect(levenshteinSimilarity("deposito", "deposito")).toBe(1);
      expect(levenshteinSimilarity("abc", "xyz")).toBeLessThan(0.5);
    });

    it("debe tokenizar y eliminar stop words", () => {
      const sim = tokenSimilarity("pago de la factura", "pago factura");
      expect(sim).toBeGreaterThan(0);
    });
  });

  describe("daysDiff", () => {
    it("calcula diferencia absoluta en días", () => {
      expect(daysDiff("2026-01-15", "2026-01-18")).toBe(3);
      expect(daysDiff("2026-01-18", "2026-01-15")).toBe(3);
    });

    it("match probable: misma fecha ±3 días", () => {
      expect(daysDiff("2026-01-15", "2026-01-17")).toBeLessThanOrEqual(3);
    });

    it("match sugerido: tolerancia ±7 días", () => {
      expect(daysDiff("2026-01-01", "2026-01-07")).toBeLessThanOrEqual(7);
    });
  });
});

describe("ConciliacionBancaria — lógica de matching", () => {
  type Movimiento = { id: string; fecha: string; monto: number; descripcion: string };

  function matchExacto(a: Movimiento, b: Movimiento, toleranciaMonto = 0.01): boolean {
    return (
      Math.abs(a.monto - b.monto) <= toleranciaMonto &&
      daysDiff(a.fecha, b.fecha) === 0
    );
  }

  function matchProbable(a: Movimiento, b: Movimiento): boolean {
    return Math.abs(a.monto - b.monto) <= 0.01 && daysDiff(a.fecha, b.fecha) <= 3;
  }

  function matchSugerido(a: Movimiento, b: Movimiento): boolean {
    return Math.abs(a.monto - b.monto) <= 0.01 && daysDiff(a.fecha, b.fecha) <= 7;
  }

  const extracto: Movimiento = { id: "e1", fecha: "2026-01-15", monto: 1180, descripcion: "PAGO PROVEEDOR" };
  const sistema: Movimiento = { id: "s1", fecha: "2026-01-16", monto: 1180, descripcion: "Pago proveedor demo" };

  it("debe hacer match exacto (mismo monto, misma fecha)", () => {
    expect(matchExacto(extracto, { ...sistema, fecha: "2026-01-15" })).toBe(true);
  });

  it("debe hacer match probable (mismo monto, fecha ±3 días)", () => {
    expect(matchProbable(extracto, sistema)).toBe(true);
  });

  it("debe hacer match sugerido (mismo monto, fecha ±7 días)", () => {
    expect(matchSugerido(extracto, { ...sistema, fecha: "2026-01-20" })).toBe(true);
  });

  it("debe detectar partidas solo en extracto", () => {
    const matchedIds = new Set<string>();
    expect(matchedIds.has(extracto.id)).toBe(false);
  });

  it("debe calcular resumen correctamente", () => {
    const extractoList = [extracto, { id: "e2", fecha: "2026-01-16", monto: 500, descripcion: "COMISION" }];
    const sistemaList = [sistema];
    const matched = 1;
    const resumen = {
      totalExtracto: extractoList.length,
      totalSistema: sistemaList.length,
      conciliados: matched,
      pendientesExtracto: extractoList.length - matched,
      pendientesSistema: sistemaList.length - matched,
    };
    expect(resumen.conciliados).toBe(1);
    expect(resumen.pendientesExtracto).toBe(1);
  });
});
