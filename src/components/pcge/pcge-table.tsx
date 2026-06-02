import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { PcgeCuenta } from "@/lib/pcge-service";
import { usePcge } from "@/hooks/use-pcge";

function PcgeForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<PcgeCuenta> | null;
  onSubmit: (v: { codigo: string; descripcion: string; activo: boolean; padre_codigo: string | null }) => void;
  loading: boolean;
}) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [padre, setPadre] = useState(initial?.padre_codigo ?? "");
  const [activo, setActivo] = useState(initial?.activo ?? true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.codigo ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Código</Label>
            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: 101, 1212, 40111" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Descripción</Label>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Caja, IGV por pagar" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Cuenta padre (opcional)</Label>
            <Input value={padre} onChange={(e) => setPadre(e.target.value)} placeholder="Ej: 10, 12, 40" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="text-sm">
              <div className="font-medium">Estado</div>
              <div className="text-xs text-muted-foreground">
                Si se desactiva, ya no se sugiere en asientos automáticos.
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActivo((v) => !v)}>
              {activo ? (
                <>
                  <ToggleRight className="size-4 mr-2" /> Activa
                </>
              ) : (
                <>
                  <ToggleLeft className="size-4 mr-2" /> Inactiva
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() =>
              onSubmit({
                codigo,
                descripcion,
                activo,
                padre_codigo: padre.trim() ? padre.trim() : null,
              })
            }
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PcgeTable() {
  const { cuentasQuery, upsert, setActivo } = usePcge();
  const [q, setQ] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<PcgeCuenta | null>(null);

  const cuentas = cuentasQuery.data ?? [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cuentas;
    return cuentas.filter((c) => `${c.codigo} ${c.descripcion}`.toLowerCase().includes(needle));
  }, [cuentas, q]);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Plan de Cuentas (PCGE)</div>
          <div className="text-xs text-muted-foreground">
            Agrega, edita o desactiva cuentas. Esto alimenta los asientos automáticos del sistema.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input className="w-64" placeholder="Buscar por código o descripción…" value={q} onChange={(e) => setQ(e.target.value)} />
          <DialogTrigger asChild>
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="size-4 mr-2" /> Nueva
            </Button>
          </DialogTrigger>
          {/* DialogTrigger se renderiza en el PcgeForm */}
        </div>
      </div>

      <div className="px-4 pb-4">
        {cuentasQuery.isLoading ? (
          <div className="text-sm text-muted-foreground py-10 text-center">Cargando plan de cuentas…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-24 text-center">Nivel</TableHead>
                <TableHead className="w-28 text-center">Estado</TableHead>
                <TableHead className="w-40 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                    Sin resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.codigo}>
                    <TableCell className="font-mono">{c.codigo}</TableCell>
                    <TableCell>{c.descripcion}</TableCell>
                    <TableCell className="text-center">{c.nivel}</TableCell>
                    <TableCell className="text-center">
                      {c.activo ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-700">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-800">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(c)}>
                          <Pencil className="size-4 mr-2" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await setActivo.mutateAsync({ codigo: c.codigo, activo: !c.activo });
                              toast.success(c.activo ? "Cuenta desactivada" : "Cuenta activada");
                            } catch (e: any) {
                              toast.error(e?.message ?? "No se pudo actualizar");
                            }
                          }}
                        >
                          {c.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <PcgeForm
        open={openNew}
        onOpenChange={setOpenNew}
        initial={null}
        loading={upsert.isPending}
        onSubmit={async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta guardada");
            setOpenNew(false);
          } catch (e: any) {
            toast.error(e?.message ?? "No se pudo guardar");
          }
        }}
      />

      <PcgeForm
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
        loading={upsert.isPending}
        onSubmit={async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta actualizada");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message ?? "No se pudo guardar");
          }
        }}
      />
    </div>
  );
}

