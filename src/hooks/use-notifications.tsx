import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const INSTITUTIONAL_EMAIL_KEY = "contam-institutional-email";

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

const MOCK_EMAILS: EmailNotification[] = [
  {
    id: "em-1",
    from: "sire@sunat.gob.pe",
    subject: "Recordatorio: carga de RVIE periodo 202506",
    preview: "Estimado contribuyente, recuerde completar la carga de registros de ventas antes del cierre del periodo tributario.",
    date: "2026-06-27T09:15:00",
    read: false,
  },
  {
    id: "em-2",
    from: "contabilidad@empresa.pe",
    subject: "Comprobantes pendientes de clasificación PCGE",
    preview: "Se detectaron 4 facturas sin cuenta contable asignada en el módulo de Libro Diario.",
    date: "2026-06-26T14:30:00",
    read: false,
  },
  {
    id: "em-3",
    from: "tesoreria@empresa.pe",
    subject: "Conciliación bancaria junio 2026",
    preview: "Favor de revisar los movimientos del BCP cuenta corriente con saldo diferencial de S/ 1,250.00.",
    date: "2026-06-25T11:00:00",
    read: true,
  },
];

const MOCK_ALERTS: SystemAlert[] = [
  {
    id: "al-1",
    title: "Asiento contable incompleto",
    message: "El asiento AS-2026-0342 tiene líneas sin cuenta de contrapartida en la Clase 12 (Cuentas por cobrar).",
    severity: "critical",
    date: "2026-06-28T08:00:00",
  },
  {
    id: "al-2",
    title: "Revisión SIRE incompleta",
    message: "El periodo 202506 de RVIE tiene 12 registros sin validar en el módulo Registros SIRE.",
    severity: "critical",
    date: "2026-06-27T16:45:00",
  },
  {
    id: "al-3",
    title: "Proceso contable pendiente",
    message: "3 comprobantes de compra del RUC 20123456789 no tienen asiento generado en Libro Diario.",
    severity: "warning",
    date: "2026-06-27T10:20:00",
  },
  {
    id: "al-4",
    title: "Libro Caja desactualizado",
    message: "Existen movimientos de caja del 25/06 sin conciliar con el Libro Diario.",
    severity: "info",
    date: "2026-06-26T09:00:00",
  },
];

const MOCK_TASKS: PendingTask[] = [
  {
    id: "tk-1",
    entidad: "EMPRESA DEMO SAC (20123456789)",
    tramite: "Validación RVIE periodo 202506",
    fechaTramitar: "2026-06-30",
    problema: "12 registros de ventas sin código de operación SUNAT asignado.",
    plazoVencimiento: "2026-07-05",
    critical: true,
  },
  {
    id: "tk-2",
    entidad: "COMERCIAL LIMA EIRL (20987654321)",
    tramite: "Cierre de asiento AS-2026-0342",
    fechaTramitar: "2026-06-28",
    problema: "Falta contrapartida en cuenta 1211 — Facturas por cobrar.",
    plazoVencimiento: "2026-06-30",
    critical: true,
  },
  {
    id: "tk-3",
    entidad: "SERVICIOS ANDINOS SAC (20555666777)",
    tramite: "Registro de pagos a proveedores",
    fechaTramitar: "2026-07-02",
    problema: "3 facturas de compra sin pago registrado en Libro Caja.",
    plazoVencimiento: "2026-07-10",
    critical: false,
  },
];

type NotificationsContextValue = {
  institutionalEmail: string;
  setInstitutionalEmail: (email: string) => void;
  emails: EmailNotification[];
  alerts: SystemAlert[];
  pendingTasks: PendingTask[];
  criticalAlertCount: number;
  markEmailRead: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function readEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(INSTITUTIONAL_EMAIL_KEY) ?? "";
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [institutionalEmail, setEmailState] = useState(readEmail);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [alerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [pendingTasks] = useState<PendingTask[]>(MOCK_TASKS);

  useEffect(() => {
    const stored = readEmail();
    if (stored) setEmails(MOCK_EMAILS);
  }, []);

  const setInstitutionalEmail = useCallback((email: string) => {
    const trimmed = email.trim();
    localStorage.setItem(INSTITUTIONAL_EMAIL_KEY, trimmed);
    setEmailState(trimmed);
    setEmails(trimmed ? MOCK_EMAILS : []);
  }, []);

  const markEmailRead = useCallback((id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  }, []);

  const criticalAlertCount = useMemo(() => {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
    const criticalTasks = pendingTasks.filter((t) => t.critical).length;
    return criticalAlerts + criticalTasks;
  }, [alerts, pendingTasks]);

  const value = useMemo(
    () => ({
      institutionalEmail,
      setInstitutionalEmail,
      emails,
      alerts,
      pendingTasks,
      criticalAlertCount,
      markEmailRead,
    }),
    [institutionalEmail, setInstitutionalEmail, emails, alerts, pendingTasks, criticalAlertCount, markEmailRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
