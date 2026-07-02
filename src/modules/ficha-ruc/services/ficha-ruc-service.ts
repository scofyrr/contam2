import { supabase } from "@/integrations/supabase/client";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { emptyFichaRuc, uid } from "@/lib/contribuyentes-factory";
import { fichaToDbRow, representantesToDb, tributosToDb, establecimientosToDb } from "@/lib/ficha-ruc-mapper";
import { fetchAllFichas, fetchFichaByRuc, upsertFichaRuc } from "@/lib/fichas-ruc-service";
import { fetchMovimientosCaja } from "@/lib/caja-service";
import { fetchRegistrosSireRows } from "@/lib/sire-registros-service";
import { fetchDeudasPendientes } from "@/lib/cxc-cxp-service";
import { consultarRucSunat, getEstadoActualizacionBadge } from "@/modules/ficha-ruc/services/sunat-consult-service";
import type {
  ComparacionContribuyentes,
  ContribuyenteBusqueda,
  ContribuyenteDashboard360,
  FichaRucMeta,
  SunatRucData,
} from "@/modules/ficha-ruc/types/sunat";

function mergeSunatIntoFicha(ficha: FichaRuc, sunat: SunatRucData): FichaRuc {
  const actPrincipal = `${sunat.actividadEconomicaPrincipal.codigo} - ${sunat.actividadEconomicaPrincipal.descripcion}`;
  return {
    ...ficha,
    general: {
      ...ficha.general,
      razonSocial: sunat.razonSocial || ficha.general.razonSocial,
      tipoContribuyente: mapTipoSunat(sunat.tipoContribuyente),
      estadoContribuyente: sunat.estadoContribuyente.replace(/_/g, " "),
      fechaInscripcion: sunat.fechaInscripcion || ficha.general.fechaInscripcion,
      fechaInicioActividades: sunat.fechaInicioActividades || ficha.general.fechaInicioActividades,
    },
    modificacionContribuyente: {
      ...ficha.modificacionContribuyente,
      nombreComercial: sunat.nombreComercial ?? ficha.modificacionContribuyente.nombreComercial,
      actividadEconomicaPrincipal: actPrincipal,
      actividadEconomicaSecundaria1: sunat.actividadesEconomicasSecundarias[0]
        ? `${sunat.actividadesEconomicasSecundarias[0].codigo} - ${sunat.actividadesEconomicasSecundarias[0].descripcion}`
        : ficha.modificacionContribuyente.actividadEconomicaSecundaria1,
    },
    domicilioFiscal: {
      ...ficha.domicilioFiscal,
      departamento: sunat.domicilioFiscal.departamento,
      provincia: sunat.domicilioFiscal.provincia,
      distrito: sunat.domicilioFiscal.distrito,
      tipoNombreVia: sunat.domicilioFiscal.direccion,
      actividadEconomica: actPrincipal,
    },
    tributosAfectos: sunat.tributosAfectos.map((t) => ({
      id: uid(),
      tributo: `${t.codigo} - ${t.descripcion}`,
      fechaAlta: "",
      afectoDesde: t.desde,
      marcaExoneracion: "NO",
      exoneracionDesde: "",
      hasta: "",
      modificacion: "",
    })),
    representantesLegales: sunat.representantesLegales.map((r) => ({
      id: uid(),
      tipoNroDoc: `${r.tipoDocumento} - ${r.numeroDocumento}`,
      apellidosNombres: r.nombre,
      fechaNacimiento: "",
      cargo: r.cargo,
      fechaDesde: r.fechaDesde,
      nroOrdenRepresentacion: "1",
    })),
    establecimientosAnexos: sunat.establecimientos.map((e) => ({
      id: uid(),
      codigo: e.codigo,
      tipo: e.tipo,
      denominacion: e.tipo,
      ubigeo: "",
      domicilio: e.direccion,
      otrasReferencias: `${e.distrito}, ${e.provincia}`,
      condLegal: "",
      licenciaMunicipal: "",
      actEcon: "",
      modificacion: "",
    })),
  };
}

