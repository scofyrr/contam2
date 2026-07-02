import { describe, it, expect } from "vitest";
import {
  getNextAvailableChildCode,
  suggestParentCode,
  validatePCGEHierarchy,
} from "@/modules/contabilidad/pcge/services/pcge-validator";

describe("PCGE Validator", () => {
  describe("validatePCGEHierarchy", () => {
    it("debe validar código de elemento (1 dígito)", () => {
      const r = validatePCGEHierarchy("1");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(1);
      expect(r.nivelNombre).toBe("Elemento");
    });

    it("debe validar código de subelemento (2 dígitos)", () => {
      const r = validatePCGEHierarchy("10");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(2);
    });

    it("debe validar código de cuenta mayor (3 dígitos)", () => {
      const r = validatePCGEHierarchy("101");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(3);
    });

    it("debe validar código de subcuenta (4 dígitos)", () => {
      const r = validatePCGEHierarchy("1010");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(4);
    });

    it("debe validar código de divisionaria (6 dígitos)", () => {
      const r = validatePCGEHierarchy("101101");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(5);
      expect(r.nivelNombre).toBe("Divisionaria");
    });

    it("debe validar código de subdivisional (8 dígitos)", () => {
      const r = validatePCGEHierarchy("10110101");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(6);
    });

    it("debe aceptar hijo que comienza con código del padre", () => {
      const r = validatePCGEHierarchy("101101", "1011");
      expect(r.valid).toBe(true);
    });

    it("debe rechazar hijo que no comienza con código del padre", () => {
      const r = validatePCGEHierarchy("101101", "102");
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes("prefijo del padre"))).toBe(true);
    });

    it("debe rechazar salto de nivel (elemento → divisionaria)", () => {
      const r = validatePCGEHierarchy("101101", "1");
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes("dígitos"))).toBe(true);
    });

    it("debe aceptar incremento de un nivel a la vez", () => {
      expect(validatePCGEHierarchy("101", "10").valid).toBe(true);
      expect(validatePCGEHierarchy("1010", "101").valid).toBe(true);
    });

    it("normaliza código con puntos a dígitos válidos", () => {
      const r = validatePCGEHierarchy("10.1");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(3);
    });

    it("normaliza código con letras eliminándolas", () => {
      const r = validatePCGEHierarchy("10A");
      expect(r.valid).toBe(true);
      expect(r.nivel).toBe(2);
    });

    it("debe rechazar código con longitud > 8", () => {
      const r = validatePCGEHierarchy("101010101");
      expect(r.valid).toBe(false);
    });

    it("debe rechazar código vacío", () => {
      const r = validatePCGEHierarchy("");
      expect(r.valid).toBe(false);
    });

    it("debe rechazar longitud intermedia inválida (5 dígitos)", () => {
      const r = validatePCGEHierarchy("10101");
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes("1, 2, 3, 4, 6 u 8"))).toBe(true);
    });
  });

  describe("suggestParentCode", () => {
    it("debe truncar hasta padre existente", () => {
      expect(suggestParentCode("101101", ["1", "10", "101", "1011"])).toBe("1011");
    });

    it("debe retornar null para código de 1 dígito", () => {
      expect(suggestParentCode("1", ["1"])).toBeNull();
    });

    it("debe sugerir padre existente en BD escalando hacia arriba", () => {
      expect(suggestParentCode("101101", ["1", "10"])).toBe("10");
    });
  });

  describe("getNextAvailableChildCode", () => {
    it("debe sugerir siguiente código secuencial bajo padre de 3 dígitos", () => {
      const r = getNextAvailableChildCode("101", ["101", "1011", "1012"]);
      expect(r.codigo).toBe("1013");
    });

    it("debe manejar primer hijo (ninguno existente)", () => {
      const r = getNextAvailableChildCode("101", ["101"]);
      expect(r.codigo).toBe("1011");
    });
  });
});
