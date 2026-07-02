import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import {
  evaluarReglasTareas,
  tareasAutoGenerator,
} from "@/modules/tareas/services/tareas-auto-generator";
import { notificarTareaGenerada } from "@/modules/notificaciones/services/notification-service";
import type { EstadisticasGeneracion, NuevaTareaSugerida } from "@/modules/tareas/types/auto-generator";
import { reglaPrioridadToDb } from "@/modules/tareas/types/auto-generator";
import { supabase } from "@/integrations/supabase/client";

const AUTO_KEY = ["tareas", "auto"] as const;
const INTERVAL_MS = 2 * 60 * 60 * 1000;

export function useTareasAutoGenerator(ruc?: string, periodo?: string) {
  const qc = useQueryClient();
  const { session } = useSession();

  const sugeridasQuery = useQuery({
    queryKey: [...AUTO_KEY, "sugeridas", ruc, periodo],
    queryFn: () => evaluarReglasTareas(ruc, periodo),
    staleTime: 5 * 60_000,
  });

  const statsQuery = useQuery({
    queryKey: [...AUTO_KEY, "stats", periodo],
    queryFn: () => tareasAutoGenerator.obtenerEstadisticasGeneracion(periodo ?? ""),
    enabled: !!periodo,
  });

  const generarMutation = useMutation({
    mutationFn: async (autoConfirmar: boolean) => {
      const result = await tareasAutoGenerator.generarTareasAutomaticas(ruc, periodo, autoConfirmar);
      if (autoConfirmar && session?.user?.id) {
        for (const r of result.filter((x) => x.accion === "creada")) {
          await notificarTareaGenerada({
            userId: session.user.id,
            titulo: r.sugerida.titulo,
            mensaje: r.sugerida.descripcion,
            tareaId: r.id,
            prioridad: reglaPrioridadToDb(r.sugerida.prioridad),
          });
        }
      }
      return result;
    },
    onSuccess: async (result, autoConfirmar) => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      await qc.invalidateQueries({ queryKey: AUTO_KEY });
      if (autoConfirmar) {
        toast.success(`${result.filter((r) => r.accion === "creada").length} tareas generadas`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    const tick = () => {
      void evaluarReglasTareas(ruc, periodo).then((tareas) => {
        if (tareas.length) {
          qc.setQueryData([...AUTO_KEY, "sugeridas", ruc, periodo], tareas);
        }
      });
    };
    tick();
    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, [ruc, periodo, qc]);

  const aceptarSugerida = useCallback(
    async (s: NuevaTareaSugerida) => {
      const payload = {
        ruc: s.ruc || null,
        entidad: s.entidad,
        tramite: s.tramite,
        titulo: s.titulo,
        descripcion: s.descripcion,
        plazo_vencimiento: s.fechaVencimiento,
        critica: s.critica,
        prioridad: reglaPrioridadToDb(s.prioridad),
        modulo_origen: s.moduloOrigen,
        referencia_id: s.referenciaId ?? null,
        hash_deduplicacion: s.hashDeduplicacion,
        generada_automaticamente: true,
        regla_generadora: s.reglaGeneradora,
        metadata: s.metadata,
        estado: "pendiente" as const,
      };
      const { data, error } = await supabase.from("tareas_pendientes").insert(payload).select("id").single();
      if (error) throw error;
      if (session?.user?.id) {
        await notificarTareaGenerada({
          userId: session.user.id,
          titulo: s.titulo,
          mensaje: s.descripcion,
          tareaId: String(data.id),
          prioridad: reglaPrioridadToDb(s.prioridad),
        });
      }
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      await qc.invalidateQueries({ queryKey: AUTO_KEY });
      toast.success("Tarea creada");
    },
    [qc, session?.user?.id],
  );

  return {
    tareasSugeridas: sugeridasQuery.data ?? [],
    loadingSugeridas: sugeridasQuery.isLoading,
    estadisticasGeneracion: statsQuery.data as EstadisticasGeneracion | undefined,
    generarTareas: (autoConfirmar: boolean) => generarMutation.mutate(autoConfirmar),
    generando: generarMutation.isPending,
    aceptarSugerida,
    refrescar: () => sugeridasQuery.refetch(),
  };
}
