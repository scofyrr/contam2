import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useConfigContable } from "@/hooks/use-config-contable";

export function ConfigContableCard() {
  const { query, update } = useConfigContable();

  const cfg = query.data;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold">Cuentas por defecto (cancelaciones)</div>
          <div className="text-xs text-muted-foreground">
            Se usan al generar el asiento de cobro/pago desde SIRE. Puedes ajustarlas sin tocar código.
          </div>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          Configuración
        </Badge>
      </div>

      {query.isLoading || !cfg ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Cargando configuración…</div>
      ) : (
        <form
          className="grid md:grid-cols-3 gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const cuenta_caja_default = String(fd.get("cuenta_caja_default") ?? "").trim();
            const cuenta_cxc_default = String(fd.get("cuenta_cxc_default") ?? "").trim();
            const cuenta_cxp_default = String(fd.get("cuenta_cxp_default") ?? "").trim();

            try {
              await update.mutateAsync({ cuenta_caja_default, cuenta_cxc_default, cuenta_cxp_default });
              toast.success("Configuración guardada");
            } catch (err: any) {
              toast.error(err?.message ?? "No se pudo guardar");
            }
          }}
        >
          <div>
            <Label className="text-xs">Cuenta Caja (10)</Label>
            <Input name="cuenta_caja_default" defaultValue={cfg.cuenta_caja_default} className="font-mono" />
            <FieldHelper>Cuenta PCGE Clase 10 usada por defecto al liquidar cobros/pagos en caja.</FieldHelper>
          </div>
          <div>
            <Label className="text-xs">Cuenta por cobrar (12)</Label>
            <Input name="cuenta_cxc_default" defaultValue={cfg.cuenta_cxc_default} className="font-mono" />
            <FieldHelper>Cuenta de clientes (ej. 121201) para cancelaciones de ventas.</FieldHelper>
          </div>
          <div>
            <Label className="text-xs">Cuenta por pagar (42)</Label>
            <Input name="cuenta_cxp_default" defaultValue={cfg.cuenta_cxp_default} className="font-mono" />
            <FieldHelper>Cuenta de proveedores (ej. 421201) para cancelaciones de compras.</FieldHelper>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={update.isPending}>
              <Save className="size-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

