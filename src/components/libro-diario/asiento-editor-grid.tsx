import { useMemo } from "react";
import { AlertTriangle, Plus, Save, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CuentaPcgeCombobox } from "@/components/libro-diario/cuenta-pcge-combobox";
import type { PcgeCuenta } from "@/lib/pcge-service";
import {
  isAsientoCuadrado,
  round2,
  sumDebe,
  sumHaber,
  type LineaAsientoEditable,
} from "@/lib/libro-diario-service";
import type { RegistroSire } from "@/lib/sire-types";
import { resolverMontosComprobante } from "@/lib/asientos-generator";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AsientoEditorGrid({
  registro,
  lineas,
  onChange,
  cuentasPcge,
  onSave,
  saving,
}: {
  registro: RegistroSire;
  lineas: LineaAsientoEditable[];
  onChange: (lineas: LineaAsientoEditable[]) => void;
  cuentasPcge: PcgeCuenta[];
  onSave: () => void;
  saving: boolean;
}) {
  const montos = useMemo(() => resolverMontosComprobante(registro), [registro]);
  const totalDebe = sumDebe(lineas);
  const totalHaber = sumHaber(lineas);
  const diff = round2(Math.abs(totalDebe - totalHaber));
  const cuadrado = isAsientoCuadrado(lineas);

  const updateLinea = (key: string, patch: Partial<LineaAsientoEditable>) => {
    onChange(lineas.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const addLinea = () => {
    const orden = lineas.length + 1;
    onChange([
      ...lineas,
      {
        key: `linea-new-${Date.now()}`,
        orden,
        cuenta: cuentasPcge[0]?.codigo_cuenta ?? "101",
        glosa: "",
        debe: 0,
        haber: 0,
      },
    ]);
  };

  const removeLinea = (key: string) => {
    if (lineas.length <= 2) return;
    onChange(
      lineas
        .filter((l) => l.key !== key)
        .map((l, i) => ({ ...l, orden: i + 1 })),
    );
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-medium">Asiento propuesto (editable)</div>
          <p className="text-xs text-muted-foreground mt-1">
            {registro.tipo} · {registro.cod_tipo_cdp}-{registro.serie_cdp}-{registro.nro_cdp_inicial} ·
            Base S/ {formatMoney(montos.base)} · IGV S/ {formatMoney(montos.igv)} · Total S/{" "}
            {formatMoney(montos.total)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addLinea}>
            <Plus className="size-4 mr-1" /> Línea
          </Button>
          <Button size="sm" disabled={!cuadrado || saving} onClick={onSave}>
            <Save className="size-4 mr-1" />
            {saving ? "Guardando…" : "Confirmar asiento"}
          </Button>
        </div>
      </div>

      {!cuadrado && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Asiento descuadrado</AlertTitle>
            <AlertDescription>
              Debe S/ {formatMoney(totalDebe)} ≠ Haber S/ {formatMoney(totalHaber)} (diferencia S/{" "}
              {formatMoney(diff)}). Ajusta los montos antes de guardar.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-48">Cuenta PCGE</TableHead>
            <TableHead>Glosa</TableHead>
            <TableHead className="w-28 text-right">Debe</TableHead>
            <TableHead className="w-28 text-right">Haber</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineas.map((l) => (
            <TableRow key={l.key}>
              <TableCell className="font-mono text-xs">{l.orden}</TableCell>
              <TableCell>
                <CuentaPcgeCombobox
                  value={l.cuenta}
                  onChange={(cuenta) => updateLinea(l.key, { cuenta })}
                  cuentas={cuentasPcge}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={l.glosa}
                  onChange={(e) => updateLinea(l.key, { glosa: e.target.value })}
                  className="h-8 text-xs"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={l.debe || ""}
                  onChange={(e) =>
                    updateLinea(l.key, {
                      debe: round2(Number(e.target.value) || 0),
                      haber: Number(e.target.value) > 0 ? 0 : l.haber,
                    })
                  }
                  className="h-8 font-mono text-right text-xs"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={l.haber || ""}
                  onChange={(e) =>
                    updateLinea(l.key, {
                      haber: round2(Number(e.target.value) || 0),
                      debe: Number(e.target.value) > 0 ? 0 : l.debe,
                    })
                  }
                  className="h-8 font-mono text-right text-xs"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  disabled={lineas.length <= 2}
                  onClick={() => removeLinea(l.key)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/30 font-medium">
            <TableCell colSpan={3} className="text-right">
              Totales
            </TableCell>
            <TableCell className="text-right font-mono">{formatMoney(totalDebe)}</TableCell>
            <TableCell className="text-right font-mono">{formatMoney(totalHaber)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
