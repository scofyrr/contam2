import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { g as fetchTareasCriticasPendientes } from "./tareas-service-CDrwsaQ5.js";
import { a as notificationService } from "./notification-service-CO-YhtRJ.js";
import { ar as useSession } from "./router-DdOnzL1Y.js";
const INSTITUTIONAL_EMAIL_KEY = "contam-institutional-email";
function mapTareaToPending(t) {
  const entidadLabel = t.razon_social ? `${t.razon_social}${t.ruc ? ` (${t.ruc})` : ""}` : t.entidad;
  return {
    id: t.id,
    entidad: entidadLabel,
    tramite: t.titulo ?? t.tramite,
    fechaTramitar: t.fecha_tramitar ?? "",
    problema: t.problema ?? t.descripcion ?? "",
    plazoVencimiento: t.plazo_vencimiento ?? "",
    critical: t.critica || t.vencida === true
  };
}
function notifToEmail(n) {
  return {
    id: n.id,
    from: n.metadata.modulo ?? "CONTAM",
    subject: n.titulo,
    preview: n.mensaje,
    date: n.fecha_creacion,
    read: n.leida
  };
}
function notifToAlert(n) {
  if (n.tipo !== "ALERTA_SISTEMA" && n.tipo !== "TAREA_VENCIDA") return null;
  return {
    id: n.id,
    title: n.titulo,
    message: n.mensaje,
    severity: n.tipo === "TAREA_VENCIDA" ? "critical" : "warning",
    date: n.fecha_creacion
  };
}
const NotificationsContext = reactExports.createContext(null);
function readEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(INSTITUTIONAL_EMAIL_KEY) ?? "";
}
function NotificationsProvider({ children }) {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;
  const [institutionalEmail, setEmailState] = reactExports.useState(readEmail);
  const [notificaciones, setNotificaciones] = reactExports.useState([]);
  const [preferencias, setPreferencias] = reactExports.useState(null);
  const [conectado, setConectado] = reactExports.useState(true);
  const [pendingTasks, setPendingTasks] = reactExports.useState([]);
  const load = reactExports.useCallback(async () => {
    if (!userId) return;
    try {
      await notificationService.inicializar(userId);
      await notificationService.sincronizarDesdeTareas().catch(() => null);
      const [notifs, prefs] = await Promise.all([
        notificationService.obtenerNotificaciones(50),
        notificationService.obtenerPreferencias()
      ]);
      setNotificaciones(notifs);
      setPreferencias(prefs);
      setConectado(true);
    } catch {
      setConectado(false);
    }
  }, [userId]);
  reactExports.useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 6e4);
    const onNew = () => void load();
    window.addEventListener("contam:notificacion-nueva", onNew);
    window.addEventListener("contam:tareas-sugeridas", onNew);
    return () => {
      clearInterval(id);
      window.removeEventListener("contam:notificacion-nueva", onNew);
      window.removeEventListener("contam:tareas-sugeridas", onNew);
    };
  }, [load]);
  reactExports.useEffect(() => {
    void fetchTareasCriticasPendientes(8).then((rows) => {
      if (rows.length > 0) setPendingTasks(rows.map(mapTareaToPending));
    }).catch(() => {
    });
  }, []);
  const setInstitutionalEmail = reactExports.useCallback((email) => {
    const trimmed = email.trim();
    localStorage.setItem(INSTITUTIONAL_EMAIL_KEY, trimmed);
    setEmailState(trimmed);
  }, []);
  const marcarLeida = reactExports.useCallback(async (id) => {
    setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
    await notificationService.marcarComoLeida(id);
  }, []);
  const marcarTodasLeidas = reactExports.useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await notificationService.marcarTodasComoLeidas();
  }, []);
  const markEmailRead = reactExports.useCallback((id) => {
    void marcarLeida(id);
  }, [marcarLeida]);
  const actualizarPreferencias = reactExports.useCallback(async (p) => {
    await notificationService.actualizarPreferencias(p);
    const prefs = await notificationService.obtenerPreferencias();
    setPreferencias(prefs);
  }, []);
  const emails = reactExports.useMemo(() => notificaciones.map(notifToEmail), [notificaciones]);
  const alerts = reactExports.useMemo(
    () => notificaciones.map(notifToAlert).filter(Boolean),
    [notificaciones]
  );
  const noLeidas = reactExports.useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);
  const criticalAlertCount = reactExports.useMemo(() => {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
    const criticalTasks = pendingTasks.filter((t) => t.critical).length;
    const criticalNotifs = notificaciones.filter(
      (n) => !n.leida && (n.tipo === "TAREA_VENCIDA" || n.metadata.prioridad === "urgente")
    ).length;
    return criticalAlerts + criticalTasks + criticalNotifs;
  }, [alerts, pendingTasks, notificaciones]);
  const value = reactExports.useMemo(
    () => ({
      institutionalEmail,
      setInstitutionalEmail,
      emails,
      alerts,
      pendingTasks,
      notificaciones,
      noLeidas,
      conectado,
      preferencias,
      criticalAlertCount,
      markEmailRead,
      marcarLeida,
      marcarTodasLeidas,
      actualizarPreferencias,
      refrescar: load
    }),
    [
      institutionalEmail,
      setInstitutionalEmail,
      emails,
      alerts,
      pendingTasks,
      notificaciones,
      noLeidas,
      conectado,
      preferencias,
      criticalAlertCount,
      markEmailRead,
      marcarLeida,
      marcarTodasLeidas,
      actualizarPreferencias,
      load
    ]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsContext.Provider, { value, children });
}
function useNotifications() {
  const ctx = reactExports.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
export {
  NotificationsProvider as N,
  useNotifications as u
};
