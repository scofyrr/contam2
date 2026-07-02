export const STALE_TIMES = {
  PCGE: 60 * 60 * 1000,
  CONFIG_CONTABLE: 60 * 60 * 1000,
  ROLES_PERMISOS: 30 * 60 * 1000,
  CONTRIBUYENTES: 15 * 60 * 1000,
  FICHA_RUC: 30 * 60 * 1000,
  CUENTAS_FINANCIERAS: 15 * 60 * 1000,
  REGISTROS_SIRE: 2 * 60 * 1000,
  ASIENTOS_CONTABLES: 2 * 60 * 1000,
  MOVIMIENTOS_CAJA: 2 * 60 * 1000,
  TAREAS_PENDIENTES: 1 * 60 * 1000,
  DASHBOARD_KPIS: 1 * 60 * 1000,
  NOTIFICACIONES: 30 * 1000,
  AUDITORIA_RECIENTE: 30 * 1000,
  USER_PERMISSIONS: 5 * 60 * 1000,
  USER_PREFERENCES: 10 * 60 * 1000,
} as const;

export type InvalidationDomain =
  | "sire.mutate"
  | "diario.mutate"
  | "caja.mutate"
  | "pcge.mutate"
  | "contribuyentes.mutate"
  | "admin.mutate";

export const INVALIDATION_RULES: Record<InvalidationDomain, string[]> = {
  "sire.mutate": ["sire", "libro-diario", "libro_diario", "cxc-cxp", "cxc_cxp", "dashboard", "tareas", "comprobantes_pendientes"],
  "diario.mutate": ["libro-diario", "libro_diario", "asientos", "dashboard", "trazabilidad", "cxc-cxp", "cxc_cxp"],
  "caja.mutate": ["caja", "libro_caja", "movimientos", "libro-diario", "libro_diario", "dashboard", "conciliacion"],
  "pcge.mutate": ["pcge"],
  "contribuyentes.mutate": ["contribuyentes", "ficha-ruc", "ficha_ruc", "dashboard"],
  "admin.mutate": ["permisos", "roles", "rbac", "usuarios"],
};

/** Invalida queries cuyo queryKey contiene alguno de los prefijos del dominio */
export function invalidateByDomain(
  qc: { invalidateQueries: (opts: { predicate?: (q: { queryKey: readonly unknown[] }) => boolean }) => Promise<void> },
  domain: InvalidationDomain,
) {
  const prefixes = INVALIDATION_RULES[domain];
  return qc.invalidateQueries({
    predicate: (query) =>
      prefixes.some((p) =>
        query.queryKey.some((k) => typeof k === "string" && k.toLowerCase().includes(p.toLowerCase())),
      ),
  });
}
