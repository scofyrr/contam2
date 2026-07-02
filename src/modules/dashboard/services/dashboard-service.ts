import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/modules/auditoria/services/auditoria-service";
import { listarUsuariosAdmin } from "@/modules/auth/services/rbac-admin-service";
import { permissionService } from "@/modules/auth/services/permission-service";
import { alertUnifiedService } from "@/modules/notificaciones/services/notification-dual-service";
import type { PendingTask } from "@/modules/notificaciones/types/alert-system";
import type {
  ActividadRegistro,
  AlertaEstudio,
  CargaTrabajoDia,
  CargaTrabajoNivel,
  ClienteAsignado,
  ContadorPerformance,
  ContadorPersonalMetrics,
  EstudioMetrics,
  TareasPorContador,
} from "@/modules/dashboard/types/dashboard";
import {
  calcularRachaDias,
  calcularLogros,
  generarSugerencias,
} from "@/modules/dashboard/services/gamification-service";
import type { Logro, SugerenciaInteligente } from "@/modules/dashboard/types/dashboard";
import { fetchContribuyentes } from "@/lib/contribuyentes-service";
import {
  fetchEstadisticasTareas,
  fetchEstadisticasTareasMejorada,
  fetchTareas,
} from "@/modules/tareas/services/tareas-service";
import type { TareaPendiente } from "@/types/tareas";

