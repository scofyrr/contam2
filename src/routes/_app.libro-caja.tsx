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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClienteOption } from "@/lib/cliente-search-service";

export const Route = createFileRoute("/_app/libro-caja")({
  component: LibroCajaPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "cuentas" || search.tab === "operaciones"
        ? (search.tab as string)
        : "flujo",
  }),
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
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
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
      </header>

      <EmpresaPeriodoFilters
        cliente={cliente}
        onClienteChange={setCliente}
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        periodoDefault={defaultPeriodo()}
      />

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="cuentas">A · Cuentas financieras</TabsTrigger>
          <TabsTrigger value="flujo">B · Flujo de efectivo</TabsTrigger>
          <TabsTrigger value="operaciones">C · Operaciones directas</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
