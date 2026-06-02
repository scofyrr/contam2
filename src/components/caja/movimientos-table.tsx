import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { MovimientoCaja } from "@/lib/caja-service";
import { useCaja } from "@/hooks/use-caja";

function calcSaldo(rows: MovimientoCaja[]): Array<MovimientoCaja & { saldo: number }> {
  let saldo = 0;
  return rows.map((r) => {
    saldo = saldo + Number(r.debe ?? 0) - Number(r.haber ?? 0);
    return { ...r, saldo };
  });
}

function MovimientoForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<MovimientoCaja> | null;
  onSubmit: (v: { fecha_operacion: string; glosa: string; cuenta_pcge: string; debe: number; haber: number }) => void;
  loading: boolean;
}) {
  const [fecha, setFecha] = useState(initial?.fecha_operacion ?? new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState(initial?.glosa ?? "");
  const [cuenta, setCuenta] = useState(initial?.cuenta_pcge ?? "10");
  const [debe, setDebe] = useState(Number(initial?.debe ?? 0));
  const [haber, setHaber] = useState(Number(initial?.haber ?? 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Fecha de operación</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Glosa</Label>
            <Input value={glosa} onChange={(e) => setGlosa(e.target.value)} placeholder="Descripción de la operación" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Cuenta (PCGE)</Label>
            <Input value={cuenta} onChange={(e) => setCuenta(e.target.value)} placeholder="Ej: 10, 101, 104" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Debe</Label>
              <Input
                type="number"
                step="0.01"
                value={debe}
                onChange={(e) => setDebe(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Haber</Label>
              <Input
                type="number"
                step="0.01"
                value={haber}
                onChange={(e) => setHaber(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Consejo: usa solo Debe o solo Haber por movimiento (no ambos).
          </p>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() =>
              onSubmit({
                fecha_operacion: fecha,
                glosa,
                cuenta_pcge: cuenta.trim(),
                debe: Number(debe),
                haber: Number(haber),
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

export function MovimientosCajaTable({ ruc, periodo }: { ruc?: string | null; periodo?: string | null }) {
  const { movimientosQuery, create, update } = useCaja({ ruc, periodo });
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<MovimientoCaja | null>(null);

  const rows = movimientosQuery.data ?? [];
  const withSaldo = useMemo(() => calcSaldo(rows), [rows]);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Libro Caja y Bancos</div>
          <div className="text-xs text-muted-foreground">
            Movimientos manuales y cancelaciones generadas desde SIRE (editable).
          </div>
        </div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="size-4 mr-2" /> Registrar movimiento
        </Button>
      </div>

      <div className="px-4 pb-4">
        {movimientosQuery.isLoading ? (
          <div className="text-sm text-muted-foreground py-10 text-center">Cargando movimientos…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">N°</TableHead>
                <TableHead className="w-36">Fecha</TableHead>
                <TableHead>Glosa</TableHead>
                <TableHead className="w-32">Cuenta</TableHead>
                <TableHead className="w-28 text-right">Debe</TableHead>
                <TableHead className="w-28 text-right">Haber</TableHead>
                <TableHead className="w-28 text-right">Saldo</TableHead>
                <TableHead className="w-40 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withSaldo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                    Aún no hay movimientos.
                  </TableCell>
                </TableRow>
              ) : (
                withSaldo.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono">{m.correlativo ?? "-"}</TableCell>
                    <TableCell className="font-mono">{m.fecha_operacion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{m.glosa}</span>
                        {m.origen === "sire" ? (
                          <Badge variant="secondary">SIRE</Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{m.cuenta_pcge}</TableCell>
                    <TableCell className="text-right font-mono">{Number(m.debe ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{Number(m.haber ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{m.saldo.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditing(m)}>
                        <Pencil className="size-4 mr-2" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <MovimientoForm
        open={openNew}
        onOpenChange={setOpenNew}
        initial={null}
        loading={create.isPending}
        onSubmit={async (v) => {
          try {
            await create.mutateAsync({
              ruc: ruc ?? null,
              periodo: periodo ?? null,
              fecha_operacion: v.fecha_operacion,
              glosa: v.glosa,
              cuenta_pcge: v.cuenta_pcge,
              debe: v.debe,
              haber: v.haber,
              origen: "manual",
              registro_sire_id: null,
              asiento_id: null,
            });
            toast.success("Movimiento registrado");
            setOpenNew(false);
          } catch (e: any) {
            toast.error(e?.message ?? "No se pudo registrar");
          }
        }}
      />

      <MovimientoForm
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
        loading={update.isPending}
        onSubmit={async (v) => {
          if (!editing) return;
          try {
            await update.mutateAsync({ id: editing.id, patch: v });
            toast.success("Movimiento actualizado");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message ?? "No se pudo actualizar");
          }
        }}
      />
    </div>
  );
}

