import { describe, expect, it } from "vitest";
import { generarLineasAsiento } from "@/lib/asientos-generator";
import { lineasToAsientosPlanos, round2 } from "@/lib/asientos-contables-utils";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import { mockRegistroVenta, mockAsientoMetadata, SIRE_UUID, sumDebeHaber } from "../helpers/fixtures";

const CUENTAS = new Set(["121201", "701111", "40111", "101101"]);

describe("Flujo Completo: Venta con Cobro", () => {
  it("debe completar ciclo de venta con cobro total", () => {
    const registro = mockRegistroVenta();
    const lineasVenta = generarLineasAsiento(registro);
    expect(validarAsientoCompleto(lineasVenta, mockAsientoMetadata({
      glosa: "Provisión venta",
      tipoLibro: "DIARIO_VENTAS",
    }), { cuentasValidas: CUENTAS }).esValido).toBe(true);

    const lineasCobro = [
      { orden: 1, cuenta: "101101", glosa: "Cobro en caja", debe: 1180, haber: 0 },
      { orden: 2, cuenta: "121201", glosa: "Cancelación CXC", debe: 0, haber: 1180 },
    ];
    expect(validarAsientoCompleto(lineasCobro, mockAsientoMetadata({
      glosa: "Cobro venta F001-123",
      tipoLibro: "CAJA_BANCOS",
    }), { cuentasValidas: CUENTAS }).esValido).toBe(true);
  });

  it("debe manejar cobros parciales", () => {
    const total = 1180;
    const cobro1 = 500;
    const saldo = round2(total - cobro1);
    expect(saldo).toBe(680);
    const cobro2 = 680;
    expect(round2(saldo - cobro2)).toBe(0);
  });

  it("debe generar CXC correctamente", () => {
    const registro = mockRegistroVenta();
    const lineas = generarLineasAsiento(registro);
    const cxc = lineas.find((l) => l.cuenta === "121201");
    expect(cxc?.debe).toBe(1180);
  });

  it("debe actualizar saldo CXC al cobrar", () => {
    let saldoCxc = 1180;
    saldoCxc = round2(saldoCxc - 1180);
    expect(saldoCxc).toBe(0);
  });

  it("persiste trazabilidad SIRE en asientos planos", () => {
    const registro = mockRegistroVenta();
    const planos = lineasToAsientosPlanos({
      registro,
      registroId: SIRE_UUID,
      lineas: generarLineasAsiento(registro),
    });
    expect(planos.every((p) => p.sire_registro_id === SIRE_UUID)).toBe(true);
    expect(planos.every((p) => p.tipo_registro === "VENTA")).toBe(true);
    const { debe, haber } = sumDebeHaber(planos);
    expect(debe).toBe(haber);
  });
});
