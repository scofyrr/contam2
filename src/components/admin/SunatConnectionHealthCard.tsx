import { useCallback, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Terminal,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/common/ClientOnly";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import {
  verificarSaludPipelineSunat,
  type SunatHealthCheckItem,
  type SunatHealthDiagnostic,
  type SunatHealthGlobalStatus,
} from "@/modules/sire/services/sunatHealthService";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-md shadow-xl shadow-emerald-950/20";

function globalBadgeClass(status: SunatHealthGlobalStatus): string {
  switch (status) {
    case "SISTEMA_OPERATIVO":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300";
    case "MODO_SIMULACION":
      return "border-yellow-400/60 bg-yellow-400/10 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.15)]";
    default:
      return "border-red-500/50 bg-red-950/40 text-red-200";
  }
}

function checkIcon(item: SunatHealthCheckItem) {
  if (item.status === "ok") {
    return <CheckCircle2 className="size-4 text-emerald-400 shrink-0" aria-hidden />;
  }
  if (item.status === "warning") {
    return <AlertTriangle className="size-4 text-yellow-400 shrink-0" aria-hidden />;
  }
  return <XCircle className="size-4 text-red-400 shrink-0" aria-hidden />;
}

function checkRowClass(item: SunatHealthCheckItem): string {
  if (item.status === "ok") {
    return "border-emerald-500/30 bg-emerald-500/5";
  }
  if (item.status === "warning") {
    return "border-yellow-500/35 bg-yellow-500/5";
  }
  return "border-red-500/35 bg-red-950/20";
}

export interface SunatConnectionHealthCardProps {
  contribuyenteId?: string | null;
  className?: string;
}

function SunatConnectionHealthCardInner({
  contribuyenteId,
  className,
}: SunatConnectionHealthCardProps) {
  const mounted = useIsMounted();
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<SunatHealthDiagnostic | null>(null);

  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    try {
      const result = await verificarSaludPipelineSunat(contribuyenteId ?? undefined);
      setDiagnostic(result);

      if (result.globalStatus === "SISTEMA_OPERATIVO") {
        toast.success("Integración SUNAT/SIRE operativa");
      } else if (result.globalStatus === "MODO_SIMULACION") {
        toast.warning("Pipeline en modo simulación — revise token o feature flag");
      } else {
        toast.error("Se detectaron fallas en la integración SUNAT/SIRE");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al ejecutar diagnóstico";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [contribuyenteId]);

  const copyCommands = useCallback(() => {
    if (!diagnostic?.comandosSolucion.length) return;
    const text = diagnostic.comandosSolucion.join("\n");
    void navigator.clipboard?.writeText(text);
    toast.message("Comandos copiados al portapapeles");
  }, [diagnostic]);

  const hasFailures = diagnostic?.checks.some((c) => !c.ok) ?? false;

  return (
    <section className={cn(GLASS, "p-5 md:p-6 space-y-5 text-slate-100", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="size-5 text-emerald-400" />
            Diagnóstico de Integración SUNAT / SIRE
          </h2>
          <p className="text-sm text-slate-400">
            Verifica migraciones PostgreSQL, Edge Functions, secretos Decolecta y feature flags del
            cliente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {diagnostic && mounted && (
            <Badge variant="outline" className={cn("text-xs", globalBadgeClass(diagnostic.globalStatus))}>
              {diagnostic.globalLabel}
            </Badge>
          )}
          <Button
            size="sm"
            onClick={() => void runDiagnostic()}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 gap-2"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Ejecutar Diagnóstico
          </Button>
        </div>
      </div>

      {!diagnostic && !loading && (
        <p className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-xl p-4">
          Pulse &quot;Ejecutar Diagnóstico&quot; para comprobar el estado del pipeline SUNAT en tiempo
          real.
        </p>
      )}

      {loading && !diagnostic && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-6 justify-center">
          <Loader2 className="size-5 animate-spin text-emerald-400" />
          Analizando migraciones, Edge Functions y secretos…
        </div>
      )}

      {diagnostic && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {diagnostic.checks.map((item) => (
              <li
                key={item.id}
                className={cn("rounded-xl border p-4 space-y-1.5", checkRowClass(item))}
              >
                <div className="flex items-start gap-2">
                  {checkIcon(item)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300 leading-snug">{item.titulo}</p>
                    <p
                      className={cn(
                        "text-sm font-semibold mt-0.5",
                        item.status === "ok"
                          ? "text-emerald-300"
                          : item.status === "warning"
                            ? "text-yellow-300"
                            : "text-red-300",
                      )}
                    >
                      {item.status === "ok" && "🟢 "}
                      {item.status === "warning" && "🟡 "}
                      {item.status === "error" && "🔴 "}
                      {item.mensaje}
                    </p>
                    {item.detalle && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.detalle}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {mounted && diagnostic.ejecutadoAt && (
            <p className="text-[11px] text-slate-500">
              Último diagnóstico:{" "}
              {new Intl.DateTimeFormat("es-PE", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(diagnostic.ejecutadoAt))}
            </p>
          )}

          {hasFailures && diagnostic.comandosSolucion.length > 0 && (
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-amber-200 flex items-center gap-2">
                  <Terminal className="size-4" />
                  Guía de solución inmediata
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-amber-500/40 text-amber-200 h-8"
                  onClick={copyCommands}
                >
                  <Copy className="size-3.5 mr-1.5" />
                  Copiar comandos
                </Button>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {diagnostic.comandosSolucion.join("\n")}
              </pre>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function SunatConnectionHealthCard(props: SunatConnectionHealthCardProps) {
  return (
    <ClientOnly fallback={null}>
      <SunatConnectionHealthCardInner {...props} />
    </ClientOnly>
  );
}
