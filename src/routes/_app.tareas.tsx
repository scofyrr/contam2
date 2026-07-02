import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TareasDashboardPremium from "@/modules/tareas/components/tareas-dashboard-premium";
import { FormularioTarea } from "@/modules/tareas/components/FormularioTarea";
import { ListaTareas } from "@/modules/tareas/components/ListaTareas";
import {
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  fetchEstadisticasTareasMejorada,
  fetchTareas,
  marcarTareaCompletada,
} from "@/modules/tareas/services/tareas-service";
import type { TareaPendiente, TareasFiltros } from "@/types/tareas";

export const Route = createFileRoute("/_app/tareas")({
  component: TareasPage,
});

function TareasPage() {
  const qc = useQueryClient();
  const [filtros, setFiltros] = useState<TareasFiltros>({ estado: "todos", orden: "reciente" });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<TareaPendiente | null>(null);

  const tareasQuery = useQuery({
    queryKey: ["tareas", "list", filtros],
    queryFn: () => fetchTareas(filtros),
  });

  const statsQuery = useQuery({
    queryKey: ["tareas", "stats", filtros.ruc, filtros.ruc],
    queryFn: () => fetchEstadisticasTareasMejorada(filtros.ruc),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: Parameters<typeof crearTarea>[0]) => {
      if (editing) {
        await actualizarTarea(editing.id, values);
        return;
      }
      await crearTarea(values);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      toast.success(editing ? "Tarea actualizada" : "Tarea creada");
      setOpenForm(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => marcarTareaCompletada(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      toast.success("Tarea completada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eliminarTarea,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      toast.success("Tarea eliminada");
    },
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <ClipboardList className="size-8 text-primary" />
            Tareas Pendientes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gestión de trámites, alertas operativas y seguimiento por módulo ·{" "}
            <code className="text-xs">tareas_pendientes</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </header>

      <Tabs defaultValue="listado">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="listado">Listado</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <TareasDashboardPremium
            stats={statsQuery.data ?? {
              total: 0, pendientes: 0, en_progreso: 0, completadas: 0,
              canceladas: 0, criticas: 0, vencidas: 0, por_modulo: {},
            }}
            extended={statsQuery.data}
            tareas={tareasQuery.data ?? []}
            loading={statsQuery.isLoading || tareasQuery.isLoading}
            ruc={filtros.ruc ?? undefined}
          />
        </TabsContent>

        <TabsContent value="listado" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tareasQuery.data?.length ?? 0} tareas</Badge>
            <Link to="/tareas" className="text-xs text-muted-foreground hover:underline">
              Sincronizado con panel de notificaciones
            </Link>
          </div>
          <ListaTareas
            tareas={tareasQuery.data ?? []}
            loading={tareasQuery.isLoading}
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onEdit={(t) => {
              setEditing(t);
              setOpenForm(true);
            }}
            onComplete={(t) => completeMutation.mutate(t.id)}
            onDelete={(t) => deleteMutation.mutate(t.id)}
          />
        </TabsContent>
      </Tabs>

      <FormularioTarea
        open={openForm}
        onOpenChange={(v) => {
          setOpenForm(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        loading={saveMutation.isPending}
        onSubmit={(values) => saveMutation.mutate(values)}
      />
    </div>
  );
}
