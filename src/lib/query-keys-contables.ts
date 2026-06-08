/** Claves React Query compartidas — invalidar entre Libro Diario y Libro Caja. */
export const queryKeys = {
  libroDiario: (filters: Record<string, unknown>) => ["libro_diario", filters] as const,
  libroCajaBancos: (ruc: string, periodo?: string | null) =>
    ["libro_caja_bancos", ruc, periodo ?? ""] as const,
  cxcCxp: (ruc: string, periodo?: string | null) => ["cxc_cxp", ruc, periodo ?? ""] as const,
  cuentasFinancieras: (ruc: string) => ["cuentas_financieras", ruc] as const,
  comprobantesPendientes: (ruc: string, periodo: string) =>
    ["comprobantes_pendientes", ruc, periodo] as const,
};

/** Invalida vistas cruzadas tras registrar pago/cobro o provisión. */
export function invalidateLibrosContables(qc: {
  invalidateQueries: (opts: { queryKey: readonly unknown[] }) => void;
}) {
  qc.invalidateQueries({ queryKey: ["libro_diario"] });
  qc.invalidateQueries({ queryKey: ["libro_caja_bancos"] });
  qc.invalidateQueries({ queryKey: ["cxc_cxp"] });
  qc.invalidateQueries({ queryKey: ["comprobantes_pendientes"] });
}
