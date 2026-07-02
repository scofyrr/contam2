import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { formatCuentaPcge, type PcgeCuenta } from "@/lib/pcge-service";
import { usePcge } from "@/hooks/use-pcge";
import { formatSupabaseError } from "@/lib/supabase-error";

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
  onSubmit: (v: {
    id?: string;
    codigo_cuenta: string;
    nombre_cuenta: string;
    activo: boolean;
    tipo_cuenta?: string | null;
    nivel?: number | null;
    naturaleza?: string | null;
    aplica_para?: string | null;
    palabras_clave?: string | null;
  }) => void;
  loading: boolean;
}) {
  const [codigoCuenta, setCodigoCuenta] = useState(initial?.codigo_cuenta ?? "");
  const [nombreCuenta, setNombreCuenta] = useState(initial?.nombre_cuenta ?? "");
  const [tipoCuenta, setTipoCuenta] = useState(initial?.tipo_cuenta ?? "");
  const [nivel, setNivel] = useState(initial?.nivel != null ? String(initial.nivel) : "");
  const [naturaleza, setNaturaleza] = useState(initial?.naturaleza ?? "");
  const [aplicaPara, setAplicaPara] = useState(initial?.aplica_para ?? "");
  const [palabrasClave, setPalabrasClave] = useState(initial?.palabras_clave ?? "");
  const [activo, setActivo] = useState(initial?.activo ?? true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.codigo_cuenta ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
          <FieldHelper variant="info">
            Mantenga códigos alineados al PCGE peruano. Las cuentas activas aparecen en selectores del Libro Diario y Caja.
          </FieldHelper>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Código de cuenta (PK)</Label>
            <Input
              value={codigoCuenta}
              onChange={(e) => setCodigoCuenta(e.target.value)}
              placeholder="Ej: 101101, 121201 (sin puntos)"
              disabled={!!initial?.codigo_cuenta}
            />
            <FieldHelper>
              Código numérico secuencial sin puntos (ej. 101101 Caja, 121201 Facturas por cobrar).
            </FieldHelper>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Nombre de cuenta</Label>
            <Input
              value={nombreCuenta}
              onChange={(e) => setNombreCuenta(e.target.value)}
              placeholder="Ej: Caja, IGV por pagar"
            />
            <FieldHelper>Denominación descriptiva visible en reportes y comboboxes contables.</FieldHelper>
          </div>
          <details className="rounded-lg border p-3 bg-muted/10">
            <summary className="text-sm font-medium cursor-pointer">Campos opcionales (estructura SUNAT)</summary>
            <div className="grid gap-3 mt-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Tipo de cuenta</Label>
                <Input value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} placeholder="Activo, Pasivo, etc." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Nivel (opcional)</Label>
                  <Input value={nivel} onChange={(e) => setNivel(e.target.value.replace(/\D/g, ""))} placeholder="Auto si vacío" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Naturaleza</Label>
                  <Input value={naturaleza} onChange={(e) => setNaturaleza(e.target.value)} placeholder="Deudora / Acreedora" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Aplica para</Label>
                <Input value={aplicaPara} onChange={(e) => setAplicaPara(e.target.value)} placeholder="Ventas, Compras, Caja…" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Palabras clave</Label>
                <Input value={palabrasClave} onChange={(e) => setPalabrasClave(e.target.value)} placeholder="Separadas por coma" />
              </div>
            </div>
          </details>
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="text-sm">
              <div className="font-medium">Estado</div>
              <div className="text-xs text-muted-foreground">
                Si se desactiva, ya no aparece en selectores del Libro Diario.
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
                id: initial?.id,
                codigo_cuenta: codigoCuenta,
                nombre_cuenta: nombreCuenta,
                activo,
                tipo_cuenta: tipoCuenta.trim() || null,
                nivel: nivel.trim() ? Number(nivel) : null,
                naturaleza: naturaleza.trim() || null,
                aplica_para: aplicaPara.trim() || null,
                palabras_clave: palabrasClave.trim() || null,
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
    return cuentas.filter((c) =>
      `${c.codigo_cuenta} ${c.nombre_cuenta}`.toLowerCase().includes(needle),
    );
  }, [cuentas, q]);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Plan de Cuentas (PCGE)</div>
          <div className="text-xs text-muted-foreground">
            Tabla oficial <code className="text-xs">plan_contable_pcge</code> · clave{" "}
            <code className="text-xs">codigo_cuenta</code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            className="w-64"
            placeholder="Buscar por código o nombre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="size-4 mr-2" /> Nueva
          </Button>
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
                <TableHead>Nombre</TableHead>
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
                  <TableRow key={c.id ?? c.codigo_cuenta}>
                    <TableCell className="font-mono">{c.codigo_cuenta}</TableCell>
                    <TableCell>{c.nombre_cuenta}</TableCell>
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
                              await setActivo.mutateAsync({
                                codigo_cuenta: c.codigo_cuenta,
                                activo: !c.activo,
                              });
                              toast.success(c.activo ? "Cuenta desactivada" : "Cuenta activada");
                            } catch (e: unknown) {
                              const msg = e instanceof Error ? e.message : "No se pudo actualizar";
                              toast.error(msg);
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
        key="new"
        open={openNew}
        onOpenChange={setOpenNew}
        initial={null}
        loading={upsert.isPending}
        onSubmit={async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta guardada");
            setOpenNew(false);
          } catch (e: unknown) {
            toast.error(formatSupabaseError(e));
          }
        }}
      />

      <PcgeForm
        key={editing?.codigo_cuenta ?? "edit"}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
        loading={upsert.isPending}
        onSubmit={async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta actualizada");
            setEditing(null);
          } catch (e: unknown) {
            toast.error(formatSupabaseError(e));
          }
        }}
      />
    </div>
  );
}
