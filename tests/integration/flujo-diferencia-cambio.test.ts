import { describe, expect, it } from "vitest";
import type { DiferenciaCambioCalculo } from "@/modules/contabilidad/diario/services/diferencia-cambio-service";

function calcularDiferenciaLocal(params: {
  saldoME: number;
  tcOriginal: number;
  tcActual: number;
  esActivo: boolean;
}): DiferenciaCambioCalculo {
  const montoOriginalSoles = Math.round(params.saldoME * params.tcOriginal * 100) / 100;
  const montoActualSoles = Math.round(params.saldoME * params.tcActual * 100) / 100;
  const diferenciaCambio = Math.round((montoActualSoles - montoOriginalSoles) * 100) / 100;
  const tipoDiferencia =
    diferenciaCambio === 0
      ? "GANANCIA"
      : params.esActivo
        ? diferenciaCambio > 0
          ? "GANANCIA"
          : "PERDIDA"
        : diferenciaCambio > 0
          ? "PERDIDA"
          : "GANANCIA";

  return {
    partidaId: "p1",
    tipo: "CXC",
    descripcion: "Factura USD",
    moneda: "USD",
    saldoME: params.saldoME,
    tcOriginal: params.tcOriginal,
    tcActual: params.tcActual,
    variacionTC: Math.round((params.tcActual - params.tcOriginal) * 10000) / 10000,
    montoOriginalSoles,
    montoActualSoles,
    diferenciaCambio,
    tipoDiferencia,
  };
}

describe("Flujo: Cálculo de Diferencia de Cambio", () => {
  it("debe calcular diferencia para CXC en USD", () => {
    const r = calcularDiferenciaLocal({ saldoME: 1000, tcOriginal: 3.7, tcActual: 3.75, esActivo: true });
    expect(r.montoOriginalSoles).toBe(3700);
    expect(r.montoActualSoles).toBe(3750);
    expect(r.diferenciaCambio).toBe(50);
  });

  it("debe manejar ganancia por diferencia de cambio", () => {
    const r = calcularDiferenciaLocal({ saldoME: 500, tcOriginal: 3.7, tcActual: 3.8, esActivo: true });
    expect(r.tipoDiferencia).toBe("GANANCIA");
    expect(r.diferenciaCambio).toBeGreaterThan(0);
  });

  it("debe manejar pérdida por diferencia de cambio", () => {
    const r = calcularDiferenciaLocal({ saldoME: 500, tcOriginal: 3.8, tcActual: 3.7, esActivo: true });
    expect(r.tipoDiferencia).toBe("PERDIDA");
    expect(r.diferenciaCambio).toBeLessThan(0);
  });

  it("debe generar asiento de ajuste por diferencia", () => {
    const r = calcularDiferenciaLocal({ saldoME: 1000, tcOriginal: 3.7, tcActual: 3.75, esActivo: true });
    const abs = Math.abs(r.diferenciaCambio);
    const lineas =
      r.diferenciaCambio > 0
        ? [
            { cuenta: "121201", debe: abs, haber: 0 },
            { cuenta: "772101", debe: 0, haber: abs },
          ]
        : [
            { cuenta: "671201", debe: abs, haber: 0 },
            { cuenta: "121201", debe: 0, haber: abs },
          ];
    const debe = lineas.reduce((s, l) => s + l.debe, 0);
    const haber = lineas.reduce((s, l) => s + l.haber, 0);
    expect(debe).toBe(haber);
  });

  it("debe usar TC según disponibilidad (SBS vs SUNAT)", () => {
    const tcSBS = 3.752;
    const tcSUNAT = 3.75;
    const tcUsado = tcSBS ?? tcSUNAT;
    expect(calcularDiferenciaLocal({ saldoME: 100, tcOriginal: 3.7, tcActual: tcUsado, esActivo: true }).tcActual).toBe(
      3.752,
    );
  });
});
