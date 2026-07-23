import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Info, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/common/ClientOnly";
import { cn } from "@/lib/utils";
import { useWorkflowWizard } from "@/modules/workflow/hooks/useWorkflowWizard";
import type {
  AlertaFlujo,
  AlertaSeveridad,
  VistaFlujoGuard,
} from "@/modules/workflow/types/workflow";
import { ALERTA_SEVERIDAD_COLORS } from "@/modules/workflow/types/workflow";

const VISTA_PASO_REQUERIDO: Record<VistaFlujoGuard, number> = {
  workflow: 1,
  contabilidad: 3,
  "libro-diario": 3,
  tesoreria: 4,
  "libro-mayor": 5,
};

function severidadIcon(severidad: AlertaSeveridad) {
  if (severidad === "BLOQUEANTE") return ShieldAlert;
  if (severidad === "ADVERTENCIA") return AlertTriangle;
  return Info;
}

function filtrarAlertasParaVista(
  alertas: AlertaFlujo[],
  vista: VistaFlujoGuard,
  pasoSugerido: number,
): AlertaFlujo[] {
  const pasoRequerido = VISTA_PASO_REQUERIDO[vista];

  return alertas.filter((alerta) => {
    if (alerta.severidad === "INFO" && vista !== "workflow") return false;

    if (vista === "libro-mayor") {
      return (
        alerta.pasoRelacionado < 5 &&
        (alerta.severidad === "BLOQUEANTE" ||
          alerta.severidad === "ADVERTENCIA" ||
          alerta.pasoRelacionado <= 3)
      );
    }

    if (vista === "contabilidad" || vista === "libro-diario") {
      return alerta.pasoRelacionado <= 3 || alerta.id === "diario-descuadrado";
    }

    if (vista === "tesoreria") {
      return alerta.pasoRelacionado >= 3 && alerta.pasoRelacionado <= 4;
    }

    return alerta.pasoRelacionado <= pasoRequerido || alerta.pasoRelacionado === pasoSugerido;
  });
}

export interface StepGuardBannerProps {
  contribuyenteId: string | null;
  periodo: string | null;
  vista: VistaFlujoGuard;
  className?: string;
}

function StepGuardBannerInner({
  contribuyenteId,
  periodo,
  vista,
  className,
}: StepGuardBannerProps) {
  const { estado, isLoading } = useWorkflowWizard(contribuyenteId, periodo);

  if (isLoading || !estado) return null;

  const alertas = filtrarAlertasParaVista(estado.alertas, vista, estado.pasoSugerido).filter(
    (a) => a.severidad !== "INFO" || vista === "workflow",
  );

  if (alertas.length === 0) return null;

  const principal =
    alertas.find((a) => a.severidad === "BLOQUEANTE") ??
    alertas.find((a) => a.severidad === "ADVERTENCIA") ??
    alertas[0];

  const Icon = severidadIcon(principal.severidad);
  const colorClass = ALERTA_SEVERIDAD_COLORS[principal.severidad];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 backdrop-blur-md",
        colorClass,
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="size-5 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">
            {principal.severidad === "BLOQUEANTE"
              ? "Atención requerida antes de continuar"
              : "Recomendación del asistente de flujo"}
          </p>
          <p className="text-sm opacity-90">{principal.mensaje}</p>
          {alertas.length > 1 && (
            <p className="text-xs opacity-70">
              +{alertas.length - 1} alerta(s) adicional(es) en este periodo
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button
          asChild
          size="sm"
          variant={principal.severidad === "BLOQUEANTE" ? "destructive" : "secondary"}
          className="gap-1.5"
        >
          <Link to={principal.accionRuta}>
            {principal.accionTexto}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-current/30 bg-transparent">
          <Link to="/workflow">Ver checklist completo</Link>
        </Button>
      </div>
    </div>
  );
}

export function StepGuardBanner(props: StepGuardBannerProps) {
  if (!props.contribuyenteId || !props.periodo?.replace(/\D/g, "").slice(0, 6)) {
    return null;
  }

  return (
    <ClientOnly fallback={null}>
      <StepGuardBannerInner {...props} />
    </ClientOnly>
  );
}
