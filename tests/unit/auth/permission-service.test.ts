import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserPermissions } from "@/modules/auth/types/rbac";

const mockRpc = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

import { permissionService } from "@/modules/auth/services/permission-service";

function buildPermissions(overrides: Partial<UserPermissions> = {}): UserPermissions {
  const now = Date.now();
  return {
    userId: "user-1",
    roles: [
      {
        id: "r1",
        nombre: "CONTADOR",
        nivelJerarquico: 50,
        color: "#000",
        icono: "User",
        rucScope: "20100000001",
        fechaDesde: "2026-01-01",
        activo: true,
      },
    ],
    permisos: ["sire.leer", "diario.crear"],
    permisosMap: new Map(),
    scopes: [{ rucId: "20100000001", permisos: ["sire.leer", "diario.crear"] }],
    loadedAt: now,
    expiresAt: now + 60000,
    legacyMode: false,
    ...overrides,
  };
}

describe("PermissionService", () => {
  beforeEach(() => {
    permissionService.invalidarCache();
    permissionService.setContext(null);
    mockRpc.mockReset();
  });

  describe("tienePermiso", () => {
    it("legacy mode debe tener acceso a permisos legacy", async () => {
      mockRpc.mockRejectedValue(new Error("RBAC no desplegado"));
      await permissionService.cargarPermisos("user-legacy");
      permissionService.setContext("user-legacy");
      expect(permissionService.tienePermiso("sire.leer")).toBe(true);
      expect(permissionService.tienePermiso("admin.usuarios")).toBe(true);
    });

    it("debe verificar permiso específico por código", async () => {
      mockRpc.mockImplementation((fn: string) => {
        if (fn === "rpc_get_user_permissions") {
          return Promise.resolve({
            data: [
              { codigo: "sire.leer", nombre: "Leer SIRE", modulo: "SIRE", categoria: "READ", otorgado_por_rol: "CONTADOR" },
            ],
            error: null,
          });
        }
        if (fn === "rpc_get_user_roles") {
          return Promise.resolve({
            data: [
              {
                id: "ur1",
                rol_id: "r1",
                rol_nombre: "CONTADOR",
                nivel_jerarquico: 50,
                color: "#000",
                icono: "User",
                ruc_id: null,
                fecha_desde: "2026-01-01",
                fecha_hasta: null,
                activo: true,
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: false, error: null });
      });

      await permissionService.cargarPermisos("user-1");
      permissionService.setContext("user-1");
      expect(permissionService.tienePermiso("sire.leer")).toBe(true);
      expect(permissionService.tienePermiso("sire.eliminar")).toBe(false);
    });

    it("debe respetar scope por RUC", async () => {
      const perms = buildPermissions();
      permissionService.invalidarCache();
      // Simular caché vía cargarPermisos con mock scoped
      mockRpc.mockImplementation((fn: string) => {
        if (fn === "rpc_get_user_permissions") {
          return Promise.resolve({
            data: perms.permisos.map((codigo) => ({
              codigo,
              nombre: codigo,
              modulo: "SIRE",
              categoria: "READ",
              otorgado_por_rol: "CONTADOR",
            })),
            error: null,
          });
        }
        if (fn === "rpc_get_user_roles") {
          return Promise.resolve({
            data: [
              {
                id: "ur1",
                rol_id: "r1",
                rol_nombre: "CONTADOR",
                nivel_jerarquico: 50,
                color: "#000",
                icono: "User",
                ruc_id: "20100000001",
                fecha_desde: "2026-01-01",
                fecha_hasta: null,
                activo: true,
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: false, error: null });
      });

      await permissionService.cargarPermisos("user-1", "20100000001");
      permissionService.setContext("user-1", "20100000001");
      expect(permissionService.tienePermiso("sire.leer", "20100000001")).toBe(true);
      expect(permissionService.tienePermiso("sire.leer", "20200000002")).toBe(false);
    });

    it("debe manejar scope GLOBAL (null)", async () => {
      mockRpc.mockImplementation((fn: string) => {
        if (fn === "rpc_get_user_permissions") {
          return Promise.resolve({
            data: [{ codigo: "sire.leer", nombre: "Leer", modulo: "SIRE", categoria: "R", otorgado_por_rol: "ADMIN" }],
            error: null,
          });
        }
        if (fn === "rpc_get_user_roles") {
          return Promise.resolve({
            data: [
              {
                id: "ur1",
                rol_id: "admin",
                rol_nombre: "ADMIN",
                nivel_jerarquico: 10,
                color: "#000",
                icono: "Shield",
                ruc_id: null,
                fecha_desde: "2026-01-01",
                fecha_hasta: null,
                activo: true,
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: false, error: null });
      });

      await permissionService.cargarPermisos("admin-1");
      permissionService.setContext("admin-1");
      expect(permissionService.tienePermiso("sire.leer", "20200000002")).toBe(true);
    });

    it("debe retornar false sin contexto cargado", () => {
      expect(permissionService.tienePermiso("sire.leer")).toBe(false);
    });

    it("debe invalidar caché cuando se actualizan roles", async () => {
      mockRpc.mockRejectedValue(new Error("offline"));
      await permissionService.cargarPermisos("user-x");
      permissionService.setContext("user-x");
      expect(permissionService.tienePermiso("sire.leer")).toBe(true);

      permissionService.invalidarCache("user-x");
      permissionService.setContext("user-x");
      expect(permissionService.tienePermiso("sire.leer")).toBe(false);
    });
  });

  describe("tieneAlgunPermiso", () => {
    it("debe retornar true si tiene al menos uno", async () => {
      mockRpc.mockRejectedValue(new Error("legacy"));
      await permissionService.cargarPermisos("u1");
      permissionService.setContext("u1");
      expect(permissionService.tieneAlgunPermiso(["sire.leer", "inexistente"])).toBe(true);
    });

    it("debe retornar false si no tiene ninguno", async () => {
      mockRpc.mockImplementation((fn: string) => {
        if (fn === "rpc_get_user_permissions") return Promise.resolve({ data: [], error: null });
        if (fn === "rpc_get_user_roles") return Promise.resolve({ data: [], error: null });
        if (fn === "rpc_rbac_bootstrap_needed") return Promise.resolve({ data: false, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      await permissionService.cargarPermisos("u2");
      permissionService.setContext("u2");
      expect(permissionService.tieneAlgunPermiso(["sire.leer"])).toBe(false);
    });
  });

  describe("tieneTodosPermisos", () => {
    it("debe retornar true solo si tiene todos", async () => {
      mockRpc.mockRejectedValue(new Error("legacy"));
      await permissionService.cargarPermisos("u3");
      permissionService.setContext("u3");
      expect(permissionService.tieneTodosPermisos(["sire.leer", "diario.leer"])).toBe(true);
    });

    it("debe retornar false si falta alguno", async () => {
      mockRpc.mockRejectedValue(new Error("legacy"));
      await permissionService.cargarPermisos("u4");
      permissionService.setContext("u4");
      expect(permissionService.tieneTodosPermisos(["sire.leer", "permiso.inexistente"])).toBe(false);
    });
  });
});
