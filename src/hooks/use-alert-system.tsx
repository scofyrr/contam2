import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  alertUnifiedService,
  getFABConfig,
} from "@/modules/notificaciones/services/notification-dual-service";
import type {
  AlertState,
  FABConfig,
  PendingTask,
} from "@/modules/notificaciones/types/alert-system";
import { playAlertSound, vibrateAlert } from "@/lib/alert-sounds";
import { useSession } from "@/hooks/use-session";

type AlertSystemContextValue = {
  alertState: AlertState;
  loading: boolean;
  fabConfig: FABConfig;
  urgentTasks: PendingTask[];
  fabDrawerOpen: boolean;
  setFabDrawerOpen: (open: boolean) => void;
  markSystemNotificationRead: (id: string) => Promise<void>;
  markAllSystemNotificationsRead: () => Promise<void>;
  dismissSystemNotification: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  snoozeTask: (id: string, hours?: number) => Promise<void>;
  refreshAlerts: () => Promise<void>;
};

const EMPTY_STATE: AlertState = {
  systemNotifications: [],
  pendingTasks: [],
  unreadSystemCount: 0,
  pendingTaskCount: 0,
  overdueTaskCount: 0,
  criticalTaskCount: 0,
  todayTaskCount: 0,
  fabVisible: true,
  fabBadgeCount: 0,
  fabPulsing: false,
  lastUpdated: 0,
};

const AlertSystemContext = createContext<AlertSystemContextValue | null>(null);

export function AlertSystemProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [alertState, setAlertState] = useState<AlertState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [fabDrawerOpen, setFabDrawerOpen] = useState(false);
  const prevCriticalRef = useRef(0);

  const refreshAlerts = useCallback(async () => {
    try {
      const state = await alertUnifiedService.getAlertState();
      setAlertState(state);
      const criticalOverdue = state.pendingTasks.filter(
        (t) => t.urgency === "OVERDUE" && t.priority === "CRITICA",
      ).length;
      if (criticalOverdue > prevCriticalRef.current) {
        playAlertSound("TASK_CRITICAL_NEW", { critical: true });
        vibrateAlert();
      } else if (state.overdueTaskCount > prevCriticalRef.current) {
        playAlertSound("TASK_OVERDUE", { critical: false });
      }
      prevCriticalRef.current = state.overdueTaskCount;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    const unsub = alertUnifiedService.subscribeToAlerts((state) => {
      setAlertState(state);
      setLoading(false);
    });
    return unsub;
  }, [session?.user?.id]);

  const markSystemNotificationRead = useCallback(async (id: string) => {
    setAlertState((prev) => ({
      ...prev,
      systemNotifications: prev.systemNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadSystemCount: Math.max(0, prev.unreadSystemCount - 1),
    }));
    await alertUnifiedService.systemService.markAsRead(id);
  }, []);

  const markAllSystemNotificationsRead = useCallback(async () => {
    setAlertState((prev) => ({
      ...prev,
      systemNotifications: prev.systemNotifications.map((n) => ({ ...n, read: true })),
      unreadSystemCount: 0,
    }));
    await alertUnifiedService.systemService.markAllAsRead();
  }, []);

  const dismissSystemNotification = useCallback(async (id: string) => {
    setAlertState((prev) => {
      const systemNotifications = prev.systemNotifications.filter((n) => n.id !== id);
      return {
        ...prev,
        systemNotifications,
        unreadSystemCount: systemNotifications.filter((n) => !n.read).length,
      };
    });
    await alertUnifiedService.systemService.dismissNotification(id);
  }, []);

  const completeTask = useCallback(async (id: string) => {
    await alertUnifiedService.taskService.completeTask(id);
    await refreshAlerts();
  }, [refreshAlerts]);

  const snoozeTask = useCallback(async (id: string, hours = 1) => {
    const until = new Date(Date.now() + hours * 3600_000).toISOString().slice(0, 10);
    await alertUnifiedService.taskService.snoozeTask(id, until);
    await refreshAlerts();
  }, [refreshAlerts]);

  const fabConfig = useMemo(() => getFABConfig(alertState), [alertState]);
  const urgentTasks = useMemo(
    () =>
      alertState.pendingTasks.filter((t) =>
        ["OVERDUE", "TODAY", "TOMORROW"].includes(t.urgency),
      ),
    [alertState.pendingTasks],
  );

  const value = useMemo(
    () => ({
      alertState,
      loading,
      fabConfig,
      urgentTasks,
      fabDrawerOpen,
      setFabDrawerOpen,
      markSystemNotificationRead,
      markAllSystemNotificationsRead,
      dismissSystemNotification,
      completeTask,
      snoozeTask,
      refreshAlerts,
    }),
    [
      alertState,
      loading,
      fabConfig,
      urgentTasks,
      fabDrawerOpen,
      markSystemNotificationRead,
      markAllSystemNotificationsRead,
      dismissSystemNotification,
      completeTask,
      snoozeTask,
      refreshAlerts,
    ],
  );

  return <AlertSystemContext.Provider value={value}>{children}</AlertSystemContext.Provider>;
}

export function useAlertSystem() {
  const ctx = useContext(AlertSystemContext);
  if (!ctx) throw new Error("useAlertSystem debe usarse dentro de AlertSystemProvider");
  return ctx;
}

export function useAlertBadge(type: "tasks" | "notifications") {
  const { alertState } = useAlertSystem();
  const today = new Date().toISOString().slice(0, 10);
  const threeDays = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);

  if (type === "tasks") {
    const nearTasks = alertState.pendingTasks.filter(
      (t) => !t.dueDate || t.dueDate <= threeDays || t.dueDate <= today,
    );
    const count = nearTasks.length || alertState.pendingTaskCount;
    const vencidas = alertState.overdueTaskCount;
    return {
      count,
      showBadge: count > 0,
      isPulsing: vencidas > 0,
      color: vencidas > 0 ? "#FF0000" : "#FF3333",
      tooltip: `${count} tareas pendientes${vencidas ? ` (${vencidas} vencida${vencidas > 1 ? "s" : ""})` : ""}`,
    };
  }

  const count = alertState.unreadSystemCount;
  return {
    count,
    showBadge: count > 0,
    isPulsing: false,
    color: "#00D4FF",
    tooltip: `${count} notificación${count !== 1 ? "es" : ""} del sistema sin leer`,
  };
}

export function useFAB() {
  const { fabConfig, urgentTasks, fabDrawerOpen, setFabDrawerOpen } = useAlertSystem();
  return {
    visible: fabConfig.visible,
    badgeCount: fabConfig.badgeCount,
    badgeColor: fabConfig.backgroundColor,
    isPulsing: fabConfig.isPulsing,
    isShaking: fabConfig.isShaking,
    tooltip: fabConfig.tooltip,
    urgentTasks,
    drawerOpen: fabDrawerOpen,
    openDrawer: () => setFabDrawerOpen(true),
    closeDrawer: () => setFabDrawerOpen(false),
  };
}
