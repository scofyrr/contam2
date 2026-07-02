import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificacionCorreo } from "@/modules/notificaciones/types/notifications";

const PRIORIDAD_BADGE: Record<string, string> = {
  CRITICA: "bg-[#FF4757]/20 text-[#FF4757] border-[#FF4757]/40 animate-pulse",
  ALTA: "bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40",
  MEDIA: "bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/40",
  BAJA: "bg-[#8899B4]/20 text-[#8899B4] border-[#8899B4]/40",
  urgente: "bg-[#FF4757]/20 text-[#FF4757]",
  alta: "bg-[#F5A623]/20 text-[#F5A623]",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "AHORA";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days}d`;
}

function NotifItem({
  n,
  onRead,
}: {
  n: NotificacionCorreo;
  onRead: (id: string, link?: string) => void;
}) {
  const prioridad = n.metadata.prioridad ?? (n.tipo === "TAREA_VENCIDA" ? "CRITICA" : "MEDIA");
  return (
    <button
      type="button"
      onClick={() => onRead(n.id, n.metadata.linkNavegacion)}
      className={cn(
        "w-full text-left rounded-lg p-3 border transition-all duration-200",
        "border-[#1A2740]/60 hover:bg-white/[0.06]",
        !n.leida ? "bg-white/[0.04]" : "bg-transparent opacity-80",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1 size-2 rounded-full shrink-0",
            !n.leida ? "bg-[#00C8FF] animate-pulse" : "bg-[#8899B4]",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={cn("text-[9px]", PRIORIDAD_BADGE[prioridad] ?? PRIORIDAD_BADGE.MEDIA)}>
              {n.tipo.replace(/_/g, " ")}
            </Badge>
            <span className="text-[10px] text-[#8899B4]">{relativeTime(n.fecha_creacion)}</span>
          </div>
          <p className="text-sm font-medium mt-1 line-clamp-1">{n.titulo}</p>
          <p className="text-xs text-[#8899B4] mt-0.5 line-clamp-2">{n.mensaje}</p>
          {n.metadata.linkNavegacion ? (
            <Link
              to={n.metadata.linkNavegacion as "/tareas"}
              className="text-[10px] text-[#00C8FF] mt-2 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Ir →
            </Link>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function NotificationCenterPremium() {
  const [open, setOpen] = useState(false);
  const {
    notificaciones,
    noLeidas,
    conectado,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotifications();

  const visibles = useMemo(() => notificaciones.slice(0, 5), [notificaciones]);
  const hasMany = noLeidas > 5;

  const handleRead = async (id: string, link?: string) => {
    await marcarLeida(id);
    if (link) setOpen(false);
  };

  const handleMarkAll = async () => {
    await marcarTodasLeidas();
    toast.success("Todas marcadas como leídas");
  };

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
          aria-label={`Notificaciones${noLeidas ? `, ${noLeidas} sin leer` : ""}`}
        >
          <Bell className={cn("size-5", noLeidas > 0 && "animate-[wiggle_1s_ease-in-out_infinite]")} />
          {noLeidas > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full text-white text-[0.65rem] font-bold ring-2 ring-background",
                hasMany ? "bg-[#FF4757] animate-pulse" : "bg-[#00C8FF]",
              )}
            >
              {noLeidas > 99 ? "!" : noLeidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[400px] p-0 border-[#1A2740]/60 bg-[#0D1525]/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A2740]/60">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#00C8FF]" />
            <h3 className="font-semibold text-sm text-[#E8EDF5]">Notificaciones</h3>
            <span className={cn("text-[10px]", conectado ? "text-emerald-400" : "text-[#8899B4]")}>
              {conectado ? "● Conectado" : "○ Sin conexión"}
            </span>
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
              onClick={() => void handleMarkAll()}
              title="Marcar todas como leídas"
              disabled={noLeidas === 0}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[360px] px-3 py-2">
          <div className="space-y-2 group">
            {visibles.length === 0 ? (
              <p className="text-sm text-[#8899B4] text-center py-8">Sin notificaciones</p>
            ) : (
              visibles.map((n) => <NotifItem key={n.id} n={n} onRead={handleRead} />)
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-[#1A2740]/60 px-4 py-3 flex flex-col gap-1">
          <Button variant="ghost" size="sm" className="justify-start text-xs text-[#00C8FF]" asChild>
            <Link to="/notificaciones" onClick={() => setOpen(false)}>
              Ver todas las notificaciones →
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenterPremium;
