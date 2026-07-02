import { supabase } from "@/integrations/supabase/client";
import { getSireReadSource } from "@/lib/feature-flags";
import { resolverMontosSunat } from "@/lib/sire-montos";

export type ComprobanteLiquidacion = {
  id: string;
  tipo: "VENTA" | "COMPRA";
  ruc: string;
  razon_social: string;
  periodo: string;
  fecha_emision: string;
  cod_tipo_cdp: string;
  serie_cdp: string | null;
  nro_cdp_inicial: string;
  nombre_contraparte: string | null;
  mto_total_cp: number;
  estado_cobro: string;
  estado_pago: string;
};

export async function fetchComprobantesPendientesLiquidacion(params: {
  ruc: string;
  periodo?: string | null;
}): Promise<ComprobanteLiquidacion[]> {
  const ruc = params.ruc.trim();
  if (!ruc) return [];

  let q = supabase
    .from(getSireReadSource())
    .select(
      "id, tipo, ruc, razon_social, periodo, fecha_emision, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, nombre_contraparte, importe_total, mto_total_cp, mto_bi_gravada, mto_igv_ipe, bi_grav, igv_grav, estado_cobro, estado_pago, cancelacion_asiento_id",
    )
    .eq("ruc", ruc)
    .is("cancelacion_asiento_id", null)
    .eq("estado_validacion", "validado")
    .order("fecha_emision", { ascending: false })
    .limit(100);
  if (params.periodo) q = q.eq("periodo", params.periodo);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? [])
    .filter((r) => {
      if (r.tipo === "VENTA") return r.estado_cobro !== "cobrado";
      return r.estado_pago !== "pagado";
    })
    .map((r) => {
      const { mto_total_cp } = resolverMontosSunat(r);
      return {
        id: r.id,
        tipo: r.tipo as "VENTA" | "COMPRA",
        ruc: r.ruc,
        razon_social: r.razon_social,
        periodo: r.periodo,
        fecha_emision: r.fecha_emision,
        cod_tipo_cdp: r.cod_tipo_cdp,
        serie_cdp: r.serie_cdp,
        nro_cdp_inicial: r.nro_cdp_inicial,
        nombre_contraparte: r.nombre_contraparte,
        mto_total_cp,
        estado_cobro: r.estado_cobro,
        estado_pago: r.estado_pago,
      };
    });
}
