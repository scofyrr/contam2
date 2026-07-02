import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Search,
  Download,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { cn } from "@/lib/utils";
import {
  buildPcgeTree,
  formatCuentaPcge,
  generarCodigoPcgeHijo,
  getColorNivel,
  getNivelNombre,
  type PcgeCuenta,
  useCuentaDetalle,
} from "@/lib/pcge-service";
import type { PcgeTreeNode } from "@/types/pcge";

type Props = {
  cuentas: PcgeCuenta[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  selectedCodigo?: string | null;
  onSelect?: (cuenta: PcgeCuenta) => void;
  onEdit?: (cuenta: PcgeCuenta) => void;
  onAddChild?: (padre: PcgeCuenta) => void;
};

function NivelIcon({ nivel, className }: { nivel: number; className?: string }) {
  const props = { className: cn("size-4 shrink-0", className), viewBox: "0 0 16 16", fill: "none" };
  switch (nivel) {
    case 1:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <path d="M2 14V6l6-4 6 4v8H2z" />
          <path d="M6 14V9h4v5" />
        </svg>
      );
    case 2:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="5" height="4" rx="0.5" />
          <rect x="2" y="9" width="5" height="4" rx="0.5" />
          <rect x="9" y="6" width="5" height="5" rx="0.5" />
        </svg>
      );
    case 3:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <path d="M4 2h8v12H4z" />
          <path d="M6 5h4M6 8h4M6 11h2" />
        </svg>
      );
    case 4:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <path d="M5 2h6v12H5z" />
          <path d="M7 6h2M7 9h2" />
        </svg>
      );
    case 5:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h10v6H3z" />
          <path d="M5 7h6" />
        </svg>
      );
    default:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2" />
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
        </svg>
      );
  }
}

function countDescendants(node: PcgeTreeNode): number {
  return node.hijos.reduce((acc, h) => acc + 1 + countDescendants(h), 0);
}

function TreeNodeRow({
  node,
  depth,
  expanded,
  toggle,
  selectedCodigo,
  highlight,
  onSelect,
  focusedCodigo,
  registerRef,
}: {
  node: PcgeTreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (code: string) => void;
  selectedCodigo?: string | null;
  highlight?: boolean;
  onSelect?: (c: PcgeCuenta) => void;
  focusedCodigo?: string | null;
  registerRef: (code: string, el: HTMLButtonElement | null) => void;
}) {
  const hasChildren = node.hijos.length > 0;
  const isOpen = expanded.has(node.codigo_cuenta);
  const selected = selectedCodigo === node.codigo_cuenta;
  const focused = focusedCodigo === node.codigo_cuenta;
  const childCount = countDescendants(node);

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={selected}
        aria-level={depth + 1}
        className="relative"
        style={{ paddingLeft: depth * 24 }}
      >
        {depth > 0 && (
          <svg
            className="absolute left-0 top-0 h-full w-6 text-[#1A2F4A] pointer-events-none"
            aria-hidden
          >
            <path
              d={`M12 0 Q 0 12, 12 24`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        )}
        <button
          type="button"
          ref={(el) => registerRef(node.codigo_cuenta, el)}
          className={cn(
            "group w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-all duration-200",
            "hover:bg-white/[0.03] border-l-2 border-transparent",
            selected && "bg-premium-gold/5 border-l-premium-gold",
            focused && "ring-2 ring-premium-gold/50 ring-offset-0",
            highlight && "bg-premium-gold/10",
          )}
          onClick={() => onSelect?.(node)}
        >
          {hasChildren ? (
            <span
              role="presentation"
              className={cn(
                "size-5 grid place-items-center text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-90",
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.codigo_cuenta);
              }}
            >
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </span>
          ) : (
            <span className="size-5" />
          )}
          <NivelIcon
            nivel={node.nivel}
            className={depth === 0 ? "text-premium-gold" : "text-muted-foreground"}
          />
          <span className="font-mono text-sm text-premium-cyan font-medium">{node.codigo_cuenta}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-sm text-foreground truncate flex-1">{node.nombre_cuenta}</span>
          {!node.es_agrupador && node.nivel >= 3 && (
            <Badge variant="success" className="text-[9px] px-1.5 py-0 rounded-full border-0">
              OPER
            </Badge>
          )}
          {hasChildren && (
            <span className="text-xs text-muted-foreground tabular-nums shrink-0 count-up">
              [{childCount} cuentas]
            </span>
          )}
        </button>
      </div>
      {hasChildren && isOpen &&
        node.hijos.map((h) => (
          <TreeNodeRow
            key={h.codigo_cuenta}
            node={h}
            depth={depth + 1}
            expanded={expanded}
            toggle={toggle}
            selectedCodigo={selectedCodigo}
            highlight={highlight}
            onSelect={onSelect}
            focusedCodigo={focusedCodigo}
            registerRef={registerRef}
          />
        ))}
    </>
  );
}

