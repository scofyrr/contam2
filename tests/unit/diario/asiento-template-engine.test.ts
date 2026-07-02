import { describe, expect, it } from "vitest";
import {
  AsientoTemplateEngine,
  resolverFormulaMonto,
} from "@/modules/contabilidad/diario/services/asiento-template-engine";
import type { FormulaMonto } from "@/modules/contabilidad/diario/types/templates";

describe("AsientoTemplateEngine", () => {
  const engine = new AsientoTemplateEngine();

  describe("evaluarTemplate", () => {
    it("debe evaluar plantilla de planilla mensual correctamente", () => {
      const r = engine.evaluarTemplate("tpl-planilla-mensual", {
        sueldoBruto: 10000,
        porcentajeESSALUD: 9,
        porcentajeONP: 13,
        periodo: "202601",
      });
      expect(r.errores).toHaveLength(0);
      expect(r.lineasGeneradas.length).toBeGreaterThanOrEqual(3);
      const totalDebe = r.lineasGeneradas.reduce((s, l) => s + l.debe, 0);
      const totalHaber = r.lineasGeneradas.reduce((s, l) => s + l.haber, 0);
      expect(Math.abs(totalDebe - totalHaber)).toBeLessThan(0.02);
      expect(r.lineasGeneradas.some((l) => l.debe === 10000)).toBe(true);
    });

    it("debe evaluar plantilla de depreciación", () => {
      const r = engine.evaluarTemplate("tpl-depreciacion", {
        valorActivo: 120000,
        vidaUtilMeses: 120,
      });
      expect(r.errores).toHaveLength(0);
      const montoDep = r.lineasGeneradas[0]?.debe ?? 0;
      expect(montoDep).toBe(1000);
    });

    it("debe evaluar fórmula SUMA", () => {
      const formula: FormulaMonto = {
        tipo: "SUMA",
        formulas: [
          { tipo: "VALOR_FIJO", valor: 100 },
          { tipo: "VALOR_FIJO", valor: 50 },
        ],
      };
      expect(resolverFormulaMonto(formula, {})).toBe(150);
    });

    it("debe evaluar fórmula PORCENTAJE", () => {
      const formula: FormulaMonto = { tipo: "PORCENTAJE", paramId: "base", porcentaje: 9 };
      expect(resolverFormulaMonto(formula, { base: 10000 })).toBe(900);
    });

    it("debe evaluar fórmula TIPO_CAMBIO", () => {
      const formula: FormulaMonto = {
        tipo: "TIPO_CAMBIO",
        montoParamId: "montoUSD",
        monedaOrigen: "USD",
        monedaDestino: "PEN",
      };
      expect(resolverFormulaMonto(formula, { montoUSD: 1000, tipoCambio: 3.75 })).toBe(3750);
    });

    it("debe generar partida doble exacta", () => {
      const r = engine.evaluarTemplate("tpl-depreciacion", {
        valorActivo: 60000,
        vidaUtilMeses: 12,
      });
      expect(r.cuadra).toBe(true);
      const debe = r.lineasGeneradas.reduce((s, l) => s + l.debe, 0);
      const haber = r.lineasGeneradas.reduce((s, l) => s + l.haber, 0);
      expect(debe).toBe(haber);
    });

    it("debe rechazar parámetros requeridos faltantes", () => {
      const r = engine.evaluarTemplate("tpl-planilla-mensual", { periodo: "202601" });
      expect(r.errores.length).toBeGreaterThan(0);
      expect(r.errores.some((e) => e.includes("Sueldo bruto"))).toBe(true);
    });
  });

  describe("resolverFormulaMonto", () => {
    it("debe resolver VALOR_FIJO", () => {
      expect(resolverFormulaMonto({ tipo: "VALOR_FIJO", valor: 42.567 }, {})).toBe(42.57);
    });

    it("debe resolver PARAMETRO", () => {
      expect(resolverFormulaMonto({ tipo: "PARAMETRO", paramId: "x" }, { x: 100 })).toBe(100);
    });

    it("debe resolver MULTIPLICACION", () => {
      const f: FormulaMonto = {
        tipo: "MULTIPLICACION",
        a: { tipo: "VALOR_FIJO", valor: 10 },
        b: { tipo: "VALOR_FIJO", valor: 3 },
      };
      expect(resolverFormulaMonto(f, {})).toBe(30);
    });

    it("debe manejar división por cero", () => {
      const f: FormulaMonto = {
        tipo: "DIVISION",
        a: { tipo: "VALOR_FIJO", valor: 100 },
        b: { tipo: "VALOR_FIJO", valor: 0 },
      };
      expect(resolverFormulaMonto(f, {})).toBe(0);
    });

    it("debe redondear a 2 decimales", () => {
      const f: FormulaMonto = {
        tipo: "DIVISION",
        a: { tipo: "VALOR_FIJO", valor: 10 },
        b: { tipo: "VALOR_FIJO", valor: 3 },
      };
      expect(resolverFormulaMonto(f, {})).toBe(3.33);
    });
  });
});
