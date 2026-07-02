import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificacionCorreo } from "@/modules/notificaciones/types/notifications";

export const Route = createFileRoute("/_app/notificaciones")({
  component: NotificacionesPage,
});

function groupLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yday = new Date(today);
  yday.setDate(yday.getDate() - 1);
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  if (dt.getTime() === today.getTime()) return "Hoy";
  if (dt.getTime() === yday.getTime()) return "Ayer";
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (dt >= weekAgo) return "Esta semana";
  return d.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

function NotificacionesPage() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas, conectado } = useNotifications();
  const [filtro, setFiltro] = useState<"todas" | "no_leidas">("todas");
  const [modulo, setModulo] = useState("todos");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = [...notificaciones];
    if (filtro === "no_leidas") list = list.filter((n) => !n.leida);
    if (modulo !== "todos") list = list.filter((n) => n.metadata.modulo === modulo || n.tipo.includes(modulo));
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((n) => n.titulo.toLowerCase().includes(s) || n.mensaje.toLowerCase().includes(s));
    }
    return list;
  }, [notificaciones, filtro, modulo, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificacionCorreo[]>();
    for (const n of filtered) {
      const g = groupLabel(n.fecha_creacion);
      const arr = map.get(g) ?? [];
      arr.push(n);
      map.set(g, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2 text-[#E8EDF5]">
            <Bell className="size-7 text-[#00C8FF]" />
            Notificaciones
          </h1>
          <p className={cn("text-xs mt-1", conectado ? "text-emerald-400" : "text-[#8899B4]")}>
            {conectado ? "● Conectado" : "○ Modo offline (localStorage)"} · {noLeidas} sin leer
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10"
          onClick={() => {
            void marcarTodasLeidas();
            toast.success("Marcadas como leídas");
          }}
          disabled={noLeidas === 0}
        >
          <Check className="size-4 mr-1" />
          Marcar todas
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute left-2.5 top-2.5 text-[#8899B4]" />
          <Input
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 bg-white/[0.03] border-white/10"
          />
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
          <SelectTrigger className="w-36 bg-white/[0.03] border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="no_leidas">No leídas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modulo} onValueChange={setModulo}>
          <SelectTrigger className="w-36 bg-white/[0.03] border-white/10">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="SIRE">SIRE</SelectItem>
            <SelectItem value="TAREA">Tareas</SelectItem>
            <SelectItem value="CIERRE">Cierre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {notificaciones.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
          ))}
          <p className="text-center text-sm text-[#8899B4] py-4">No hay notificaciones aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([grupo, items]) => (
            <section key={grupo}>
              <h2 className="text-xs uppercase tracking-wider text-[#8899B4] mb-2">{grupo}</h2>
              <div className="space-y-2">
                {items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void marcarLeida(n.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-4 transition-colors",
                      "border-white/[0.06] hover:bg-white/[0.04]",
                      !n.leida && "bg-white/[0.03] border-[#00C8FF]/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-1">
                          {n.tipo.replace(/_/g, " ")}
                        </Badge>
                        <p className="font-medium text-[#E8EDF5]">{n.titulo}</p>
                        <p className="text-sm text-[#8899B4] mt-1">{n.mensaje}</p>
                      </div>
                      {!n.leida && <span className="size-2 rounded-full bg-[#00C8FF] shrink-0 mt-1" />}
                    </div>
                    {n.metadata.linkNavegacion ? (
                      <Link
                        to={n.metadata.linkNavegacion as "/tareas"}
                        className="text-xs text-[#00C8FF] mt-2 inline-block hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ir →
                      </Link>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