const CONTADOR_ROLES = new Set(["CONTADOR", "CONTADOR_SENIOR", "AUXILIAR_CONTABLE"]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

function mapCarga(pendientes: number, vencidas: number): CargaTrabajoNivel {
  if (vencidas > 5 || pendientes > 40) return "CRITICA";
  if (vencidas > 0 || pendientes > 25) return "ALTA";
  if (pendientes > 10) return "NORMAL";
  return "BAJA";
}

function mapActividadTipo(accion: string, modulo: string): ActividadRegistro["tipo"] {
  const a = accion.toUpperCase();
  const m = modulo.toUpperCase();
  if (a.includes("COMPLET") || a === "COMPLETAR") return "TAREA_COMPLETADA";
  if (m.includes("SIRE")) return "COMPROBANTE";
  if (m.includes("CAJA")) return "CAJA";
  if (m.includes("FICHA") || m.includes("RUC")) return "FICHA";
  if (a.includes("VENCID")) return "TAREA_VENCIDA";
  if (m.includes("SISTEMA")) return "SISTEMA";
  return "OTRO";
}

function filterTareasByRucs(tareas: TareaPendiente[], rucs: string[], userId?: string): TareaPendiente[] {
  if (rucs.length === 0) return tareas;
  return tareas.filter(
    (t) =>
      (t.ruc && rucs.includes(t.ruc)) ||
      t.usuario_id === userId ||
      t.asignado_a === userId,
  );
}

async function getRucsForUser(userId: string): Promise<string[]> {
  const scoped = permissionService.getRucsPermitidos();
  if (scoped.length > 0) return scoped;

  const { data } = await supabase
    .from("usuario_roles")
    .select("ruc_id")
    .eq("user_id", userId)
    .eq("activo", true)
    .not("ruc_id", "is", null);

  const fromDb = [...new Set((data ?? []).map((r) => String(r.ruc_id)).filter(Boolean))];
  return fromDb;
}

async function fetchAllTareasActivas(): Promise<TareaPendiente[]> {
  const [pend, prog] = await Promise.all([
    fetchTareas({ estado: "pendiente", orden: "plazo" }),
    fetchTareas({ estado: "en_progreso", orden: "plazo" }),
  ]);
  const seen = new Set<string>();
  return [...pend, ...prog].filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export class AdminDashboardService {
  async getEstudioMetrics(adminUserId: string): Promise<EstudioMetrics> {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_estudio_kpis");
      if (!error && data) {
        const d = data as Record<string, number>;
        const facturacion = await this.getFacturacionMensual(12);
        const contadores = await this.getContadoresPerformance(adminUserId);
        return {
          totalContadores: Number(d.totalContadores ?? 0),
          contadoresActivos: Number(d.contadoresActivos ?? 0),
          totalClientes: Number(d.totalClientes ?? 0),
          clientesActivos: Number(d.clientesActivos ?? 0),
          facturacionMensual: Number(d.facturacionMensual ?? 0),
          facturacionAnual: Number(d.facturacionAnual ?? 0),
          efectividadPromedio: Number(d.efectividadPromedio ?? 85),
          tareasPendientesEstudio: Number(d.tareasPendientesEstudio ?? 0),
          tareasVencidasEstudio: Number(d.tareasVencidasEstudio ?? 0),
          clientesPorContador: contadores.map((c) => ({
            contadorId: c.userId,
            nombre: c.nombre,
            clientes: c.clientesAsignados,
          })),
          facturacionPorMes: facturacion,
        };
      }
    } catch {
      /* fallback */
    }
    return this.getEstudioMetricsFallback(adminUserId);
  }

  private async getEstudioMetricsFallback(adminUserId: string): Promise<EstudioMetrics> {
    const [usuarios, contribuyentes, stats, facturacion] = await Promise.all([
      listarUsuariosAdmin(adminUserId).catch(() => []),
      fetchContribuyentes().catch(() => []),
      fetchEstadisticasTareas().catch(() => null),
      this.getFacturacionMensual(12),
    ]);

    const contadores = usuarios.filter((u) =>
      u.rolesResumen.split(",").some((r) => CONTADOR_ROLES.has(r.trim())),
    );

    return {
      totalContadores: contadores.length || 4,
      contadoresActivos: contadores.filter((u) => u.activo).length || 3,
      totalClientes: contribuyentes.length,
      clientesActivos: contribuyentes.filter((c) => c.estado === "ACTIVO").length,
      facturacionMensual: facturacion.at(-1)?.monto ?? 0,
      facturacionAnual: facturacion.reduce((s, f) => s + f.monto, 0),
      efectividadPromedio: stats?.efectividad_pct ?? 88,
      tareasPendientesEstudio: stats?.pendientes ?? 0,
      tareasVencidasEstudio: stats?.vencidas ?? 0,
      clientesPorContador: contadores.map((c) => ({
        contadorId: c.userId,
        nombre: c.nombre,
        clientes: c.rucsCount,
      })),
      facturacionPorMes: facturacion,
    };
  }

  async getContadoresPerformance(adminUserId: string): Promise<ContadorPerformance[]> {
    const [usuarios, tareas] = await Promise.all([
      listarUsuariosAdmin(adminUserId).catch(() => []),
      fetchAllTareasActivas(),
    ]);

    const contadores = usuarios.filter((u) =>
      u.rolesResumen.split(",").some((r) => CONTADOR_ROLES.has(r.trim())),
    );

    if (contadores.length === 0) {
      return this.demoContadores();
    }

    return contadores.map((u) => {
      const userTasks = tareas.filter(
        (t) => t.usuario_id === u.userId || t.asignado_a === u.userId,
      );
      const pendientes = userTasks.filter((t) => !["completada", "cancelada"].includes(t.estado));
      const vencidas = pendientes.filter((t) => t.vencida || (t.plazo_vencimiento && t.plazo_vencimiento < todayIso()));
      const completadas = tareas.filter((t) => t.estado === "completada" && t.usuario_id === u.userId);
      const onTime = completadas.filter(
        (t) => !t.plazo_vencimiento || !t.fecha_completada || t.fecha_completada.slice(0, 10) <= t.plazo_vencimiento,
      );
      const efectividad = completadas.length
        ? Math.round((onTime.length / completadas.length) * 100)
        : 85;

      const lastActivity = u.lastSignInAt ?? new Date().toISOString();
      const hoursSince = (Date.now() - new Date(lastActivity).getTime()) / 3600_000;
      const estado: ContadorPerformance["estado"] =
        hoursSince > 72 ? "INACTIVO" : hoursSince > 24 ? "AUSENTE" : "ACTIVO";

      return {
        userId: u.userId,
        nombre: u.nombre,
        email: u.email,
        rol: u.rolesResumen.split(",")[0]?.trim() ?? "CONTADOR",
        clientesAsignados: u.rucsCount,
        tareasPendientes: pendientes.length,
        tareasCompletadas: completadas.length,
        tareasVencidas: vencidas.length,
        efectividad,
        ultimaActividad: lastActivity,
        estado,
        cargaTrabajo: mapCarga(pendientes.length, vencidas.length),
      };
    });
  }

  private demoContadores(): ContadorPerformance[] {
    return [
      { userId: "1", nombre: "María García", email: "maria@estudio.com", rol: "CONTADOR_SENIOR", clientesAsignados: 8, tareasPendientes: 45, tareasCompletadas: 120, tareasVencidas: 3, efectividad: 93, ultimaActividad: new Date(Date.now() - 900_000).toISOString(), estado: "ACTIVO", cargaTrabajo: "ALTA" },
      { userId: "2", nombre: "Carlos Rojas", email: "carlos@estudio.com", rol: "CONTADOR", clientesAsignados: 5, tareasPendientes: 23, tareasCompletadas: 89, tareasVencidas: 1, efectividad: 78, ultimaActividad: new Date(Date.now() - 7200_000).toISOString(), estado: "ACTIVO", cargaTrabajo: "NORMAL" },
      { userId: "3", nombre: "Juan Pérez", email: "juan@estudio.com", rol: "CONTADOR", clientesAsignados: 3, tareasPendientes: 12, tareasCompletadas: 45, tareasVencidas: 5, efectividad: 67, ultimaActividad: new Date(Date.now() - 86400_000 * 2).toISOString(), estado: "AUSENTE", cargaTrabajo: "CRITICA" },
      { userId: "4", nombre: "Ana López", email: "ana@estudio.com", rol: "CONTADOR", clientesAsignados: 6, tareasPendientes: 31, tareasCompletadas: 95, tareasVencidas: 0, efectividad: 90, ultimaActividad: new Date(Date.now() - 3600_000).toISOString(), estado: "ACTIVO", cargaTrabajo: "NORMAL" },
    ];
  }

  async getFacturacionMensual(meses = 12): Promise<{ mes: string; monto: number }[]> {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_facturacion_mensual", { p_meses: meses });
      if (!error && Array.isArray(data)) {
        return (data as { mes: string; monto: number }[]).map((r) => ({
          mes: String(r.mes),
          monto: Number(r.monto ?? 0),
        }));
      }
    } catch {
      /* fallback */
    }

    const now = new Date();
    return Array.from({ length: meses }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (meses - 1 - i), 1);
      const mes = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { mes, monto: 180_000 + Math.random() * 120_000 };
    });
  }

  async getTareasPorContador(adminUserId: string): Promise<TareasPorContador[]> {
    const perf = await this.getContadoresPerformance(adminUserId);
    return perf.map((c) => ({
      contadorId: c.userId,
      nombre: c.nombre,
      pendientes: c.tareasPendientes,
      vencidas: c.tareasVencidas,
      completadas: c.tareasCompletadas,
    }));
  }

  async getAlertasEstudio(adminUserId: string): Promise<AlertaEstudio[]> {
    const perf = await this.getContadoresPerformance(adminUserId);
    const alertas: AlertaEstudio[] = [];

    for (const c of perf) {
      if (c.tareasVencidas > 0) {
        alertas.push({
          id: `venc-${c.userId}`,
          severidad: c.tareasVencidas > 3 ? "CRITICA" : "ADVERTENCIA",
          titulo: `${c.tareasVencidas} tarea${c.tareasVencidas > 1 ? "s" : ""} vencida${c.tareasVencidas > 1 ? "s" : ""}`,
          descripcion: `Contador: ${c.nombre}`,
          contadorId: c.userId,
          contadorNombre: c.nombre,
        });
      }
      if (c.cargaTrabajo === "ALTA" || c.cargaTrabajo === "CRITICA") {
        alertas.push({
          id: `carga-${c.userId}`,
          severidad: c.cargaTrabajo === "CRITICA" ? "CRITICA" : "ADVERTENCIA",
          titulo: `Carga ${c.cargaTrabajo.toLowerCase()}`,
          descripcion: `${c.nombre} tiene ${c.tareasPendientes} tareas pendientes`,
          contadorId: c.userId,
          contadorNombre: c.nombre,
        });
      }
      if (c.estado === "INACTIVO") {
        alertas.push({
          id: `inact-${c.userId}`,
          severidad: "ADVERTENCIA",
          titulo: "Contador inactivo",
          descripcion: `${c.nombre} sin actividad reciente`,
          contadorId: c.userId,
          contadorNombre: c.nombre,
        });
      }
    }

    return alertas.slice(0, 10);
  }

  async getActividadReciente(limit = 20): Promise<ActividadRegistro[]> {
    const { data } = await auditoriaService.buscarRegistros({ limit, pagina: 1 });
    if (data.length === 0) {
      return [
        { id: "1", usuarioNombre: "María G.", tipo: "TAREA_COMPLETADA", titulo: "Completó provisión FACTURA F001-123", createdAt: new Date(Date.now() - 300_000).toISOString() },
        { id: "2", usuarioNombre: "Carlos R.", tipo: "CAJA", titulo: "Registró 5 movimientos de caja", createdAt: new Date(Date.now() - 600_000).toISOString() },
        { id: "3", usuarioNombre: "Sistema", tipo: "SISTEMA", titulo: "Sincronización SIRE completada (45 registros)", createdAt: new Date(Date.now() - 900_000).toISOString() },
      ];
    }
    return data.slice(0, limit).map((r) => ({
      id: r.id,
      userId: r.userId ?? undefined,
      usuarioNombre: r.usuarioEmail?.split("@")[0],
      tipo: mapActividadTipo(r.accion, r.modulo),
      titulo: `${r.accion} en ${r.modulo}`,
      detalle: r.rucAfectado ? `RUC ${r.rucAfectado}` : undefined,
      createdAt: r.createdAt,
    }));
  }
}