function DetailPanel({
  codigo,
  onEdit,
  onAddChild,
}: {
  codigo: string;
  onEdit?: (c: PcgeCuenta) => void;
  onAddChild?: (c: PcgeCuenta) => void;
}) {
  const { data: detalle, isLoading } = useCuentaDetalle(codigo);

  if (isLoading || !detalle) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-32 bg-white/10" />
        <Skeleton className="h-24 w-full bg-white/10" />
      </div>
    );
  }

  const chartData = detalle.estadisticas.actividad_mensual.map((a) => ({
    mes: a.mes.slice(4),
    count: a.count,
  }));

  return (
    <div className="p-6 space-y-5 slide-right h-full overflow-y-auto">
      <div className="rounded-xl bg-gradient-to-br from-premium-gold/10 to-transparent p-4 border border-premium-gold/20">
        <p className="font-mono text-2xl text-premium-cyan">{detalle.codigo_cuenta}</p>
        <p className="text-lg font-semibold text-foreground mt-1">{detalle.nombre_cuenta}</p>
        <Badge className={cn("mt-2 border", getColorNivel(detalle.nivel))}>
          Nivel {detalle.nivel} — {getNivelNombre(detalle.nivel)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Naturaleza</p>
          <Badge
            variant="outline"
            className={cn(
              "mt-1",
              detalle.naturaleza === "deudora"
                ? "border-blue-500/30 bg-blue-500/10"
                : "border-destructive/30 bg-destructive/10",
            )}
          >
            {detalle.naturaleza === "deudora" ? "D — Deudora" : "A — Acreedora"}
          </Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estado</p>
          <p className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                detalle.activo ? "bg-success" : "bg-muted-foreground",
              )}
            />
            {detalle.activo ? "Activa" : "Inactiva"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Último movimiento</p>
          <p className="mt-1 font-mono text-xs">
            {detalle.estadisticas.ultimo_movimiento
              ? new Date(detalle.estadisticas.ultimo_movimiento).toLocaleDateString("es-PE")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Asientos este mes</p>
          <p className="mt-1 text-xl font-bold tabular-nums count-up">
            {detalle.estadisticas.asientos_mes}
          </p>
        </div>
      </div>

      {chartData.some((d) => d.count > 0) && (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pcge-act" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="#00D4FF" fill="url(#pcge-act)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {detalle.hijos_directos.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hijos directos</p>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/30">
            {detalle.hijos_directos.map((h) => (
              <div key={h.codigo_cuenta} className="px-3 py-2 text-xs font-mono hover:bg-white/[0.03]">
                {formatCuentaPcge(h)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="border-premium-gold/30 hover:bg-premium-gold/10"
            onClick={() => onEdit(detalle)}
          >
            <Pencil className="size-3.5 mr-1" />
            Editar
          </Button>
        )}
        {onAddChild && detalle.es_agrupador && (
          <Button
            size="sm"
            className="bg-gradient-to-r from-premium-gold/20 to-transparent border border-premium-gold/30"
            onClick={() => onAddChild(detalle)}
          >
            <Plus className="size-3.5 mr-1" />
            Añadir Hijo
          </Button>
        )}
        <Button variant="outline" size="sm" className="border-premium-cyan/30" asChild>
          <Link to="/libro-diario">
            <BookOpen className="size-3.5 mr-1" />
            Ver en Diario
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="border border-white/10">
          <Download className="size-3.5 mr-1" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

function flattenVisible(
  nodes: PcgeTreeNode[],
  expanded: Set<string>,
  acc: PcgeTreeNode[] = [],
): PcgeTreeNode[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.hijos.length && expanded.has(n.codigo_cuenta)) {
      flattenVisible(n.hijos, expanded, acc);
    }
  }
  return acc;
}

export function PcgeTreePremium({
  cuentas,
  loading,
  error,
  onRetry,
  selectedCodigo,
  onSelect,
  onEdit,
  onAddChild,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["1", "2", "6", "7", "10"]));
  const [focusedCodigo, setFocusedCodigo] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const deferredSearch = useDeferredValue(busqueda);
  const searchRef = useRef<HTMLInputElement>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const tree = useMemo(() => buildPcgeTree(cuentas), [cuentas]);

  const matchCodes = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      cuentas
        .filter(
          (c) => c.codigo_cuenta.includes(q) || c.nombre_cuenta.toLowerCase().includes(q),
        )
        .map((c) => c.codigo_cuenta),
    );
  }, [cuentas, deferredSearch]);

  const filteredTree = useMemo(() => {
    if (!matchCodes) return tree;
    const matching = cuentas.filter((c) => matchCodes.has(c.codigo_cuenta));
    return buildPcgeTree(matching);
  }, [tree, cuentas, matchCodes]);

  const visibleFlat = useMemo(
    () => flattenVisible(filteredTree, expanded),
    [filteredTree, expanded],
  );

  const toggle = useCallback((code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const registerRef = useCallback((code: string, el: HTMLButtonElement | null) => {
    if (el) nodeRefs.current.set(code, el);
    else nodeRefs.current.delete(code);
  }, []);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleTreeKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!visibleFlat.length) return;
    const idx = focusedCodigo
      ? visibleFlat.findIndex((n) => n.codigo_cuenta === focusedCodigo)
      : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = visibleFlat[Math.min(idx + 1, visibleFlat.length - 1)];
      setFocusedCodigo(next.codigo_cuenta);
      nodeRefs.current.get(next.codigo_cuenta)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = visibleFlat[Math.max(idx - 1, 0)];
      setFocusedCodigo(next.codigo_cuenta);
      nodeRefs.current.get(next.codigo_cuenta)?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const node = visibleFlat[idx >= 0 ? idx : 0];
      if (node?.hijos.length) toggle(node.codigo_cuenta);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const node = visibleFlat[idx >= 0 ? idx : 0];
      if (node) toggle(node.codigo_cuenta);
    } else if (e.key === "Enter" && idx >= 0) {
      e.preventDefault();
      onSelect?.(visibleFlat[idx]);
    }
  };

  const selected = cuentas.find((c) => c.codigo_cuenta === selectedCodigo);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-[#1A2F4A]/50 bg-[#0A1628]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 12px)",
      }}
    >
      <header className="px-6 pt-6 pb-4 border-b border-[#1A2F4A]/50">
        <h2 className="font-display text-xl text-premium-gold">Plan Contable General Empresarial</h2>
        <p className="text-sm text-muted-foreground font-light">PCGE — CONASEV</p>
        <div className="mt-3 h-px bg-gradient-to-r from-premium-gold/60 via-premium-gold/20 to-transparent" />
        <div className="mt-4 relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
              isSearching && "animate-pulse",
            )}
            strokeWidth={1.5}
          />
          <Input
            ref={searchRef}
            placeholder="Buscar cuenta… (Ctrl+K)"
            value={busqueda}
            onChange={(e) => startSearchTransition(() => setBusqueda(e.target.value))}
            className="pl-10 bg-[#0F1D32] border-[#1A2F4A] focus-visible:ring-premium-gold/40 font-mono"
          />
          {busqueda !== deferredSearch && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
              buscando...
            </span>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px] min-h-[560px]">
        <div
          role="tree"
          aria-label="Árbol PCGE"
          tabIndex={0}
          onKeyDown={handleTreeKeyDown}
          className="max-h-[600px] overflow-y-auto p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-gold/40"
        >
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 bg-white/5 shimmer" style={{ marginLeft: (i % 3) * 24 }} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 m-4 rounded-xl border border-destructive/40 bg-destructive/5">
              <AlertCircle className="size-8 text-destructive mb-3" />
              <p className="text-sm text-destructive">{error.message}</p>
              {onRetry && (
                <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
                  Reintentar
                </Button>
              )}
            </div>
          ) : filteredTree.length === 0 ? (
            <PremiumEmptyState
              icon={Search}
              title={busqueda ? "Sin resultados" : "No se encontraron cuentas"}
              description={
                busqueda
                  ? `No hay cuentas que coincidan con "${busqueda}"`
                  : "El plan contable está vacío. Cree la primera cuenta."
              }
            />
          ) : (
            filteredTree.map((node) => (
              <TreeNodeRow
                key={node.codigo_cuenta}
                node={node}
                depth={0}
                expanded={expanded}
                toggle={toggle}
                selectedCodigo={selectedCodigo}
                highlight={matchCodes?.has(node.codigo_cuenta)}
                onSelect={onSelect}
                focusedCodigo={focusedCodigo}
                registerRef={registerRef}
              />
            ))
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-[#1A2F4A]/50 bg-[#0F1D32]/40 min-h-[280px]">
          {selectedCodigo && selected ? (
            <DetailPanel codigo={selectedCodigo} onEdit={onEdit} onAddChild={onAddChild} />
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Seleccione una cuenta del árbol para ver el detalle
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export async function openNewChildWithGeneratedCode(
  padre: PcgeCuenta,
  onReady: (initial: Partial<PcgeCuenta>) => void,
  onError: (msg: string) => void,
) {
  try {
    const hijo = await generarCodigoPcgeHijo(padre.codigo_cuenta);
    onReady({ codigo_cuenta: hijo, padre_codigo: padre.codigo_cuenta, es_agrupador: false });
  } catch (e) {
    onError(e instanceof Error ? e.message : "No se pudo generar código hijo");
  }
}
