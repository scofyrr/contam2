import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Loader2, X } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldHelper } from "@/components/ui/field-helper";
import {
  computeNivelFromCodigo,
  computePadreCodigo,
  normalizePcgeCode,
} from "@/modules/contabilidad/pcge/utils/pcge-codigo";
import { validatePCGEHierarchy } from "@/modules/contabilidad/pcge/services/pcge-validator";
import { generarCodigoPcgeHijo } from "@/lib/pcge-service";
import type { PcgeCuenta } from "@/lib/pcge-service";

const schema = z.object({
  codigo_cuenta: z
    .string()
    .min(1, "Código requerido")
    .refine((v) => /^\d+$/.test(normalizePcgeCode(v)), "Solo dígitos, sin puntos"),
  nombre_cuenta: z.string().min(2, "Nombre requerido"),
  naturaleza: z.string().optional(),
  tipo_cuenta: z.string().optional(),
  activo: z.boolean(),
  es_agrupador: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<PcgeCuenta> | null;
  padreCodigo?: string | null;
  loading?: boolean;
  onSubmit: (values: FormValues & { nivel: number; padre_codigo: string | null }) => void;
};

export function FormularioCuentaPCGE({
  open,
  onOpenChange,
  initial,
  padreCodigo,
  loading,
  onSubmit,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo_cuenta: "",
      nombre_cuenta: "",
      naturaleza: "deudora",
      tipo_cuenta: "",
      activo: true,
      es_agrupador: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      codigo_cuenta: initial?.codigo_cuenta ?? padreCodigo ?? "",
      nombre_cuenta: initial?.nombre_cuenta ?? "",
      naturaleza: initial?.naturaleza ?? "deudora",
      tipo_cuenta: initial?.tipo_cuenta ?? "",
      activo: initial?.activo ?? true,
      es_agrupador: initial?.es_agrupador ?? false,
    });
  }, [open, initial, padreCodigo, form]);

  const codigo = normalizePcgeCode(form.watch("codigo_cuenta"));
  const nivel = codigo ? computeNivelFromCodigo(codigo) : null;
  const validation = codigo ? validatePCGEHierarchy(codigo, padreCodigo ?? computePadreCodigo(codigo)) : null;
  const [generating, setGenerating] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass-surface border-white/10 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.codigo_cuenta ? "Editar cuenta PCGE" : "Nueva cuenta PCGE"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => {
              const code = normalizePcgeCode(values.codigo_cuenta);
              onSubmit({
                ...values,
                codigo_cuenta: code,
                nivel: computeNivelFromCodigo(code),
                padre_codigo: computePadreCodigo(code),
              });
            })}
          >
            <FormField
              control={form.control}
              name="codigo_cuenta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de cuenta</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        className="font-mono"
                        placeholder="Ej: 101101 (sin puntos)"
                        disabled={!!initial?.codigo_cuenta}
                        onChange={(e) => field.onChange(normalizePcgeCode(e.target.value))}
                      />
                    </FormControl>
                    {!initial?.codigo_cuenta && padreCodigo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={generating}
                        className="shrink-0 border-premium-gold/30"
                        onClick={async () => {
                          setGenerating(true);
                          try {
                            const hijo = await generarCodigoPcgeHijo(padreCodigo);
                            field.onChange(hijo);
                          } finally {
                            setGenerating(false);
                          }
                        }}
                      >
                        Auto
                      </Button>
                    )}
                    {validation && (
                      <span className="grid place-items-center">
                        {validation.valid ? (
                          <Check className="size-5 text-success fade-in" />
                        ) : (
                          <X className="size-5 text-destructive fade-in" />
                        )}
                      </span>
                    )}
                  </div>
                  <FieldHelper>
                    Nivel {nivel ?? "—"} · Padre: {codigo ? computePadreCodigo(codigo) ?? "raíz" : "—"}
                  </FieldHelper>
                  {validation && !validation.valid && (
                    <p className="text-xs text-destructive">{validation.errors[0]}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre_cuenta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de cuenta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Denominación según PCGE" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="naturaleza"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naturaleza</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="deudora">Deudora</SelectItem>
                        <SelectItem value="acreedora">Acreedora</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo_cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Opcional" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Activa</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="es_agrupador"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Agrupador</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm fade-in">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Vista previa en jerarquía
              </p>
              <p className="font-mono text-premium-cyan">
                {codigo || "——"} <span className="text-muted-foreground">-</span>{" "}
                {form.watch("nombre_cuenta") || "Denominación"}
              </p>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading || (validation != null && !validation.valid)} className="hover-lift">
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Guardar cuenta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