function mapTipoSunat(t: SunatRucData["tipoContribuyente"]): string {
  const map: Record<string, string> = {
    PERSONA_NATURAL: "PERSONA NATURAL CON NEGOCIO",
    SOCIEDAD_ANONIMA: "PERSONA JURIDICA",
    SOCIEDAD_COMERCIAL: "PERSONA JURIDICA",
    OTRO: "OTROS",
  };
  return map[t] ?? t;
}

export async function obtenerFichaCompleta(ruc: string): Promise<{
  ficha: FichaRuc | null;
  meta: FichaRucMeta;
}> {
  const ficha = await fetchFichaByRuc(ruc);
  const meta = await obtenerMetaFicha(ruc);
  return { ficha, meta };
}

async function obtenerMetaFicha(ruc: string): Promise<FichaRucMeta> {
  const { data } = await supabase.from("fichas_ruc").select("*").eq("ruc", ruc).maybeSingle();
  if (!data) return {};
  const row = data as Record<string, unknown>;
  const ultima = String(row.ultima_actualizacion ?? row.updated_at ?? "");
  return {
    datosIncompletos: Boolean(row.datos_incompletos),
    fuenteDatos: String(row.fuente_datos ?? "MANUAL"),
    ultimaActualizacion: ultima || null,
    ultimaActividad: row.ultima_actividad ? String(row.ultima_actividad) : null,
    cantidadComprobantes: Number(row.cantidad_comprobantes ?? 0),
    totalCompras12m: Number(row.total_compras_12m ?? 0),
    totalVentas12m: Number(row.total_ventas_12m ?? 0),
    estadoActualizacion: getEstadoActualizacionBadge(ultima),
  };
}

export async function consultarSunat(ruc: string, forzarActualizacion = false) {
  return consultarRucSunat(ruc, { forzarActualizacion });
}

export async function actualizarFichaDesdeSunat(ruc: string, forzar = false): Promise<FichaRuc> {
  const res = await consultarRucSunat(ruc, { forzarActualizacion: forzar });
  if (!res.success || !res.data) throw new Error(res.error ?? "Consulta SUNAT fallida");

  const existing = (await fetchFichaByRuc(ruc)) ?? emptyFichaRuc(ruc, res.data.razonSocial);
  const merged = mergeSunatIntoFicha(existing, res.data);

  const row = {
    ...fichaToDbRow(merged),
    fuente_datos: res.metadata.source === "DATOS_SIMULADOS" ? "SUNAT_SIMULADO" : "SUNAT",
    datos_incompletos: false,
    ultima_actualizacion: new Date().toISOString(),
  };

  const saved = await upsertFichaRuc(merged);

  try {
    await supabase.from("fichas_ruc").update(row).eq("ruc", ruc.replace(/\D/g, "").slice(0, 11));
    if (res.data.tributosAfectos.length) {
      await supabase.from("tributos_afectos").delete().eq("ruc", ruc);
      await supabase.from("tributos_afectos").insert(tributosToDb(ruc, merged.tributosAfectos));
    }
    if (res.data.representantesLegales.length) {
      await supabase.from("representantes_legales").delete().eq("ruc", ruc);
      await supabase.from("representantes_legales").insert(representantesToDb(ruc, merged.representantesLegales));
    }
    if (res.data.establecimientos.length) {
      await supabase.from("establecimientos_anexos").delete().eq("ruc", ruc);
      await supabase.from("establecimientos_anexos").insert(establecimientosToDb(ruc, merged.establecimientosAnexos));
    }
  } catch {
    /* columnas/tablas pueden no existir aún */
  }

  return saved;
}

export async function actualizarFicha(ruc: string, datos: Partial<FichaRuc>): Promise<FichaRuc> {
  const existing = (await fetchFichaByRuc(ruc)) ?? emptyFichaRuc(ruc);
  const merged: FichaRuc = {
    ...existing,
    ...datos,
    ruc: ruc.replace(/\D/g, "").slice(0, 11),
    general: { ...existing.general, ...datos.general },
    modificacionContribuyente: { ...existing.modificacionContribuyente, ...datos.modificacionContribuyente },
    domicilioFiscal: { ...existing.domicilioFiscal, ...datos.domicilioFiscal },
    personaNatural: { ...existing.personaNatural, ...datos.personaNatural },
    empresa: { ...existing.empresa, ...datos.empresa },
  };
  return upsertFichaRuc(merged);
}

