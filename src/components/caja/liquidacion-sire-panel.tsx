import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, Loader2 } from "lucide-react";

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
import { generarCancelacionCaja } from "@/lib/asiento-cancelacion";
import { fetchComprobantesPendientesLiquidacion } from "@/lib/caja-liquidacion-service";

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

  const liquidar = useMutation({
    mutationFn: (registroId: string) => generarCancelacionCaja({ registroSireId: registroId }),
    onSuccess: async (result) => {
      if (result.duplicado) {
        toast.info("Este comprobante ya fue liquidado");
      } else {
        toast.success("Liquidación registrada: movimiento de caja + asiento de cancelación");
      }
      await qc.invalidateQueries({ queryKey: ["caja_liquidacion_pendientes"] });
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
      await qc.invalidateQueries({ queryKey: ["registros_sire"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = pendientesQuery.data ?? [];

  return (
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
        ) : rows.length === 0 ? (
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
              {rows.map((r) => (
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
  );
}
