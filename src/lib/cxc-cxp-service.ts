import { supabase } from "@/integrations/supabase/client";
import { CUENTAS_DEFAULT } from "@/lib/asientos-generator";
import {
  ASIENTOS_CONTABLES_SELECT,
  logSupabaseAsientosInsertError,
  normalizeCuentaContable,
  round2,
  TIPOS_LIBRO_PROVISION,
  toAsientoContableInsert,
  type AsientoContableInsert,
  type TipoRegistroDb,
} from "@/lib/asientos-contables-utils";
import { getSireEmbedRelation } from "@/lib/feature-flags";
import { updateRegistroSireCabecera } from "@/lib/sire-registros-service";
import { resolverMontosSunat } from "@/lib/sire-montos";
import { normalizeRegistroSire } from "@/lib/sire-data";

export type DeudaPendiente = {
  sireRegistroId: string;
  tipo: TipoRegistroDb;
  periodo: string;
  rucContraparte: string | null;
  nombreContraparte: string | null;
  comprobante: string;
  montoTotal: number;
  montoCancelado: number;
  saldoPendiente: number;
  cuentaComercial: string;
};

function labelCpe(row: {
  cod_tipo_cdp?: string | null;
  serie_cdp?: string | null;
  nro_cdp_inicial?: string | null;
}) {
  return `${row.cod_tipo_cdp ?? ""}-${row.serie_cdp ?? ""}-${row.nro_cdp_inicial ?? ""}`.replace(
    /^-|-$/g,
    "",
  );
}

export async function fetchDeudasPendientes(params: {
  ruc: string;
  periodo?: string | null;
}): Promise<DeudaPendiente[]> {
  const ruc = params.ruc.trim();
  if (!ruc) return [];

  const sireEmbed = getSireEmbedRelation();
  let qProvision = supabase
    .from("asientos_contables")
    .select(`${ASIENTOS_CONTABLES_SELECT}, ${sireEmbed} (cod_tipo_cdp, serie_cdp, nro_cdp_inicial, nombre_contraparte, ruc)`)
    .eq("ruc_contraparte", ruc)
    .in("tipo_libro", TIPOS_LIBRO_PROVISION);

  if (params.periodo?.trim()) qProvision = qProvision.eq("periodo", params.periodo.trim());

  const { data: provisiones, error: provErr } = await qProvision;
  if (provErr) throw provErr;

  let qCaja = supabase
    .from("asientos_contables")
    .select("sire_registro_id, cuenta_contable, debe, haber")
    .eq("ruc_contraparte", ruc)
    .eq("tipo_libro", "CAJA_BANCOS")
    .not("sire_registro_id", "is", null);

  if (params.periodo?.trim()) qCaja = qCaja.eq("periodo", params.periodo.trim());

  const { data: cancelaciones, error: cajaErr } = await qCaja;
  if (cajaErr) throw cajaErr;

  const canceladoPorRegistro = new Map<string, number>();
  for (const c of cancelaciones ?? []) {
    const id = String(c.sire_registro_id);
    const cuenta = normalizeCuentaContable(String(c.cuenta_contable));
    const monto =
      cuenta === normalizeCuentaContable(CUENTAS_DEFAULT.proveedor)
        ? Number(c.debe ?? 0)
        : cuenta === normalizeCuentaContable(CUENTAS_DEFAULT.cliente)
          ? Number(c.haber ?? 0)
          : Math.max(Number(c.debe ?? 0), Number(c.haber ?? 0));
    canceladoPorRegistro.set(id, round2((canceladoPorRegistro.get(id) ?? 0) + monto));
  }

  const porRegistro = new Map<
    string,
    {
      tipo: TipoRegistroDb;
      periodo: string;
      monto: number;
      cuenta: string;
      rs: Record<string, unknown> | null;
    }
  >();

  for (const row of provisiones ?? []) {
    const sireId = row.sire_registro_id;
    if (!sireId) continue;
    const cuenta = normalizeCuentaContable(String(row.cuenta_contable));
    const esProveedor = cuenta === normalizeCuentaContable(CUENTAS_DEFAULT.proveedor);
    const esCliente = cuenta === normalizeCuentaContable(CUENTAS_DEFAULT.cliente);
    if (!esProveedor && !esCliente) continue;

    const monto = esProveedor ? Number(row.haber ?? 0) : Number(row.debe ?? 0);
    if (monto <= 0) continue;

    const prev = porRegistro.get(sireId);
    porRegistro.set(sireId, {
      tipo: row.tipo_registro === "VENTA" ? "VENTA" : "COMPRA",
      periodo: String(row.periodo),
      monto: round2((prev?.monto ?? 0) + monto),
      cuenta,
      rs: (row as Record<string, Record<string, unknown> | null>)[sireEmbed] ?? null,
    });
  }

  const out: DeudaPendiente[] = [];
  for (const [sireRegistroId, agg] of porRegistro) {
    const cancelado = canceladoPorRegistro.get(sireRegistroId) ?? 0;
    const saldo = round2(agg.monto - cancelado);
    if (saldo <= 0.01) continue;

    const rs = agg.rs;
    out.push({
      sireRegistroId,
      tipo: agg.tipo,
      periodo: agg.periodo,
      rucContraparte: rs?.ruc != null ? String(rs.ruc) : null,
      nombreContraparte:
        rs?.nombre_contraparte != null ? String(rs.nombre_contraparte) : null,
      comprobante: labelCpe({
        cod_tipo_cdp: rs?.cod_tipo_cdp as string,
        serie_cdp: rs?.serie_cdp as string,
        nro_cdp_inicial: rs?.nro_cdp_inicial as string,
      }),
      montoTotal: agg.monto,
      montoCancelado: cancelado,
      saldoPendiente: saldo,
      cuentaComercial: agg.cuenta,
    });
  }

  return out.sort((a, b) => b.saldoPendiente - a.saldoPendiente);
}

