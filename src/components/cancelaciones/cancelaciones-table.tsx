import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { useCancelacionDetails, useCancelacionesList } from "@/hooks/use-cancelaciones";
import { updateTotalesAsiento } from "@/lib/cancelaciones-service";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Selected = {
  registroId: string;
  asientoId: string | null;
  movimientoId: string | null;
  tipo: "VENTA" | "COMPRA";
};

export function CancelacionesTable({ ruc, periodo }: { ruc: string; periodo?: string | null }) {
  const { cancelacionesQuery, updateLinea, updateMovimiento } = useCancelacionesList({ ruc, periodo });
  const [selected, setSelected] = useState<Selected | null>(null);
  const details = useCancelacionDetails({
    asientoId: selected?.asientoId ?? null,
    movimientoId: selected?.movimientoId ?? null,
  });

  const [motivo, setMotivo] = useState("");
  const [usuario, setUsuario] = useState("contador");

  const rows = cancelacionesQuery.data ?? [];

  const header = useMemo(() => {
    if (!selected) return null;
    const row = rows.find((r) => r.registro_id === selected.registroId);
    if (!row) return null;
    return row;
  }, [rows, selected]);

  const lineas = details.lineasQuery.data ?? [];
  const movimiento = details.movimientoQuery.data ?? null;

  const canEdit = !!selected?.asientoId && !!selected?.movimientoId;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Cancelaciones</div>
          <div className="text-xs text-muted-foreground">
            Ajusta cuentas y céntimos. Se guarda con trazabilidad mínima.
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void cancelacionesQuery.refetch()}>
          <RefreshCw className="size-4 mr-2" /> Actualizar
        </Button>
      </div>

      <div className="px-4 pb-4">
        {cancelacionesQuery.isLoading ? (
          <div className="text-sm text-muted-foreground py-10 text-center">Cargando…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Periodo</TableHead>
                <TableHead className="w-32">Fecha</TableHead>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="w-40">RUC</TableHead>
                <TableHead>Razón social</TableHead>
                <TableHead className="w-32 text-right">Importe</TableHead>
                <TableHead className="w-28 text-center">Estado</TableHead>
                <TableHead className="w-28 text-right">Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                    No hay cancelaciones para los filtros.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.registro_id}>
                    <TableCell className="font-mono">{r.periodo}</TableCell>
                    <TableCell className="font-mono">{r.fecha_emision}</TableCell>
                    <TableCell>{r.tipo}</TableCell>
                    <TableCell className="font-mono">{r.ruc}</TableCell>
                    <TableCell className="truncate">{r.razon_social}</TableCell>
                    <TableCell className="text-right font-mono">{formatMoney(r.importe_total)}</TableCell>
                    <TableCell className="text-center">
                      {r.tipo === "VENTA" ? (
                        r.estado_cobro === "cobrado" ? (
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-700">
                            Cobrado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-800">
                            Pendiente
                          </Badge>
                        )
                      ) : r.estado_pago === "pagado" ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-700">
                          Pagado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-800">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelected({
                            registroId: r.registro_id,
                            asientoId: r.asiento_id,
                            movimientoId: r.movimiento_id,
                            tipo: r.tipo,
                          })
                        }
                      >
                        <Pencil className="size-4 mr-2" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ajustar cancelación</DialogTitle>
          </DialogHeader>

          {!canEdit ? (
            <div className="text-sm text-muted-foreground">Esta cancelación aún no tiene asiento o movimiento vinculado.</div>
          ) : (
            <div className="grid gap-4">
              {header && (
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary">{header.tipo}</Badge>
                    <span className="font-mono">{header.periodo}</span>
                    <span className="font-mono">{header.fecha_emision}</span>
                    <span className="font-mono">{header.ruc}</span>
                    <span className="truncate text-muted-foreground">{header.razon_social}</span>
                    <span className="ml-auto font-mono">S/ {formatMoney(header.importe_total)}</span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="font-medium text-sm mb-2">Asiento contable (líneas)</div>
                  {details.lineasQuery.isLoading ? (
                    <div className="text-sm text-muted-foreground">Cargando líneas…</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">#</TableHead>
                          <TableHead className="w-28">Cuenta</TableHead>
                          <TableHead>Glosa</TableHead>
                          <TableHead className="w-24 text-right">Debe</TableHead>
                          <TableHead className="w-24 text-right">Haber</TableHead>
                          <TableHead className="w-20 text-right">Guardar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineas.map((l) => (
                          <LineaEditable
                            key={l.id}
                            linea={l}
                            motivo={motivo}
                            usuario={usuario}
                            saving={updateLinea.isPending}
                            onSave={async (patch) => {
                              try {
                                await updateLinea.mutateAsync({
                                  id: l.id,
                                  patch,
                                  audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                                });
                                await updateTotalesAsiento(l.asiento_id);
                                toast.success("Línea actualizada");
                              } catch (e: any) {
                                toast.error(e?.message ?? "No se pudo actualizar");
                              }
                            }}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="rounded-lg border p-3">
                  <div className="font-medium text-sm mb-2">Movimiento en Caja</div>
                  {details.movimientoQuery.isLoading ? (
                    <div className="text-sm text-muted-foreground">Cargando movimiento…</div>
                  ) : movimiento ? (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Fecha</Label>
                          <Input
                            type="date"
                            value={movimiento.fecha_operacion}
                            onChange={async (e) => {
                              const fecha_operacion = e.target.value;
                              try {
                                await updateMovimiento.mutateAsync({
                                  id: movimiento.id,
                                  patch: { fecha_operacion },
                                  audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                                });
                              } catch (err: any) {
                                toast.error(err?.message ?? "No se pudo guardar");
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cuenta</Label>
                          <Input
                            value={movimiento.cuenta_contable}
                            onChange={async (e) => {
                              const cuenta_contable = e.target.value;
                              try {
                                await updateMovimiento.mutateAsync({
                                  id: movimiento.id,
                                  patch: { cuenta_contable },
                                  audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                                });
                              } catch (err: any) {
                                toast.error(err?.message ?? "No se pudo guardar");
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Glosa</Label>
                        <Input
                          value={movimiento.glosa}
                          onChange={async (e) => {
                            const glosa = e.target.value;
                            try {
                              await updateMovimiento.mutateAsync({
                                id: movimiento.id,
                                patch: { glosa },
                                audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                              });
                            } catch (err: any) {
                              toast.error(err?.message ?? "No se pudo guardar");
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Debe</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="font-mono"
                            value={movimiento.debe}
                            onChange={async (e) => {
                              const debe = Number(e.target.value);
                              try {
                                await updateMovimiento.mutateAsync({
                                  id: movimiento.id,
                                  patch: { debe },
                                  audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                                });
                              } catch (err: any) {
                                toast.error(err?.message ?? "No se pudo guardar");
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Haber</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="font-mono"
                            value={movimiento.haber}
                            onChange={async (e) => {
                              const haber = Number(e.target.value);
                              try {
                                await updateMovimiento.mutateAsync({
                                  id: movimiento.id,
                                  patch: { haber },
                                  audit: { editado_por: usuario, editado_motivo: motivo.trim() ? motivo.trim() : null },
                                });
                              } catch (err: any) {
                                toast.error(err?.message ?? "No se pudo guardar");
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No se encontró el movimiento.</div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Quién ajusta</Label>
                  <Input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ej: contador@estudio.pe" />
                </div>
                <div>
                  <Label className="text-xs">Motivo (opcional)</Label>
                  <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: ajuste de céntimos / corrección de cuenta" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LineaEditable({
  linea,
  motivo,
  usuario,
  saving,
  onSave,
}: {
  linea: any;
  motivo: string;
  usuario: string;
  saving: boolean;
  onSave: (patch: any) => Promise<void>;
}) {
  const [cuenta, setCuenta] = useState(linea.cuenta);
  const [glosa, setGlosa] = useState(linea.glosa ?? "");
  const [debe, setDebe] = useState(Number(linea.debe ?? 0));
  const [haber, setHaber] = useState(Number(linea.haber ?? 0));

  return (
    <TableRow>
      <TableCell className="font-mono">{linea.orden}</TableCell>
      <TableCell>
        <Input value={cuenta} onChange={(e) => setCuenta(e.target.value)} className="font-mono h-8" />
      </TableCell>
      <TableCell>
        <Input value={glosa} onChange={(e) => setGlosa(e.target.value)} className="h-8" />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          value={debe}
          onChange={(e) => setDebe(Number(e.target.value))}
          className="font-mono h-8 text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          value={haber}
          onChange={(e) => setHaber(Number(e.target.value))}
          className="font-mono h-8 text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={() =>
            onSave({
              cuenta,
              glosa,
              debe,
              haber,
              editado_por: usuario,
              editado_motivo: motivo,
            })
          }
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  );
}

