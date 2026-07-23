import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { a as alertUnifiedService, g as getFABConfig } from "./notification-dual-service-q2OTmUpN.js";
import { ar as useSession } from "./router-DdOnzL1Y.js";
const DEFAULT_SOUND_PREFERENCES = {
  enabled: false,
  taskSounds: true,
  systemSounds: true,
  criticalOnly: true,
  volume: 0.4,
  quietHours: null
};
const SOUND_PREFS_KEY = "contam-alert-sound-prefs";
const ALERT_SOUNDS = {
  TASK_OVERDUE: "/sounds/task-overdue.mp3",
  TASK_CRITICAL_NEW: "/sounds/task-critical.mp3",
  SYSTEM_NOTIFICATION: "/sounds/system-notif.mp3",
  SYSTEM_ERROR: "/sounds/system-error.mp3"
};
function readSoundPreferences() {
  if (typeof window === "undefined") return DEFAULT_SOUND_PREFERENCES;
  try {
    const raw = localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return DEFAULT_SOUND_PREFERENCES;
    return { ...DEFAULT_SOUND_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_PREFERENCES;
  }
}
function inQuietHours(prefs) {
  if (!prefs.quietHours) return false;
  const now = /* @__PURE__ */ new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = prefs.quietHours.start.split(":").map(Number);
  const [eh, em] = prefs.quietHours.end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start <= end) return mins >= start && mins <= end;
  return mins >= start || mins <= end;
}
function playAlertSound(key, opts) {
  const prefs = readSoundPreferences();
  if (!prefs.enabled || inQuietHours(prefs)) return;
  if (key.startsWith("TASK") && !prefs.taskSounds) return;
  if (key.startsWith("SYSTEM") && !prefs.systemSounds) return;
  if (prefs.criticalOnly && key.startsWith("TASK") && !opts?.critical) return;
  const src = ALERT_SOUNDS[key];
  try {
    const audio = new Audio(src);
    audio.volume = prefs.volume;
    void audio.play().catch(() => {
    });
  } catch {
  }
}
function vibrateAlert(pattern = [80, 40, 80]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
const EMPTY_STATE = {
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
  lastUpdated: 0
};
const AlertSystemContext = reactExports.createContext(null);
function AlertSystemProvider({ children }) {
  const { session } = useSession();
  const [alertState, setAlertState] = reactExports.useState(EMPTY_STATE);
  const [loading, setLoading] = reactExports.useState(true);
  const [fabDrawerOpen, setFabDrawerOpen] = reactExports.useState(false);
  const prevCriticalRef = reactExports.useRef(0);
  const refreshAlerts = reactExports.useCallback(async () => {
    try {
      const state = await alertUnifiedService.getAlertState();
      setAlertState(state);
      const criticalOverdue = state.pendingTasks.filter(
        (t) => t.urgency === "OVERDUE" && t.priority === "CRITICA"
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
  reactExports.useEffect(() => {
    if (!session?.user?.id) return;
    const unsub = alertUnifiedService.subscribeToAlerts((state) => {
      setAlertState(state);
      setLoading(false);
    });
    return unsub;
  }, [session?.user?.id]);
  const markSystemNotificationRead = reactExports.useCallback(async (id) => {
    setAlertState((prev) => ({
      ...prev,
      systemNotifications: prev.systemNotifications.map(
        (n) => n.id === id ? { ...n, read: true } : n
      ),
      unreadSystemCount: Math.max(0, prev.unreadSystemCount - 1)
    }));
    await alertUnifiedService.systemService.markAsRead(id);
  }, []);
  const markAllSystemNotificationsRead = reactExports.useCallback(async () => {
    setAlertState((prev) => ({
      ...prev,
      systemNotifications: prev.systemNotifications.map((n) => ({ ...n, read: true })),
      unreadSystemCount: 0
    }));
    await alertUnifiedService.systemService.markAllAsRead();
  }, []);
  const dismissSystemNotification = reactExports.useCallback(async (id) => {
    setAlertState((prev) => {
      const systemNotifications = prev.systemNotifications.filter((n) => n.id !== id);
      return {
        ...prev,
        systemNotifications,
        unreadSystemCount: systemNotifications.filter((n) => !n.read).length
      };
    });
    await alertUnifiedService.systemService.dismissNotification(id);
  }, []);
  const completeTask = reactExports.useCallback(async (id) => {
    await alertUnifiedService.taskService.completeTask(id);
    await refreshAlerts();
  }, [refreshAlerts]);
  const snoozeTask = reactExports.useCallback(async (id, hours = 1) => {
    const until = new Date(Date.now() + hours * 36e5).toISOString().slice(0, 10);
    await alertUnifiedService.taskService.snoozeTask(id, until);
    await refreshAlerts();
  }, [refreshAlerts]);
  const fabConfig = reactExports.useMemo(() => getFABConfig(alertState), [alertState]);
  const urgentTasks = reactExports.useMemo(
    () => alertState.pendingTasks.filter(
      (t) => ["OVERDUE", "TODAY", "TOMORROW"].includes(t.urgency)
    ),
    [alertState.pendingTasks]
  );
  const value = reactExports.useMemo(
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
      refreshAlerts
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
      refreshAlerts
    ]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertSystemContext.Provider, { value, children });
}
function useAlertSystem() {
  const ctx = reactExports.useContext(AlertSystemContext);
  if (!ctx) throw new Error("useAlertSystem debe usarse dentro de AlertSystemProvider");
  return ctx;
}
function useAlertBadge(type) {
  const { alertState } = useAlertSystem();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const threeDays = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  if (type === "tasks") {
    const nearTasks = alertState.pendingTasks.filter(
      (t) => !t.dueDate || t.dueDate <= threeDays || t.dueDate <= today
    );
    const count2 = nearTasks.length || alertState.pendingTaskCount;
    const vencidas = alertState.overdueTaskCount;
    return {
      count: count2,
      showBadge: count2 > 0,
      isPulsing: vencidas > 0,
      color: vencidas > 0 ? "#FF0000" : "#FF3333",
      tooltip: `${count2} tareas pendientes${vencidas ? ` (${vencidas} vencida${vencidas > 1 ? "s" : ""})` : ""}`
    };
  }
  const count = alertState.unreadSystemCount;
  return {
    count,
    showBadge: count > 0,
    isPulsing: false,
    color: "#00D4FF",
    tooltip: `${count} notificación${count !== 1 ? "es" : ""} del sistema sin leer`
  };
}
function useFAB() {
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
    closeDrawer: () => setFabDrawerOpen(false)
  };
}
export {
  AlertSystemProvider as A,
  useAlertSystem as a,
  useFAB as b,
  useAlertBadge as u
};
