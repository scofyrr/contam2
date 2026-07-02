import { Link } from "@tanstack/react-router";
import { ExternalLink, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AsientoLineaTrazabilidad } from "@/modules/contabilidad/asientos/types/traceability";

const LIBRO_COLORS: Record<string, string> = {
  DIARIO_COMPRAS: "border-l-[#00D4FF]",
  DIARIO_VENTAS: "border-l-[#00C897]",
  CAJA_BANCOS: "border-l-[#9B87F5]",
  DIARIO_MANUAL: "border-l-[#8899B4]",
};

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AsientoViewerCardPremium({
  asientoId,
  numeroAsiento,
  fecha,
  tipoLibro,
  tipoAsiento,
  glosa,
  lineas,
  sireRegistroId,
  onEdit,
  className,
}: {
  asientoId: string;
  numeroAsiento?: string;
  fecha: string;
  tipoLibro: string;
  tipoAsiento?: string;
  glosa?: string | null;
  lineas: AsientoLineaTrazabilidad[];
  sireRegistroId?: string | null;
  onEdit?: () => void;
  className?: string;
}) {
  const debe = lineas.reduce((s, l) => s + l.debe, 0);
  const haber = lineas.reduce((s, l) => s + l.haber, 0);
  const cuadra = Math.abs(debe - haber) <= 0.001;
  const borderColor = LIBRO_COLORS[tipoLibro] ?? "border-l-[#8899B4]";

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden border-l-4",
        borderColor,
        className,
      )}
    >
      <div className="p-4 border-b border-white/[0.05]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-sm text-[#E8EDF5]">{numeroAsiento ?? asientoId.slice(0, 8)}</p>
            <p className="text-xs text-[#8899B4] mt-0.5">{fecha}</p>
          </div>
          <div className="flex gap-1.5">
            <Badge variant="outline" className="text-[10px] border-white/10">
              {tipoLibro}
            </Badge>
            {tipoAsiento ? (
              <Badge variant="secondary" className="text-[10px]">
                {tipoAsiento}
              </Badge>
            ) : null}
          </div>
        </div>
        {glosa ? <p className="text-xs text-[#8899B4] mt-2 line-clamp-2">{glosa}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/[0.05] text-[#8899B4] uppercase tracking-wider">
              <th className="px-3 py-2 text-left">Cuenta</th>
              <th className="px-3 py-2 text-right">Debe</th>
              <th className="px-3 py-2 text-right">Haber</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr
                key={`${l.cuentaCodigo}-${i}`}
                className={cn("border-t border-white/[0.03]", i % 2 === 0 && "bg-white/[0.01]")}
              >
                <td className="px-3 py-1.5">
                  <span className="font-mono text-[#E8EDF5]">{l.cuentaCodigo}</span>
                  <span className="text-[#8899B4] ml-2 hidden sm:inline">{l.cuentaDenominacion}</span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[#00D4FF] tabular-nums">
                  {l.debe > 0 ? formatMoney(l.debe) : "—"}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[#FF6B6B] tabular-nums">
                  {l.haber > 0 ? formatMoney(l.haber) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#C8A95A]/40">
              <td className="px-3 py-2 font-medium text-[#E8EDF5]">Totales</td>
              <td className="px-3 py-2 text-right font-mono text-[#00D4FF]">{formatMoney(debe)}</td>
              <td className="px-3 py-2 text-right font-mono text-[#FF6B6B]">{formatMoney(haber)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05]">
        <Badge
          className={cn(
            "text-[10px]",
            cuadra ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
          )}
        >
          {cuadra ? "CUADRA" : "DESCUADRE"}
        </Badge>
        <div className="flex gap-2">
          {sireRegistroId ? (
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <Link to="/trazabilidad/$sireRegistroId" params={{ sireRegistroId }}>
                <GitBranch className="size-3.5 mr-1" />
                Ver trazabilidad
              </Link>
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link to="/libro-diario">
              <ExternalLink className="size-3.5 mr-1" />
              Diario
            </Link>
          </Button>
          {onEdit ? (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onEdit}>
              Editar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
