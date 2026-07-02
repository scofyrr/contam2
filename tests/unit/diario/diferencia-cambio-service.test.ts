import { describe, expect, it } from "vitest";
import {
  obtenerTipoCambioSBS,
  obtenerTipoCambioSUNAT,
} from "@/modules/contabilidad/diario/services/diferencia-cambio-service";

describe("diferencia-cambio-service", () => {
  it("obtenerTipoCambioSBS retorna TC determinístico por fecha", async () => {
    const tc = await obtenerTipoCambioSBS("2026-01-15", "USD");
    expect(tc.fuente).toBe("SBS");
    expect(tc.moneda).toBe("USD");
    expect(tc.venta).toBeGreaterThan(3.5);
    expect(tc.compra).toBeLessThan(tc.venta);
  });

  it("obtenerTipoCambioSUNAT retorna TC con fuente SUNAT", async () => {
    const tc = await obtenerTipoCambioSUNAT("2026-01-15", "USD");
    expect(tc.fuente).toBe("SUNAT");
    expect(tc.fecha).toBe("2026-01-15");
  });
});
