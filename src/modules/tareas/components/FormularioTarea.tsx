import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldHelper } from "@/components/ui/field-helper";
import type { TareaModuloOrigen, TareaPendiente, TareaPrioridad } from "@/types/tareas";

const schema = z.object({
  entidad: z.string().min(2, "Entidad requerida"),
  tramite: z.string().min(2, "Trámite requerido"),
  titulo: z.string().optional(),
  descripcion: z.string().optional(),
  ruc: z.string().optional(),
  fecha_tramitar: z.string().optional(),
  plazo_vencimiento: z.string().optional(),
  problema: z.string().optional(),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]),
  modulo_origen: z.enum(["general", "sire", "asientos", "caja", "pcge", "contribuyentes"]),
  asignado_a: z.string().optional(),
  critica: z.boolean(),
});

export type FormularioTareaValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<TareaPendiente> | null;
  defaults?: Partial<FormularioTareaValues>;
  loading?: boolean;
  onSubmit: (values: FormularioTareaValues) => void;
};

export function FormularioTarea({
  open,
  onOpenChange,
  initial,
  defaults,
  loading,
  onSubmit,
}: Props) {
  const form = useForm<FormularioTareaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      entidad: "",
      tramite: "",
      prioridad: "media",
      modulo_origen: "general",
      critica: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      entidad: initial?.entidad ?? defaults?.entidad ?? "",
      tramite: initial?.tramite ?? defaults?.tramite ?? "",
      titulo: initial?.titulo ?? defaults?.titulo ?? "",
      descripcion: initial?.descripcion ?? defaults?.descripcion ?? "",
      ruc: initial?.ruc ?? defaults?.ruc ?? "",
      fecha_tramitar: initial?.fecha_tramitar ?? defaults?.fecha_tramitar ?? "",
      plazo_vencimiento: initial?.plazo_vencimiento ?? defaults?.plazo_vencimiento ?? "",
      problema: initial?.problema ?? defaults?.problema ?? "",
      prioridad: (initial?.prioridad ?? defaults?.prioridad ?? "media") as TareaPrioridad,
      modulo_origen: (initial?.modulo_origen ?? defaults?.modulo_origen ?? "general") as TareaModuloOrigen,
      asignado_a: initial?.asignado_a ?? defaults?.asignado_a ?? "",
      critica: initial?.critica ?? defaults?.critica ?? false,
    });
  }, [open, initial, defaults, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar tarea" : "Nueva tarea pendiente"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="entidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SUNAT, Cliente, Interno…" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modulo_origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo origen</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="sire">SIRE</SelectItem>
                        <SelectItem value="asientos">Asientos</SelectItem>
                        <SelectItem value="caja">Caja</SelectItem>
                        <SelectItem value="pcge">PCGE</SelectItem>
                        <SelectItem value="contribuyentes">Contribuyentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tramite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trámite / título</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descripción breve del trámite" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problema detectado</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Detalle del problema a resolver" />
                  </FormControl>
                  <FieldHelper>Visible en el panel de notificaciones y listado de tareas.</FieldHelper>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono" maxLength={11} placeholder="20123456789" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fecha_tramitar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha a tramitar</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plazo_vencimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plazo vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="asignado_a"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignado a</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Responsable interno" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="critica"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Marcar como crítica</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Guardar tarea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
