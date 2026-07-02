import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Loader2, Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { normalizeCuentaContable } from "@/lib/asientos-contables-utils";

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
  ruc,
  razonSocial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<MovimientoCaja> | null;
  ruc: string;
  razonSocial?: string;
  onSubmit: (v: {
    fecha_operacion: string;
    glosa: string;
    cuenta_contable: string;
    debe: number;
    haber: number;
  }) => void;
  loading: boolean;
}) {
  const [fecha, setFecha] = useState(
    initial?.fecha_operacion ?? initial?.fecha ?? new Date().toISOString().slice(0, 10),
  );
  const [glosa, setGlosa] = useState(initial?.glosa ?? "");
  const [cuenta, setCuenta] = useState(initial?.cuenta_contable ?? "");
  const [debe, setDebe] = useState(String(initial?.debe ?? ""));
  const [haber, setHaber] = useState(String(initial?.haber ?? ""));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
          <DialogDescription className="sr-only">
            Registro de movimiento de caja con cuenta contable, debe y haber para el contribuyente seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground text-xs block mb-0.5">Contribuyente</span>
            <span className="font-mono font-medium">{ruc}</span>
            {razonSocial ? (
              <span className="text-muted-foreground ml-2">{razonSocial}</span>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Fecha de operación</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            <FieldHelper>Fecha efectiva del movimiento de caja dentro del periodo seleccionado (AAAAMM).</FieldHelper>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Glosa</Label>
            <Input value={glosa} onChange={(e) => setGlosa(e.target.value)} placeholder="Descripción de la operación" />
            <FieldHelper>Descripción breve del movimiento para auditoría y conciliación bancaria.</FieldHelper>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Cuenta (PCGE)</Label>
            <Input value={cuenta} onChange={(e) => setCuenta(e.target.value)} placeholder="Ej: 101, 104" />
            <FieldHelper>Cuenta contable Clase 10 (caja o banco) según el plan de cuentas del contribuyente.</FieldHelper>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Debe</Label>
              <Input
                type="number"
                step="0.01"
                value={debe}
                onChange={(e) => setDebe(e.target.value)}
                className="font-mono"
              />
              <FieldHelper>Importe de entrada a la cuenta. Deje en 0 si registra solo Haber.</FieldHelper>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Haber</Label>
              <Input
                type="number"
                step="0.01"
                value={haber}
                onChange={(e) => setHaber(e.target.value)}
                className="font-mono"
              />
              <FieldHelper>Importe de salida de la cuenta. Deje en 0 si registra solo Debe.</FieldHelper>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading || !cuenta.trim()}
            onClick={() =>
              onSubmit({
                fecha_operacion: fecha,
                glosa,
                cuenta_contable: normalizeCuentaContable(cuenta),
                debe: Number(debe) || 0,
                haber: Number(haber) || 0,
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

export function MovimientosCajaTable({
  ruc,
  razonSocial,
  periodo,
}: {
  ruc: string;
  razonSocial?: string;
  periodo?: string | null;
}) {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroOrigen, setFiltroOrigen] = useState<string>("todos");

  const { movimientosQuery, pendientesCentralizarQuery, create, update, centralizar } = useCaja({
    ruc,
    periodo,
    tipo_movimiento: filtroTipo === "todos" ? null : filtroTipo,
    origen_documento: filtroOrigen === "todos" ? null : filtroOrigen,
  });
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<MovimientoCaja | null>(null);

  const rows = movimientosQuery.data ?? [];
  const withSaldo = useMemo(() => calcSaldo(rows), [rows]);
  const pendientesCount = pendientesCentralizarQuery.data?.length ?? 0;
  const puedeCentralizar = !!ruc && !!periodo?.trim() && pendientesCount > 0;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Libro Caja y Bancos</div>
          <div className="text-xs text-muted-foreground">
            Auxiliar de efectivo · Centralización al diario (tipo CAJA).
            {pendientesCount > 0 && periodo ? (
              <span className="block mt-1 text-amber-700">
                {pendientesCount} movimiento(s) sin centralizar en {periodo}.
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={!puedeCentralizar || centralizar.isPending}
            onClick={async () => {
              try {
                const res = await centralizar.mutateAsync();
                toast.success(
                  `Centralizado: ${res.movimientosVinculados} movimiento(s), ${res.lineasDiario} línea(s) en diario.`,
                );
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "No se pudo centralizar");
              }
            }}
          >
            {centralizar.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-4 mr-2" />
            )}
            Centralizar periodo
          </Button>
          <Button disabled={!ruc} onClick={() => setOpenNew(true)}>
            <Plus className="size-4 mr-2" /> Registrar movimiento
          </Button>
        </div>
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-3">
        <div className="grid gap-1">
          <Label className="text-xs">Tipo movimiento</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ingreso">Ingreso</SelectItem>
              <SelectItem value="egreso">Egreso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Origen documento</Label>
          <Select value={filtroOrigen} onValueChange={setFiltroOrigen}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="sire">SIRE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-4 pb-4">
        {movimientosQuery.isLoading ? (
          <div className="text-sm text-muted-foreground py-10 text-center">Cargando movimientos…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">N° doc.</TableHead>
                <TableHead className="w-20">N°</TableHead>
                <TableHead className="w-36">Fecha</TableHead>
                <TableHead>Glosa</TableHead>
                <TableHead className="w-32">Cuenta</TableHead>
                <TableHead className="w-28 text-right">Debe</TableHead>
                <TableHead className="w-28 text-right">Haber</TableHead>
                <TableHead className="w-28 text-right">Saldo</TableHead>
                <TableHead className="w-24">Diario</TableHead>
                <TableHead className="w-40 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withSaldo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-10">
                    No hay movimientos para este RUC y periodo.
                  </TableCell>
                </TableRow>
              ) : (
                withSaldo.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.numero_documento ?? "—"}</TableCell>
                    <TableCell className="font-mono">{m.correlativo ?? "-"}</TableCell>
                    <TableCell className="font-mono">{m.fecha_operacion ?? m.fecha}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{m.glosa}</span>
                        {String(m.origen_documento ?? m.origen).toLowerCase() === "sire" ? (
                          <Badge variant="secondary">SIRE</Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                        {m.tipo_movimiento ? (
                          <Badge variant="outline" className="text-xs capitalize">
                            {m.tipo_movimiento}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{m.cuenta_contable}</TableCell>
                    <TableCell className="text-right font-mono">{Number(m.debe ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{Number(m.haber ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{m.saldo.toFixed(2)}</TableCell>
                    <TableCell>
                      {m.asiento_id ? (
                        <Badge variant="outline" className="text-xs">
                          Centralizado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
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
        ruc={ruc}
        razonSocial={razonSocial}
        loading={create.isPending}
        onSubmit={async (v) => {
          if (!periodo?.trim()) {
            toast.error("Indica el periodo (AAAAMM) en el filtro superior.");
            return;
          }
          try {
            await create.mutateAsync({
              ruc,
              periodo: periodo.trim(),
              fecha: v.fecha_operacion,
              fecha_operacion: v.fecha_operacion,
              glosa: v.glosa,
              cuenta_contable: v.cuenta_contable,
              debe: v.debe,
              haber: v.haber,
              origen: "manual",
              registro_sire_id: null,
              asiento_id: null,
            });
            toast.success("Movimiento registrado");
            setOpenNew(false);
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "No se pudo registrar");
          }
        }}
      />

      <MovimientoForm
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
        ruc={ruc}
        razonSocial={razonSocial}
        loading={update.isPending}
        onSubmit={async (v) => {
          if (!editing) return;
          try {
            await update.mutateAsync({ id: editing.id, patch: v });
            toast.success("Movimiento actualizado");
            setEditing(null);
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "No se pudo actualizar");
          }
        }}
      />
    </div>
  );
}
