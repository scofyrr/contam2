import { useMemo } from "react";
import { CheckCircle2, Pencil, Trash2, AlertTriangle, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TareaPendiente, TareasFiltros } from "@/types/tareas";
import { cn } from "@/lib/utils";

const PRIORIDAD_VARIANT: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
  urgente: "destructive",
  alta: "warning",
  media: "secondary",
  baja: "outline",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

type Props = {
  tareas: TareaPendiente[];
  loading?: boolean;
  filtros: TareasFiltros;
  onFiltrosChange: (f: TareasFiltros) => void;
  onEdit?: (t: TareaPendiente) => void;
  onComplete?: (t: TareaPendiente) => void;
  onDelete?: (t: TareaPendiente) => void;
};

export function ListaTareas({
  tareas,
  loading,
  filtros,
  onFiltrosChange,
  onEdit,
  onComplete,
  onDelete,
}: Props) {
  const rows = useMemo(() => tareas, [tareas]);

  return (
    <div className="surface-panel overflow-hidden">
      <div className="p-4 flex flex-wrap gap-3 border-b">
        <Input
          placeholder="Buscar trámite, entidad, problema…"
          className="max-w-xs h-9"
          value={filtros.busqueda ?? ""}
          onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
        />
        <Select
          value={filtros.estado ?? "todos"}
          onValueChange={(v) =>
            onFiltrosChange({ ...filtros, estado: v as TareasFiltros["estado"] })
          }
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_progreso">En progreso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtros.prioridad ?? "todos"}
          onValueChange={(v) =>
            onFiltrosChange({ ...filtros, prioridad: v as TareasFiltros["prioridad"] })
          }
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtros.orden ?? "reciente"}
          onValueChange={(v) =>
            onFiltrosChange({ ...filtros, orden: v as TareasFiltros["orden"] })
          }
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reciente">Más recientes</SelectItem>
            <SelectItem value="plazo">Por plazo</SelectItem>
            <SelectItem value="prioridad">Por prioridad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Cargando tareas…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trámite</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Plazo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <PremiumEmptyState
                    icon={ClipboardList}
                    title="Sin tareas"
                    description="No hay tareas con los filtros seleccionados."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => (
                <TableRow key={t.id} className={cn(t.vencida && "bg-destructive/5")}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {t.critica && <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />}
                      <div>
                        <div className="font-medium text-sm">{t.titulo ?? t.tramite}</div>
                        {t.problema && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{t.problema}</div>
                        )}
                        <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                          {t.modulo_origen}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.entidad}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {t.ruc ?? "—"}
                    {t.razon_social && (
                      <div className="text-muted-foreground truncate max-w-[120px]">{t.razon_social}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {t.plazo_vencimiento ?? "—"}
                    {t.dias_restantes != null && t.dias_restantes < 0 && (
                      <Badge variant="destructive" className="ml-1 text-[10px]">Vencida</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={PRIORIDAD_VARIANT[t.prioridad] ?? "secondary"}
                      className="text-xs capitalize rounded-full"
                    >
                      {t.prioridad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {ESTADO_LABEL[t.estado] ?? t.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {t.estado !== "completada" && onComplete && (
                        <Button variant="ghost" size="icon" onClick={() => onComplete(t)} title="Completar">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(t)} title="Editar">
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(t)} title="Eliminar">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
