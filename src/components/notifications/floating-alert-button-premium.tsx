import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Clock,
  ClipboardList,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFAB, useAlertSystem } from "@/hooks/use-alert-system";
import { cn } from "@/lib/utils";
import type { PendingTask } from "@/modules/notificaciones/types/alert-system";

const FAB_POS_KEY = "contam-fab-position";

type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNER_CLASS: Record<Corner, string> = {
  "bottom-right": "right-6 bottom-24",
  "bottom-left": "left-6 bottom-24",
  "top-right": "right-6 top-24",
  "top-left": "left-6 top-24",
};

function urgencyLabel(task: PendingTask): string {
  if (task.urgency === "OVERDUE") return "VENCIDA";
  if (task.urgency === "TODAY") return "VENCE HOY";
  if (task.urgency === "TOMORROW") return "VENCE MAÑANA";
  return "PRÓXIMA";
}

function TaskCard({
  task,
  onComplete,
  onSnooze,
}: {
  task: PendingTask;
  onComplete: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-[#0D1525]/80 p-3 space-y-2"
      style={{ borderLeftColor: task.badgeColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-wide" style={{ color: task.badgeColor }}>
            {task.priority} · {urgencyLabel(task)}
          </p>
          <p className="text-sm font-medium text-[#E8EDF5] mt-0.5">{task.title}</p>
          {task.rucName && (
            <p className="text-xs text-[#8899B4] mt-1">
              {task.rucName}
              {task.ruc ? ` · ${task.ruc}` : ""}
            </p>
          )}
          {task.dueDate && (
            <p className="text-[10px] text-[#8899B4] mt-1 flex items-center gap-1">
              <Clock className="size-3" />
              {task.urgency === "OVERDUE" ? "Vencida" : "Vence"}: {task.dueDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {task.metadata?.link && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#00D4FF]" asChild>
            <Link to={task.metadata.link}>
              Ir al módulo
              <ExternalLink className="size-3 ml-1" />
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSnooze(task.id)}
        >
          Posponer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-emerald-400"
          onClick={() => onComplete(task.id)}
        >
          <Check className="size-3 mr-1" />
          Hecho
        </Button>
      </div>
    </div>
  );
}

export function FloatingAlertButtonPremium() {
  const {
    visible,
    badgeCount,
    badgeColor,
    isPulsing,
    isShaking,
    tooltip,
    urgentTasks,
    drawerOpen,
    openDrawer,
    closeDrawer,
  } = useFAB();
  const { completeTask, snoozeTask, alertState } = useAlertSystem();
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const saved = localStorage.getItem(FAB_POS_KEY) as Corner | null;
    if (saved && CORNER_CLASS[saved]) setCorner(saved);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    setDragging(false);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = Math.abs(e.clientX - dragRef.current.x);
      const dy = Math.abs(e.clientY - dragRef.current.y);
      dragRef.current = null;
      if (dx > 8 || dy > 8) {
        setDragging(true);
        const cx = e.clientX;
        const cy = e.clientY;
        const w = window.innerWidth;
        const h = window.innerHeight;
        let next: Corner = "bottom-right";
        if (cx < w / 2 && cy < h / 2) next = "top-left";
        else if (cx >= w / 2 && cy < h / 2) next = "top-right";
        else if (cx < w / 2) next = "bottom-left";
        setCorner(next);
        localStorage.setItem(FAB_POS_KEY, next);
        return;
      }
      openDrawer();
    },
    [openDrawer],
  );

  const handleDoubleClick = useCallback(() => {
    const top = urgentTasks[0] ?? alertState.pendingTasks[0];
    if (top) void snoozeTask(top.id, 1);
  }, [urgentTasks, alertState.pendingTasks, snoozeTask]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const choice = window.prompt(
        "Alertas: 1=Ver todas 2=Posponer 1h 3=Silenciar hasta mañana 4=Configurar",
      );
      if (choice === "1") window.location.href = "/tareas";
      else if (choice === "2") {
        const top = urgentTasks[0];
        if (top) void snoozeTask(top.id, 1);
      } else if (choice === "3") {
        const top = urgentTasks[0];
        if (top) void snoozeTask(top.id, 24);
      } else if (choice === "4") window.location.href = "/mi-cuenta";
    },
    [urgentTasks, snoozeTask],
  );

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        title={tooltip}
        aria-label={tooltip}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "fixed z-[9999] flex flex-col items-center justify-center size-14 rounded-2xl border border-white/10 shadow-lg transition-transform hover:scale-105 fab-enter",
          CORNER_CLASS[corner],
          !reducedMotion && isPulsing && "animate-pulse-red",
          !reducedMotion && isShaking && !dragging && "animate-shake-alert",
        )}
        style={{
          backgroundColor: badgeColor,
          boxShadow:
            badgeColor.includes("FF")
              ? "0 4px 20px rgba(255, 0, 0, 0.35)"
              : "0 4px 16px rgba(0, 0, 0, 0.25)",
        }}
      >
        <ClipboardList className="size-6 text-white" strokeWidth={1.75} />
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-white text-[#FF0000] text-[11px] font-bold flex items-center justify-center">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      <Sheet open={drawerOpen} onOpenChange={(o) => (o ? openDrawer() : closeDrawer())}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-[#1A2740]/60 bg-[#0D1525]/98 backdrop-blur-xl p-0"
        >
          <SheetHeader className="px-4 py-4 border-b border-[#1A2740]/60">
            <SheetTitle className="flex items-center gap-2 text-[#E8EDF5]">
              <AlertTriangle className="size-4 text-[#FF6B00]" />
              Tareas urgentes ({urgentTasks.length || badgeCount})
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 max-h-[calc(100vh-10rem)] px-4 py-3">
            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <p className="text-sm text-[#8899B4] text-center py-8">
                  Sin tareas urgentes por ahora
                </p>
              ) : (
                urgentTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onComplete={(id) => void completeTask(id)}
                    onSnooze={(id) => void snoozeTask(id, 1)}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#1A2740]/60 px-4 py-3 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-[#00D4FF]" asChild>
              <Link to="/tareas" onClick={closeDrawer}>
                Ver todas las tareas ({alertState.pendingTaskCount})
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
              <Link to="/mi-cuenta" onClick={closeDrawer}>
                <Settings className="size-3 mr-2" />
                Configurar alertas
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default FloatingAlertButtonPremium;
