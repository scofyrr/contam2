import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchTareasCriticasPendientes } from "@/modules/tareas/services/tareas-service";
import {
  notificationService,
} from "@/modules/notificaciones/services/notification-service";
import type { NotificacionCorreo, PreferenciasNotificacion } from "@/modules/notificaciones/types/notifications";
import type { TareaPendiente } from "@/types/tareas";
import { useSession } from "@/hooks/use-session";

export const INSTITUTIONAL_EMAIL_KEY = "contam-institutional-email";

/** @deprecated Usar NotificacionCorreo del servicio */
export type EmailNotification = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
};

export type SystemAlert = {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  date: string;
};

export type PendingTask = {
  id: string;
  entidad: string;
  tramite: string;
  fechaTramitar: string;
  problema: string;
  plazoVencimiento: string;
  critical: boolean;
};

function mapTareaToPending(t: TareaPendiente): PendingTask {
  const entidadLabel = t.razon_social
    ? `${t.razon_social}${t.ruc ? ` (${t.ruc})` : ""}`
    : t.entidad;
  return {
    id: t.id,
    entidad: entidadLabel,
    tramite: t.titulo ?? t.tramite,
    fechaTramitar: t.fecha_tramitar ?? "",
    problema: t.problema ?? t.descripcion ?? "",
    plazoVencimiento: t.plazo_vencimiento ?? "",
    critical: t.critica || t.vencida === true,
  };
}

function notifToEmail(n: NotificacionCorreo): EmailNotification {
  return {
    id: n.id,
    from: n.metadata.modulo ?? "CONTAM",
    subject: n.titulo,
    preview: n.mensaje,
    date: n.fecha_creacion,
    read: n.leida,
  };
}

function notifToAlert(n: NotificacionCorreo): SystemAlert | null {
  if (n.tipo !== "ALERTA_SISTEMA" && n.tipo !== "TAREA_VENCIDA") return null;
  return {
    id: n.id,
    title: n.titulo,
    message: n.mensaje,
    severity: n.tipo === "TAREA_VENCIDA" ? "critical" : "warning",
    date: n.fecha_creacion,
  };
}

type NotificationsContextValue = {
  institutionalEmail: string;
  setInstitutionalEmail: (email: string) => void;
  emails: EmailNotification[];
  alerts: SystemAlert[];
  pendingTasks: PendingTask[];
  notificaciones: NotificacionCorreo[];
  noLeidas: number;
  conectado: boolean;
  preferencias: PreferenciasNotificacion | null;
  criticalAlertCount: number;
  markEmailRead: (id: string) => void;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  actualizarPreferencias: (p: Partial<PreferenciasNotificacion>) => Promise<void>;
  refrescar: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function readEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(INSTITUTIONAL_EMAIL_KEY) ?? "";
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  const [institutionalEmail, setEmailState] = useState(readEmail);
  const [notificaciones, setNotificaciones] = useState<NotificacionCorreo[]>([]);
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacion | null>(null);
  const [conectado, setConectado] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      await notificationService.inicializar(userId);
      await notificationService.sincronizarDesdeTareas().catch(() => null);
      const [notifs, prefs] = await Promise.all([
        notificationService.obtenerNotificaciones(50),
        notificationService.obtenerPreferencias(),
      ]);
      setNotificaciones(notifs);
      setPreferencias(prefs);
      setConectado(true);
    } catch {
      setConectado(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 60_000);
    const onNew = () => void load();
    window.addEventListener("contam:notificacion-nueva", onNew);
    window.addEventListener("contam:tareas-sugeridas", onNew);
    return () => {
      clearInterval(id);
      window.removeEventListener("contam:notificacion-nueva", onNew);
      window.removeEventListener("contam:tareas-sugeridas", onNew);
    };
  }, [load]);

  useEffect(() => {
    void fetchTareasCriticasPendientes(8)
      .then((rows) => {
        if (rows.length > 0) setPendingTasks(rows.map(mapTareaToPending));
      })
      .catch(() => {
        /* fallback vacío */
      });
  }, []);

  const setInstitutionalEmail = useCallback((email: string) => {
    const trimmed = email.trim();
    localStorage.setItem(INSTITUTIONAL_EMAIL_KEY, trimmed);
    setEmailState(trimmed);
  }, []);

  const marcarLeida = useCallback(async (id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    await notificationService.marcarComoLeida(id);
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await notificationService.marcarTodasComoLeidas();
  }, []);

  const markEmailRead = useCallback((id: string) => {
    void marcarLeida(id);
  }, [marcarLeida]);

  const actualizarPreferencias = useCallback(async (p: Partial<PreferenciasNotificacion>) => {
    await notificationService.actualizarPreferencias(p);
    const prefs = await notificationService.obtenerPreferencias();
    setPreferencias(prefs);
  }, []);

  const emails = useMemo(() => notificaciones.map(notifToEmail), [notificaciones]);
  const alerts = useMemo(
    () => notificaciones.map(notifToAlert).filter(Boolean) as SystemAlert[],
    [notificaciones],
  );
  const noLeidas = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  const criticalAlertCount = useMemo(() => {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
    const criticalTasks = pendingTasks.filter((t) => t.critical).length;
    const criticalNotifs = notificaciones.filter(
      (n) => !n.leida && (n.tipo === "TAREA_VENCIDA" || n.metadata.prioridad === "urgente"),
    ).length;
    return criticalAlerts + criticalTasks + criticalNotifs;
  }, [alerts, pendingTasks, notificaciones]);

  const value = useMemo(
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
      refrescar: load,
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
      load,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
