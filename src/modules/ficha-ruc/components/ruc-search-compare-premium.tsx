import { useEffect, useMemo, useRef, useState } from "react";
import { GitCompare, Loader2, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBuscarContribuyentes, useCompararContribuyentes } from "@/hooks/use-ficha-ruc-premium";
import { validarRuc } from "@/modules/ficha-ruc/services/sunat-consult-service";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}

export function RucSearchComparePremium({
  onSelectRuc,
  initialRuc,
}: {
  onSelectRuc?: (ruc: string) => void;
  initialRuc?: string;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [termino, setTermino] = useState("");
  const [debounced, setDebounced] = useState("");
  const [compareA, setCompareA] = useState(initialRuc ?? "");
  const [compareB, setCompareB] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(termino), 400);
    return () => clearTimeout(t);
  }, [termino]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data: resultados, isLoading } = useBuscarContribuyentes(debounced);
  const { data: comparacion, isLoading: loadingCmp } = useCompararContribuyentes(
    showCompare ? compareA : null,
    showCompare ? compareB : null,
  );

  const validation = useMemo(() => {
    const digits = termino.replace(/\D/g, "");
    if (digits.length === 11) return validarRuc(digits);
    return null;
  }, [termino]);

  const goToFicha = (ruc: string) => {
    if (onSelectRuc) onSelectRuc(ruc);
    else void navigate({ to: "/ficha-ruc", search: { ruc, tab: "360" } });
  };

  return (
    <div
      className="rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-6"
      style={{ background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" }}
    >
      <div>
        <h3 className="text-lg font-semibold text-[#C8A44D] flex items-center gap-2">
          <Search className="size-5" /> Búsqueda inteligente de RUC
        </h3>
        <p className="text-xs text-[#8899B4] mt-1">Ctrl+Shift+R para enfocar · Autocompletado con debounce 400ms</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" />
        <Input
          ref={inputRef}
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          placeholder="Buscar por RUC o razón social…"
          className="pl-10 bg-white/[0.03] border-white/[0.08] text-[#E8EDF5] placeholder:text-[#8899B4]"
          aria-label="Buscar contribuyente por RUC o razón social"
        />
        {validation && !validation.esValido && termino.replace(/\D/g, "").length === 11 ? (
          <p className="text-xs text-red-400 mt-1">{validation.errores[0]}</p>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl bg-white/5" />
      ) : debounced.length >= 2 && resultados?.length ? (
        <ul className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]" role="listbox">
          {resultados.map((r) => (
            <li key={r.ruc}>
              <button
                type="button"
                role="option"
                className="w-full text-left px-4 py-3 hover:bg-cyan-500/5 transition-colors flex justify-between items-center gap-2"
                onClick={() => goToFicha(r.ruc)}
              >
                <div>
                  <span className="font-mono text-sm text-[#E8EDF5]">{r.ruc}</span>
                  <p className="text-xs text-[#8899B4] truncate">{r.razonSocial}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {r.estadoContribuyente || "ACTIVO"}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      ) : debounced.length >= 2 ? (
        <p className="text-sm text-[#8899B4] text-center py-6">Sin coincidencias</p>
      ) : null}

      <div className="border-t border-white/[0.06] pt-6">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-[#E8EDF5] mb-3">
          <GitCompare className="size-4 text-[#C8A44D]" /> Comparar contribuyentes
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <Input
            value={compareA}
            onChange={(e) => setCompareA(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="RUC 1"
            className="font-mono bg-white/[0.03] border-white/[0.08]"
            aria-label="Primer RUC a comparar"
          />
          <Input
            value={compareB}
            onChange={(e) => setCompareB(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="RUC 2"
            className="font-mono bg-white/[0.03] border-white/[0.08]"
            aria-label="Segundo RUC a comparar"
          />
        </div>
        <Button
          size="sm"
          disabled={compareA.length !== 11 || compareB.length !== 11 || compareA === compareB}
          onClick={() => setShowCompare(true)}
        >
          Comparar
        </Button>

        {showCompare && loadingCmp ? (
          <Loader2 className="size-6 animate-spin mt-4 text-[#8899B4]" />
        ) : comparacion ? (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                <p className="font-mono text-[#00C8FF]">{comparacion.ruc1}</p>
                <p className="text-xs text-[#8899B4]">{comparacion.ficha1?.general.razonSocial}</p>
                <p className="font-mono mt-2">Compras: {fmt(comparacion.dashboard1?.comprasAnio ?? 0)}</p>
                <p className="font-mono">Ventas: {fmt(comparacion.dashboard1?.ventasAnio ?? 0)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                <p className="font-mono text-[#9B87F5]">{comparacion.ruc2}</p>
                <p className="text-xs text-[#8899B4]">{comparacion.ficha2?.general.razonSocial}</p>
                <p className="font-mono mt-2">Compras: {fmt(comparacion.dashboard2?.comprasAnio ?? 0)}</p>
                <p className="font-mono">Ventas: {fmt(comparacion.dashboard2?.ventasAnio ?? 0)}</p>
              </div>
            </div>
            {comparacion.diferencias.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>{comparacion.ruc1}</TableHead>
                    <TableHead>{comparacion.ruc2}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparacion.diferencias.map((d) => (
                    <TableRow key={d.campo}>
                      <TableCell className="font-medium">{d.campo}</TableCell>
                      <TableCell className={cn("text-[#00C8FF]")}>{d.valor1}</TableCell>
                      <TableCell className={cn("text-[#9B87F5]")}>{d.valor2}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-[#8899B4]">Los campos comparados son idénticos</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
