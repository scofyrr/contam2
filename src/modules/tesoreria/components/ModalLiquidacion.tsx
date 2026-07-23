import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useComprobantesPendientes,
  useCuentasBancarias,
  useLiquidarComprobante,
} from "@/modules/tesoreria/hooks/useTesoreria";
import type {
  ComprobantePendienteLiquidacion,
  CuentaBancaria,
  MedioPagoTabla1,
} from "@/modules/tesoreria/types/tesoreria";
import { MEDIOS_PAGO_TABLA1 } from "@/modules/tesoreria/types/tesoreria";

export interface ModalLiquidacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contribuyenteId: string;
  periodo: string;
  cuentas?: CuentaBancaria[];
  comprobantePreseleccionado?: ComprobantePendienteLiquidacion | null;
  mounted: boolean;
}

function formatSoles(amount: number, mounted: boolean): string {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ModalLiquidacion({
  open,
  onOpenChange,
  contribuyenteId,
  periodo,
  cuentas: cuentasProp,
  comprobantePreseleccionado,
  mounted,
}: ModalLiquidacionProps) {
  const { data: cuentasQuery } = useCuentasBancarias(contribuyenteId, open && !cuentasProp);
  const cuentas = cuentasProp ?? cuentasQuery ?? [];

  const { data: pendientes = [], isLoading: loadingPendientes } = useComprobantesPendientes(
    contribuyenteId,
    periodo,
    open,
  );

  const liquidar = useLiquidarComprobante(contribuyenteId, periodo);

  const [comprobanteId, setComprobanteId] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const [medioPago, setMedioPago] = useState<MedioPagoTabla1>("001");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState("");
  const [monto, setMonto] = useState("");

  const comprobanteSeleccionado = pendientes.find((p) => p.id === comprobanteId);

  useEffect(() => {
    if (!open) return;
    if (comprobantePreseleccionado) {
      setComprobanteId(comprobantePreseleccionado.id);
      setMonto(String(comprobantePreseleccionado.total));
      setGlosa(
        comprobantePreseleccionado.tipo === "COMPRA"
          ? `Pago compra ${comprobantePreseleccionado.serie ?? ""}-${comprobantePreseleccionado.numero}`
          : `Cobro venta ${comprobantePreseleccionado.serie ?? ""}-${comprobantePreseleccionado.numero}`,
      );
    }
  }, [open, comprobantePreseleccionado]);

  useEffect(() => {
    if (cuentas.length > 0 && !cuentaId) {
      setCuentaId(cuentas[0].id);
    }
  }, [cuentas, cuentaId]);

  useEffect(() => {
    if (comprobanteSeleccionado && !comprobantePreseleccionado) {
      setMonto(String(comprobanteSeleccionado.total));
      setGlosa(
        comprobanteSeleccionado.tipo === "COMPRA"
          ? `Pago compra ${comprobanteSeleccionado.serie ?? ""}-${comprobanteSeleccionado.numero}`
          : `Cobro venta ${comprobanteSeleccionado.serie ?? ""}-${comprobanteSeleccionado.numero}`,
      );
    }
  }, [comprobanteSeleccionado, comprobantePreseleccionado]);

  const handleSubmit = () => {
    if (!comprobanteId || !cuentaId || !comprobanteSeleccionado) return;

    liquidar.mutate(
      {
        contribuyenteId,
        comprobanteId,
        tipoComprobante: comprobanteSeleccionado.tipo,
        cuentaBancariaId: cuentaId,
        medioPago,
        fecha,
        glosa: glosa || "Liquidación de comprobante",
        monto: Number(monto),
        tipoCambio: 1,
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            onOpenChange(false);
            setComprobanteId("");
            setMonto("");
            setGlosa("");
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Liquidación directa</DialogTitle>
          <DialogDescription className="text-slate-400">
            Pago/cobro atómico: movimiento caja · asiento cancelación · saldo bancario · estado
            comprobante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Comprobante pendiente</Label>
            {loadingPendientes ? (
              <div className="flex items-center text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin mr-2" />
                Cargando…
              </div>
            ) : pendientes.length === 0 ? (
              <p className="text-sm text-amber-400/90">No hay comprobantes pendientes en el periodo.</p>
            ) : (
              <Select value={comprobanteId || undefined} onValueChange={setComprobanteId}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Seleccione comprobante…" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 max-h-60">
                  {pendientes.map((p) => (
                    <SelectItem key={`${p.tipo}-${p.id}`} value={p.id}>
                      {p.tipo === "COMPRA" ? "🔴 Pago" : "🟢 Cobro"} · {p.serie}-{p.numero} ·{" "}
                      {formatSoles(p.total, mounted)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {comprobanteSeleccionado ? (
            <div className="rounded-lg border border-slate-700/80 bg-slate-800/40 p-3 text-xs space-y-1">
              <p>
                <span className="text-slate-500">Contraparte:</span>{" "}
                {comprobanteSeleccionado.rucContraparte} — {comprobanteSeleccionado.razonSocial ?? "—"}
              </p>
              <p>
                <span className="text-slate-500">Total:</span>{" "}
                {formatSoles(comprobanteSeleccionado.total, mounted)}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Cuenta bancaria / caja</Label>
            <Select value={cuentaId || undefined} onValueChange={setCuentaId}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Seleccione cuenta…" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {cuentas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombreCuenta} ({c.banco}) — {formatSoles(c.saldoActual, mounted)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Medio de pago (Tabla 1)</Label>
              <Select value={medioPago} onValueChange={(v) => setMedioPago(v as MedioPagoTabla1)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {MEDIOS_PAGO_TABLA1.map((m) => (
                    <SelectItem key={m.codigo} value={m.codigo}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Fecha operación</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Monto (S/)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-slate-800/50 border-slate-700 tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Glosa</Label>
            <Textarea
              value={glosa}
              onChange={(e) => setGlosa(e.target.value)}
              className="bg-slate-800/50 border-slate-700 min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              liquidar.isPending ||
              !comprobanteId ||
              !cuentaId ||
              !monto ||
              Number(monto) <= 0 ||
              pendientes.length === 0
            }
            className={cn("bg-emerald-600 hover:bg-emerald-500")}
          >
            {liquidar.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Ejecutar liquidación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
