import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Lock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import type { EstadoFlujoPeriodoResponse, PasoEstado } from "@/modules/workflow/types/workflow";
import { PASO_ESTADO_COLORS } from "@/modules/workflow/types/workflow";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-md shadow-xl shadow-emerald-950/20";

function PasoIcon({ estado }: { estado: PasoEstado }) {
  if (estado === "COMPLETADO") {
    return <CheckCircle2 className="size-5 text-emerald-400 shrink-0" aria-hidden />;
  }
  if (estado === "EN_PROGRESO") {
    return (
      <span
        className="size-3 rounded-full bg-yellow-400 shrink-0 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]"
        aria-hidden
      />
    );
  }
  if (estado === "BLOQUEADO") {
    return <Lock className="size-4 text-slate-500 shrink-0" aria-hidden />;
  }
  return <Circle className="size-4 text-slate-500 shrink-0" aria-hidden />;
}

function pasoTieneAtencion(
  pasoNumero: number,
  estado: PasoEstado,
  alertas: EstadoFlujoPeriodoResponse["alertas"],
): boolean {
  if (estado === "EN_PROGRESO") return true;
  return alertas.some(
    (a) =>
      a.pasoRelacionado === pasoNumero &&
      (a.severidad === "BLOQUEANTE" || a.severidad === "ADVERTENCIA"),
  );
}

export interface WorkflowStepperBarProps {
  estado?: EstadoFlujoPeriodoResponse;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

export function WorkflowStepperBar({
  estado,
  isLoading = false,
  className,
  compact = false,
}: WorkflowStepperBarProps) {
  const mounted = useIsMounted();
  const porcentaje = mounted && estado ? Math.min(100, Math.max(0, estado.porcentajeAvance)) : 0;

  if (isLoading && !estado) {
    return (
      <div className={cn(GLASS, "p-4 flex items-center gap-3", className)}>
        <Loader2 className="size-5 animate-spin text-emerald-400" />
        <span className="text-sm text-slate-400">Calculando progreso del ciclo contable…</span>
      </div>
    );
  }

  if (!estado) return null;

  return (
    <div className={cn(GLASS, "p-4 space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
            Ciclo contable mensual
          </p>
          <p className="text-sm text-slate-300">
            Periodo{" "}
            <span className="font-mono text-emerald-300">{estado.periodo}</span>
            {" · "}
            Paso sugerido{" "}
            <span className="font-semibold text-yellow-300">{estado.pasoSugerido}/5</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-emerald-300">
            {mounted ? `${Math.round(porcentaje)}%` : "—%"}
          </p>
          <p className="text-xs text-slate-500">avance global</p>
        </div>
      </div>

      <div className="relative h-2.5 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300",
            mounted && "transition-all duration-700 ease-out",
          )}
          style={{ width: mounted ? `${porcentaje}%` : "0%" }}
          role="progressbar"
          aria-valuenow={Math.round(porcentaje)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del ciclo contable"
        />
      </div>

      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-1 md:grid-cols-5",
        )}
      >
        {estado.pasos.map((paso) => {
          const atencion = pasoTieneAtencion(paso.pasoNumero, paso.estado, estado.alertas);
          const colorClass =
            atencion && paso.estado !== "COMPLETADO" && paso.estado !== "BLOQUEADO"
              ? "border-red-500/60 bg-red-950/30 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              : PASO_ESTADO_COLORS[paso.estado];

          const content = (
            <div
              className={cn(
                "rounded-xl border p-3 flex flex-col gap-1.5 min-h-[88px] transition-colors",
                colorClass,
                paso.estado !== "BLOQUEADO" && "hover:brightness-110 cursor-pointer",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono opacity-70">{paso.pasoNumero}</span>
                <PasoIcon estado={paso.estado} />
                {atencion && paso.estado !== "COMPLETADO" ? (
                  <AlertTriangle className="size-3.5 text-red-400 ml-auto shrink-0" />
                ) : null}
              </div>
              {!compact && (
                <>
                  <p className="text-xs font-semibold leading-tight">{paso.titulo}</p>
                  <p className="text-[10px] opacity-75 line-clamp-2 leading-snug">{paso.descripcion}</p>
                </>
              )}
              {compact && <p className="text-[11px] font-medium leading-tight">{paso.titulo}</p>}
            </div>
          );

          if (paso.estado === "BLOQUEADO") {
            return (
              <div key={paso.pasoNumero} title={paso.titulo}>
                {content}
              </div>
            );
          }

          return (
            <Link
              key={paso.pasoNumero}
              to={paso.rutaModulo}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
              title={paso.descripcion}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
