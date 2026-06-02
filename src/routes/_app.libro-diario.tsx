import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ClienteSearchCombobox } from "@/components/libro-diario/cliente-search-combobox";
import { ComprobantesPendientesTable } from "@/components/libro-diario/comprobantes-pendientes-table";
import { AsientoEditorGrid } from "@/components/libro-diario/asiento-editor-grid";
import { ExportButtons } from "@/components/export-buttons";
import {
  exportLibroExcel,
  exportLibroPdf,
  exportRegistrosExcel,
} from "@/lib/export-service";
import { fetchLibroDiario, fetchRegistrosSire } from "@/lib/sire-data";
import { fetchPcgeCuentasActivas } from "@/lib/pcge-service";
import {
  fetchComprobantesPendientes,
  guardarAsientoProvision,
  proponerLineasAsiento,
  type LineaAsientoEditable,
} from "@/lib/libro-diario-service";
import type { ClienteOption } from "@/lib/cliente-search-service";
import type { ComprobantePendiente } from "@/lib/libro-diario-service";
import type { LibroDiarioLinea } from "@/lib/sire-types";

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
  const [cliente, setCliente] = useState<ClienteOption | null>(null);
  const [selectedComprobante, setSelectedComprobante] = useState<ComprobantePendiente | null>(null);
  const [lineas, setLineas] = useState<LineaAsientoEditable[]>([]);

  const pcgeQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas,
  });

  const pendientesQuery = useQuery({
    queryKey: ["comprobantes_pendientes", cliente?.ruc, periodo],
    queryFn: () =>
      fetchComprobantesPendientes({
        ruc: cliente!.ruc,
        periodo: periodo || undefined,
      }),
    enabled: !!cliente?.ruc,
  });

  const lineasQuery = useQuery({
    queryKey: ["libro_diario", periodo],
    queryFn: () => fetchLibroDiario(periodo || undefined),
  });

  const registrosQuery = useQuery({
    queryKey: ["libro_registros_sire", periodo],
    queryFn: () => fetchRegistrosSire(periodo || undefined),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      guardarAsientoProvision({
        registroId: selectedComprobante!.id,
        lineas: lineas.map(({ key: _k, ...l }) => l),
      }),
    onSuccess: () => {
      toast.success("Asiento registrado en el Libro Diario");
      setSelectedComprobante(null);
      setLineas([]);
      qc.invalidateQueries({ queryKey: ["libro_diario"] });
      qc.invalidateQueries({ queryKey: ["comprobantes_pendientes"] });
      qc.invalidateQueries({ queryKey: ["libro_registros_sire"] });
      qc.invalidateQueries({ queryKey: ["registros_pendientes"] });
      qc.invalidateQueries({ queryKey: ["dashboard_registros_sire"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSelectComprobante = (row: ComprobantePendiente) => {
    setSelectedComprobante(row);
    setLineas(proponerLineasAsiento(row));
  };

  const rows = lineasQuery.data ?? [];
  const registros = registrosQuery.data ?? [];
  const cuentasPcge = pcgeQuery.data ?? [];

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

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <BookOpen className="size-8 text-primary" />
            Libro Diario
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Database className="size-3.5" />
            Provisión por comprobante SIRE · Plan de Cuentas editable
          </p>
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

      {/* --- Flujo: Cliente → Comprobante → Asiento editable --- */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <ClienteSearchCombobox
          value={cliente}
          onSelect={(c) => {
            setCliente(c);
            setSelectedComprobante(null);
            setLineas([]);
          }}
        />

        {cliente && (
          <ComprobantesPendientesTable
            rows={pendientesQuery.data ?? []}
            loading={pendientesQuery.isLoading}
            selectedId={selectedComprobante?.id ?? null}
            onSelect={handleSelectComprobante}
          />
        )}
      </div>

      {selectedComprobante && lineas.length > 0 && (
        <AsientoEditorGrid
          registro={selectedComprobante}
          lineas={lineas}
          onChange={setLineas}
          cuentasPcge={cuentasPcge}
          saving={saveMutation.isPending}
          onSave={() => saveMutation.mutate()}
        />
      )}

      {pcgeQuery.isLoading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-3 animate-spin" />
          Cargando plan de cuentas…
        </div>
      )}

      {/* --- KPIs del libro registrado --- */}
      <div className="grid md:grid-cols-3 gap-4">
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

      {/* --- Libro registrado --- */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="font-medium">Asientos registrados</h2>
          <p className="text-xs text-muted-foreground">
            Historial del libro diario vinculado a registros SIRE validados.
          </p>
        </div>
        {lineasQuery.isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Cargando asientos…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No hay asientos registrados. Selecciona un comprobante y confirma su provisión.
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
