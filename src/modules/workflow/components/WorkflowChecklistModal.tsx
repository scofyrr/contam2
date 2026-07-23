import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import { useWorkflowWizard } from "@/modules/workflow/hooks/useWorkflowWizard";
import type { PasoEstado } from "@/modules/workflow/types/workflow";
import { PASO_ESTADO_COLORS } from "@/modules/workflow/types/workflow";

const GLASS_ITEM =
  "rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-sm";

function ChecklistIcon({ estado }: { estado: PasoEstado }) {
  if (estado === "COMPLETADO") {
    return <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />;
  }
  if (estado === "BLOQUEADO") {
    return <Lock className="size-4 text-slate-500 shrink-0" />;
  }
  if (estado === "EN_PROGRESO") {
    return (
      <span className="size-4 rounded-full border-2 border-yellow-400 bg-yellow-400/20 shrink-0 animate-pulse" />
    );
  }
  return <Circle className="size-4 text-slate-500 shrink-0" />;
}

export interface WorkflowChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contribuyenteId: string | null;
  periodo: string | null;
  contribuyenteLabel?: string;
}

export function WorkflowChecklistModal({
  open,
  onOpenChange,
  contribuyenteId,
  periodo,
  contribuyenteLabel,
}: WorkflowChecklistModalProps) {
  const mounted = useIsMounted();
  const { estado, isLoading, isFetching, refetch, marcarPaso, isMarcandoPaso } =
    useWorkflowWizard(contribuyenteId, periodo, open);

  const porcentaje =
    mounted && estado ? Math.min(100, Math.max(0, estado.porcentajeAvance)) : 0;

  async function handleTogglePaso(pasoNumero: number, completado: boolean) {
    if (!contribuyenteId || !periodo) return;
    await marcarPaso({ paso: pasoNumero, completado: !completado });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-slate-950/95 border-slate-800 text-slate-100 overflow-y-auto"
      >
        <SheetHeader className="text-left space-y-2 pb-4 border-b border-slate-800">
          <SheetTitle className="text-emerald-300 flex items-center gap-2">
            Checklist de cierre
            {(isLoading || isFetching) && (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            )}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {contribuyenteLabel ? `${contribuyenteLabel} · ` : ""}
            Periodo{" "}
            <span className="font-mono text-slate-300">
              {periodo?.replace(/\D/g, "").slice(0, 6) || "—"}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progreso del mes</span>
              <span className="font-bold text-emerald-300 tabular-nums">
                {mounted ? `${Math.round(porcentaje)}%` : "—%"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r from-emerald-600 to-teal-400",
                  mounted && "transition-all duration-500",
                )}
                style={{ width: mounted ? `${porcentaje}%` : "0%" }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-300"
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4 mr-2", isFetching && "animate-spin")} />
            Actualizar diagnóstico
          </Button>

          {isLoading && !estado ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="size-5 animate-spin" />
              Analizando periodo…
            </div>
          ) : estado ? (
            <ul className="space-y-3">
              {estado.pasos.map((paso) => {
                const manualOk =
                  paso.pasoNumero === 1
                    ? estado.periodoCierre.paso1RucOk
                    : paso.pasoNumero === 2
                      ? estado.periodoCierre.paso2SireOk
                      : paso.pasoNumero === 3
                        ? estado.periodoCierre.paso3ProvisionOk
                        : paso.pasoNumero === 4
                          ? estado.periodoCierre.paso4CajaOk
                          : estado.periodoCierre.paso5LibrosCerrados;

                const alertasPaso = estado.alertas.filter(
                  (a) => a.pasoRelacionado === paso.pasoNumero && a.severidad !== "INFO",
                );

                return (
                  <li key={paso.pasoNumero} className={cn(GLASS_ITEM, "p-4 space-y-3")}>
                    <div className="flex items-start gap-3">
                      <ChecklistIcon estado={paso.estado} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm text-slate-100">{paso.titulo}</p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", PASO_ESTADO_COLORS[paso.estado])}
                          >
                            {paso.estado.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{paso.descripcion}</p>
                      </div>
                    </div>

                    {alertasPaso.length > 0 && (
                      <ul className="space-y-1.5 pl-8">
                        {alertasPaso.map((a) => (
                          <li key={a.id} className="text-xs text-amber-200/90 flex gap-1.5">
                            <span className="text-amber-500">•</span>
                            {a.mensaje}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-2 pl-8">
                      {paso.estado !== "BLOQUEADO" && (
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs bg-slate-800 hover:bg-slate-700"
                        >
                          <Link to={paso.rutaModulo}>
                            Ir al módulo
                            <ArrowRight className="size-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-slate-600"
                        disabled={isMarcandoPaso || paso.estado === "BLOQUEADO"}
                        onClick={() => void handleTogglePaso(paso.pasoNumero, manualOk)}
                      >
                        {manualOk ? "Marcar pendiente" : "Marcar completado"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              Seleccione contribuyente y periodo para ver el checklist.
            </p>
          )}

          {estado && !estado.diarioCuadrado && estado.metricas.totalAsientosDiario > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200">
              Libro Diario descuadrado: Debe S/ {estado.metricas.sumaDebe.toFixed(2)} ≠ Haber S/{" "}
              {estado.metricas.sumaHaber.toFixed(2)}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 pt-3 pb-1 bg-slate-950/95 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full text-slate-400"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4 mr-2" />
            Cerrar checklist
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