export async function registrarPagoCobroCaja(params: {
  deuda: DeudaPendiente;
  ruc: string;
  fechaPago: string;
  medioPago: string;
  cuentaFinanciera: string;
  monto?: number;
}): Promise<void> {
  const monto = round2(params.monto ?? params.deuda.saldoPendiente);
  if (monto <= 0) throw new Error("El monto debe ser mayor a cero.");

  const cuenta10 = normalizeCuentaContable(params.cuentaFinanciera);
  const cuentaComercial = normalizeCuentaContable(params.deuda.cuentaComercial);
  if (!cuenta10) throw new Error("Seleccione una cuenta financiera válida (Clase 10).");

  const { data: regRow, error: regErr } = await supabase
    .from(getSireReadSource())
    .select("*")
    .eq("id", params.deuda.sireRegistroId)
    .maybeSingle();
  if (regErr) throw regErr;

  const registro = regRow ? normalizeRegistroSire(regRow as Record<string, unknown>) : null;
  const montos = regRow ? resolverMontosSunat(regRow as Record<string, unknown>) : null;

  const glosaBase =
    params.deuda.tipo === "COMPRA"
      ? `Pago a proveedor ${params.deuda.nombreContraparte ?? ""} — ${params.deuda.comprobante}`
      : `Cobro de cliente ${params.deuda.nombreContraparte ?? ""} — ${params.deuda.comprobante}`;

  const glosa = `${glosaBase.trim()} · Medio ${params.medioPago} · S/ ${monto.toFixed(2)}`;

  let filas: AsientoContableInsert[];

  if (params.deuda.tipo === "COMPRA") {
    filas = [
      toAsientoContableInsert({
        sire_registro_id: params.deuda.sireRegistroId,
        periodo: params.deuda.periodo,
        tipo_asiento: "cancelacion_caja",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fechaPago,
        cuenta_contable: cuentaComercial,
        glosa,
        debe: monto,
        haber: 0,
        tipo_registro: "COMPRA",
        serie_cdp: registro?.serie_cdp ?? null,
        nro_cdp_inicial: registro?.nro_cdp_inicial ?? null,
        ruc_contraparte: params.ruc.trim(),
        nombre_contraparte: params.deuda.nombreContraparte,
      }),
      toAsientoContableInsert({
        sire_registro_id: params.deuda.sireRegistroId,
        periodo: params.deuda.periodo,
        tipo_asiento: "cancelacion_caja",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fechaPago,
        cuenta_contable: cuenta10,
        glosa,
        debe: 0,
        haber: monto,
        tipo_registro: "COMPRA",
        serie_cdp: registro?.serie_cdp ?? null,
        nro_cdp_inicial: registro?.nro_cdp_inicial ?? null,
        ruc_contraparte: params.ruc.trim(),
        nombre_contraparte: params.deuda.nombreContraparte,
      }),
    ];
  } else {
    filas = [
      toAsientoContableInsert({
        sire_registro_id: params.deuda.sireRegistroId,
        periodo: params.deuda.periodo,
        tipo_asiento: "cancelacion_caja",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fechaPago,
        cuenta_contable: cuenta10,
        glosa,
        debe: monto,
        haber: 0,
        tipo_registro: "VENTA",
        serie_cdp: registro?.serie_cdp ?? null,
        nro_cdp_inicial: registro?.nro_cdp_inicial ?? null,
        ruc_contraparte: params.ruc.trim(),
        nombre_contraparte: params.deuda.nombreContraparte,
      }),
      toAsientoContableInsert({
        sire_registro_id: params.deuda.sireRegistroId,
        periodo: params.deuda.periodo,
        tipo_asiento: "cancelacion_caja",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fechaPago,
        cuenta_contable: cuentaComercial,
        glosa,
        debe: 0,
        haber: monto,
        tipo_registro: "VENTA",
        serie_cdp: registro?.serie_cdp ?? null,
        nro_cdp_inicial: registro?.nro_cdp_inicial ?? null,
        ruc_contraparte: params.ruc.trim(),
        nombre_contraparte: params.deuda.nombreContraparte,
      }),
    ];
  }

  const { error: insertErr } = await supabase.from("asientos_contables").insert(filas);
  if (insertErr) {
    logSupabaseAsientosInsertError(insertErr, filas, "registrarPagoCobroCaja");
    throw insertErr;
  }

  if (regRow && montos) {
    const upd =
      params.deuda.tipo === "COMPRA"
        ? { estado_pago: "pagado" }
        : { estado_cobro: "cobrado" };
    await updateRegistroSireCabecera(params.deuda.sireRegistroId, upd);
  }
}
