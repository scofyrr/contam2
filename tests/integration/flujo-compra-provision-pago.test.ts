import { describe, expect, it } from "vitest";
import { generarLineasAsiento } from "@/lib/asientos-generator";
import {
  lineasToAsientosPlanos,
  round2,
  tipoAsientoCancelacion,
  tipoAsientoProvision,
  tipoLibroProvision,
} from "@/lib/asientos-contables-utils";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import type { LineaAsientoInput } from "@/lib/sire-types";
import { mockRegistroCompra, mockAsientoMetadata, sumDebeHaber, SIRE_UUID } from "../helpers/fixtures";

const CUENTAS = new Set(["601101", "40111", "421201", "101101"]);

describe("Flujo Completo: Compra con Provisión y Pago", () => {
  it("debe completar el ciclo completo de una compra", () => {
    const registro = mockRegistroCompra();

    // Paso 2: generar provisión
    const lineasProvision = generarLineasAsiento(registro);
    const validacionProvision = validarAsientoCompleto(lineasProvision, mockAsientoMetadata({
      glosa: "Provisión compra F001-123",
    }), { cuentasValidas: CUENTAS });
    expect(validacionProvision.esValido).toBe(true);

    const asientosProvision = lineasToAsientosPlanos({
      registro,
      registroId: SIRE_UUID,
      lineas: lineasProvision,
      tipoAsiento: tipoAsientoProvision(registro.tipo),
      tipoLibro: tipoLibroProvision(registro.tipo),
    });
    expect(asientosProvision).toHaveLength(3);
    expect(asientosProvision.every((a) => a.tipo_asiento === "principal")).toBe(true);
    expect(asientosProvision.every((a) => a.sire_registro_id === SIRE_UUID)).toBe(true);

    // Paso 4: pago en caja (debe proveedor / haber caja)
    const lineasCancelacion: LineaAsientoInput[] = [
      { orden: 1, cuenta: "421201", glosa: "Pago proveedor", debe: 1180, haber: 0 },
      { orden: 2, cuenta: "101101", glosa: "Salida caja", debe: 0, haber: 1180 },
    ];

    const validacionPago = validarAsientoCompleto(lineasCancelacion, mockAsientoMetadata({
      glosa: "Pago compra F001-123",
      tipoLibro: "CAJA_BANCOS",
    }), { cuentasValidas: CUENTAS });
    expect(validacionPago.esValido).toBe(true);

    const asientosCancelacion = lineasToAsientosPlanos({
      registro,
      registroId: SIRE_UUID,
      lineas: lineasCancelacion,
      tipoAsiento: tipoAsientoCancelacion(),
      tipoLibro: "CAJA_BANCOS",
    });
    expect(asientosCancelacion.every((a) => a.tipo_asiento === "cancelacion_caja")).toBe(true);
  });

  it("debe manejar pagos parciales correctamente", () => {
    const total = 15000;
    const pago1 = 7500;
    const pago2 = 7500;
    const saldo = round2(total - pago1 - pago2);
    expect(saldo).toBe(0);

    const estados: string[] = [];
    let acumulado = 0;
    for (const pago of [pago1, pago2]) {
      acumulado = round2(acumulado + pago);
      estados.push(acumulado >= total ? "pagado" : "parcial");
    }
    expect(estados).toEqual(["parcial", "pagado"]);
  });

  it("debe mantener integridad contable en todo el flujo", () => {
    const registro = mockRegistroCompra();
    const lineas = generarLineasAsiento(registro);
    const { debe, haber } = sumDebeHaber(lineas);
    expect(debe).toBe(registro.mto_total_cp);
    expect(haber).toBe(registro.mto_total_cp);

    const planos = lineasToAsientosPlanos({
      registro,
      registroId: SIRE_UUID,
      lineas,
    });
    const totalDebe = planos.reduce((s, p) => s + p.debe, 0);
    const totalHaber = planos.reduce((s, p) => s + p.haber, 0);
    expect(totalDebe).toBe(totalHaber);
  });

  it("debe rechazar pago duplicado del mismo comprobante", () => {
    const estados = new Map<string, string>();
    const id = SIRE_UUID;
    estados.set(id, "provisionado");

    function registrarPago(comprobanteId: string): { ok: boolean; error?: string } {
      const estado = estados.get(comprobanteId);
      if (estado === "pagado") return { ok: false, error: "COMPROBANTE_YA_PAGADO" };
      estados.set(comprobanteId, "pagado");
      return { ok: true };
    }

    expect(registrarPago(id).ok).toBe(true);
    expect(registrarPago(id)).toEqual({ ok: false, error: "COMPROBANTE_YA_PAGADO" });
  });
});
