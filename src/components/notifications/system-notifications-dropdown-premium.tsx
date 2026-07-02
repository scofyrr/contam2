import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpCircle,
  Bell,
  Check,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  UserPlus,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlertSystem, useAlertBadge } from "@/hooks/use-alert-system";
import { cn } from "@/lib/utils";
import type { SystemNotification } from "@/modules/notificaciones/types/alert-system";

const ICON_MAP: Record<string, LucideIcon> = {
  RefreshCw,
  XCircle,
  ArrowUpCircle,
  Save,
  UserPlus,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  Bell,
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  return new Date(iso).toLocaleDateString("es-PE");
}

function SystemNotifRow({
  n,
  onRead,
}: {
  n: SystemNotification;
  onRead: (id: string) => void;
}) {
  const Icon = ICON_MAP[n.icon] ?? Bell;
  return (
    <button
      type="button"
      onClick={() => void onRead(n.id)}
      className={cn(
        "w-full text-left rounded-xl p-3 transition-colors border border-transparent hover:border-[#1A2740]/80",
        n.read ? "opacity-70" : "bg-white/[0.03]",
      )}
    >
      <div className="flex gap-3">
        <div
          className="size-8 rounded-lg grid place-items-center shrink-0"
          style={{ backgroundColor: `${n.color}22`, color: n.color }}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#E8EDF5] truncate">{n.title}</p>
          <p className="text-xs text-[#8899B4] line-clamp-2 mt-0.5">{n.message}</p>
          <p className="text-[10px] text-[#8899B4]/80 mt-1">{formatRelative(n.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}

export function SystemNotificationsDropdownPremium() {
  const [open, setOpen] = useState(false);
  const badge = useAlertBadge("notifications");
  const { alertState, markSystemNotificationRead, markAllSystemNotificationsRead } =
    useAlertSystem();
  const items = alertState.systemNotifications.slice(0, 12);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-xl text-muted-foreground hover:text-foreground",
            open && "bg-white/[0.06]",
          )}
          aria-label={badge.tooltip}
          title={badge.tooltip}
        >
          <Bell className="size-5" />
          {badge.showBadge && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold animate-fade-badge",
              )}
              style={{
                backgroundColor: "rgba(0, 212, 255, 0.2)",
                color: "#00D4FF",
              }}
            >
              {badge.count > 99 ? "99+" : badge.count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[400px] p-0 border-[#1A2740]/60 bg-[#0D1525]/95 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A2740]/60">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-[#00D4FF]" />
            <h3 className="font-semibold text-sm text-[#E8EDF5]">Notificaciones del sistema</h3>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="size-7" asChild title="Preferencias">
              <Link to="/mi-cuenta">
                <Settings className="size-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => void markAllSystemNotificationsRead()}
              title="Marcar todas como leídas"
              disabled={badge.count === 0}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[360px] px-3 py-2">
          {items.length === 0 ? (
            <p className="text-sm text-[#8899B4] text-center py-8">Sin notificaciones del sistema</p>
          ) : (
            <div className="space-y-1">
              {items.map((n) => (
                <SystemNotifRow
                  key={n.id}
                  n={n}
                  onRead={(id) => void markSystemNotificationRead(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-[#1A2740]/60 px-4 py-3">
          <Button variant="ghost" size="sm" className="justify-start text-xs text-[#00D4FF] w-full" asChild>
            <Link to="/notificaciones" onClick={() => setOpen(false)}>
              Ver historial completo →
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarAlertBadge({
  type,
  className,
}: {
  type: "tasks" | "notifications";
  className?: string;
}) {
  const badge = useAlertBadge(type);
  if (!badge.showBadge) return null;

  const isTasks = type === "tasks";
  return (
    <span
      className={cn(
        "absolute top-1.5 right-2 flex items-center justify-center rounded-full font-bold text-white",
        isTasks ? "min-w-5 h-5 text-[10px]" : "min-w-[18px] h-[18px] text-[9px] font-semibold",
        isTasks && badge.isPulsing && "animate-pulse-red",
        className,
      )}
      style={
        isTasks
          ? { backgroundColor: badge.color }
          : { backgroundColor: "rgba(0, 212, 255, 0.2)", color: "#00D4FF" }
      }
      title={badge.tooltip}
    >
      {badge.count > 99 ? "99+" : badge.count}
    </span>
  );
}

export function UrgentTasksTopbarIndicator() {
  const { alertState, setFabDrawerOpen } = useAlertSystem();
  const { overdueTaskCount, todayTaskCount } = alertState;
  if (overdueTaskCount === 0 && todayTaskCount === 0) return null;

  const parts: string[] = [];
  if (overdueTaskCount) parts.push(`${overdueTaskCount} vencida${overdueTaskCount > 1 ? "s" : ""}`);
  if (todayTaskCount) parts.push(`${todayTaskCount} para hoy`);

  return (
    <button
      type="button"
      onClick={() => setFabDrawerOpen(true)}
      className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-3 py-1.5 text-xs text-[#FF6B00] hover:bg-[#FF6B00]/20 transition-colors"
    >
      <AlertTriangle className="size-3.5" />
      {parts.join(" | ")}
    </button>
  );
}

export default SystemNotificationsDropdownPremium;
