import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { T as TrendingUp } from "./trending-up-H7BEnUdg.js";
import { T as TrendingDown } from "./trending-down-B-hiFKmE.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { ac as supabase, $ as permissionService, as as useSession, aq as usePermissions } from "./router-B2fOVgbK.js";
import { a as auditoriaService } from "./auditoria-service-_uxRL405.js";
import { d as listarUsuariosAdmin } from "./rbac-admin-service-DF1ibFFl.js";
import { a as alertUnifiedService } from "./notification-dual-service-Bq0t1Kn4.js";
import { a as fetchContribuyentes } from "./contribuyentes-service-BLWdN8Z5.js";
import { f as fetchEstadisticasTareas, d as fetchTareas, b as fetchEstadisticasTareasMejorada } from "./tareas-service-Co1DUort.js";
function DashboardKpiCard({
  label,
  value,
  suffix,
  sublabel,
  trend,
  accentColor = "#00D4FF",
  loading,
  pulse,
  onClick
}) {
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl bg-white/5" });
  const Wrapper = onClick ? "button" : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Wrapper,
    {
      type: onClick ? "button" : void 0,
      onClick,
      className: cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all duration-300 hover:bg-white/[0.05] hover:scale-[1.02]",
        pulse && "animate-pulse-red",
        onClick && "cursor-pointer"
      ),
      style: { borderBottomWidth: 2, borderBottomColor: accentColor },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-semibold tabular-nums mt-1 text-[#E8EDF5]", children: [
          value,
          suffix ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg ml-1 text-[#8899B4]", children: suffix }) : null
        ] }),
        sublabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4] mt-1", children: sublabel }) : null,
        trend !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-xs mt-1 flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400"), children: [
          trend >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3" }),
          Math.abs(trend),
          "% vs mes anterior"
        ] }) : null
      ]
    }
  );
}
function DashboardSection({
  title,
  icon,
  children,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/[0.06]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-[#E8EDF5] flex items-center gap-2", children: [
        icon,
        title
      ] }),
      action
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children })
  ] });
}
function formatSoles(n) {
  if (n >= 1e6) return `S/ ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `S/ ${(n / 1e3).toFixed(0)}K`;
  return `S/ ${n.toFixed(0)}`;
}
const LOGROS_DEF = [
  { id: "RACHA_7", titulo: "🔥 Enrachado", descripcion: "7 días seguidos completando tareas", icono: "Flame", tipo: "RACHA" },
  { id: "RACHA_30", titulo: "🔥 Imparable", descripcion: "30 días seguidos completando tareas", icono: "Flame", tipo: "RACHA" },
  { id: "EFECTIVIDAD_90", titulo: "⭐ Precisión Quirúrgica", descripcion: "90% de tareas completadas a tiempo", icono: "Star", tipo: "EFECTIVIDAD" },
  { id: "EFECTIVIDAD_100", titulo: "🏆 Perfección", descripcion: "100% de tareas a tiempo este mes", icono: "Trophy", tipo: "EFECTIVIDAD" },
  { id: "VOLUMEN_50", titulo: "💪 Productivo", descripcion: "50 tareas completadas en un mes", icono: "Zap", tipo: "VOLUMEN" },
  { id: "VOLUMEN_100", titulo: "🚀 Súper Productivo", descripcion: "100 tareas completadas en un mes", icono: "Rocket", tipo: "VOLUMEN" },
  { id: "CLIENTES_SIN_VENCIDAS", titulo: "🛡️ Guardián", descripcion: "Todos tus clientes sin tareas vencidas", icono: "Shield", tipo: "ESPECIAL" }
];
function computeRacha(tareas) {
  const completedDays = /* @__PURE__ */ new Set();
  for (const t of tareas) {
    if (t.estado === "completada" && t.fecha_completada) {
      completedDays.add(t.fecha_completada.slice(0, 10));
    }
  }
  let streak = 0;
  const d = /* @__PURE__ */ new Date();
  for (let i = 0; i < 60; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (completedDays.has(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
function calcularLogros(metrics, tareas, clientesConVencidas) {
  const racha = computeRacha(tareas);
  const completadasMes = tareas.filter(
    (t) => t.estado === "completada" && t.fecha_completada && t.fecha_completada.slice(0, 7) === (/* @__PURE__ */ new Date()).toISOString().slice(0, 7)
  ).length;
  const checks = {
    RACHA_7: racha >= 7,
    RACHA_30: racha >= 30,
    EFECTIVIDAD_90: metrics.efectividad >= 90,
    EFECTIVIDAD_100: metrics.efectividad >= 100,
    VOLUMEN_50: completadasMes >= 50,
    VOLUMEN_100: completadasMes >= 100,
    CLIENTES_SIN_VENCIDAS: clientesConVencidas === 0 && metrics.clientesAsignados > 0
  };
  return LOGROS_DEF.map((l) => ({
    ...l,
    desbloqueado: checks[l.id] ?? false,
    progreso: l.id.startsWith("RACHA") ? Math.min(100, Math.round(racha / (l.id === "RACHA_30" ? 30 : 7) * 100)) : l.id.startsWith("VOLUMEN") ? Math.min(100, Math.round(completadasMes / (l.id === "VOLUMEN_100" ? 100 : 50) * 100)) : checks[l.id] ? 100 : Math.round(metrics.efectividad),
    fechaDesbloqueo: checks[l.id] ? (/* @__PURE__ */ new Date()).toISOString() : void 0
  }));
}
function generarSugerencias(metrics, tareas, clientes) {
  const sugerencias = [];
  const criticas = tareas.filter((t) => t.critica && t.estado !== "completada").length;
  const sirePendientes = tareas.filter(
    (t) => t.modulo_origen === "sire" && !["completada", "cancelada"].includes(t.estado)
  ).length;
  if (sirePendientes >= 3) {
    sugerencias.push({
      id: "prov-sire",
      tipo: "PRIORIZAR",
      titulo: "Provisiona comprobantes SIRE",
      descripcion: `Tienes ${sirePendientes} comprobantes pendientes de provisión.`,
      impacto: "Reduce hasta 60% de tus tareas críticas",
      accion: { label: "Ir a SIRE", link: "/sire-registros" },
      prioridad: "ALTA"
    });
  }
  const topCxc = [...clientes].sort((a, b) => b.cxcVencido - a.cxcVencido)[0];
  if (topCxc && topCxc.cxcVencido > 0) {
    sugerencias.push({
      id: "cxc-focus",
      tipo: "OPTIMIZAR",
      titulo: `Prioriza ${topCxc.razonSocial}`,
      descripcion: "Este cliente concentra la mayor parte de CXC vencidas.",
      impacto: "Mejora flujo de cobranza del mes",
      accion: { label: "Ver contribuyente", link: "/contribuyentes" },
      prioridad: "MEDIA"
    });
  }
  if (metrics.cargaTrabajo === "ALTA" || metrics.cargaTrabajo === "CRITICA") {
    sugerencias.push({
      id: "carga-alta",
      tipo: "ALERTA",
      titulo: "Carga de trabajo elevada",
      descripcion: "Considera delegar clientes o posponer tareas no críticas.",
      impacto: "Evita vencimientos en cascada",
      accion: { label: "Ver tareas", link: "/tareas" },
      prioridad: "ALTA"
    });
  }
  if (metrics.rachaDiasProductivos >= 7) {
    sugerencias.push({
      id: "racha-logro",
      tipo: "LOGRO",
      titulo: `¡Racha de ${metrics.rachaDiasProductivos} días!`,
      descripcion: "Has completado tareas de forma consistente.",
      impacto: "Mantén el ritmo para desbloquear logros",
      accion: { label: "Ver logros", link: "/dashboard" },
      prioridad: "BAJA"
    });
  }
  if (criticas === 0 && metrics.tareasVencidas === 0) {
    sugerencias.push({
      id: "sin-criticas",
      tipo: "LOGRO",
      titulo: "Sin tareas vencidas",
      descripcion: "Excelente control de plazos este periodo.",
      impacto: "Efectividad personal en buen nivel",
      accion: { label: "Ver estadísticas", link: "/dashboard-estadisticas" },
      prioridad: "BAJA"
    });
  }
  return sugerencias.slice(0, 5);
}
function calcularRachaDias(tareas) {
  return computeRacha(tareas);
}
const CONTADOR_ROLES = /* @__PURE__ */ new Set(["CONTADOR", "CONTADOR_SENIOR", "AUXILIAR_CONTABLE"]);
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}
function mapCarga(pendientes, vencidas) {
  if (vencidas > 5 || pendientes > 40) return "CRITICA";
  if (vencidas > 0 || pendientes > 25) return "ALTA";
  if (pendientes > 10) return "NORMAL";
  return "BAJA";
}
function mapActividadTipo(accion, modulo) {
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
function filterTareasByRucs(tareas, rucs, userId) {
  if (rucs.length === 0) return tareas;
  return tareas.filter(
    (t) => t.ruc && rucs.includes(t.ruc) || t.usuario_id === userId || t.asignado_a === userId
  );
}
async function getRucsForUser(userId) {
  const scoped = permissionService.getRucsPermitidos();
  if (scoped.length > 0) return scoped;
  const { data } = await supabase.from("usuario_roles").select("ruc_id").eq("user_id", userId).eq("activo", true).not("ruc_id", "is", null);
  const fromDb = [...new Set((data ?? []).map((r) => String(r.ruc_id)).filter(Boolean))];
  return fromDb;
}
async function fetchAllTareasActivas() {
  const [pend, prog] = await Promise.all([
    fetchTareas({ estado: "pendiente", orden: "plazo" }),
    fetchTareas({ estado: "en_progreso", orden: "plazo" })
  ]);
  const seen = /* @__PURE__ */ new Set();
  return [...pend, ...prog].filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}
class AdminDashboardService {
  async getEstudioMetrics(adminUserId) {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_estudio_kpis");
      if (!error && data) {
        const d = data;
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
            clientes: c.clientesAsignados
          })),
          facturacionPorMes: facturacion
        };
      }
    } catch {
    }
    return this.getEstudioMetricsFallback(adminUserId);
  }
  async getEstudioMetricsFallback(adminUserId) {
    const [usuarios, contribuyentes, stats, facturacion] = await Promise.all([
      listarUsuariosAdmin(adminUserId).catch(() => []),
      fetchContribuyentes().catch(() => []),
      fetchEstadisticasTareas().catch(() => null),
      this.getFacturacionMensual(12)
    ]);
    const contadores = usuarios.filter(
      (u) => u.rolesResumen.split(",").some((r) => CONTADOR_ROLES.has(r.trim()))
    );
    return {
      totalContadores: contadores.length,
      contadoresActivos: contadores.filter((u) => u.activo).length,
      totalClientes: contribuyentes.length,
      clientesActivos: contribuyentes.filter((c) => c.estado === "ACTIVO").length,
      facturacionMensual: facturacion.at(-1)?.monto ?? 0,
      facturacionAnual: facturacion.reduce((s, f) => s + f.monto, 0),
      efectividadPromedio: stats?.efectividad_pct ?? 0,
      tareasPendientesEstudio: stats?.pendientes ?? 0,
      tareasVencidasEstudio: stats?.vencidas ?? 0,
      clientesPorContador: contadores.map((c) => ({
        contadorId: c.userId,
        nombre: c.nombre,
        clientes: c.rucsCount
      })),
      facturacionPorMes: facturacion
    };
  }
  async getContadoresPerformance(adminUserId) {
    const [usuarios, tareas] = await Promise.all([
      listarUsuariosAdmin(adminUserId).catch(() => []),
      fetchAllTareasActivas()
    ]);
    const contadores = usuarios.filter(
      (u) => u.rolesResumen.split(",").some((r) => CONTADOR_ROLES.has(r.trim()))
    );
    if (contadores.length === 0) {
      return [];
    }
    return contadores.map((u) => {
      const userTasks = tareas.filter(
        (t) => t.usuario_id === u.userId || t.asignado_a === u.userId
      );
      const pendientes = userTasks.filter((t) => !["completada", "cancelada"].includes(t.estado));
      const vencidas = pendientes.filter((t) => t.vencida || t.plazo_vencimiento && t.plazo_vencimiento < todayIso());
      const completadas = tareas.filter((t) => t.estado === "completada" && t.usuario_id === u.userId);
      const onTime = completadas.filter(
        (t) => !t.plazo_vencimiento || !t.fecha_completada || t.fecha_completada.slice(0, 10) <= t.plazo_vencimiento
      );
      const efectividad = completadas.length ? Math.round(onTime.length / completadas.length * 100) : 85;
      const lastActivity = u.lastSignInAt ?? (/* @__PURE__ */ new Date()).toISOString();
      const hoursSince = (Date.now() - new Date(lastActivity).getTime()) / 36e5;
      const estado = hoursSince > 72 ? "INACTIVO" : hoursSince > 24 ? "AUSENTE" : "ACTIVO";
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
        cargaTrabajo: mapCarga(pendientes.length, vencidas.length)
      };
    });
  }
  demoContadores() {
    return [
      { userId: "1", nombre: "María García", email: "maria@estudio.com", rol: "CONTADOR_SENIOR", clientesAsignados: 8, tareasPendientes: 45, tareasCompletadas: 120, tareasVencidas: 3, efectividad: 93, ultimaActividad: new Date(Date.now() - 9e5).toISOString(), estado: "ACTIVO", cargaTrabajo: "ALTA" },
      { userId: "2", nombre: "Carlos Rojas", email: "carlos@estudio.com", rol: "CONTADOR", clientesAsignados: 5, tareasPendientes: 23, tareasCompletadas: 89, tareasVencidas: 1, efectividad: 78, ultimaActividad: new Date(Date.now() - 72e5).toISOString(), estado: "ACTIVO", cargaTrabajo: "NORMAL" },
      { userId: "3", nombre: "Juan Pérez", email: "juan@estudio.com", rol: "CONTADOR", clientesAsignados: 3, tareasPendientes: 12, tareasCompletadas: 45, tareasVencidas: 5, efectividad: 67, ultimaActividad: new Date(Date.now() - 864e5 * 2).toISOString(), estado: "AUSENTE", cargaTrabajo: "CRITICA" },
      { userId: "4", nombre: "Ana López", email: "ana@estudio.com", rol: "CONTADOR", clientesAsignados: 6, tareasPendientes: 31, tareasCompletadas: 95, tareasVencidas: 0, efectividad: 90, ultimaActividad: new Date(Date.now() - 36e5).toISOString(), estado: "ACTIVO", cargaTrabajo: "NORMAL" }
    ];
  }
  async getFacturacionMensual(meses = 12) {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_facturacion_mensual", { p_meses: meses });
      if (!error && Array.isArray(data)) {
        return data.map((r) => ({
          mes: String(r.mes),
          monto: Number(r.monto ?? 0)
        }));
      }
    } catch {
    }
    return [];
  }
  async getTareasPorContador(adminUserId) {
    const perf = await this.getContadoresPerformance(adminUserId);
    return perf.map((c) => ({
      contadorId: c.userId,
      nombre: c.nombre,
      pendientes: c.tareasPendientes,
      vencidas: c.tareasVencidas,
      completadas: c.tareasCompletadas
    }));
  }
  async getAlertasEstudio(adminUserId) {
    const perf = await this.getContadoresPerformance(adminUserId);
    const alertas = [];
    for (const c of perf) {
      if (c.tareasVencidas > 0) {
        alertas.push({
          id: `venc-${c.userId}`,
          severidad: c.tareasVencidas > 3 ? "CRITICA" : "ADVERTENCIA",
          titulo: `${c.tareasVencidas} tarea${c.tareasVencidas > 1 ? "s" : ""} vencida${c.tareasVencidas > 1 ? "s" : ""}`,
          descripcion: `Contador: ${c.nombre}`,
          contadorId: c.userId,
          contadorNombre: c.nombre
        });
      }
      if (c.cargaTrabajo === "ALTA" || c.cargaTrabajo === "CRITICA") {
        alertas.push({
          id: `carga-${c.userId}`,
          severidad: c.cargaTrabajo === "CRITICA" ? "CRITICA" : "ADVERTENCIA",
          titulo: `Carga ${c.cargaTrabajo.toLowerCase()}`,
          descripcion: `${c.nombre} tiene ${c.tareasPendientes} tareas pendientes`,
          contadorId: c.userId,
          contadorNombre: c.nombre
        });
      }
      if (c.estado === "INACTIVO") {
        alertas.push({
          id: `inact-${c.userId}`,
          severidad: "ADVERTENCIA",
          titulo: "Contador inactivo",
          descripcion: `${c.nombre} sin actividad reciente`,
          contadorId: c.userId,
          contadorNombre: c.nombre
        });
      }
    }
    return alertas.slice(0, 10);
  }
  async getActividadReciente(limit = 20) {
    const { data } = await auditoriaService.buscarRegistros({ limit, pagina: 1 });
    if (data.length === 0) {
      return [
        { id: "1", usuarioNombre: "María G.", tipo: "TAREA_COMPLETADA", titulo: "Completó provisión FACTURA F001-123", createdAt: new Date(Date.now() - 3e5).toISOString() },
        { id: "2", usuarioNombre: "Carlos R.", tipo: "CAJA", titulo: "Registró 5 movimientos de caja", createdAt: new Date(Date.now() - 6e5).toISOString() },
        { id: "3", usuarioNombre: "Sistema", tipo: "SISTEMA", titulo: "Sincronización SIRE completada (45 registros)", createdAt: new Date(Date.now() - 9e5).toISOString() }
      ];
    }
    return data.slice(0, limit).map((r) => ({
      id: r.id,
      userId: r.userId ?? void 0,
      usuarioNombre: r.usuarioEmail?.split("@")[0],
      tipo: mapActividadTipo(r.accion, r.modulo),
      titulo: `${r.accion} en ${r.modulo}`,
      detalle: r.rucAfectado ? `RUC ${r.rucAfectado}` : void 0,
      createdAt: r.createdAt
    }));
  }
}
class ContadorDashboardService {
  async getPersonalMetrics(userId) {
    try {
      const { data, error } = await supabase.rpc("rpc_dashboard_contador_kpis", { p_user_id: userId });
      if (!error && data) {
        const d = data;
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
          cargaTrabajo: String(d.cargaTrabajo ?? "NORMAL"),
          rachaDiasProductivos: racha,
          tareasCompletadasHoy: Number(d.tareasCompletadasHoy ?? 0)
        };
      }
    } catch {
    }
    return this.getPersonalMetricsFallback(userId);
  }
  async getPersonalMetricsFallback(userId) {
    const rucs = await getRucsForUser(userId);
    const [contribuyentes, tareas, statsExt] = await Promise.all([
      fetchContribuyentes().catch(() => []),
      fetchAllTareasActivas(),
      fetchEstadisticasTareasMejorada(null, (/* @__PURE__ */ new Date()).toISOString().slice(0, 7)).catch(() => null)
    ]);
    const clientes = rucs.length > 0 ? contribuyentes.filter((c) => rucs.includes(c.ruc)) : contribuyentes;
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    const activas = scoped.filter((t) => !["completada", "cancelada"].includes(t.estado));
    const vencidas = activas.filter((t) => t.vencida || t.plazo_vencimiento && t.plazo_vencimiento < todayIso());
    const hoy = activas.filter((t) => t.plazo_vencimiento === todayIso());
    const completadasHoy = scoped.filter(
      (t) => t.estado === "completada" && t.fecha_completada?.slice(0, 10) === todayIso()
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
      tareasCompletadasHoy: completadasHoy.length
    };
  }
  async getTareasUrgentes(userId) {
    const rucs = await getRucsForUser(userId);
    const all = await alertUnifiedService.taskService.getPendingTasks();
    if (rucs.length === 0) return all;
    return all.filter((t) => !t.ruc || rucs.includes(t.ruc));
  }
  async getClientesAsignados(userId) {
    const rucs = await getRucsForUser(userId);
    const [contribuyentes, tareas] = await Promise.all([
      fetchContribuyentes().catch(() => []),
      fetchAllTareasActivas()
    ]);
    const list = rucs.length > 0 ? contribuyentes.filter((c) => rucs.includes(c.ruc)) : contribuyentes;
    return list.map((c) => {
      const clientTasks = tareas.filter((t) => t.ruc === c.ruc && !["completada", "cancelada"].includes(t.estado));
      const vencidas = clientTasks.filter((t) => t.vencida || t.plazo_vencimiento && t.plazo_vencimiento < todayIso());
      return {
        ruc: c.ruc,
        razonSocial: c.razonSocial,
        estado: c.estado ?? "ACTIVO",
        tareasPendientes: clientTasks.length,
        ultimaActividad: (/* @__PURE__ */ new Date()).toISOString(),
        comprobantesPendientes: clientTasks.filter((t) => t.modulo_origen === "sire").length,
        cxcVencido: 0,
        cxpVencido: 0,
        saldoCaja: 0,
        alertas: vencidas.length
      };
    });
  }
  async getCargaTrabajo(userId, semanas = 4) {
    const rucs = await getRucsForUser(userId);
    const tareas = filterTareasByRucs(await fetchAllTareasActivas(), rucs, userId);
    const days = [];
    const start = /* @__PURE__ */ new Date();
    start.setDate(start.getDate() - semanas * 7);
    for (let i = 0; i < semanas * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const dayTasks = tareas.filter((t) => t.plazo_vencimiento === iso);
      days.push({
        fecha: iso,
        total: dayTasks.length,
        vencidas: dayTasks.filter((t) => iso < todayIso()).length
      });
    }
    return days;
  }
  async getSugerencias(userId) {
    const [metrics, tareas, clientes] = await Promise.all([
      this.getPersonalMetrics(userId),
      fetchAllTareasActivas(),
      this.getClientesAsignados(userId)
    ]);
    const rucs = await getRucsForUser(userId);
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    return generarSugerencias(metrics, scoped, clientes);
  }
  async getLogros(userId) {
    const [metrics, tareas, clientes] = await Promise.all([
      this.getPersonalMetrics(userId),
      fetchAllTareasActivas(),
      this.getClientesAsignados(userId)
    ]);
    const rucs = await getRucsForUser(userId);
    const scoped = filterTareasByRucs(tareas, rucs, userId);
    const clientesConVencidas = clientes.filter((c) => c.alertas > 0).length;
    return calcularLogros(metrics, scoped, clientesConVencidas);
  }
  async getActividadPersonal(userId, limit = 10) {
    const { data } = await auditoriaService.buscarRegistros({ userId, limit, pagina: 1 });
    return data.slice(0, limit).map((r) => ({
      id: r.id,
      userId: r.userId ?? void 0,
      tipo: mapActividadTipo(r.accion, r.modulo),
      titulo: `${r.accion} — ${r.modulo}`,
      detalle: r.detalleJsonb ? JSON.stringify(r.detalleJsonb).slice(0, 80) : void 0,
      createdAt: r.createdAt
    }));
  }
  async getFacturacionMensualPersonal(userId) {
    const rucs = await getRucsForUser(userId);
    const now = /* @__PURE__ */ new Date();
    const periodo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    let query = supabase.from("registros_sire").select("importe_total").eq("periodo", periodo).eq("tipo", "VENTA");
    if (rucs.length > 0) {
      query = query.in("ruc", rucs);
    }
    const { data, error } = await query;
    if (error || !data?.length) return 0;
    return data.reduce((sum, row) => sum + Number(row.importe_total ?? 0), 0);
  }
  async getProximosVencimientos(userId, dias = 7) {
    const rucs = await getRucsForUser(userId);
    const tareas = filterTareasByRucs(await fetchAllTareasActivas(), rucs, userId);
    const hoy = todayIso();
    const limite = /* @__PURE__ */ new Date();
    limite.setDate(limite.getDate() + dias);
    const limiteIso = limite.toISOString().slice(0, 10);
    return tareas.filter(
      (t) => t.plazo_vencimiento && t.plazo_vencimiento >= hoy && t.plazo_vencimiento <= limiteIso && !["completada", "cancelada"].includes(t.estado)
    ).sort((a, b) => (a.plazo_vencimiento ?? "").localeCompare(b.plazo_vencimiento ?? "")).slice(0, 10);
  }
}
const adminDashboardService = new AdminDashboardService();
const contadorDashboardService = new ContadorDashboardService();
const STALE_TIMES = {
  TAREAS_PENDIENTES: 1 * 60 * 1e3,
  AUDITORIA_RECIENTE: 30 * 1e3
};
class AdminMetricsService {
  async getEstudioKPIs(adminUserId) {
    const [metrics, contadores, alertas, auditStats] = await Promise.all([
      adminDashboardService.getEstudioMetrics(adminUserId),
      adminDashboardService.getContadoresPerformance(adminUserId),
      adminDashboardService.getAlertasEstudio(adminUserId),
      auditoriaService.obtenerDashboardStats().catch(() => null)
    ]);
    const inactivos = contadores.filter((c) => c.estado === "INACTIVO").length;
    const criticas = alertas.filter((a) => a.severidad === "CRITICA").length;
    const seguridad = auditStats?.alertasActivas ?? alertas.length;
    let estadoSistema = "NORMAL";
    if (criticas > 0 || metrics.tareasVencidasEstudio > 10) estadoSistema = "CRITICO";
    else if (inactivos > 0 || metrics.tareasVencidasEstudio > 0) estadoSistema = "ATENCION";
    return {
      ...metrics,
      estadoSistema,
      alertasSeguridad: seguridad,
      contadoresInactivos: inactivos
    };
  }
  async getRendimientoContadores(adminUserId) {
    return adminDashboardService.getContadoresPerformance(adminUserId);
  }
  async getClientesPorContador(adminUserId) {
    const perf = await this.getRendimientoContadores(adminUserId);
    return perf.map((c) => ({ nombre: c.nombre.split(" ")[0], clientes: c.clientesAsignados }));
  }
  async getFacturacionEstudio(meses = 12) {
    return adminDashboardService.getFacturacionMensual(meses);
  }
  async getAlertasEstudio(adminUserId) {
    return adminDashboardService.getAlertasEstudio(adminUserId);
  }
  async getActividadReciente(limit = 10) {
    return adminDashboardService.getActividadReciente(limit);
  }
  async getGraficos(adminUserId) {
    const [clientesPorContador, facturacionMensual] = await Promise.all([
      this.getClientesPorContador(adminUserId),
      this.getFacturacionEstudio(12)
    ]);
    return { clientesPorContador, facturacionMensual };
  }
}
const adminMetricsService = new AdminMetricsService();
function useAdminEnabled() {
  const { tiene } = usePermissions();
  return tiene("dashboard.configurar");
}
function useAdminKPIs() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "kpis", user?.id],
    queryFn: () => adminMetricsService.getEstudioKPIs(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 2 * 6e4,
    refetchInterval: 2 * 6e4
  });
}
function useRendimientoContadores() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "rendimiento", user?.id],
    queryFn: () => adminMetricsService.getRendimientoContadores(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 6e4
  });
}
function useAdminGraficos() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "graficos", user?.id],
    queryFn: () => adminMetricsService.getGraficos(user.id),
    enabled: !!user?.id && enabled,
    staleTime: 10 * 6e4
  });
}
function useAdminAlertas() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "alertas", user?.id],
    queryFn: () => adminMetricsService.getAlertasEstudio(user.id),
    enabled: !!user?.id && enabled,
    staleTime: STALE_TIMES.TAREAS_PENDIENTES,
    refetchInterval: 6e4
  });
}
function useAdminActividad(limit = 10) {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "actividad", limit],
    queryFn: () => adminMetricsService.getActividadReciente(limit),
    enabled: !!user?.id && enabled,
    staleTime: STALE_TIMES.AUDITORIA_RECIENTE,
    refetchInterval: 6e4
  });
}
export {
  DashboardKpiCard as D,
  DashboardSection as a,
  useAdminAlertas as b,
  contadorDashboardService as c,
  useAdminGraficos as d,
  useAdminKPIs as e,
  formatSoles as f,
  useRendimientoContadores as g,
  relativeTime as r,
  useAdminActividad as u
};
