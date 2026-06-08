import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoteCajaAuditDialog } from "@/components/libro-diario/lote-caja-audit-dialog";
import { esLineaCentralizacionCaja } from "@/lib/asientos-contables-utils";
import type { LibroDiarioLinea } from "@/lib/sire-types";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function labelCpe(row: LibroDiarioLinea) {
  return `${row.cod_tipo_cdp ?? ""}-${row.serie_cdp ?? ""}-${row.nro_cdp_inicial ?? ""}`.replace(
    /^-|-$/g,
    "",
  );
}

export type LibroDiarioGeneralFilters = {
  cpe: string;
  rucRazon: string;
  periodo: string;
  cuenta: string;
};

export function LibroDiarioGeneralPanel({
  rows,
  loading,
  periodoDefault,
}: {
  rows: LibroDiarioLinea[];
  loading: boolean;
  periodoDefault: string;
}) {
  const [filters, setFilters] = useState<LibroDiarioGeneralFilters>({
    cpe: "",
    rucRazon: "",
    periodo: periodoDefault,
    cuenta: "",
  });
  const [auditLote, setAuditLote] = useState<LibroDiarioLinea | null>(null);

  const filtered = useMemo(() => {
    const cpeQ = filters.cpe.trim().toLowerCase();
    const rucQ = filters.rucRazon.trim().toLowerCase();
    const periodoQ = filters.periodo.trim();
    const cuentaQ = filters.cuenta.trim().toLowerCase();

    return rows.filter((r) => {
      if (periodoQ && r.periodo !== periodoQ) return false;
      if (cuentaQ && !r.cuenta_contable.toLowerCase().includes(cuentaQ)) return false;
      if (cpeQ && !labelCpe(r).toLowerCase().includes(cpeQ)) return false;
      if (rucQ) {
        const haystack = `${r.ruc ?? ""} ${r.razon_social ?? ""} ${r.glosa ?? ""}`.toLowerCase();
        if (!haystack.includes(rucQ)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const totales = useMemo(() => {
    const debe = filtered.reduce((s, r) => s + Number(r.debe ?? 0), 0);
    const haber = filtered.reduce((s, r) => s + Number(r.haber ?? 0), 0);
    return { debe, haber };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="filtro-cpe" className="text-xs">
            CPE (Serie-Número)
          </Label>
          <Input
            id="filtro-cpe"
            placeholder="01-F001-123"
            value={filters.cpe}
            onChange={(e) => setFilters((f) => ({ ...f, cpe: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-ruc" className="text-xs">
            RUC / Razón social
          </Label>
          <Input
            id="filtro-ruc"
            placeholder="20100066603 o ACME SAC"
            value={filters.rucRazon}
            onChange={(e) => setFilters((f) => ({ ...f, rucRazon: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-periodo" className="text-xs">
            Periodo
          </Label>
          <Input
            id="filtro-periodo"
            placeholder="202606"
            value={filters.periodo}
            onChange={(e) => setFilters((f) => ({ ...f, periodo: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-cuenta" className="text-xs">
            Cuenta contable
          </Label>
          <Input
            id="filtro-cuenta"
            placeholder="601101"
            value={filters.cuenta}
            onChange={(e) => setFilters((f) => ({ ...f, cuenta: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-medium">Libro Diario General</h2>
            <p className="text-xs text-muted-foreground">
              Todos los asientos del periodo · provisiones, manuales y referencias a caja
            </p>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            Debe S/ {formatMoney(totales.debe)} · Haber S/ {formatMoney(totales.haber)}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Cargando asientos…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No hay asientos que coincidan con los filtros.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>CPE</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Glosa</TableHead>
                <TableHead className="text-right">Debe</TableHead>
                <TableHead className="text-right">Haber</TableHead>
                <TableHead>Libro</TableHead>
                <TableHead className="w-28 text-right">Caja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fecha_asiento}</TableCell>
                  <TableCell>{row.periodo}</TableCell>
                  <TableCell className="text-xs font-mono">{labelCpe(row) || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{row.cuenta_contable}</TableCell>
                  <TableCell className="max-w-xs truncate" title={row.glosa ?? ""}>
                    {row.glosa}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.debe > 0 ? formatMoney(row.debe) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.haber > 0 ? formatMoney(row.haber) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {row.tipo_libro ?? row.origen}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {esLineaCentralizacionCaja(row) ? (
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setAuditLote(row)}>
                        <Eye className="size-4 mr-1" />
                        Ver
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <LoteCajaAuditDialog
        linea={auditLote}
        open={!!auditLote}
        onOpenChange={(v) => !v && setAuditLote(null)}
      />
    </div>
  );
}
