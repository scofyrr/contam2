/** Tipos del sistema dual: notificaciones informativas vs tareas accionables. */

export type SystemNotificationType =
  | "SYNC_SUCCESS"
  | "SYNC_ERROR"
  | "SYSTEM_UPDATE"
  | "BACKUP_COMPLETE"
  | "MIGRATION_EXECUTED"
  | "USER_CREATED"
  | "USER_DISABLED"
  | "ROLE_CHANGED"
  | "SECURITY_ALERT"
  | "FEATURE_FLAG_CHANGED"
  | "ERROR_CRITICAL"
  | "MAINTENANCE_SCHEDULED"
  | "GENERAL";

export type SystemNotificationPriority = "LOW" | "NORMAL" | "HIGH";

export interface SystemNotification {
  id: string;
  type: SystemNotificationType;
  title: string;
  message: string;
  priority: SystemNotificationPriority;
  read: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt: string;
  metadata?: {
    module?: string;
    affectedUser?: string;
    details?: string;
    link?: string;
  };
  icon: string;
  color: string;
  sound?: "subtle" | "none";
}

export type TaskUrgency = "OVERDUE" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING";

export type PendingTaskModule =
  | "SIRE"
  | "DIARIO"
  | "CAJA"
  | "PCGE"
  | "FICHA_RUC"
  | "TAREAS"
  | "CONCILIACION"
  | "GENERAL";

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  module: PendingTaskModule;
  priority: "CRITICA" | "ALTA" | "MEDIA" | "BAJA";
  urgency: TaskUrgency;
  dueDate: string;
  ruc?: string;
  rucName?: string;
  amount?: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  metadata?: {
    sireRegistroId?: string;
    asientoId?: string;
    movimientoId?: string;
    link?: string;
  };
  badgeColor: string;
  pulseAnimation: boolean;
  shakeAnimation: boolean;
}

export interface AlertState {
  systemNotifications: SystemNotification[];
  pendingTasks: PendingTask[];
  unreadSystemCount: number;
  pendingTaskCount: number;
  overdueTaskCount: number;
  criticalTaskCount: number;
  todayTaskCount: number;
  fabVisible: boolean;
  fabBadgeCount: number;
  fabPulsing: boolean;
  lastUpdated: number;
}

export interface FABConfig {
  visible: boolean;
  badgeCount: number;
  backgroundColor: string;
  isPulsing: boolean;
  isShaking: boolean;
  tooltip: string;
}

export interface CreateSystemNotification {
  type: SystemNotificationType;
  title: string;
  message: string;
  priority?: SystemNotificationPriority;
  metadata?: SystemNotification["metadata"];
}

export interface SoundPreferences {
  enabled: boolean;
  taskSounds: boolean;
  systemSounds: boolean;
  criticalOnly: boolean;
  volume: number;
  quietHours: { start: string; end: string } | null;
}

export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: false,
  taskSounds: true,
  systemSounds: true,
  criticalOnly: true,
  volume: 0.4,
  quietHours: null,
};
