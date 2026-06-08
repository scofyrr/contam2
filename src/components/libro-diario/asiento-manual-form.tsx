import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { CuentaPcgeCombobox } from "@/components/libro-diario/cuenta-pcge-combobox";
import { fetchPcgeCuentasActivas } from "@/lib/pcge-service";
import {
  guardarAsientoManual,
  isAsientoCuadrado,
  sumDebe,
  sumHaber,
  toEditableLineas,
  type LineaAsientoEditable,
} from "@/lib/libro-diario-service";
import { invalidateLibrosContables } from "@/lib/query-keys-contables";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AsientoManualForm({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string;
}) {
  const qc = useQueryClient();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState("");
  const [lineas, setLineas] = useState<LineaAsientoEditable[]>(
    toEditableLineas([
      { orden: 1, cuenta: "601101", glosa: "", debe: 0, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "", debe: 0, haber: 0 },
    ]),
  );

  const pcgeQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      guardarAsientoManual({
        ruc,
        periodo: periodo.trim(),
        fecha,
        glosa,
        lineas: lineas.map(({ key: _k, ...l }) => l),
      }),
    onSuccess: () => {
      toast.success("Asiento manual registrado (DIARIO_MANUAL)");
      setGlosa("");
      setLineas(
        toEditableLineas([
          { orden: 1, cuenta: "601101", glosa: "", debe: 0, haber: 0 },
          { orden: 2, cuenta: "421201", glosa: "", debe: 0, haber: 0 },
        ]),
      );
      invalidateLibrosContables(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cuadrado = isAsientoCuadrado(lineas);
  const cuentas = pcgeQuery.data ?? [];

  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        key: `linea-${prev.length + 1}`,
        orden: prev.length + 1,
        cuenta: "",
        glosa: glosa,
        debe: 0,
        haber: 0,
      },
    ]);
  };

  const updateLinea = (key: string, patch: Partial<LineaAsientoEditable>) => {
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const removeLinea = (key: string) => {
    setLineas((prev) => prev.filter((l) => l.key !== key));
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div>
        <h3 className="font-medium text-sm">Asiento libre / ajuste manual</h3>
        <p className="text-xs text-muted-foreground">
          Planillas, apertura, reclasificaciones · tipo_libro = DIARIO_MANUAL
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Glosa general</Label>
          <Input
            placeholder="Apertura del ejercicio, planilla mes…"
            value={glosa}
            onChange={(e) => setGlosa(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cuenta</TableHead>
            <TableHead>Glosa</TableHead>
            <TableHead className="w-28 text-right">Debe</TableHead>
            <TableHead className="w-28 text-right">Haber</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineas.map((l) => (
            <TableRow key={l.key}>
              <TableCell>
                <CuentaPcgeCombobox
                  value={l.cuenta}
                  onChange={(v) => updateLinea(l.key, { cuenta: v })}
                  cuentas={cuentas}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={l.glosa}
                  onChange={(e) => updateLinea(l.key, { glosa: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="text-right"
                  value={l.debe || ""}
                  onChange={(e) =>
                    updateLinea(l.key, { debe: Number(e.target.value), haber: 0 })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="text-right"
                  value={l.haber || ""}
                  onChange={(e) =>
                    updateLinea(l.key, { haber: Number(e.target.value), debe: 0 })
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => removeLinea(l.key)}
                  disabled={lineas.length <= 2}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={addLinea}>
          <Plus className="size-4 mr-1" />
          Línea
        </Button>
        <div className="text-sm tabular-nums text-muted-foreground">
          Debe S/ {formatMoney(sumDebe(lineas))} · Haber S/ {formatMoney(sumHaber(lineas))}
        </div>
        <Button
          size="sm"
          disabled={!cuadrado || !glosa.trim() || !periodo.trim() || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          <Save className="size-4 mr-1" />
          Confirmar asiento manual
        </Button>
      </div>

      {!cuadrado && (
        <Alert variant="destructive">
          <AlertDescription>El asiento está descuadrado. Ajuste Debe y Haber.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