export class ContadorDashboardService {
  async getPersonalMetrics(userId: string): Promise<ContadorPersonalMetrics> {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_contador_kpis", { p_user_id: userId });
      if (!error && data) {
        const d = data as Record<string, string | number>;
        const tareas = await fetchAllTareasActivas();
        const rucs = await getRucsForUser(userId);
        const scoped = filterTareasByRucs(tareas, rucs, userId);
        const racha = calcularRachaDias(scoped);
        return {
          clientesAsignados: Number(d.clientesAsignados ?? 0),
          tareasPendientes: Number(d.tareasPendientes ?? 0),
          tareasVencidas: Number(d.tareasVencidas ?? 0),
          tareasHoy: Number(d.tareasHoy ?? 0),
          efectividad: Number(d.efectividad ?? 90),
          comprobantesPendientes: Number(d.comprobantesPendientes ?? 0),
          asientosDelMes: Number(d.asientosDelMes ?? 0),
          movimientosCajaPendientes: Number(d.movimientosCajaPendientes ?? 0),
          cxcVencido: Number(d.cxcVencido ?? 0),
          cxpVencido: Number(d.cxpVencido ?? 0),
          cargaTrabajo: (String(d.cargaTrabajo ?? "NORMAL") as CargaTrabajoNivel),
          rachaDiasProductivos: racha,
          tareasCompletadasHoy: Number(d.tareasCompletadasHoy ?? 0),
        };
      }
    } catch {
      /* fallback */
    }
    return this.getPersonalMetricsFallback(userId);
  }

  private async getPersonalMetricsFallback(userId: string): Promise<ContadorPersonalMetrics> {
    const rucs = await getRucsForUser(userId);
    const [contribuyentes, tareas, statsExt] = await Promise.all([
      fetchContribuyentes().catch(() => []),
      fetchAllTareasActivas(),
      fetchEstadisticasTareasMejorada(null, new Date().toISOString().slice(0, 7)).catch(() => null),
    ]);

    const clientes =
      rucs.length > 0 ? contribuyentes.filter((c) => rucs.includes(c.ruc)) : contribuyentes;
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    const activas = scoped.filter((t) => !["completada", "cancelada"].includes(t.estado));
    const vencidas = activas.filter((t) => t.vencida || (t.plazo_vencimiento && t.plazo_vencimiento < todayIso()));
    const hoy = activas.filter((t) => t.plazo_vencimiento === todayIso());
    const completadasHoy = scoped.filter(
      (t) => t.estado === "completada" && t.fecha_completada?.slice(0, 10) === todayIso(),
    );

    return {
      clientesAsignados: clientes.length,
      tareasPendientes: activas.length,
      tareasVencidas: vencidas.length,
      tareasHoy: hoy.length,
      efectividad: statsExt?.efectividad_pct ?? 90,
      comprobantesPendientes: statsExt?.por_modulo?.sire ?? 0,
      asientosDelMes: statsExt?.por_modulo?.asientos ?? 0,
      movimientosCajaPendientes: statsExt?.por_modulo?.caja ?? 0,
      cxcVencido: 0,
      cxpVencido: 0,
      cargaTrabajo: mapCarga(activas.length, vencidas.length),
      rachaDiasProductivos: calcularRachaDias(scoped),
      tareasCompletadasHoy: completadasHoy.length,
    };
  }

  async getTareasUrgentes(userId: string): Promise<PendingTask[]> {
    const rucs = await getRucsForUser(userId);
    const all = await alertUnifiedService.taskService.getPendingTasks();
    if (rucs.length === 0) return all;
    return all.filter((t) => !t.ruc || rucs.includes(t.ruc));
  }

  async getClientesAsignados(userId: string): Promise<ClienteAsignado[]> {
    const rucs = await getRucsForUser(userId);
    const [contribuyentes, tareas] = await Promise.all([
      fetchContribuyentes().catch(() => []),
      fetchAllTareasActivas(),
    ]);

    const list = rucs.length > 0 ? contribuyentes.filter((c) => rucs.includes(c.ruc)) : contribuyentes;

    return list.map((c) => {
      const clientTasks = tareas.filter((t) => t.ruc === c.ruc && !["completada", "cancelada"].includes(t.estado));
      const vencidas = clientTasks.filter((t) => t.vencida || (t.plazo_vencimiento && t.plazo_vencimiento < todayIso()));
      return {
        ruc: c.ruc,
        razonSocial: c.razonSocial,
        estado: c.estado ?? "ACTIVO",
        tareasPendientes: clientTasks.length,
        ultimaActividad: new Date().toISOString(),
        comprobantesPendientes: clientTasks.filter((t) => t.modulo_origen === "sire").length,
        cxcVencido: 0,
        cxpVencido: 0,
        saldoCaja: 0,
        alertas: vencidas.length,
      };
    });
  }

  async getCargaTrabajo(userId: string, semanas = 4): Promise<CargaTrabajoDia[]> {
    const rucs = await getRucsForUser(userId);
    const tareas = filterTareasByRucs(await fetchAllTareasActivas(), rucs, userId);
    const days: CargaTrabajoDia[] = [];
    const start = new Date();
    start.setDate(start.getDate() - semanas * 7);

    for (let i = 0; i < semanas * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dayTasks = tareas.filter((t) => t.plazo_vencimiento === iso);
      days.push({
        fecha: iso,
        total: dayTasks.length,
        vencidas: dayTasks.filter((t) => iso < todayIso()).length,
      });
    }
    return days;
  }

  async getSugerencias(userId: string): Promise<SugerenciaInteligente[]> {
    const [metrics, tareas, clientes] = await Promise.all([
      this.getPersonalMetrics(userId),
      fetchAllTareasActivas(),
      this.getClientesAsignados(userId),
    ]);
    const rucs = await getRucsForUser(userId);
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    return generarSugerencias(metrics, scoped, clientes);
  }

  async getLogros(userId: string): Promise<Logro[]> {
    const [metrics, tareas, clientes] = await Promise.all([
      this.getPersonalMetrics(userId),
      fetchAllTareasActivas(),
      this.getClientesAsignados(userId),
    ]);
    const rucs = await getRucsForUser(userId);
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    const clientesConVencidas = clientes.filter((c) => c.alertas > 0).length;
    return calcularLogros(metrics, scoped, clientesConVencidas);
  }

  async getActividadPersonal(userId: string, limit = 10): Promise<ActividadRegistro[]> {
    const { data } = await auditoriaService.buscarRegistros({ userId, limit, pagina: 1 });
    return data.slice(0, limit).map((r) => ({
      id: r.id,
      userId: r.userId ?? undefined,
      tipo: mapActividadTipo(r.accion, r.modulo),
      titulo: `${r.accion} — ${r.modulo}`,
      detalle: r.detalleJsonb ? JSON.stringify(r.detalleJsonb).slice(0, 80) : undefined,
      createdAt: r.createdAt,
    }));
  }

  async getFacturacionMensualPersonal(userId: string): Promise<number> {
    const rucs = await getRucsForUser(userId);
    const now = new Date();
    const periodo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    let query = supabase
      .from("registros_sire")
      .select("importe_total")
      .eq("periodo", periodo)
      .eq("tipo", "VENTA");

    if (rucs.length > 0) {
      query = query.in("ruc", rucs);
    }

    const { data, error } = await query;
    if (error || !data?.length) return 0;
    return data.reduce((sum, row) => sum + Number(row.importe_total ?? 0), 0);
  }

  async getProximosVencimientos(userId: string, dias = 7): Promise<TareaPendiente[]> {
    const rucs = await getRucsForUser(userId);
    const tareas = filterTareasByRucs(await fetchAllTareasActivas(), rucs, userId);
    const hoy = todayIso();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);
    const limiteIso = limite.toISOString().slice(0, 10);

    return tareas
      .filter(
        (t) =>
          t.plazo_vencimiento &&
          t.plazo_vencimiento >= hoy &&
          t.plazo_vencimiento <= limiteIso &&
          !["completada", "cancelada"].includes(t.estado),
      )
      .sort((a, b) => (a.plazo_vencimiento ?? "").localeCompare(b.plazo_vencimiento ?? ""))
      .slice(0, 10);
  }
}

export const adminDashboardService = new AdminDashboardService();
export const contadorDashboardService = new ContadorDashboardService();

export { relativeTime };
