// CONTAM — CRUD de comprobantes de ventas y compras + generación de asientos contables.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSession } from "./auth.functions";

const num = z.coerce.number().nonnegative().default(0);

const VentaInput = z.object({
  periodo: z.string().regex(/^\d{6}$/),
  fecha_emision: z.string(),
  tipo_comprobante: z.string().length(2), // 01,03,07,08,...
  serie: z.string().min(1).max(4),
  numero: z.string().min(1).max(20),
  cliente_id: z.string().uuid(),
  moneda: z.enum(["PEN", "USD", "EUR"]).default("PEN"),
  tipo_cambio: z.coerce.number().positive().default(1),
  base_gravada: num,
  base_exonerada: num,
  base_inafecta: num,
  base_exportacion: num,
  igv: num,
  isc: num,
  icbper: num,
  otros_tributos: num,
  importe_total: num,
  medio_pago: z.string().length(3).optional().nullable(),
});

const CompraInput = z.object({
  periodo: z.string().regex(/^\d{6}$/),
  fecha_emision: z.string(),
  tipo_comprobante: z.string().length(2),
  serie: z.string().min(1).max(20),
  numero: z.string().min(1).max(20),
  proveedor_id: z.string().uuid(),
  moneda: z.enum(["PEN", "USD", "EUR"]).default("PEN"),
  tipo_cambio: z.coerce.number().positive().default(1),
  base_gravada_dg: num,
  igv_dg: num,
  isc: num,
  icbper: num,
  valor_no_gravado: num,
  otros_tributos: num,
  importe_total: num,
  medio_pago: z.string().length(3).optional().nullable(),
});

export const listVentas = createServerFn({ method: "GET" })
  .inputValidator(z.object({ periodo: z.string().regex(/^\d{6}$/).optional() }).optional())
  .handler(async ({ data }) => {
    await requireSession();
    let q = supabaseAdmin
      .from("comprobantes_ventas")
      .select("*, entidades:cliente_id(razon_social, numero_documento, tipo_documento)")
      .order("fecha_emision", { ascending: false })
      .limit(500);
    if (data?.periodo) q = q.eq("periodo", data.periodo);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listCompras = createServerFn({ method: "GET" })
  .inputValidator(z.object({ periodo: z.string().regex(/^\d{6}$/).optional() }).optional())
  .handler(async ({ data }) => {
    await requireSession();
    let q = supabaseAdmin
      .from("comprobantes_compras")
      .select("*, entidades:proveedor_id(razon_social, numero_documento, tipo_documento)")
      .order("fecha_emision", { ascending: false })
      .limit(500);
    if (data?.periodo) q = q.eq("periodo", data.periodo);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createVenta = createServerFn({ method: "POST" })
  .inputValidator(VentaInput)
  .handler(async ({ data }) => {
    await requireSession();
    const { data: cpe, error } = await supabaseAdmin
      .from("comprobantes_ventas")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Asiento contable automático (PCGE): 12 Cuentas por cobrar / 40 Tributos / 70 Ventas
    const cobrar = Number(cpe.importe_total);
    const igv = Number(cpe.igv);
    const ventas = Number(cpe.base_gravada) + Number(cpe.base_exonerada) + Number(cpe.base_inafecta) + Number(cpe.base_exportacion);

    const { data: asiento } = await supabaseAdmin
      .from("asientos_contables")
      .insert({
        periodo: cpe.periodo,
        fecha: cpe.fecha_emision,
        origen: "VENTAS",
        comprobante_venta_id: cpe.id,
        glosa: `Venta ${cpe.serie}-${cpe.numero}`,
        moneda: cpe.moneda,
        tipo_cambio: cpe.tipo_cambio,
        total_debe: cobrar,
        total_haber: cobrar,
      })
      .select()
      .single();

    if (asiento) {
      await supabaseAdmin.from("lineas_asiento").insert([
        { asiento_id: asiento.id, orden: 1, cuenta: "1212", glosa: "Facturas por cobrar", debe: cobrar, haber: 0 },
        { asiento_id: asiento.id, orden: 2, cuenta: "4011", glosa: "IGV - Cuenta propia", debe: 0, haber: igv },
        { asiento_id: asiento.id, orden: 3, cuenta: "7011", glosa: "Mercaderías - Venta", debe: 0, haber: ventas },
      ]);
    }
    return cpe;
  });

export const createCompra = createServerFn({ method: "POST" })
  .inputValidator(CompraInput)
  .handler(async ({ data }) => {
    await requireSession();
    const { data: cpe, error } = await supabaseAdmin
      .from("comprobantes_compras")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Asiento: 60 Compras / 40 IGV crédito / 42 Cuentas por pagar
    const pagar = Number(cpe.importe_total);
    const igv = Number(cpe.igv_dg);
    const compras = Number(cpe.base_gravada_dg) + Number(cpe.valor_no_gravado);

    const { data: asiento } = await supabaseAdmin
      .from("asientos_contables")
      .insert({
        periodo: cpe.periodo,
        fecha: cpe.fecha_emision,
        origen: "COMPRAS",
        comprobante_compra_id: cpe.id,
        glosa: `Compra ${cpe.serie}-${cpe.numero}`,
        moneda: cpe.moneda,
        tipo_cambio: cpe.tipo_cambio,
        total_debe: pagar,
        total_haber: pagar,
      })
      .select()
      .single();

    if (asiento) {
      await supabaseAdmin.from("lineas_asiento").insert([
        { asiento_id: asiento.id, orden: 1, cuenta: "601", glosa: "Mercaderías", debe: compras, haber: 0 },
        { asiento_id: asiento.id, orden: 2, cuenta: "4011", glosa: "IGV - Crédito fiscal", debe: igv, haber: 0 },
        { asiento_id: asiento.id, orden: 3, cuenta: "4212", glosa: "Facturas por pagar", debe: 0, haber: pagar },
      ]);
    }
    return cpe;
  });
