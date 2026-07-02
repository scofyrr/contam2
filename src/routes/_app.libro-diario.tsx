import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProvisionesSirePanel } from "@/components/libro-diario/provisiones-sire-panel";
import { LibroDiarioGeneralPanel } from "@/components/libro-diario/libro-diario-general-panel";
import { AsientoManualForm } from "@/components/libro-diario/asiento-manual-form";
import { CxcCxpBandeja } from "@/components/libro-diario/cxc-cxp-bandeja";
import { LibroDiarioPremium } from "@/modules/contabilidad/diario/components/libro-diario-premium";
import {
  EmpresaPeriodoFilters,
  RequireRucEmptyState,
} from "@/components/shared/empresa-periodo-filters";
import { ExportButtons } from "@/components/export-buttons";
import { NuevaTareaButton } from "@/modules/tareas/components/NuevaTareaButton";
import { exportLibroExcel, exportLibroPdf } from "@/lib/export-service";
import { fetchLibroDiario } from "@/lib/sire-data";
import type { ClienteOption } from "@/lib/cliente-search-service";

const VALID_TABS = ["premium", "provisiones", "general", "cxp"] as const;

export const Route = createFileRoute("/_app/libro-diario")({
  component: LibroDiarioPage,
  validateSearch: (search: Record<string, unknown>) => {
    const tab = search.tab as string;
    return {
      tab: VALID_TABS.includes(tab as (typeof VALID_TABS)[number])
        ? (tab as (typeof VALID_TABS)[number])
        : "premium",
    };
  },
});

function defaultPeriodo(): string {
  return new Date().toISOString().slice(0, 7).replace("-", "");
}

function LibroDiarioPage() {
  const { tab } = Route.useSearch();
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [cliente, setCliente] = useState<ClienteOption | null>(null);

  const rucSelected = cliente?.ruc?.trim() ?? "";
  const libroFilters = useMemo(
    () => ({
      ruc: rucSelected || undefined,
      periodo: periodo.trim() || undefined,
    }),
    [rucSelected, periodo],
  );

  const lineasQuery = useQuery({
    queryKey: ["libro_diario", libroFilters],
    queryFn: () => fetchLibroDiario(libroFilters),
    enabled: !!rucSelected,
  });

  const rows = lineasQuery.data ?? [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <BookOpen className="size-8 text-primary" />
            Libro Diario
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Database className="size-3.5" />
            Tabla unificada asientos_contables · DIARIO_* y puente a CAJA_BANCOS
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <NuevaTareaButton
            moduloOrigen="asientos"
            ruc={rucSelected || undefined}
            entidad="Libro Diario"
            tramite="Revisión de asientos contables"
          />
          <Badge variant="outline" className="self-start sm:self-auto">
            RUC obligatorio
          </Badge>
          <ExportButtons
            prominent
            compact
            disabled={!rucSelected || rows.length === 0}
            onExportExcel={() => exportLibroExcel(rows, periodo.trim() || undefined)}
            onExportPdf={() => exportLibroPdf(rows, periodo.trim() || undefined)}
          />
        </div>
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
          <TabsTrigger value="premium">★ Premium</TabsTrigger>
          <TabsTrigger value="provisiones">A · Provisiones SIRE</TabsTrigger>
          <TabsTrigger value="general">B · Libro Diario General</TabsTrigger>
          <TabsTrigger value="cxp">C · CxP / CxC</TabsTrigger>
        </TabsList>

        <TabsContent value="premium" className="mt-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="Selecciona el contribuyente para el libro diario premium." />
          ) : (
            <LibroDiarioPremium
              ruc={rucSelected}
              periodo={periodo.trim()}
              rows={rows}
              loading={lineasQuery.isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="provisiones" className="mt-4">
          <ProvisionesSirePanel ruc={rucSelected} periodo={periodo} />
        </TabsContent>

        <TabsContent value="general" className="mt-4 space-y-4">
          {!rucSelected ? (
            <RequireRucEmptyState context="Selecciona el contribuyente para ver el libro diario completo." />
          ) : (
            <>
              <LibroDiarioGeneralPanel
                rows={rows}
                loading={lineasQuery.isLoading}
                periodoDefault={periodo.trim()}
              />
              <AsientoManualForm ruc={rucSelected} periodo={periodo} />
            </>
          )}
        </TabsContent>

        <TabsContent value="cxp" className="mt-4">
          <CxcCxpBandeja ruc={rucSelected} periodo={periodo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
