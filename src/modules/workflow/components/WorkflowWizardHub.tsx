import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, GitBranch, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import { WorkflowChecklistModal } from "@/modules/workflow/components/WorkflowChecklistModal";
import { WorkflowStepperBar } from "@/modules/workflow/components/WorkflowStepperBar";
import { useWorkflowWizard } from "@/modules/workflow/hooks/useWorkflowWizard";
import { ALERTA_SEVERIDAD_COLORS } from "@/modules/workflow/types/workflow";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function defaultPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function resolveContribuyenteId(ruc: string): Promise<string | null> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("contribuyentes")
    .select("id")
    .eq("ruc", ruc)
    .maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

export function WorkflowWizardHub() {
  const mounted = useIsMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [checklistOpen, setChecklistOpen] = useState(false);

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

  useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedId } = useQuery({
    queryKey: ["workflow", "contribuyente-id", selectedRuc],
    queryFn: () => resolveContribuyenteId(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 120_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  const { estado, isLoading, isFetching, refetch } = useWorkflowWizard(
    contribuyenteId,
    periodoClean,
  );

  const alertasVisibles = estado?.alertas.filter((a) => a.severidad !== "INFO") ?? [];
  const bloqueantes = alertasVisibles.filter((a) => a.severidad === "BLOQUEANTE").length;

  return (
    <div className="min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <GitBranch className="size-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Asistente de Flujo Contable
            </h1>
            <p className="text-sm text-slate-400">
              Piloto automático del ciclo mensual — 5 pasos hasta el cierre fiscal
            </p>
          </div>
        </div>
        <Button
          onClick={() => setChecklistOpen(true)}
          disabled={!contribuyenteId}
          className="bg-emerald-600 hover:bg-emerald-500 gap-2"
        >
          <ClipboardCheck className="size-4" />
          Checklist de cierre
        </Button>
      </header>

      <div className={cn(GLASS, "p-4 flex flex-wrap gap-4 items-end")}>
        <div className="space-y-1.5 min-w-[240px] lg:flex-1">
          <Label className="text-slate-400 text-xs">Contribuyente</Label>
          <Select
            value={selectedRuc || undefined}
            onValueChange={setSelectedRuc}
            disabled={loadingContrib}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Seleccione RUC…" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {options.map((o) => (
                <SelectItem key={o.ruc} value={o.ruc}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Periodo (YYYYMM)</Label>
          <Input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-32 bg-slate-800/50 border-slate-700 font-mono"
            placeholder="202607"
          />
        </div>
        {estado && mounted && (
          <div className="flex flex-wrap gap-2 items-center ml-auto">
            {bloqueantes > 0 && (
              <Badge variant="destructive" className="text-xs">
                {bloqueantes} bloqueante(s)
              </Badge>
            )}
            <Badge variant="outline" className="border-emerald-600/40 text-emerald-300 text-xs">
              Diario {estado.diarioCuadrado ? "cuadrado" : "descuadrado"}
            </Badge>
            {(isLoading || isFetching) && (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            )}
          </div>
        )}
      </div>

      <WorkflowStepperBar estado={estado} isLoading={isLoading && !estado} />

      {estado && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={cn(GLASS, "p-5 space-y-3")}>
            <h2 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <Sparkles className="size-4" />
              Métricas del periodo
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card p-3 !rounded-lg">
                <dt className="text-slate-500 text-xs">RCE sin provisionar</dt>
                <dd className="font-mono text-lg text-amber-300">
                  {estado.metricas.rcePendientesProvision}
                </dd>
              </div>
              <div className="glass-card p-3 !rounded-lg">
                <dt className="text-slate-500 text-xs">RVIE sin provisionar</dt>
                <dd className="font-mono text-lg text-amber-300">
                  {estado.metricas.rviePendientesProvision}
                </dd>
              </div>
              <div className="glass-card p-3 !rounded-lg">
                <dt className="text-slate-500 text-xs">Pendientes tesorería</dt>
                <dd className="font-mono text-lg text-sky-300">
                  {estado.metricas.comprasPendientesTesoreria +
                    estado.metricas.ventasPendientesTesoreria}
                </dd>
              </div>
              <div className="glass-card p-3 !rounded-lg">
                <dt className="text-slate-500 text-xs">Asientos diario</dt>
                <dd className="font-mono text-lg text-slate-200">
                  {estado.metricas.totalAsientosDiario}
                </dd>
              </div>
              {estado.metricas.regimenTributario && (
                <div className="col-span-2 glass-card p-3 !rounded-lg">
                  <dt className="text-slate-500 text-xs">Régimen tributario</dt>
                  <dd className="font-semibold text-emerald-300">
                    {estado.metricas.regimenTributario}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className={cn(GLASS, "p-5 space-y-3")}>
            <h2 className="text-sm font-semibold text-emerald-300">Alertas activas</h2>
            {alertasVisibles.length === 0 ? (
              <p className="text-sm text-slate-400">
                Sin alertas críticas. El periodo avanza según lo esperado.
              </p>
            ) : (
              <ul className="space-y-2">
                {alertasVisibles.map((alerta) => (
                  <li
                    key={alerta.id}
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      ALERTA_SEVERIDAD_COLORS[alerta.severidad],
                    )}
                  >
                    {alerta.mensaje}
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
              onClick={() => void refetch()}
            >
              Recalcular diagnóstico
            </Button>
          </section>
        </div>
      )}

      <WorkflowChecklistModal
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        contribuyenteId={contribuyenteId}
        periodo={periodoClean}
        contribuyenteLabel={contribuyente?.razonSocial}
      />
    </div>
  );
}