export async function obtenerEstadisticasContribuyente(ruc: string, periodo?: string) {
  const year = periodo?.slice(0, 4) ?? new Date().getFullYear().toString();
  const rows = await fetchRegistrosSireRows({ ruc, limit: 5000 });
  const yearRows = rows.filter((r) => String(r.periodo ?? "").startsWith(year));

  let compras = 0;
  let ventas = 0;
  let nCompras = 0;
  let nVentas = 0;

  for (const r of yearRows) {
    const monto = Number(r.mto_total_cp ?? r.importe_total ?? 0);
    if (r.tipo === "COMPRA") {
      compras += monto;
      nCompras += 1;
    } else if (r.tipo === "VENTA") {
      ventas += monto;
      nVentas += 1;
    }
  }

  return { compras, ventas, nCompras, nVentas, year };
}

export async function obtenerDashboard360(ruc: string, periodo?: string): Promise<ContribuyenteDashboard360> {
  const year = periodo?.slice(0, 4) ?? new Date().getFullYear().toString();
  const periodoFilter = periodo ?? `${year}12`;

  const [stats, rows, deudas, movs, tareasRes] = await Promise.all([
    obtenerEstadisticasContribuyente(ruc, periodoFilter),
    fetchRegistrosSireRows({ ruc, limit: 500 }),
    fetchDeudasPendientes({ ruc }).catch(() => []),
    fetchMovimientosCaja({ ruc, periodo: periodoFilter }).catch(() => []),
    supabase
      .from("tareas_pendientes")
      .select("id", { count: "exact", head: true })
      .eq("ruc", ruc)
      .in("estado", ["pendiente", "en_progreso"]),
  ]);

  const ratio = stats.compras > 0 ? stats.ventas / stats.compras : stats.ventas > 0 ? 99 : 0;
  const ratioSalud: ContribuyenteDashboard360["ratioSalud"] =
    ratio >= 1.5 ? "SALUDABLE" : ratio >= 0.8 ? "ATENCION" : "RIESGOSO";

  const byMonth = new Map<string, { compras: number; ventas: number }>();
  for (let m = 1; m <= 12; m++) {
    byMonth.set(String(m).padStart(2, "0"), { compras: 0, ventas: 0 });
  }
  for (const r of rows) {
    const p = String(r.periodo ?? "");
    if (!p.startsWith(year)) continue;
    const mes = p.slice(4, 6);
    const prev = byMonth.get(mes) ?? { compras: 0, ventas: 0 };
    const monto = Number(r.mto_total_cp ?? r.importe_total ?? 0);
    if (r.tipo === "COMPRA") prev.compras += monto;
    else prev.ventas += monto;
    byMonth.set(mes, prev);
  }

  const actividadMensual = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({ mes, ...v }));

  const sparklineCompras = actividadMensual.map((x) => x.compras);
  const sparklineVentas = actividadMensual.map((x) => x.ventas);

  const ultimosComprobantes = rows.slice(0, 50).map((r) => ({
    id: String(r.id ?? ""),
    fecha: String(r.fecha_emision ?? "").slice(0, 10),
    tipo: String(r.tipo ?? ""),
    comprobante: `${r.cod_tipo_cdp ?? ""}-${r.serie_cdp ?? ""}-${r.nro_cdp_inicial ?? ""}`,
    monto: Number(r.mto_total_cp ?? r.importe_total ?? 0),
    estado: String(r.estado_validacion ?? r.estado_cobro ?? r.estado_pago ?? "—"),
  }));

  let saldoCxc = 0;
  let saldoCxp = 0;
  for (const d of deudas) {
    if (d.tipo === "VENTA") saldoCxc += d.saldoPendiente;
    else saldoCxp += d.saldoPendiente;
  }

  return {
    ruc,
    periodo: periodoFilter,
    comprasAnio: Math.round(stats.compras * 100) / 100,
    ventasAnio: Math.round(stats.ventas * 100) / 100,
    comprobantesCompra: stats.nCompras,
    comprobantesVenta: stats.nVentas,
    ratioComercial: Math.round(ratio * 100) / 100,
    ratioSalud,
    sparklineCompras,
    sparklineVentas,
    tendenciaComprasPct: 0,
    tendenciaVentasPct: 0,
    ultimosComprobantes,
    actividadMensual,
    saldoCxc: Math.round(saldoCxc * 100) / 100,
    saldoCxp: Math.round(saldoCxp * 100) / 100,
    movimientosCajaRecientes: movs.slice(-10).map((m) => ({
      id: m.id,
      fecha: String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10),
      glosa: m.glosa,
      neto: Number(m.haber ?? 0) - Number(m.debe ?? 0),
    })),
    tareasPendientes: tareasRes.count ?? 0,
  };
}

