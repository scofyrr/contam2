import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listVentas, listCompras, createVenta, createCompra } from "@/lib/comprobantes.functions";
import { listEntidades } from "@/lib/entidades.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const TIPO_CPE: Record<string, string> = {
  "01": "Factura",
  "03": "Boleta de venta",
  "07": "Nota de crédito",
  "08": "Nota de débito",
  "12": "Ticket de máquina registradora",
};

export function ComprobantePage({ tipo }: { tipo: "VENTA" | "COMPRA" }) {
  const qc = useQueryClient();
  const isVenta = tipo === "VENTA";
  const listFn = useServerFn(isVenta ? listVentas : listCompras);
  const createFn = useServerFn(isVenta ? createVenta : createCompra);
  const entFn = useServerFn(listEntidades);

  const now = new Date();
  const defPeriodo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rows = useQuery({ queryKey: [isVenta ? "ventas" : "compras"], queryFn: () => listFn({ data: undefined }) });
  const ents = useQuery({ queryKey: ["entidades"], queryFn: () => entFn() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    periodo: defPeriodo,
    fecha_emision: now.toISOString().slice(0, 10),
    tipo_comprobante: "01",
    serie: isVenta ? "F001" : "F001",
    numero: "",
    entidad_id: "",
    moneda: "PEN",
    tipo_cambio: 1,
    base: 0,
    igv: 0,
    total: 0,
  });

  const calcular = (base: number) => {
    const b = Number(base) || 0;
    const igv = +(b * 0.18).toFixed(2);
    const total = +(b + igv).toFixed(2);
    setForm({ ...form, base, igv, total });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entidad_id) return toast.error("Selecciona una entidad");
    try {
      const payload: any = {
        periodo: form.periodo,
        fecha_emision: form.fecha_emision,
        tipo_comprobante: form.tipo_comprobante,
        serie: form.serie,
        numero: form.numero,
        moneda: form.moneda,
        tipo_cambio: form.tipo_cambio,
        importe_total: form.total,
      };
      if (isVenta) {
        payload.cliente_id = form.entidad_id;
        payload.base_gravada = form.base;
        payload.igv = form.igv;
      } else {
        payload.proveedor_id = form.entidad_id;
        payload.base_gravada_dg = form.base;
        payload.igv_dg = form.igv;
      }
      await createFn({ data: payload });
      toast.success("Comprobante registrado y asiento contable generado");
      setOpen(false);
      setForm({ ...form, numero: "", base: 0, igv: 0, total: 0 });
      qc.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  const entidadesFiltradas = (ents.data ?? []).filter((e: any) =>
    isVenta ? e.tipo !== "PROVEEDOR" : e.tipo !== "CLIENTE",
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {isVenta ? "Comprobantes de Venta" : "Comprobantes de Compra"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isVenta ? "Alimenta el Registro de Ventas e Ingresos Electrónico (RVIE - 140400)." : "Alimenta el Registro de Compras Electrónico (RCE - 130400)."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Nuevo comprobante</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Registrar comprobante</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Periodo</Label>
                  <Input value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} className="font-mono" />
                </div>
                <div>
                  <Label>Fecha emisión</Label>
                  <Input type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} />
                </div>
                <div>
                  <Label>Tipo CPE</Label>
                  <Select value={form.tipo_comprobante} onValueChange={(v) => setForm({ ...form, tipo_comprobante: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_CPE).map(([k, v]) => <SelectItem key={k} value={k}>{k} — {v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Serie</Label>
                  <Input required value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })} maxLength={4} className="font-mono" />
                </div>
                <div className="col-span-2">
                  <Label>Número</Label>
                  <Input required value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="font-mono" />
                </div>
              </div>
              <div>
                <Label>{isVenta ? "Cliente" : "Proveedor"}</Label>
                <Select value={form.entidad_id} onValueChange={(v) => setForm({ ...form, entidad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {entidadesFiltradas.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.numero_documento} — {e.razon_social}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Moneda</Label>
                  <Select value={form.moneda} onValueChange={(v) => setForm({ ...form, moneda: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base gravada</Label>
                  <Input type="number" step="0.01" value={form.base} onChange={(e) => calcular(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <Label>IGV (18%)</Label>
                  <Input type="number" step="0.01" value={form.igv} onChange={(e) => setForm({ ...form, igv: Number(e.target.value) })} className="font-mono" />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} className="font-mono font-semibold" />
                </div>
              </div>
              <DialogFooter><Button type="submit">Registrar y generar asiento</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">CPE</th>
              <th className="text-left p-3">Serie-N°</th>
              <th className="text-left p-3">{isVenta ? "Cliente" : "Proveedor"}</th>
              <th className="text-right p-3">Base</th>
              <th className="text-right p-3">IGV</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(rows.data ?? []).map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{r.fecha_emision}</td>
                <td className="p-3">{r.tipo_comprobante}</td>
                <td className="p-3 font-mono text-xs">{r.serie}-{r.numero}</td>
                <td className="p-3">{r.entidades?.razon_social ?? "—"}</td>
                <td className="p-3 text-right font-mono">{Number(isVenta ? r.base_gravada : r.base_gravada_dg).toFixed(2)}</td>
                <td className="p-3 text-right font-mono">{Number(isVenta ? r.igv : r.igv_dg).toFixed(2)}</td>
                <td className="p-3 text-right font-mono font-semibold">{Number(r.importe_total).toFixed(2)}</td>
                <td className="p-3"><span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">{r.estado}</span></td>
              </tr>
            ))}
            {rows.data?.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No hay comprobantes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
