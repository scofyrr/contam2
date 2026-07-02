import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FormularioTarea,
  type FormularioTareaValues,
} from "@/modules/tareas/components/FormularioTarea";
import { crearTarea } from "@/modules/tareas/services/tareas-service";
import type { TareaModuloOrigen } from "@/types/tareas";

type Props = {
  moduloOrigen?: TareaModuloOrigen;
  ruc?: string | null;
  entidad?: string;
  tramite?: string;
  titulo?: string;
  problema?: string;
  referenciaId?: string | null;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  iconOnly?: boolean;
};

export function NuevaTareaButton({
  moduloOrigen = "general",
  ruc,
  entidad,
  tramite,
  titulo,
  problema,
  referenciaId,
  variant = "outline",
  size = "sm",
  label = "Nueva tarea",
  iconOnly = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: crearTarea,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      toast.success("Tarea registrada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const defaults: Partial<FormularioTareaValues> = {
    modulo_origen: moduloOrigen,
    ruc: ruc ?? "",
    entidad: entidad ?? (moduloOrigen === "sire" ? "SIRE" : moduloOrigen === "caja" ? "Caja" : "Contabilidad"),
    tramite: tramite ?? titulo ?? "",
    problema: problema ?? "",
  };

  return (
    <>
      <Button variant={variant} size={iconOnly ? "icon" : size} onClick={() => setOpen(true)} title={iconOnly ? label : undefined}>
        <Plus className={iconOnly ? "size-4" : "size-4 mr-1"} />
        {!iconOnly && label}
      </Button>
      <FormularioTarea
        open={open}
        onOpenChange={setOpen}
        defaults={defaults}
        loading={create.isPending}
        onSubmit={(values) =>
          create.mutate({
            ...values,
            referencia_id: referenciaId ?? undefined,
          })
        }
      />
    </>
  );
}
