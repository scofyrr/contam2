import type { SoundPreferences } from "@/modules/notificaciones/types/alert-system";
import { DEFAULT_SOUND_PREFERENCES } from "@/modules/notificaciones/types/alert-system";

const SOUND_PREFS_KEY = "contam-alert-sound-prefs";

export const ALERT_SOUNDS = {
  TASK_OVERDUE: "/sounds/task-overdue.mp3",
  TASK_CRITICAL_NEW: "/sounds/task-critical.mp3",
  SYSTEM_NOTIFICATION: "/sounds/system-notif.mp3",
  SYSTEM_ERROR: "/sounds/system-error.mp3",
} as const;

export type AlertSoundKey = keyof typeof ALERT_SOUNDS;

export function readSoundPreferences(): SoundPreferences {
  if (typeof window === "undefined") return DEFAULT_SOUND_PREFERENCES;
  try {
    const raw = localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return DEFAULT_SOUND_PREFERENCES;
    return { ...DEFAULT_SOUND_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_PREFERENCES;
  }
}

export function writeSoundPreferences(prefs: Partial<SoundPreferences>): SoundPreferences {
  const next = { ...readSoundPreferences(), ...prefs };
  localStorage.setItem(SOUND_PREFS_KEY, JSON.stringify(next));
  return next;
}

function inQuietHours(prefs: SoundPreferences): boolean {
  if (!prefs.quietHours) return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = prefs.quietHours.start.split(":").map(Number);
  const [eh, em] = prefs.quietHours.end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start <= end) return mins >= start && mins <= end;
  return mins >= start || mins <= end;
}

export function playAlertSound(key: AlertSoundKey, opts?: { critical?: boolean }): void {
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
      /* archivo opcional / autoplay bloqueado */
    });
  } catch {
    /* ignore */
  }
}

export function vibrateAlert(pattern: number | number[] = [80, 40, 80]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
