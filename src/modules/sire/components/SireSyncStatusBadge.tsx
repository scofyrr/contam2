import { AlertTriangle, CheckCircle2, Clock, HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClientOnly } from "@/components/common/ClientOnly";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import { useSireEstadoFuentePeriodo } from "@/modules/sire/hooks/useSireSync";

const GLASS_BADGE =
  "rounded-full border backdrop-blur-md px-3 py-1 text-xs font-medium shadow-sm";

function formatSyncTime(iso: string | null, mounted: boolean): string | null {
  if (!iso || !mounted) return null;
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export interface SireSyncStatusBadgeProps {
  contribuyenteId: string | null;
  periodo: string | null;
  className?: string;
}

function SireSyncStatusBadgeInner({
  contribuyenteId,
  periodo,
  className,
}: SireSyncStatusBadgeProps) {
  const mounted = useIsMounted();
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";

  const { data: estado, isLoading } = useSireEstadoFuentePeriodo(
    contribuyenteId,
    periodoClean,
    !!contribuyenteId && periodoClean.length === 6,
  );

  if (!contribuyenteId || periodoClean.length !== 6) {
    return null;
  }

  if (isLoading && !estado) {
    return (
      <Badge
        variant="outline"
        className={cn(
          GLASS_BADGE,
          "border-slate-600/50 bg-slate-900/60 text-slate-400 animate-pulse",
          className,
        )}
      >
        <Clock className="size-3.5 mr-1.5" />
        Verificando origen SIRE…
      </Badge>
    );
  }

  if (!estado) return null;

  const horaSync = formatSyncTime(estado.fechaSincronizacion, mounted);
  const esSunatReal =
    (estado.fuente === "DECOLECTA" || estado.fuente === "SUNAT_DIRECTO") &&
    !estado.esSimulacionDetectada;

  const esSimulacion =
    estado.fuente === "SIMULACION" ||
    estado.esSimulacionDetectada;

  if (esSunatReal) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                GLASS_BADGE,
                "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-emerald-950/30",
                className,
              )}
            >
              <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-400" />
              🟢 Sincronizado SUNAT
              {horaSync ? ` · ${horaSync}` : ""}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-sm">
            Propuesta RVIE/RCE obtenida desde la API Decolecta/SUNAT.
            {horaSync ? ` Última sincronización: ${horaSync}.` : ""}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (esSimulacion) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                GLASS_BADGE,
                "border-yellow-400/60 bg-yellow-400/10 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.15)]",
                className,
              )}
            >
              <AlertTriangle className="size-3.5 mr-1.5 text-yellow-400" />
              🟡 Datos de Simulación
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm text-sm space-y-1">
            <p>
              Atención: Configure <code className="text-xs">API_SUNAT_TOKEN</code> en Supabase Edge
              Secrets para obtener la propuesta real de SUNAT.
            </p>
            <p className="text-muted-foreground text-xs">
              Comando:{" "}
              <code>npx supabase secrets set API_SUNAT_TOKEN=&quot;tu_bearer_token&quot;</code>
            </p>
            {estado.ultimoError && (
              <p className="text-amber-200/90 text-xs">Último error: {estado.ultimoError}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (estado.fuente === "PENDIENTE") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                GLASS_BADGE,
                "border-slate-600/50 bg-slate-900/50 text-slate-400",
                className,
              )}
            >
              <HelpCircle className="size-3.5 mr-1.5" />
              Sin sincronizar
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-sm">
            Este periodo aún no tiene propuesta SIRE sincronizada. Use &quot;Sincronizar propuesta
            SUNAT&quot;.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              GLASS_BADGE,
              "border-sky-500/40 bg-sky-500/10 text-sky-200",
              className,
            )}
          >
            <Clock className="size-3.5 mr-1.5" />
            Datos locales
            {horaSync ? ` · ${horaSync}` : ""}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-sm">
          Hay comprobantes en el periodo pero no se registró el origen SUNAT en esta sesión.
          Sincronice nuevamente para confirmar la fuente.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SireSyncStatusBadge(props: SireSyncStatusBadgeProps) {
  return (
    <ClientOnly fallback={null}>
      <SireSyncStatusBadgeInner {...props} />
    </ClientOnly>
  );
}
