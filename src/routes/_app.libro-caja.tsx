import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";

import { CuentasFinancierasPanel } from "@/components/libro-caja/cuentas-financieras-panel";
import { FlujoCajaTable } from "@/components/libro-caja/flujo-caja-table";
import { OperacionDirectaForm } from "@/components/libro-caja/operacion-directa-form";
import {
  EmpresaPeriodoFilters,
  RequireRucEmptyState,
} from "@/components/shared/empresa-periodo-filters";
import { Badge } from "@/components/ui/badge";
import { NuevaTareaButton } from "@/modules/tareas/components/NuevaTareaButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CajaCentralizacionPanel } from "@/modules/caja/components/caja-centralizacion-panel";
import { CajaMultiEmpresaDashboardPremium } from "@/modules/caja/components/caja-multi-empresa-dashboard-premium";
import { ConciliacionBancariaPremium } from "@/modules/caja/components/conciliacion-bancaria-premium";
import type { ClienteOption } from "@/lib/cliente-search-service";

const VALID_TABS = ["cuentas", "flujo", "operaciones", "liquidez", "conciliacion", "centralizacion"] as const;
type LibroCajaTab = (typeof VALID_TABS)[number];

export const Route = createFileRoute("/_app/libro-caja")({
  component: LibroCajaPage,
  validateSearch: (search: Record<string, unknown>) => {
    const tab = search.tab as string;
    return {
      tab: VALID_TABS.includes(tab as LibroCajaTab) ? (tab as LibroCajaTab) : "flujo",
    };
  },
});

function defaultPeriodo(): string {
  return new Date().toISOString().slice(0, 7).replace("-", "");
}

function LibroCajaPage() {
  const { tab } = Route.useSearch();
  const [cliente, setCliente] = useState<ClienteOption | null>(null);
  const [periodo, setPeriodo] = useState(defaultPeriodo);

  const rucSelected = cliente?.ruc?.trim() ?? "";
  const periodoFilter = periodo.trim() || null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Wallet className="size-8 text-primary" />
            Libro Caja y Bancos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Movimientos CAJA_BANCOS sincronizados con el Libro Diario en tiempo real.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          RUC obligatorio
        </Badge>
        <NuevaTareaButton
          moduloOrigen="caja"
          ruc={rucSelected || undefined}
          entidad="Libro Caja"
          tramite="Seguimiento movimientos de caja"
        />
      </header>

      <EmpresaPeriodoFilters
        cliente={cliente}
        onClienteChange={setCliente}
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        periodoDefault={defaultPeriodo()}
      />

      <Tabs defaultValue={tab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="cuentas">A · Cuentas financieras</TabsTrigger>
          <TabsTrigger value="flujo">B · Flujo de efectivo</TabsTrigger>
          <TabsTrigger value="operaciones">C · Operaciones directas</TabsTrigger>
          <TabsTrigger value="liquidez">D · Liquidez</TabsTrigger>
          <TabsTrigger value="conciliacion">E · Conciliación</TabsTrigger>
          <TabsTrigger value="centralizacion">F · Centralización</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="Configure cajas chicas y bancos del contribuyente." />
          ) : (
            <CuentasFinancierasPanel ruc={rucSelected} />
          )}
        </TabsContent>

        <TabsContent value="flujo" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="El flujo de caja se filtra por contribuyente." />
          ) : (
            <FlujoCajaTable ruc={rucSelected} periodo={periodoFilter} />
          )}
        </TabsContent>

        <TabsContent value="operaciones" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="Registre operaciones monetarias directas." />
          ) : (
            <OperacionDirectaForm ruc={rucSelected} periodo={periodo} />
          )}
        </TabsContent>

        <TabsContent value="liquidez" className="mt-4">
          <CajaMultiEmpresaDashboardPremium ruc={rucSelected || null} periodo={periodoFilter} />
        </TabsContent>

        <TabsContent value="conciliacion" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="La conciliación bancaria requiere RUC y período." />
          ) : !periodoFilter ? (
            <RequireRucEmptyState context="Indique el período (AAAAMM) para conciliar." />
          ) : (
            <ConciliacionBancariaPremium ruc={rucSelected} periodo={periodoFilter} />
          )}
        </TabsContent>

        <TabsContent value="centralizacion" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="Centralice movimientos de caja por contribuyente." />
          ) : !periodoFilter ? (
            <RequireRucEmptyState context="Indique el período antes de centralizar." />
          ) : (
            <CajaCentralizacionPanel ruc={rucSelected} periodo={periodoFilter} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
