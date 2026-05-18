// CONTAM — Generador de archivos planos SIRE (RVIE 140400 / RCE 130400)
// y stub del cliente API SUNAT (token + envío TUS.IO + consulta ticket).
//
// Referencia: RS N.° 112-2021/SUNAT y normas modificatorias. Estructura
// resumida: filas separadas por pipe `|` y nombre de archivo:
//   LE[RUC][AAAA][MM]00[140400|130400][CC][O][I][M]2.txt
//   CC = 00 (período mensual), O = 1/2/3 (1ra/2da/3ra propuesta) usamos 1,
//   I  = 1 (con info), M = 1 (no se acepta indicador modificación parcial).
//
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSession } from "./auth.functions";

const fmt = (n: number | string | null | undefined) =>
  Number(n ?? 0).toFixed(2);
const fmtFecha = (iso: string | null | undefined) => {
  if (!iso) return "";
  // ddmmaaaa para SIRE
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}${m}${y}`;
};

function nombreArchivo(opts: {
  ruc: string;
  periodo: string; // AAAAMM
  libro: "140400" | "130400";
}) {
  const aaaa = opts.periodo.slice(0, 4);
  const mm = opts.periodo.slice(4, 6);
  // LE + RUC(11) + AAAA + MM + 00 + libro + 00(CC) + 1(O) + 1(I) + 1(M) + 1 + .txt
  return `LE${opts.ruc}${aaaa}${mm}00${opts.libro}00111${1}.txt`;
}

export const generarRVIE = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ruc: z.string().regex(/^\d{11}$/),
      periodo: z.string().regex(/^\d{6}$/),
    }),
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { data: rows, error } = await supabaseAdmin
      .from("comprobantes_ventas")
      .select("*, entidades:cliente_id(tipo_documento, numero_documento, razon_social)")
      .eq("periodo", data.periodo)
      .order("fecha_emision", { ascending: true });
    if (error) throw new Error(error.message);

    // Estructura simplificada Anexo 2 (cabecera ilustrativa):
    // Periodo|CUO|CAR|FechaEmision|FechaVencimiento|TipoCDP|Serie|Numero|TipoDocCliente|NroDocCliente|RazonSocial|BIGravada|IGV|BIExo|BIInaf|BIExp|ISC|ICBPER|Otros|Total|Moneda|TC|Estado
    const filas: string[] = [];
    let cuo = 1;
    for (const r of rows ?? []) {
      const ent = (r as any).entidades ?? {};
      filas.push(
        [
          data.periodo,
          String(cuo++).padStart(8, "0"),
          r.car ?? "",
          fmtFecha(r.fecha_emision),
          fmtFecha(r.fecha_vencimiento),
          r.tipo_comprobante,
          r.serie,
          r.numero,
          ent.tipo_documento ?? "",
          ent.numero_documento ?? "",
          (ent.razon_social ?? "").replace(/[|\r\n]/g, " "),
          fmt(r.base_gravada),
          fmt(r.igv),
          fmt(r.base_exonerada),
          fmt(r.base_inafecta),
          fmt(r.base_exportacion),
          fmt(r.isc),
          fmt(r.icbper),
          fmt(r.otros_tributos),
          fmt(r.importe_total),
          r.moneda,
          fmt(r.tipo_cambio),
          r.estado,
        ].join("|"),
      );
    }
    return {
      nombre: nombreArchivo({ ruc: data.ruc, periodo: data.periodo, libro: "140400" }),
      contenido: filas.join("\r\n") + (filas.length ? "\r\n" : ""),
      totalFilas: filas.length,
    };
  });

export const generarRCE = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ruc: z.string().regex(/^\d{11}$/),
      periodo: z.string().regex(/^\d{6}$/),
    }),
  )
  .handler(async ({ data }) => {
    await requireSession();
    const { data: rows, error } = await supabaseAdmin
      .from("comprobantes_compras")
      .select("*, entidades:proveedor_id(tipo_documento, numero_documento, razon_social)")
      .eq("periodo", data.periodo)
      .order("fecha_emision", { ascending: true });
    if (error) throw new Error(error.message);

    const filas: string[] = [];
    let cuo = 1;
    for (const r of rows ?? []) {
      const ent = (r as any).entidades ?? {};
      filas.push(
        [
          data.periodo,
          String(cuo++).padStart(8, "0"),
          r.car ?? "",
          fmtFecha(r.fecha_emision),
          fmtFecha(r.fecha_vencimiento),
          r.tipo_comprobante,
          r.serie,
          r.numero,
          ent.tipo_documento ?? "",
          ent.numero_documento ?? "",
          (ent.razon_social ?? "").replace(/[|\r\n]/g, " "),
          fmt(r.base_gravada_dg),
          fmt(r.igv_dg),
          fmt(r.base_gravada_dgng),
          fmt(r.igv_dgng),
          fmt(r.base_gravada_dng),
          fmt(r.igv_dng),
          fmt(r.isc),
          fmt(r.icbper),
          fmt(r.valor_no_gravado),
          fmt(r.otros_tributos),
          fmt(r.importe_total),
          r.moneda,
          fmt(r.tipo_cambio),
          r.detraccion_numero ?? "",
          fmtFecha(r.detraccion_fecha),
          r.estado,
        ].join("|"),
      );
    }
    return {
      nombre: nombreArchivo({ ruc: data.ruc, periodo: data.periodo, libro: "130400" }),
      contenido: filas.join("\r\n") + (filas.length ? "\r\n" : ""),
      totalFilas: filas.length,
    };
  });

// ------------------------------------------------------------------
// CLIENTE API SUNAT SIRE — Stub documentado
// Endpoints reales (entorno producción):
//   Token:     https://api-seguridad.sunat.gob.pe/v1/clientessol/{client_id}/oauth2/token/
//   SIRE:      https://api-sire.sunat.gob.pe/v1/contribuyente/migeigv/libros/rvierce/...
//   TUS.IO:    Servicio de subida resumible para archivos ZIP > 5 MB.
// ------------------------------------------------------------------

export const sunatToken = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ruc: z.string().regex(/^\d{11}$/),
      usuario_sol: z.string().min(1),
      clave_sol: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const clientId = process.env.SUNAT_CLIENT_ID;
    const clientSecret = process.env.SUNAT_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return {
        ok: false,
        error:
          "Faltan SUNAT_CLIENT_ID / SUNAT_CLIENT_SECRET. Regístralos en los secretos del proyecto.",
      };
    }
    const url = `https://api-seguridad.sunat.gob.pe/v1/clientessol/${clientId}/oauth2/token/`;
    const body = new URLSearchParams({
      grant_type: "password",
      scope: "https://api-sire.sunat.gob.pe",
      client_id: clientId,
      client_secret: clientSecret,
      username: `${data.ruc}${data.usuario_sol}`,
      password: data.clave_sol,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: JSON.stringify(json) };
    return { ok: true, token: json };
  });
