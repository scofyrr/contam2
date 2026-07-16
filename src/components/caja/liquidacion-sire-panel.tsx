import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, Loader2, Trash2, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  generarCancelacionCaja,
  revertirCancelacion,
  limpiarDuplicadosCancelacion,
} from "@/lib/asiento-cancelacion";
import { fetchComprobantesPendientesLiquidacion } from "@/lib/caja-liquidacion-service";
import { fetchCancelaciones } from "@/lib/cancelaciones-service";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function LiquidacionSirePanel({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo?: string | null;
}) {
  const qc = useQueryClient();

  const pendientesQuery = useQuery({
    queryKey: ["caja_liquidacion_pendientes", ruc, periodo],
    queryFn: () =>
      fetchComprobantesPendientesLiquidacion({
        ruc,
        periodo: periodo ?? undefined,
      }),
    enabled: !!ruc.trim(),
  });

  const cancelacionesQuery = useQuery({
    queryKey: ["cancelaciones", ruc, periodo],
    queryFn: () => fetchCancelaciones({ ruc, periodo }),
    enabled: !!ruc.trim(),
  });

  const invalidateAll = async () => {
    await qc.invalidateQueries({ queryKey: ["caja_liquidacion_pendientes"] });
    await qc.invalidateQueries({ queryKey: ["caja"] });
    await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
    await qc.invalidateQueries({ queryKey: ["registros_sire"] });
  };

  const liquidar = useMutation({
    mutationFn: (registroId: string) => generarCancelacionCaja({ registroSireId: registroId }),
    onSuccess: async (result) => {
      if (result.duplicado) {
        toast.info("Este comprobante ya fue liquidado");
      } else {
        toast.success("Liquidación registrada: movimiento de caja + asiento de cancelación");
      }
      await invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revertir = useMutation({
    mutationFn: (registroId: string) => revertirCancelacion(registroId),
    onSuccess: async () => {
      toast.success("Pago/cobro revertido — el comprobante vuelve a Pendiente");
      await invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const limpiarDups = useMutation({
    mutationFn: () => limpiarDuplicadosCancelacion(ruc, periodo),
    onSuccess: async (res) => {
      toast.success(`Limpieza completada: ${res.registros_eliminados} duplicado(s) eliminado(s)`);
      await invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendientes = pendientesQuery.data ?? [];
  const cancelaciones = cancelacionesQuery.data ?? [];

  return (
    <div className="space-y-4">
      {/* ── Comprobantes pendientes ── */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Banknote className="size-4" />
              Liquidación de comprobantes (SIRE)
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cobro/pago atómico: movimiento en caja, asiento{" "}
              <code className="text-xs">cancelacion_caja</code> y actualización de estado SIRE.
            </p>
          </div>
          <Badge variant="outline">Transacción RPC</Badge>
        </div>

        <div className="px-4 pb-4">
          {pendientesQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Cargando comprobantes…
            </div>
          ) : pendientes.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay comprobantes validados pendientes de cobro/pago.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendientes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.fecha_emision}</TableCell>
                    <TableCell>
                      <Badge variant={r.tipo === "VENTA" ? "default" : "secondary"}>{r.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.cod_tipo_cdp}-{r.serie_cdp}-{r.nro_cdp_inicial}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.ruc}</TableCell>
                    <TableCell className="text-right font-mono">S/ {formatMoney(r.mto_total_cp)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={liquidar.isPending}
                        onClick={() => liquidar.mutate(r.id)}
                      >
                        {r.tipo === "VENTA" ? "Registrar cobro" : "Registrar pago"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── Cancelaciones activas (con opción de revertir) ── */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-semibold flex items-center gap-2">
              Cancelaciones activas
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Comprobantes ya cobrados/pagados. Usa 🗑 para revertir si hay error.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                disabled={limpiarDups.isPending}
              >
                <AlertTriangle className="size-3 mr-1" />
                Limpiar duplicados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Limpiar duplicados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán todos los asientos y movimientos de caja duplicados para este
                  contribuyente/período, conservando solo el más reciente por comprobante.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => limpiarDups.mutate()}>
                  Sí, limpiar duplicados
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="px-4 pb-4">
          {cancelacionesQuery.isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Cargando…
            </div>
          ) : cancelaciones.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No hay cancelaciones registradas en este período.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Revertir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelaciones.map((c) => (
                  <TableRow key={c.registro_id}>
                    <TableCell className="font-mono text-xs">{c.fecha_emision}</TableCell>
                    <TableCell>
                      <Badge variant={c.tipo === "VENTA" ? "default" : "secondary"}>{c.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{c.razon_social}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      S/ {formatMoney(c.importe_total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-400">
                        {c.tipo === "VENTA" ? "Cobrado" : "Pagado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Revertir pago/cobro"
                            disabled={revertir.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Revertir cancelación?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el asiento de cancelación y el movimiento de caja de{" "}
                              <strong>S/ {formatMoney(c.importe_total)}</strong> para{" "}
                              <strong>{c.razon_social}</strong>. El comprobante volverá a{" "}
                              <strong>Pendiente</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => revertir.mutate(c.registro_id)}
                            >
                              Sí, revertir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
