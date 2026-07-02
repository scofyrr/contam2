import { describe, it, expect } from "vitest";
import {
  normalizeCuentaContable,
  round2,
  tipoAsientoCancelacion,
  tipoAsientoProvision,
  tipoLibroProvision,
  resolveSireRegistroId,
  toAsientoContableInsert,
  TIPOS_LIBRO_PROVISION,
} from "@/lib/asientos-contables-utils";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import type { LineaAsientoInput } from "@/lib/sire-types";
import { mockAsientoMetadata } from "../../helpers/fixtures";

describe("normalizeCuentaContable", () => {
  it("debe eliminar puntos de códigos contables", () => {
    expect(normalizeCuentaContable("10.1")).toBe("101");
  });

  it("debe extraer el primer bloque numérico con guiones", () => {
    expect(normalizeCuentaContable("10-1")).toBe("10");
  });

  it("debe extraer el primer bloque numérico", () => {
    expect(normalizeCuentaContable("10 1")).toBe("10");
  });

  it("debe manejar códigos sin formato (solo dígitos)", () => {
    expect(normalizeCuentaContable("10101")).toBe("10101");
  });

  it("debe extraer solo el primer bloque de dígitos", () => {
    expect(normalizeCuentaContable("10A1B")).toBe("10");
  });

  it("debe retornar texto sin dígitos como fallback", () => {
    expect(normalizeCuentaContable("ABC")).toBe("ABC");
  });

  it("debe manejar string vacío", () => {
    expect(normalizeCuentaContable("")).toBe("");
  });

  it("debe manejar null/undefined con graceful fallback", () => {
    expect(normalizeCuentaContable(null)).toBe("");
    expect(normalizeCuentaContable(undefined)).toBe("");
  });

  it("debe normalizar códigos PCGE peruanos reales", () => {
    expect(normalizeCuentaContable("10")).toBe("10");
    expect(normalizeCuentaContable("10.1")).toBe("101");
    expect(normalizeCuentaContable("10.1.01")).toBe("10101");
    expect(normalizeCuentaContable("40.1.1.1.01")).toBe("4011101");
  });

  it("debe limpiar corchetes en códigos legacy", () => {
    expect(normalizeCuentaContable("[601101]")).toBe("601101");
  });
});

describe("round2", () => {
  it("redondea a 2 decimales", () => {
    expect(round2(1.004)).toBe(1);
    expect(round2(1.006)).toBe(1.01);
    expect(round2(10.999)).toBe(11);
  });
});

describe("resolveSireRegistroId", () => {
  it("acepta UUID válido", () => {
    expect(resolveSireRegistroId("a1b2c3d4-e5f6-4789-a012-3456789abcde")).toBe(
      "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    );
  });

  it("rechaza RUC de 11 dígitos", () => {
    expect(resolveSireRegistroId("20100000001")).toBeNull();
  });
});

describe("validarAsientoCompleto", () => {
  const metadata = mockAsientoMetadata();

  const cuentasValidas = new Set(["601101", "40111", "421201"]);

  it("debe validar asiento con partida doble correcta", () => {
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "601101", glosa: "Gasto compra", debe: 1000, haber: 0 },
      { orden: 2, cuenta: "40111", glosa: "IGV crédito", debe: 180, haber: 0 },
      { orden: 3, cuenta: "421201", glosa: "Proveedor", debe: 0, haber: 1180 },
    ];
    const r = validarAsientoCompleto(lineas, metadata, { cuentasValidas });
    expect(r.esValido).toBe(true);
    expect(r.errores).toHaveLength(0);
  });

  it("debe rechazar asiento descuadrado", () => {
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "601101", glosa: "Gasto compra", debe: 1000, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "Proveedor", debe: 0, haber: 900 },
    ];
    const r = validarAsientoCompleto(lineas, metadata, { cuentasValidas });
    expect(r.esValido).toBe(false);
    expect(r.errores.some((e) => e.codigo === "PARTIDA_DOBLE_DESCUADRADA")).toBe(true);
  });

  it("debe rechazar asiento sin líneas", () => {
    const r = validarAsientoCompleto([], metadata);
    expect(r.esValido).toBe(false);
    expect(r.errores.some((e) => e.codigo === "LINEAS_VACIAS")).toBe(true);
  });

  it("debe rechazar cuentas inexistentes en PCGE", () => {
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "999999", glosa: "Cuenta inválida", debe: 100, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "Contrapartida", debe: 0, haber: 100 },
    ];
    const r = validarAsientoCompleto(lineas, metadata, { cuentasValidas });
    expect(r.errores.some((e) => e.codigo === "CUENTA_NO_EXISTE")).toBe(true);
  });

  it("debe advertir sobre glosa corta en línea", () => {
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "601101", glosa: "OK", debe: 50, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "Contrapartida proveedor", debe: 0, haber: 50 },
    ];
    const r = validarAsientoCompleto(lineas, metadata, { cuentasValidas });
    expect(r.warnings.some((w) => w.codigo === "GLOSA_CORTA")).toBe(true);
  });

  it("debe aceptar tolerancia de 0.001 en descuadre", () => {
    const lineas: LineaAsientoInput[] = [
      { orden: 1, cuenta: "601101", glosa: "Gasto compra", debe: 100.001, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "Proveedor", debe: 0, haber: 100 },
    ];
    const r = validarAsientoCompleto(lineas, metadata, { cuentasValidas });
    expect(r.esValido).toBe(true);
  });
});

describe("Tipos CHECK de asientos_contables", () => {
  it("debe normalizar tipo_asiento correcto", () => {
    expect(toAsientoContableInsert({ tipo_asiento: "cancelacion_caja", debe: 1, haber: 0 }).tipo_asiento).toBe(
      "cancelacion_caja",
    );
    expect(toAsientoContableInsert({ tipo_asiento: "principal", debe: 1, haber: 0 }).tipo_asiento).toBe("principal");
    expect(tipoAsientoProvision("COMPRA")).toBe("principal");
    expect(tipoAsientoCancelacion()).toBe("cancelacion_caja");
  });

  it("debe normalizar tipo_libro correcto", () => {
    expect(tipoLibroProvision("VENTA")).toBe("DIARIO_VENTAS");
    expect(tipoLibroProvision("COMPRA")).toBe("DIARIO_COMPRAS");
    expect(TIPOS_LIBRO_PROVISION).toContain("DIARIO_COMPRAS");
    expect(TIPOS_LIBRO_PROVISION).toContain("DIARIO_VENTAS");
  });

  it("debe normalizar naturaleza desde montos", () => {
    const row = toAsientoContableInsert({ debe: 100, haber: 0, cuenta_contable: "601101" });
    expect(row.naturaleza).toBe("debe");
    const row2 = toAsientoContableInsert({ debe: 0, haber: 50, cuenta_contable: "421201" });
    expect(row2.naturaleza).toBe("haber");
  });
});
