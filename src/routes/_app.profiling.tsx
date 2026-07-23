import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { FichaRucCard, FichaRucCardSkeleton } from "@/modules/profiling/components/FichaRucCard";
import { LibrosObligadosWidget } from "@/modules/profiling/components/LibrosObligadosWidget";
import {
  useContribuyenteByRucProfiling,
  useEstudiosUsuario,
  useProfilingRuc,
} from "@/modules/profiling/hooks/useProfiling";

export const Route = createFileRoute("/_app/profiling")({
  component: ProfilingPage,
});

const EJERCICIOS = [2026, 2025, 2024, 2023] as const;

function ProfilingPage() {
  const { contribuyentes, loading: loadingContribuyentes } = useContribuyentes();
  const { data: estudios, isLoading: loadingEstudios } = useEstudiosUsuario();

  const [selectedRuc, setSelectedRuc] = useState<string>("");
  const [ejercicio, setEjercicio] = useState<number>(2026);

  const options = useMemo(
    () =>
      contribuyentes
        .filter((c) => c.ruc?.trim())
        .map((c) => ({
          ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
          label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
        })),
    [contribuyentes],
  );

  const {
    data: contribuyente,
    isLoading: loadingContrib,
    isError: errorContrib,
    error: contribError,
  } = useContribuyenteByRucProfiling(selectedRuc || null);

  const {
    data: profiling,
    isLoading: loadingProfiling,
    isError: errorProfiling,
    error: profilingError,
    refetch: refetchProfiling,
    isFetching: fetchingProfiling,
  } = useProfilingRuc(contribuyente?.id ?? null, ejercicio);

  const estudioActivo = estudios?.[0]?.estudio;

  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profiling RUC & Libros Obligatorios
        </h1>
        <p className="text-sm text-muted-foreground">
          Evaluación multi-tenant de régimen tributario, ingresos en UIT y libros contables SUNAT
          (Tabla 8).
        </p>
        {estudioActivo && (
          <p className="text-xs text-muted-foreground">
            Estudio: <span className="font-medium text-emerald-600">{estudioActivo.razonSocial}</span>
            {" · "}
            RUC estudio {estudioActivo.ruc}
          </p>
        )}
        {loadingEstudios && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Cargando membresía de estudio…
          </p>
        )}
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card/50 p-4">
        <div className="min-w-[280px] flex-1 space-y-2">
          <Label htmlFor="profiling-ruc">Contribuyente (RUC)</Label>
          <Select
            value={selectedRuc || undefined}
            onValueChange={setSelectedRuc}
            disabled={loadingContribuyentes}
          >
            <SelectTrigger id="profiling-ruc">
              <SelectValue placeholder="Seleccione un contribuyente…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.ruc} value={o.ruc}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40 space-y-2">
          <Label htmlFor="profiling-ejercicio">Ejercicio</Label>
          <Select
            value={String(ejercicio)}
            onValueChange={(v) => setEjercicio(Number(v))}
          >
            <SelectTrigger id="profiling-ejercicio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EJERCICIOS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedRuc && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Seleccione un contribuyente para ver la ficha RUC enriquecida y la evaluación de libros
          obligados.
        </div>
      )}

      {selectedRuc && loadingContrib && <FichaRucCardSkeleton />}

      {selectedRuc && errorContrib && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">No se pudo cargar el contribuyente</p>
            <p className="text-sm opacity-80">
              {(contribError as Error)?.message ?? "Verifique permisos RLS y membresía de estudio."}
            </p>
          </div>
        </div>
      )}

      {contribuyente && <FichaRucCard contribuyente={contribuyente} />}

      {selectedRuc && contribuyente && (
        <LibrosObligadosWidget
          profiling={profiling}
          isLoading={loadingProfiling}
          isError={errorProfiling}
          errorMessage={(profilingError as Error)?.message}
          onRefresh={() => void refetchProfiling()}
          isRefreshing={fetchingProfiling}
        />
      )}
    </div>
  );
}
