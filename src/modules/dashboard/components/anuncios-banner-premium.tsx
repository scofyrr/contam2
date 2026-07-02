import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnuncioEstudio } from "@/modules/dashboard/types/dashboard-configurable-types";

const PRIORIDAD_STYLES: Record<string, string> = {
  CRITICA: "border-l-red-500 bg-red-500/10",
  ALTA: "border-l-orange-500 bg-orange-500/10",
  MEDIA: "border-l-amber-500 bg-amber-500/10",
  BAJA: "border-l-cyan-500 bg-cyan-500/10",
};

interface AnunciosBannerPremiumProps {
  anuncio: AnuncioEstudio;
  onDismiss?: () => void;
  canDismiss?: boolean;
}

export function AnunciosBannerPremium({ anuncio, onDismiss, canDismiss = true }: AnunciosBannerPremiumProps) {
  const esCritica = anuncio.prioridad === "CRITICA";

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] border-l-4 p-4 backdrop-blur-sm",
        "animate-in slide-in-from-top-2 fade-in duration-500",
        PRIORIDAD_STYLES[anuncio.prioridad] ?? PRIORIDAD_STYLES.MEDIA,
      )}
      role="region"
      aria-label="Anuncio del estudio"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <Megaphone className="size-5 text-[#C8A95A] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#8899B4] uppercase">
              Anuncio del estudio · {anuncio.prioridad}
            </p>
            <p className="text-sm font-semibold text-[#E8EDF5] mt-0.5">{anuncio.titulo}</p>
            <p className="text-sm text-[#8899B4] mt-1">{anuncio.mensaje}</p>
          </div>
        </div>
        {canDismiss && !esCritica && onDismiss && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-white/10 text-xs"
            onClick={onDismiss}
          >
            Entendido
          </Button>
        )}
      </div>
    </div>
  );
}
