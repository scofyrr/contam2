import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";

import { MovimientosCajaTable } from "@/components/caja/movimientos-table";
import { LiquidacionSirePanel } from "@/components/caja/liquidacion-sire-panel";
import { CancelacionesTable } from "@/components/cancelaciones/cancelaciones-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/libro-caja")({
  component: LibroCajaPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) === "liquidaciones" ? "liquidaciones" : "movimientos",
  }),
});

function LibroCajaPage() {
  const { tab } = Route.useSearch();
  const [ruc, setRuc] = useState("");
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7).replace("-", ""));

  const rucFilter = ruc.trim() ? ruc.trim() : null;
  const periodoFilter = periodo.trim() ? periodo.trim() : null;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Wallet className="size-8 text-primary" />
            Libro Caja y Bancos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Movimientos de efectivo, liquidación de comprobantes SIRE y trazabilidad de cancelaciones.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          Liquidación unificada
        </Badge>
      </header>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">RUC contribuyente (opcional)</Label>
          <Input
            value={ruc}
            onChange={(e) => setRuc(e.target.value)}
            placeholder="Filtrar por RUC…"
          />
        </div>
        <div>
          <Label className="text-xs">Periodo (AAAAMM)</Label>
          <Input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="liquidaciones">Liquidar SIRE</TabsTrigger>
          <TabsTrigger value="historial">Cancelaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos" className="mt-4">
          <MovimientosCajaTable ruc={rucFilter} periodo={periodoFilter} />
        </TabsContent>

        <TabsContent value="liquidaciones" className="mt-4">
          <LiquidacionSirePanel ruc={rucFilter} periodo={periodoFilter} />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <CancelacionesTable ruc={rucFilter} periodo={periodoFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
