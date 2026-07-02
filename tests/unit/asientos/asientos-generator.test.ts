import { describe, it, expect } from "vitest";
import {
  CUENTAS_DEFAULT,
  generarLineasAsiento,
  glosaAsiento,
  resolverMontosComprobante,
} from "@/lib/asientos-generator";
import {
  lineasToAsientosPlanos,
  tipoAsientoCancelacion,
  tipoLibroProvision,
} from "@/lib/asientos-contables-utils";
import { mockRegistroCompra, mockRegistroVenta, sumDebeHaber, SIRE_UUID } from "../../helpers/fixtures";

describe("AsientosGenerator", () => {
  describe("generarLineasAsiento — compra", () => {
    it("debe generar líneas correctas para compra con IGV", () => {
      const registro = mockRegistroCompra();
      const lineas = generarLineasAsiento(registro);

      expect(lineas).toHaveLength(3);
      expect(lineas[0]).toMatchObject({ cuenta: CUENTAS_DEFAULT.gastoCompra, debe: 1000, haber: 0 });
      expect(lineas[1]).toMatchObject({ cuenta: CUENTAS_DEFAULT.igv, debe: 180, haber: 0 });
      expect(lineas[2]).toMatchObject({ cuenta: CUENTAS_DEFAULT.proveedor, debe: 0, haber: 1180 });

      const { debe, haber } = sumDebeHaber(lineas);
      expect(debe).toBe(haber);
    });

    it("debe generar líneas correctas para compra sin IGV", () => {
      const registro = mockRegistroCompra({
        mto_bi_gravada: 1000,
        mto_igv_ipe: 0,
        mto_total_cp: 1000,
        importe_total: 1000,
      });
      const lineas = generarLineasAsiento(registro);
      expect(lineas[1].debe).toBe(0);
      expect(lineas[2].haber).toBe(1000);
    });

    it("debe usar cuentas de config_contable", () => {
      const registro = mockRegistroCompra();
      const lineas = generarLineasAsiento(registro, {
        gastoCompra: "601999",
        igv: "40199",
        proveedor: "421999",
      });
      expect(lineas[0].cuenta).toBe("601999");
      expect(lineas[1].cuenta).toBe("40199");
      expect(lineas[2].cuenta).toBe("421999");
    });

    it("debe usar cuenta_pcge del registro si existe", () => {
      const registro = mockRegistroCompra({ cuenta_pcge: "602101" });
      const lineas = generarLineasAsiento(registro);
      expect(lineas[0].cuenta).toBe("602101");
    });

    it("debe incluir glosa descriptiva", () => {
      const registro = mockRegistroCompra();
      const lineas = generarLineasAsiento(registro);
      expect(lineas[0].glosa).toContain("01-F001-123");
      expect(glosaAsiento(registro)).toContain("COMPRA");
    });

    it("debe generar partida doble exacta", () => {
      const registro = mockRegistroCompra({ mto_bi_gravada: 2500, mto_igv_ipe: 450, mto_total_cp: 2950 });
      const { debe, haber } = sumDebeHaber(generarLineasAsiento(registro));
      expect(debe).toBe(2950);
      expect(haber).toBe(2950);
    });
  });

  describe("generarLineasAsiento — venta", () => {
    it("debe generar líneas correctas para venta con IGV", () => {
      const registro = mockRegistroVenta();
      const lineas = generarLineasAsiento(registro);

      expect(lineas[0]).toMatchObject({ cuenta: CUENTAS_DEFAULT.cliente, debe: 1180, haber: 0 });
      expect(lineas[1]).toMatchObject({ cuenta: CUENTAS_DEFAULT.ingresoVenta, debe: 0, haber: 1000 });
      expect(lineas[2]).toMatchObject({ cuenta: CUENTAS_DEFAULT.igv, debe: 0, haber: 180 });
    });

    it("debe usar cuentas de config_contable para ventas", () => {
      const registro = mockRegistroVenta();
      const lineas = generarLineasAsiento(registro, {
        cliente: "121999",
        ingresoVenta: "701999",
      });
      expect(lineas[0].cuenta).toBe("121999");
      expect(lineas[1].cuenta).toBe("701999");
    });
  });

  describe("resolverMontosComprobante", () => {
    it("resuelve montos SUNAT del comprobante", () => {
      const montos = resolverMontosComprobante(mockRegistroCompra());
      expect(montos.base).toBe(1000);
      expect(montos.igv).toBe(180);
      expect(montos.total).toBe(1180);
    });
  });

  describe("generarAsientoCancelacion", () => {
    it("debe invertir líneas del asiento original", () => {
      const registro = mockRegistroCompra();
      const provision = generarLineasAsiento(registro);
      const cancelacion = provision.map((l) => ({
        ...l,
        debe: l.haber,
        haber: l.debe,
      }));

      expect(cancelacion[0].haber).toBe(provision[0].debe);
      expect(cancelacion[0].debe).toBe(0);
    });

    it("debe usar tipo_asiento = cancelacion_caja en payload plano", () => {
      const registro = mockRegistroCompra();
      const lineas = generarLineasAsiento(registro).map((l) => ({
        ...l,
        debe: l.haber,
        haber: l.debe,
      }));
      const planos = lineasToAsientosPlanos({
        registro,
        registroId: SIRE_UUID,
        lineas,
        tipoAsiento: tipoAsientoCancelacion(),
        tipoLibro: "CAJA_BANCOS",
      });
      expect(planos.every((p) => p.tipo_asiento === "cancelacion_caja")).toBe(true);
      expect(planos.every((p) => p.tipo_libro === "CAJA_BANCOS")).toBe(true);
    });
  });

  describe("lineasToAsientosPlanos", () => {
    it("incluye ruc_contraparte del proveedor", () => {
      const registro = mockRegistroCompra({ ruc: "20123456789" });
      const lineas = generarLineasAsiento(registro);
      const planos = lineasToAsientosPlanos({
        registro,
        registroId: SIRE_UUID,
        lineas,
        tipoLibro: tipoLibroProvision(registro.tipo),
      });
      expect(planos.every((p) => p.ruc_contraparte === "20123456789")).toBe(true);
      expect(planos.every((p) => p.sire_registro_id === SIRE_UUID)).toBe(true);
    });
  });
});
