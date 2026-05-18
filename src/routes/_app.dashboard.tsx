import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listVentas, listCompras } from "@/lib/comprobantes.functions";
import { listEntidades } from "@/lib/entidades.functions";
import { Receipt, ShoppingCart, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Resumen — CONTAM" }] }),
  component: Dashboard,
});

function Dashboard() {
  const ventasFn = useServerFn(listVentas);
  const comprasFn = useServerFn(listCompras);
  const entFn = useServerFn(listEntidades);

  const ventas = useQuery({ queryKey: ["ventas"], queryFn: () => ventasFn({ data: undefined }) });
  const compras = useQuery({ queryKey: ["compras"], queryFn: () => comprasFn({ data: undefined }) });
  const entidades = useQuery({ queryKey: ["entidades"], queryFn: () => entFn() });

  const totalVentas = (ventas.data ?? []).reduce((s, r: any) => s + Number(r.importe_total), 0);
  const totalCompras = (compras.data ?? []).reduce((s, r: any) => s + Number(r.importe_total), 0);
  const utilidad = totalVentas - totalCompras;

  const cards = [
    { label: "Comprobantes de Venta", value: ventas.data?.length ?? 0, sub: `S/ ${totalVentas.toFixed(2)}`, icon: Receipt, color: "text-primary" },
    { label: "Comprobantes de Compra", value: compras.data?.length ?? 0, sub: `S/ ${totalCompras.toFixed(2)}`, icon: ShoppingCart, color: "text-accent-foreground" },
    { label: "Entidades", value: entidades.data?.length ?? 0, sub: "Clientes / Proveedores", icon: Users, color: "text-primary" },
    { label: "Resultado bruto", value: `S/ ${utilidad.toFixed(2)}`, sub: utilidad >= 0 ? "Utilidad" : "Pérdida", icon: TrendingUp, color: utilidad >= 0 ? "text-success" : "text-destructive" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Resumen general</h1>
        <p className="text-muted-foreground mt-1">Estado del periodo contable y de los registros SIRE.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="font-display text-2xl font-semibold mt-2">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
              </div>
              <c.icon className={`size-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <RecentList title="Últimas Ventas" rows={ventas.data ?? []} field="cliente_id" />
        <RecentList title="Últimas Compras" rows={compras.data ?? []} field="proveedor_id" />
      </section>
    </div>
  );
}

function RecentList({ title, rows }: { title: string; rows: any[]; field: string }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b font-medium">{title}</div>
      {rows.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">Aún no hay registros.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-2 pl-4">Serie-N°</th>
              <th className="text-left p-2">Razón social</th>
              <th className="text-right p-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 6).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 pl-4 font-mono text-xs">{r.serie}-{r.numero}</td>
                <td className="p-2">{r.entidades?.razon_social ?? "—"}</td>
                <td className="p-2 pr-4 text-right font-mono">{Number(r.importe_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
