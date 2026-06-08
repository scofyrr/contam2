import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ComprobantesPendientesTable } from "@/components/libro-diario/comprobantes-pendientes-table";
import { AsientoEditorGrid } from "@/components/libro-diario/asiento-editor-grid";
import { RequireRucEmptyState } from "@/components/shared/empresa-periodo-filters";
import { fetchPcgeCuentasActivas } from "@/lib/pcge-service";
import {
  fetchComprobantesPendientes,
  guardarAsientoProvision,
  proponerLineasAsiento,
  type ComprobantePendiente,
  type LineaAsientoEditable,
} from "@/lib/libro-diario-service";
import { invalidateLibrosContables } from "@/lib/query-keys-contables";

export function ProvisionesSirePanel({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string;
}) {
  const qc = useQueryClient();
  const [selectedComprobante, setSelectedComprobante] = useState<ComprobantePendiente | null>(null);
  const [lineas, setLineas] = useState<LineaAsientoEditable[]>([]);

  const pcgeQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas,
  });

  const pendientesQuery = useQuery({
    queryKey: ["comprobantes_pendientes", ruc, periodo],
    queryFn: () =>
      fetchComprobantesPendientes({
        ruc,
        periodo: periodo.trim() || undefined,
      }),
    enabled: !!ruc,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      guardarAsientoProvision({
        registroId: selectedComprobante!.id,
        lineas: lineas.map(({ key: _k, ...l }) => l),
      }),
    onSuccess: () => {
      toast.success("Provisión registrada en Libro Diario");
      setSelectedComprobante(null);
      setLineas([]);
      invalidateLibrosContables(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSelect = (row: ComprobantePendiente) => {
    setSelectedComprobante(row);
    setLineas(proponerLineasAsiento(row));
  };

  const cuentasPcge = useMemo(() => pcgeQuery.data ?? [], [pcgeQuery.data]);

  if (!ruc) {
    return (
      <RequireRucEmptyState context="Elige el contribuyente para importar comprobantes SIRE pendientes de provisión." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div>
          <h2 className="font-medium text-sm">Bandeja de comprobantes pendientes</h2>
          <p className="text-xs text-muted-foreground">
            Comprobantes SIRE sin asiento de provisión · Clase 6/7, IGV 40111, 421201 / 121201
          </p>
        </div>
        <ComprobantesPendientesTable
          rows={pendientesQuery.data ?? []}
          loading={pendientesQuery.isLoading}
          selectedId={selectedComprobante?.id ?? null}
          onSelect={handleSelect}
        />
      </div>

      {pcgeQuery.isLoading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-3 animate-spin" />
          Cargando plan de cuentas…
        </div>
      )}

      {selectedComprobante && lineas.length > 0 && (
        <AsientoEditorGrid
          registro={selectedComprobante}
          lineas={lineas}
          onChange={setLineas}
          cuentasPcge={cuentasPcge}
          saving={saveMutation.isPending}
          onSave={() => saveMutation.mutate()}
        />
      )}
    </div>
  );
}
