import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCuentasFinancieras } from "@/lib/cuentas-financieras-service";
import { MEDIOS_PAGO_SUNAT } from "@/lib/cuentas-financieras-types";
import { registrarOperacionDirectaCaja } from "@/lib/libro-caja-asientos-service";
import { invalidateLibrosContables, queryKeys } from "@/lib/query-keys-contables";

export function OperacionDirectaForm({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string;
}) {
  const qc = useQueryClient();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState("");
  const [tipo, setTipo] = useState<"egreso" | "ingreso">("egreso");
  const [monto, setMonto] = useState("");
  const [cuentaFinId, setCuentaFinId] = useState("");
  const [contrapartida, setContrapartida] = useState("401111");
  const [medioPago, setMedioPago] = useState<string>("009");

  const cuentasQuery = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc,
  });

  const cuentaSel = (cuentasQuery.data ?? []).find((c) => c.id === cuentaFinId)
    ?? cuentasQuery.data?.[0];

  const mutation = useMutation({
    mutationFn: async () => {
      const val = Number(monto);
      if (!cuentaSel || val <= 0) throw new Error("Indique monto y cuenta financiera.");
      const glosaFull = `${glosa.trim()} · Medio ${medioPago}`;
      await registrarOperacionDirectaCaja({
        ruc,
        periodo: periodo.trim(),
        fecha,
        glosa: glosaFull,
        cuentaFinanciera: cuentaSel.cuenta_contable,
        debe: tipo === "ingreso" ? val : 0,
        haber: tipo === "egreso" ? val : 0,
        contrapartida,
      });
    },
    onSuccess: () => {
      toast.success("Operación directa registrada (CAJA_BANCOS)");
      setGlosa("");
      setMonto("");
      invalidateLibrosContables(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div>
        <h3 className="font-medium text-sm">Operación directa (sin CPE)</h3>
        <p className="text-xs text-muted-foreground">
          Tributos SUNAT, transferencias entre cuentas, gastos de caja chica, planilla neta
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as "egreso" | "ingreso")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="egreso">Egreso (salida de caja/banco)</SelectItem>
              <SelectItem value="ingreso">Ingreso (entrada a caja/banco)</SelectItem>
            </SelectContent>
          </Select>
          <FieldHelper>Egreso = salida de efectivo; Ingreso = entrada. Sin comprobante electrónico vinculado.</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <FieldHelper>Fecha de la operación de tesorería dentro del periodo contable.</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label>Monto (S/)</Label>
          <Input
            type="number"
            min={0.01}
            step={0.01}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <FieldHelper>Importe en soles de la operación. Debe ser mayor a cero.</FieldHelper>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Glosa</Label>
          <Input
            placeholder="Pago PDTE mes, transferencia BCP→BBVA…"
            value={glosa}
            onChange={(e) => setGlosa(e.target.value)}
          />
          <FieldHelper>Motivo de la operación: tributos, transferencias, gastos de caja chica, etc.</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label>Medio de pago</Label>
          <Select value={medioPago} onValueChange={setMedioPago}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIOS_PAGO_SUNAT.map((m) => (
                <SelectItem key={m.codigo} value={m.codigo}>
                  {m.codigo} — {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHelper>Código de medio de pago según catálogo SUNAT (Tabla 01).</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label>Cuenta financiera</Label>
          <Select
            value={cuentaFinId || cuentaSel?.id || ""}
            onValueChange={setCuentaFinId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Caja o banco" />
            </SelectTrigger>
            <SelectContent>
              {(cuentasQuery.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre} ({c.cuenta_contable})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHelper>Caja o banco (Clase 10) desde donde sale o entra el efectivo.</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label>Cuenta contrapartida</Label>
          <Input
            placeholder="401111 tributos, 421201…"
            value={contrapartida}
            onChange={(e) => setContrapartida(e.target.value)}
          />
          <FieldHelper>Cuenta de contrapartida contable (ej. 401111 tributos, 421201 proveedores).</FieldHelper>
        </div>
      </div>

      <Button
        disabled={mutation.isPending || !glosa.trim() || !periodo.trim() || Number(monto) <= 0}
        onClick={() => mutation.mutate()}
      >
        <Save className="size-4 mr-1" />
        Registrar operación
      </Button>
    </div>
  );
}
