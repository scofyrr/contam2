import { a as createLucideIcon } from "./index-CwvZaaA2.js";
import { a as notificationService } from "./notification-service-CO-YhtRJ.js";
import { d as fetchTareas, m as marcarTareaCompletada, a as actualizarTarea } from "./tareas-service-CDrwsaQ5.js";
const __iconNode = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode);
const SYSTEM_LOCAL_DISMISSED = "contam-system-notif-dismissed";
const TASK_SNOOZE_KEY = "contam-task-snooze";
const EXPIRE_DAYS = 30;
const TASK_TIPOS = ["TAREA_ASIGNADA", "TAREA_VENCIDA", "VENCIMIENTO_PROXIMO"];
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function addDays(iso, days) {
  const d = /* @__PURE__ */ new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function readDismissed() {
  if (typeof window === "undefined") return /* @__PURE__ */ new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SYSTEM_LOCAL_DISMISSED) ?? "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function writeDismissed(ids) {
  localStorage.setItem(SYSTEM_LOCAL_DISMISSED, JSON.stringify([...ids].slice(0, 200)));
}
function readSnoozes() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(TASK_SNOOZE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeSnooze(taskId, until) {
  const all = readSnoozes();
  all[taskId] = until;
  localStorage.setItem(TASK_SNOOZE_KEY, JSON.stringify(all));
}
function mapTipoToSystem(tipo, meta) {
  const raw = String(meta?.modulo ?? "").toUpperCase();
  if (raw.includes("SYNC") && raw.includes("ERROR")) return "SYNC_ERROR";
  if (raw.includes("SYNC")) return "SYNC_SUCCESS";
  if (raw.includes("SECURITY") || tipo === "MENSAJE_ADMIN") return "SECURITY_ALERT";
  if (tipo === "CIERRE_PERIODO") return "SYSTEM_UPDATE";
  return "GENERAL";
}
function systemIcon(type) {
  const map = {
    SYNC_SUCCESS: "RefreshCw",
    SYNC_ERROR: "XCircle",
    SYSTEM_UPDATE: "ArrowUpCircle",
    BACKUP_COMPLETE: "Save",
    MIGRATION_EXECUTED: "Database",
    USER_CREATED: "UserPlus",
    USER_DISABLED: "UserX",
    ROLE_CHANGED: "Shield",
    SECURITY_ALERT: "ShieldAlert",
    FEATURE_FLAG_CHANGED: "Flag",
    ERROR_CRITICAL: "AlertTriangle",
    MAINTENANCE_SCHEDULED: "Wrench",
    GENERAL: "Bell"
  };
  return map[type];
}
function systemColor(type) {
  if (type === "SYNC_SUCCESS" || type === "USER_CREATED" || type === "BACKUP_COMPLETE") return "#00C897";
  if (type === "SYNC_ERROR" || type === "ERROR_CRITICAL") return "#FF5E7A";
  if (type === "SECURITY_ALERT") return "#F0A500";
  if (type === "SYSTEM_UPDATE" || type === "MIGRATION_EXECUTED") return "#00D4FF";
  return "#60A5FA";
}
function mapNotifToSystem(n) {
  if (TASK_TIPOS.includes(n.tipo)) return null;
  const type = mapTipoToSystem(n.tipo, n.metadata);
  const created = n.fecha_creacion;
  return {
    id: n.id,
    type,
    title: n.titulo,
    message: n.mensaje,
    priority: n.metadata.prioridad === "urgente" || type === "ERROR_CRITICAL" ? "HIGH" : "NORMAL",
    read: n.leida,
    createdAt: created,
    expiresAt: addDays(created.slice(0, 10), EXPIRE_DAYS),
    metadata: {
      module: n.metadata.modulo,
      link: n.metadata.linkNavegacion,
      details: n.metadata.periodo
    },
    icon: systemIcon(type),
    color: systemColor(type),
    sound: type === "ERROR_CRITICAL" ? "subtle" : "none"
  };
}
function computeUrgency(plazo, vencida) {
  if (!plazo) return "UPCOMING";
  const today = todayIso();
  if (vencida || plazo < today) return "OVERDUE";
  if (plazo === today) return "TODAY";
  if (plazo === addDays(today, 1)) return "TOMORROW";
  if (plazo <= addDays(today, 7)) return "THIS_WEEK";
  return "UPCOMING";
}
function mapPriority(t) {
  if (t.critica || t.prioridad === "urgente") return "CRITICA";
  if (t.prioridad === "alta") return "ALTA";
  if (t.prioridad === "baja") return "BAJA";
  return "MEDIA";
}
function mapModule(m) {
  const u = m.toUpperCase();
  if (u.includes("SIRE")) return "SIRE";
  if (u.includes("CAJA")) return "CAJA";
  if (u.includes("DIARIO") || u.includes("ASIENTO")) return "DIARIO";
  if (u.includes("PCGE")) return "PCGE";
  if (u.includes("FICHA") || u.includes("RUC")) return "FICHA_RUC";
  if (u.includes("CONCIL")) return "CONCILIACION";
  return "GENERAL";
}
function badgeColor(urgency, priority) {
  if (urgency === "OVERDUE" && priority === "CRITICA") return "#FF0000";
  if (urgency === "OVERDUE") return "#FF3333";
  if (urgency === "TODAY") return "#FF6B00";
  if (urgency === "TOMORROW") return "#FF9500";
  if (urgency === "THIS_WEEK") return "#FFB800";
  return "#00D4FF";
}
function moduleLink(t) {
  const m = t.modulo_origen;
  if (m === "sire") return "/sire-registros";
  if (m === "caja") return "/libro-caja";
  if (m === "asientos") return "/libro-diario";
  if (m === "pcge") return "/pcge";
  if (m === "contribuyentes") return "/contribuyentes";
  return "/tareas";
}
function mapTareaToPending(t, snoozedUntil) {
  if (["completada", "cancelada"].includes(t.estado)) return null;
  if (snoozedUntil && snoozedUntil > todayIso()) return null;
  const urgency = computeUrgency(t.plazo_vencimiento, t.vencida);
  const priority = mapPriority(t);
  const recentlyOverdue = urgency === "OVERDUE" && t.updated_at != null && Date.now() - new Date(t.updated_at).getTime() < 36e5;
  return {
    id: t.id,
    title: t.titulo ?? t.tramite,
    description: t.problema ?? t.descripcion ?? t.tramite,
    module: mapModule(t.modulo_origen),
    priority,
    urgency,
    dueDate: t.plazo_vencimiento ?? "",
    ruc: t.ruc ?? void 0,
    rucName: t.razon_social ?? t.entidad,
    completed: false,
    createdAt: t.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    metadata: {
      link: moduleLink(t),
      sireRegistroId: t.referencia_id ?? void 0
    },
    badgeColor: badgeColor(urgency, priority),
    pulseAnimation: urgency === "OVERDUE" && priority === "CRITICA",
    shakeAnimation: recentlyOverdue
  };
}
function buildAlertState(systemNotifications, pendingTasks) {
  const unreadSystemCount = systemNotifications.filter((n) => !n.read).length;
  const overdueTaskCount = pendingTasks.filter((t) => t.urgency === "OVERDUE").length;
  const criticalTaskCount = pendingTasks.filter((t) => t.priority === "CRITICA").length;
  const todayTaskCount = pendingTasks.filter((t) => t.urgency === "TODAY").length;
  const fabBadgeCount = overdueTaskCount + todayTaskCount;
  const fabPulsing = pendingTasks.some((t) => t.pulseAnimation);
  return {
    systemNotifications,
    pendingTasks,
    unreadSystemCount,
    pendingTaskCount: pendingTasks.length,
    overdueTaskCount,
    criticalTaskCount,
    todayTaskCount,
    fabVisible: true,
    fabBadgeCount,
    fabPulsing,
    lastUpdated: Date.now()
  };
}
function getFABConfig(state) {
  const { overdueTaskCount, criticalTaskCount, todayTaskCount, fabBadgeCount, fabPulsing, pendingTasks } = state;
  const criticalOverdue = pendingTasks.some((t) => t.urgency === "OVERDUE" && t.priority === "CRITICA");
  const shaking = pendingTasks.some((t) => t.shakeAnimation);
  let backgroundColor = "#0D1525";
  if (criticalOverdue) backgroundColor = "#FF0000";
  else if (overdueTaskCount > 0) backgroundColor = "#CC0000";
  else if (todayTaskCount > 0) backgroundColor = "#FF6B00";
  const parts = [];
  if (overdueTaskCount) parts.push(`${overdueTaskCount} vencida${overdueTaskCount > 1 ? "s" : ""}`);
  if (todayTaskCount) parts.push(`${todayTaskCount} para hoy`);
  const tooltip = parts.length > 0 ? `${fabBadgeCount} tarea${fabBadgeCount > 1 ? "s" : ""} requieren atención (${parts.join(", ")})` : `${state.pendingTaskCount} tareas pendientes`;
  return {
    visible: state.fabVisible,
    badgeCount: fabBadgeCount || state.pendingTaskCount,
    backgroundColor,
    isPulsing: fabPulsing || criticalOverdue,
    isShaking: shaking,
    tooltip
  };
}
class SystemNotificationService {
  async getNotifications(limit = 50) {
    const raw = await notificationService.obtenerNotificaciones(limit);
    const dismissed = readDismissed();
    const today = todayIso();
    return raw.map(mapNotifToSystem).filter((n) => n != null).filter((n) => !dismissed.has(n.id)).filter((n) => n.expiresAt >= today);
  }
  async getUnreadCount() {
    const items = await this.getNotifications(100);
    return items.filter((n) => !n.read).length;
  }
  async markAsRead(id) {
    await notificationService.marcarComoLeida(id);
  }
  async markAllAsRead() {
    await notificationService.marcarTodasComoLeidas();
  }
  async dismissNotification(id) {
    const dismissed = readDismissed();
    dismissed.add(id);
    writeDismissed(dismissed);
    await this.markAsRead(id);
  }
  async createNotification(input, userId) {
    await notificationService.inicializar(userId);
    return notificationService.generarNotificacion({
      user_id: userId,
      tipo: "ALERTA_SISTEMA",
      titulo: input.title,
      mensaje: input.message,
      metadata: {
        modulo: input.type,
        linkNavegacion: input.metadata?.link,
        prioridad: input.priority === "HIGH" ? "urgente" : "media"
      }
    });
  }
}
class PendingTaskService {
  async getPendingTasks(ruc) {
    const snoozes = readSnoozes();
    const rows = await fetchTareas({
      ruc,
      estado: "pendiente",
      orden: "plazo"
    });
    const enProgreso = await fetchTareas({ ruc, estado: "en_progreso", orden: "plazo" });
    const all = [...rows, ...enProgreso];
    const seen = /* @__PURE__ */ new Set();
    const tasks = [];
    for (const t of all) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      const mapped = mapTareaToPending(t, snoozes[t.id]);
      if (mapped) tasks.push(mapped);
    }
    tasks.sort((a, b) => {
      const rank = {
        OVERDUE: 0,
        TODAY: 1,
        TOMORROW: 2,
        THIS_WEEK: 3,
        UPCOMING: 4
      };
      return rank[a.urgency] - rank[b.urgency] || a.dueDate.localeCompare(b.dueDate);
    });
    return tasks;
  }
  async getUrgentTaskCount() {
    const tasks = await this.getPendingTasks();
    return {
      overdue: tasks.filter((t) => t.urgency === "OVERDUE").length,
      today: tasks.filter((t) => t.urgency === "TODAY").length,
      critical: tasks.filter((t) => t.priority === "CRITICA").length,
      total: tasks.length
    };
  }
  async completeTask(id) {
    await marcarTareaCompletada(id);
    window.dispatchEvent(new CustomEvent("contam:tareas-updated"));
  }
  async snoozeTask(id, until) {
    writeSnooze(id, until);
    await actualizarTarea(id, { plazo_vencimiento: until });
    window.dispatchEvent(new CustomEvent("contam:tareas-updated"));
  }
}
class AlertUnifiedService {
  system = new SystemNotificationService();
  tasks = new PendingTaskService();
  async getAlertState(ruc) {
    const [systemNotifications, pendingTasks] = await Promise.all([
      this.system.getNotifications(),
      this.tasks.getPendingTasks(ruc)
    ]);
    return buildAlertState(systemNotifications, pendingTasks);
  }
  subscribeToAlerts(callback, ruc) {
    let active = true;
    const tick = async () => {
      if (!active) return;
      try {
        callback(await this.getAlertState(ruc));
      } catch {
      }
    };
    void tick();
    const taskInterval = setInterval(tick, 3e4);
    const sysInterval = setInterval(tick, 6e4);
    const onEvent = () => void tick();
    window.addEventListener("contam:notificacion-nueva", onEvent);
    window.addEventListener("contam:tareas-updated", onEvent);
    window.addEventListener("contam:tareas-sugeridas", onEvent);
    return () => {
      active = false;
      clearInterval(taskInterval);
      clearInterval(sysInterval);
      window.removeEventListener("contam:notificacion-nueva", onEvent);
      window.removeEventListener("contam:tareas-updated", onEvent);
      window.removeEventListener("contam:tareas-sugeridas", onEvent);
    };
  }
  getFABConfig(state) {
    return getFABConfig(state);
  }
  get systemService() {
    return this.system;
  }
  get taskService() {
    return this.tasks;
  }
}
const alertUnifiedService = new AlertUnifiedService();
export {
  Settings as S,
  alertUnifiedService as a,
  getFABConfig as g
};