export async function buscarContribuyentes(termino: string): Promise<ContribuyenteBusqueda[]> {
  const t = termino.trim();
  if (t.length < 2) return [];

  const digits = t.replace(/\D/g, "");
  let q = supabase.from("fichas_ruc").select("ruc, razon_social, estado_contribuyente, fuente_datos").limit(20);

  if (digits.length >= 2) {
    q = q.ilike("ruc", `${digits}%`);
  } else {
    q = q.ilike("razon_social", `%${t}%`);
  }

  const { data, error } = await q;
  if (error || !data?.length) {
    const fichas = await fetchAllFichas();
    return Object.values(fichas)
      .filter(
        (f) =>
          f.ruc.includes(digits) ||
          f.general.razonSocial.toUpperCase().includes(t.toUpperCase()),
      )
      .slice(0, 20)
      .map((f) => ({
        ruc: f.ruc,
        razonSocial: f.general.razonSocial,
        estadoContribuyente: f.general.estadoContribuyente,
        fuenteDatos: "MANUAL",
      }));
  }

  return (data as Record<string, unknown>[]).map((r) => ({
    ruc: String(r.ruc),
    razonSocial: String(r.razon_social ?? r.ruc),
    estadoContribuyente: String(r.estado_contribuyente ?? "ACTIVO"),
    fuenteDatos: String(r.fuente_datos ?? "MANUAL"),
  }));
}

export async function compararContribuyentes(ruc1: string, ruc2: string): Promise<ComparacionContribuyentes> {
  const [ficha1, ficha2, dashboard1, dashboard2] = await Promise.all([
    fetchFichaByRuc(ruc1),
    fetchFichaByRuc(ruc2),
    obtenerDashboard360(ruc1).catch(() => null),
    obtenerDashboard360(ruc2).catch(() => null),
  ]);

  const campos: Array<{ campo: string; v1: string; v2: string }> = [
    { campo: "Razón social", v1: ficha1?.general.razonSocial ?? "—", v2: ficha2?.general.razonSocial ?? "—" },
    { campo: "Estado", v1: ficha1?.general.estadoContribuyente ?? "—", v2: ficha2?.general.estadoContribuyente ?? "—" },
    { campo: "Departamento", v1: ficha1?.domicilioFiscal.departamento ?? "—", v2: ficha2?.domicilioFiscal.departamento ?? "—" },
    { campo: "Compras año", v1: String(dashboard1?.comprasAnio ?? 0), v2: String(dashboard2?.comprasAnio ?? 0) },
    { campo: "Ventas año", v1: String(dashboard1?.ventasAnio ?? 0), v2: String(dashboard2?.ventasAnio ?? 0) },
    { campo: "CXC", v1: String(dashboard1?.saldoCxc ?? 0), v2: String(dashboard2?.saldoCxc ?? 0) },
    { campo: "CXP", v1: String(dashboard1?.saldoCxp ?? 0), v2: String(dashboard2?.saldoCxp ?? 0) },
  ];

  const diferencias = campos
    .filter((c) => c.v1 !== c.v2)
    .map((c) => ({ campo: c.campo, valor1: c.v1, valor2: c.v2 }));

  return { ruc1, ruc2, ficha1, ficha2, dashboard1, dashboard2, diferencias };
}

export const fichaRucPremiumService = {
  obtenerFichaCompleta,
  consultarSunat,
  actualizarFichaDesdeSunat,
  actualizarFicha,
  obtenerDashboard360,
  obtenerEstadisticasContribuyente,
  buscarContribuyentes,
  compararContribuyentes,
};
