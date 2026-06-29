import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { registrarPagoCobroCaja, type DeudaPendiente } from "@/lib/cxc-cxp-service";
import { invalidateLibrosContables, queryKeys } from "@/lib/query-keys-contables";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function RegistrarPagoCobroModal({
  deuda,
  ruc,
  open,
  onOpenChange,
}: {
  deuda: DeudaPendiente | null;
  ruc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [medioPago, setMedioPago] = useState<string>(MEDIOS_PAGO_SUNAT[0].codigo);
  const [cuentaFinId, setCuentaFinId] = useState("");
  const [monto, setMonto] = useState("");

  const cuentasQuery = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: open && !!ruc,
  });

  useEffect(() => {
    if (deuda) {
      setMonto(String(deuda.saldoPendiente));
      setFechaPago(new Date().toISOString().slice(0, 10));
    }
  }, [deuda]);

  useEffect(() => {
    const list = cuentasQuery.data ?? [];
    if (list.length && !cuentaFinId) setCuentaFinId(list[0].id);
  }, [cuentasQuery.data, cuentaFinId]);

  const cuentaSel = (cuentasQuery.data ?? []).find((c) => c.id === cuentaFinId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!deuda || !cuentaSel) throw new Error("Complete los datos del formulario.");
      await registrarPagoCobroCaja({
        deuda,
        ruc,
        fechaPago,
        medioPago,
        cuentaFinanciera: cuentaSel.cuenta_contable,
        monto: Number(monto),
      });
    },
    onSuccess: () => {
      toast.success(
        deuda?.tipo === "COMPRA"
          ? "Pago registrado en Libro Caja (CAJA_BANCOS)"
          : "Cobro registrado en Libro Caja (CAJA_BANCOS)",
      );
      onOpenChange(false);
      invalidateLibrosContables(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {deuda?.tipo === "COMPRA" ? "Registrar pago a proveedor" : "Registrar cobro de cliente"}
          </DialogTitle>
          <DialogDescription>
            {deuda?.comprobante} · Saldo S/ {formatMoney(deuda?.saldoPendiente ?? 0)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Fecha de pago / cobro</Label>
            <Input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
            <FieldHelper>
              Fecha efectiva del movimiento de caja. Debe corresponder al periodo contable abierto.
            </FieldHelper>
          </div>

          <div className="space-y-1.5">
            <Label>Medio de pago (SUNAT)</Label>
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
            <FieldHelper>
              Código de medio de pago según catálogo SUNAT (Tabla 01). Requerido para el Libro Caja electrónico.
            </FieldHelper>
          </div>

          <div className="space-y-1.5">
            <Label>Cuenta financiera (Clase 10)</Label>
            {cuentasQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando cajas y bancos…
              </div>
            ) : (
              <Select value={cuentaFinId} onValueChange={setCuentaFinId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione caja o banco" />
                </SelectTrigger>
                <SelectContent>
                  {(cuentasQuery.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} ({c.cuenta_contable})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldHelper>
              Seleccione la caja o cuenta bancaria (PCGE Clase 10) desde donde se realiza el pago o cobro.
            </FieldHelper>
          </div>

          <div className="space-y-1.5">
            <Label>Monto</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
            <FieldHelper>
              Monto en soles (PEN). No puede superar el saldo pendiente del comprobante ni ser cero.
            </FieldHelper>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={mutation.isPending || !cuentaSel || Number(monto) <= 0}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            Confirmar {deuda?.tipo === "COMPRA" ? "pago" : "cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
