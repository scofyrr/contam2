import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";

import { useNotifications, type EmailNotification, type PendingTask, type SystemAlert } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SeverityIcon({ severity }: { severity: SystemAlert["severity"] }) {
  if (severity === "critical") return <ShieldAlert className="size-4 text-red-500 shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
  return <CheckCircle2 className="size-4 text-blue-500 shrink-0" />;
}

function EmailItem({ email, onRead }: { email: EmailNotification; onRead: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRead(email.id)}
      className={cn(
        "w-full text-left rounded-lg p-3 transition-colors hover:bg-muted/60",
        !email.read && "bg-primary/5 border border-primary/10",
      )}
    >
      <div className="flex items-start gap-2">
        <Mail className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground truncate">{email.from}</span>
            {!email.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
          </div>
          <p className="text-sm font-medium mt-0.5 truncate">{email.subject}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{email.preview}</p>
          <p className="text-[0.7rem] text-muted-foreground/70 mt-1.5">{formatDate(email.date)}</p>
        </div>
      </div>
    </button>
  );
}

function AlertItem({ alert }: { alert: SystemAlert }) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 border",
        alert.severity === "critical" && "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
        alert.severity === "warning" && "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30",
        alert.severity === "info" && "border-border bg-muted/30",
      )}
    >
      <div className="flex items-start gap-2">
        <SeverityIcon severity={alert.severity} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
          <p className="text-[0.7rem] text-muted-foreground/70 mt-1.5">{formatDate(alert.date)}</p>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: PendingTask }) {
  const isOverdue = new Date(task.plazoVencimiento) < new Date();

  return (
    <div
      className={cn(
        "rounded-lg p-3 border space-y-2",
        task.critical
          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{task.entidad}</p>
          <p className="text-xs text-primary font-medium mt-0.5">{task.tramite}</p>
        </div>
        {task.critical && (
          <Badge variant="destructive" className="shrink-0 text-[0.65rem]">
            Crítica
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{task.problema}</p>

      <div className="flex flex-wrap gap-3 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          Tramitar: {formatShortDate(task.fechaTramitar)}
        </span>
        <span className={cn("flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
          <Clock className="size-3" />
          Vence: {formatShortDate(task.plazoVencimiento)}
          {isOverdue && " (vencido)"}
        </span>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("correos");
  const { emails, alerts, pendingTasks, criticalAlertCount, institutionalEmail, markEmailRead } =
    useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Abrir panel de notificaciones"
        >
          <Bell className="size-5" />
          {criticalAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-600 text-white text-[0.65rem] font-bold shadow-md shadow-red-600/40 ring-2 ring-background animate-in zoom-in-50">
              {criticalAlertCount > 9 ? "9+" : criticalAlertCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[420px] p-0 shadow-xl border-border/80"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="font-display font-semibold text-sm">Notificaciones</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Correos institucionales y alertas del sistema
            </p>
          </div>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-3">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="correos" className="text-xs gap-1.5">
              <Mail className="size-3.5" />
              Correos
              {emails.filter((e) => !e.read).length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[0.6rem]">
                  {emails.filter((e) => !e.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alertas" className="text-xs gap-1.5">
              <ShieldAlert className="size-3.5" />
              Alertas del Sistema
              {alerts.filter((a) => a.severity === "critical").length > 0 && (
                <Badge variant="destructive" className="h-4 px-1 text-[0.6rem]">
                  {alerts.filter((a) => a.severity === "critical").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="correos" className="mt-3">
            {!institutionalEmail ? (
              <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
                <Mail className="size-8 text-muted-foreground/50 mx-auto" />
                <div>
                  <p className="text-sm font-medium">Sin correo institucional configurado</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Configure su correo Gmail institucional en Mi Cuenta para recibir mensajes
                    extraídos automáticamente.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild onClick={() => setOpen(false)}>
                  <Link to="/mi-cuenta">
                    <Settings className="size-3.5 mr-1.5" />
                    Ir a Mi Cuenta
                  </Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[200px] pr-2">
                <div className="space-y-1">
                  {emails.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No hay correos nuevos.</p>
                  ) : (
                    emails.map((email) => (
                      <EmailItem key={email.id} email={email} onRead={markEmailRead} />
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="alertas" className="mt-3">
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-3" />

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Tareas Pendientes</h4>
            <Badge variant="outline" className="text-[0.65rem] ml-auto">
              {pendingTasks.length}
            </Badge>
          </div>
          <ScrollArea className="h-[180px] pr-2">
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
