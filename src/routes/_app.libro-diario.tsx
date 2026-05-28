import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LibroDiarioLinea } from "@/lib/sire-types";
import { fetchLibroDiario, fetchRegistrosSire } from "@/lib/sire-data";
import { ExportButtons } from "@/components/export-buttons";
import {
  exportLibroExcel,
  exportLibroPdf,
  exportRegistrosExcel,
  exportToExcel,
  exportToPdf,
} from "@/lib/export-service";
import { computeCharts, computeKpis } from "@/lib/stats-service";

export const Route = createFileRoute("/_app/libro-diario")({
  component: LibroDiarioPage,
});

function formatPeriodoInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function LibroDiarioPage() {
  const qc = useQueryClient();
  const [periodo, setPeriodo] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const lineasQuery = useQuery({
    queryKey: ["libro_diario", periodo],
    queryFn: () => fetchLibroDiario(periodo || undefined),
  });

  const registrosQuery = useQuery({
    queryKey: ["libro_registros_sire", periodo],
    queryFn: () => fetchRegistrosSire(periodo || undefined),
  });

  const pendientesQuery = useQuery({
    queryKey: ["registros_pendientes", periodo],
    queryFn: async () => {
      let q = supabase
        .from("registros_sire")
        .select("id, tipo, periodo, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, importe_total, estado_validacion")
        .or("estado_validacion.is.null,estado_validacion.eq.pendiente,estado_validacion.eq.ia_sugerido")
        .limit(50);

      if (periodo) q = q.eq("periodo", periodo);

      const { data, error } = await q;
      if (error) return [];
      return data ?? [];
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (registroId: string) => {
      setValidatingId(registroId);
      const res = await fetch("/api/sire/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registroId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al validar");
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Registro validado");
      qc.invalidateQueries({ queryKey: ["libro_diario"] });
      qc.invalidateQueries({ queryKey: ["libro_registros_sire"] });
      qc.invalidateQueries({ queryKey: ["registros_pendientes"] });
      qc.invalidateQueries({ queryKey: ["dashboard_registros_sire"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setValidatingId(null),
  });

  const rows = lineasQuery.data?.rows ?? [];
  const registros = registrosQuery.data?.rows ?? [];
  const demo = lineasQuery.data?.demo ?? registrosQuery.data?.demo ?? false;

  const totales = useMemo(() => {
    const debe = rows.reduce((s, r) => s + Number(r.debe ?? 0), 0);
    const haber = rows.reduce((s, r) => s + Number(r.haber ?? 0), 0);
    return { debe, haber, diff: Math.abs(debe - haber) };
  }, [rows]);

  const grouped = useMemo(() => {
    const map = new Map<string, LibroDiarioLinea[]>();
    for (const row of rows) {
      const key = `${row.sire_registro_id ?? row.id}-${row.fecha_asiento}`;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [rows]);

  const exportFullPack = useMemo(() => {
    const p = periodo || undefined;
    const kpis = computeKpis(registros, periodo || null);
    const charts = computeCharts(registros, periodo || null);
    return {
      titulo: "CONTAM_Libro_y_SIRE",
      periodo: p,
      registros,
      libro: rows,
      kpis,
      charts,
    };
  }, [periodo, registros, rows]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <BookOpen className="size-8 text-primary" />
            Libro Diario
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Database className="size-3.5" />
            Asientos vinculados a registros validados en{" "}
            <code className="text-xs bg-muted px-1 rounded">registros_sire</code>
          </p>
          {demo && (
            <Badge variant="secondary" className="mt-2">
              Modo demo — datos de ejemplo
            </Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="w-44">
            <Label className="text-xs">Periodo (AAAAMM)</Label>
            <Input
              placeholder="202605"
              value={periodo}
              onChange={(e) => setPeriodo(formatPeriodoInput(e.target.value))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <ExportButtons
              prominent
              compact
              disabled={rows.length === 0}
              onExportExcel={() => exportLibroExcel(rows, periodo || undefined)}
              onExportPdf={() => exportLibroPdf(rows, periodo || undefined)}
            />
            <ExportButtons
              prominent
              compact
              disabled={registros.length === 0}
              onExportExcel={() => exportRegistrosExcel(registros, periodo || undefined)}
            />
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debe</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            S/ {formatMoney(totales.debe)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Haber</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            S/ {formatMoney(totales.haber)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diferencia</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold tabular-nums ${totales.diff > 0.01 ? "text-destructive" : "text-emerald-600"}`}
          >
            S/ {formatMoney(totales.diff)}
          </CardContent>
        </Card>
      </div>

      {(pendientesQuery.data?.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-card p-4 mb-6">
          <h2 className="font-medium mb-3">Pendientes de validar</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Al validar se generan asientos y el dashboard se actualiza con los mismos datos SIRE.
          </p>
          <div className="flex flex-wrap gap-2">
            {pendientesQuery.data?.map((r: Record<string, unknown>) => (
              <Button
                key={String(r.id)}
                size="sm"
                variant="outline"
                disabled={validateMutation.isPending}
                onClick={() => validateMutation.mutate(String(r.id))}
              >
                {validatingId === r.id ? (
                  <Loader2 className="size-3 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3 mr-1" />
                )}
                {String(r.tipo)} {String(r.serie_cdp)}-{String(r.nro_cdp_inicial)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-x-auto">
        {lineasQuery.isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Cargando asientos…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No hay asientos. Valida un registro SIRE para generar partida doble.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Glosa</TableHead>
                <TableHead className="text-right">Debe</TableHead>
                <TableHead className="text-right">Haber</TableHead>
                <TableHead>Naturaleza</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.flatMap(([key, groupRows]) =>
                groupRows.map((row, idx) => (
                  <TableRow key={`${key}-${row.id}-${idx}`}>
                    <TableCell>{row.fecha_asiento}</TableCell>
                    <TableCell>{row.periodo}</TableCell>
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
                      <Badge variant={row.naturaleza === "debe" ? "default" : "secondary"}>
                        {row.naturaleza}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{row.tipo_registro ?? "—"}</TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
