import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { idReferenciaLote } from "@/lib/asientos-contables-utils";
import { fetchMovimientosPorAsientoLote } from "@/lib/caja-service";
import type { LibroDiarioLinea } from "@/lib/sire-types";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function LoteCajaAuditDialog({
  linea,
  open,
  onOpenChange,
}: {
  linea: LibroDiarioLinea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const loteId = linea ? idReferenciaLote(linea) : "";

  const movimientosQuery = useQuery({
    queryKey: ["caja", "lote", loteId],
    queryFn: () => fetchMovimientosPorAsientoLote(loteId),
    enabled: open && !!loteId,
  });

  const movs = movimientosQuery.data ?? [];
  const totalDebe = movs.reduce((s, m) => s + Number(m.debe ?? 0), 0);
  const totalHaber = movs.reduce((s, m) => s + Number(m.haber ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Lote de centralización (Libro Caja)
          </DialogTitle>
          <DialogDescription>
            Consulta los movimientos de caja vinculados al asiento consolidado del Libro Diario.
          </DialogDescription>
        </DialogHeader>

        <FieldHelper variant="info">
          Este diálogo muestra la trazabilidad entre el lote centralizado en Libro Diario y sus movimientos
          origen en Libro Caja. Verifique que Debe y Haber cuadren antes de cerrar el periodo.
        </FieldHelper>

        {linea && (
          <div className="text-sm space-y-1 rounded-md border bg-muted/30 p-3">
            <p>
              <span className="text-muted-foreground">Referencia lote:</span>{" "}
              <span className="font-mono text-xs">{loteId}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Periodo:</span> {linea.periodo} · RUC{" "}
              {linea.ruc}
            </p>
            <p className="text-muted-foreground text-xs">{linea.glosa}</p>
          </div>
        )}

        {movimientosQuery.isLoading ? (
          <div className="py-8 flex justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            Cargando movimientos del lote…
          </div>
        ) : movs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No hay movimientos con <code className="text-xs">asiento_id</code> igual a esta
            referencia. Verifique que el lote fue centralizado correctamente.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Glosa</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead className="text-right">Debe</TableHead>
                  <TableHead className="text-right">Haber</TableHead>
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movs.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">
                      {m.fecha_operacion ?? m.fecha}
                    </TableCell>
                    <TableCell>{m.glosa}</TableCell>
                    <TableCell className="font-mono">{m.cuenta_contable}</TableCell>
                    <TableCell className="text-right font-mono">{formatMoney(Number(m.debe))}</TableCell>
                    <TableCell className="text-right font-mono">{formatMoney(Number(m.haber))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {m.origen}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground text-right">
              Total Debe {formatMoney(totalDebe)} · Haber {formatMoney(totalHaber)} ·{" "}
              {movs.length} movimiento(s)
            </p>
          </>
        )}

        <DialogFooter>
          {linea?.ruc && linea?.periodo ? (
            <Button variant="outline" asChild>
              <Link to="/libro-caja" search={{ tab: "movimientos" }}>
                Abrir Libro Caja
              </Link>
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
