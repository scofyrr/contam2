import { useMemo } from "react";
import { FileText } from "lucide-react";

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
import type { ComprobantePendiente } from "@/lib/libro-diario-service";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ComprobantesPendientesTable({
  rows,
  loading,
  selectedId,
  onSelect,
}: {
  rows: ComprobantePendiente[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (row: ComprobantePendiente) => void;
}) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.fecha_emision.localeCompare(a.fecha_emision)),
    [rows],
  );

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando comprobantes…
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        No hay comprobantes pendientes de provisión para este cliente.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/20">
        <div className="font-medium flex items-center gap-2">
          <FileText className="size-4" />
          Comprobantes pendientes (SIRE)
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Selecciona un comprobante individual para generar su asiento de provisión.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Comprobante</TableHead>
            <TableHead>Contraparte</TableHead>
            <TableHead className="text-right">Base</TableHead>
            <TableHead className="text-right">IGV</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow
              key={r.id}
              className={selectedId === r.id ? "bg-primary/5" : undefined}
            >
              <TableCell className="font-mono text-xs">{r.fecha_emision}</TableCell>
              <TableCell>
                <Badge variant={r.tipo === "VENTA" ? "default" : "secondary"}>{r.tipo}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {r.cod_tipo_cdp}-{r.serie_cdp}-{r.nro_cdp_inicial}
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-xs">
                {r.nombre_contraparte ?? "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatMoney(Number(r.mto_bi_gravada ?? r.bi_grav ?? 0))}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatMoney(Number(r.mto_igv_ipe ?? r.igv_grav ?? 0))}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatMoney(Number(r.mto_total_cp ?? r.importe_total ?? 0))}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={selectedId === r.id ? "default" : "outline"}
                  onClick={() => onSelect(r)}
                >
                  Generar asiento
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
