import { apiRequest } from "@/lib/api/http-client";
import type { CentralizarPeriodoResult } from "@/lib/caja-service";

export async function centralizarPeriodoViaApi(params: {
  ruc: string;
  periodo: string;
}): Promise<CentralizarPeriodoResult> {
  const res = await apiRequest<{
    asiento_referencia_id: string;
    movimientos_vinculados: number;
    lineas_diario: number;
  }>("/caja/centralizar-periodo/", {
    method: "POST",
    body: JSON.stringify({ ruc: params.ruc, periodo: params.periodo }),
  });

  const ref = res.asiento_referencia_id;
  return {
    asientoReferenciaId: ref,
    movimientosVinculados: res.movimientos_vinculados,
    lineasDiario: res.lineas_diario,
  };
}
