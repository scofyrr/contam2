import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CHART_CATALOG, type ChartCatalogId } from "@/lib/sire-types";
import { ExportButtons } from "@/components/export-buttons";
import type { ExportPack } from "@/lib/export-service";
import { exportToExcel, exportToPdf } from "@/lib/export-service";

const ALL_IDS = CHART_CATALOG.map((c) => c.id);

type Props = {
  pack: ExportPack;
  disabled?: boolean;
};

export function ChartExportPanel({ pack, disabled }: Props) {
  const [selected, setSelected] = useState<ChartCatalogId[]>([...ALL_IDS]);
  const [includeRegistros, setIncludeRegistros] = useState(true);
  const [includeLibro, setIncludeLibro] = useState(true);
  const [includeKpis, setIncludeKpis] = useState(true);

  const toggle = (id: ChartCatalogId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const opts = {
    chartIds: selected,
    includeRegistros,
    includeLibro,
    includeKpis,
  };

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-muted/40 to-background shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Exportar reportes</CardTitle>
        <p className="text-xs text-muted-foreground">
          Elija tablas y gráficos a incluir en Excel o PDF
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={includeKpis} onCheckedChange={(v) => setIncludeKpis(!!v)} />
            <span>KPIs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeRegistros}
              onCheckedChange={(v) => setIncludeRegistros(!!v)}
            />
            <span>Tabla Registros SIRE</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={includeLibro} onCheckedChange={(v) => setIncludeLibro(!!v)} />
            <span>Tabla Libro Diario</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CHART_CATALOG.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50"
            >
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={() => toggle(c.id)}
              />
              {c.label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelected([...ALL_IDS])}
          >
            Todos los gráficos
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected([])}>
            Ninguno
          </Button>
          <div className="flex-1" />
          <ExportButtons
            prominent
            disabled={disabled || (selected.length === 0 && !includeRegistros && !includeKpis)}
            onExportExcel={() => exportToExcel(pack, opts)}
            onExportPdf={() => exportToPdf(pack, opts)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
