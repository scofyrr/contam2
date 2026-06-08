import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { RequireRucEmptyState } from "@/components/shared/empresa-periodo-filters";
import { RegistrarPagoCobroModal } from "@/components/libro-diario/registrar-pago-cobro-modal";
import { fetchDeudasPendientes, type DeudaPendiente } from "@/lib/cxc-cxp-service";
import { queryKeys } from "@/lib/query-keys-contables";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CxcCxpBandeja({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string;
}) {
  const [modalDeuda, setModalDeuda] = useState<DeudaPendiente | null>(null);

  const deudasQuery = useQuery({
    queryKey: queryKeys.cxcCxp(ruc, periodo.trim() || null),
    queryFn: () =>
      fetchDeudasPendientes({
        ruc,
        periodo: periodo.trim() || undefined,
      }),
    enabled: !!ruc,
  });

  if (!ruc) {
    return (
      <RequireRucEmptyState context="Selecciona el contribuyente para calcular saldos 421201 / 121201 pendientes." />
    );
  }

  const rows = deudasQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-medium flex items-center gap-2">
              <Banknote className="size-5 text-primary" />
              Cuentas por pagar y cobrar
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Provisiones sin cancelación en Libro Caja · El botón extra genera asientos CAJA_BANCOS
            </p>
          </div>
          <Badge variant="secondary">{rows.length} pendientes</Badge>
        </div>

        {deudasQuery.isLoading ? (
          <div className="py-8 flex justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="size-4 animate-spin" />
            Calculando saldos…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No hay deudas pendientes en 421201 / 121201 para este periodo.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Comprobante</TableHead>
                <TableHead>Contraparte</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Cancelado</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right w-40">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.sireRegistroId}>
                  <TableCell>
                    <Badge variant={d.tipo === "COMPRA" ? "destructive" : "default"}>
                      {d.tipo === "COMPRA" ? "CxP" : "CxC"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{d.comprobante}</TableCell>
                  <TableCell className="max-w-[180px] truncate" title={d.nombreContraparte ?? ""}>
                    {d.nombreContraparte ?? d.rucContraparte ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{d.cuentaComercial}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(d.montoTotal)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatMoney(d.montoCancelado)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    S/ {formatMoney(d.saldoPendiente)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => setModalDeuda(d)}>
                      Registrar Pago / Cobro
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <RegistrarPagoCobroModal
        deuda={modalDeuda}
        ruc={ruc}
        open={!!modalDeuda}
        onOpenChange={(v) => !v && setModalDeuda(null)}
      />
    </div>
  );
}
