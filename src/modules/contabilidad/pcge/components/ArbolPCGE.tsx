import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildPcgeTree, type PcgeCuenta } from "@/lib/pcge-service";
import type { PcgeTreeNode } from "@/types/pcge";

type Props = {
  cuentas: PcgeCuenta[];
  selectedCodigo?: string | null;
  onSelect?: (cuenta: PcgeCuenta) => void;
  onAddChild?: (padre: PcgeCuenta) => void;
};

function TreeNode({
  node,
  depth,
  selectedCodigo,
  onSelect,
  onAddChild,
  expanded,
  toggle,
}: {
  node: PcgeTreeNode;
  depth: number;
  selectedCodigo?: string | null;
  onSelect?: (cuenta: PcgeCuenta) => void;
  onAddChild?: (padre: PcgeCuenta) => void;
  expanded: Set<string>;
  toggle: (code: string) => void;
}) {
  const hasChildren = node.hijos.length > 0;
  const isOpen = expanded.has(node.codigo_cuenta);
  const selected = selectedCodigo === node.codigo_cuenta;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded-md text-sm hover:bg-muted/60",
          selected && "bg-primary/10 ring-1 ring-primary/30",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          className="size-5 shrink-0 grid place-items-center text-muted-foreground"
          onClick={() => hasChildren && toggle(node.codigo_cuenta)}
          aria-label={isOpen ? "Contraer" : "Expandir"}
        >
          {hasChildren ? (
            isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
          ) : (
            <span className="size-4" />
          )}
        </button>
        {node.es_agrupador ? (
          <Folder className="size-4 text-amber-600 shrink-0" />
        ) : (
          <FileText className="size-4 text-blue-600 shrink-0" />
        )}
        <button
          type="button"
          className="flex-1 text-left min-w-0"
          onClick={() => onSelect?.(node)}
        >
          <span className="font-mono font-medium">{node.codigo_cuenta}</span>
          <span className="text-muted-foreground ml-2 truncate">{node.nombre_cuenta}</span>
        </button>
        {!node.activo && (
          <Badge variant="outline" className="text-xs shrink-0">
            Inactiva
          </Badge>
        )}
        {onAddChild && node.es_agrupador && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => onAddChild(node)}
          >
            + Hijo
          </Button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.hijos.map((h) => (
            <TreeNode
              key={h.codigo_cuenta}
              node={h}
              depth={depth + 1}
              selectedCodigo={selectedCodigo}
              onSelect={onSelect}
              onAddChild={onAddChild}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ArbolPCGE({ cuentas, selectedCodigo, onSelect, onAddChild }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["1", "2", "6", "7"]));

  const tree = useMemo(() => buildPcgeTree(cuentas), [cuentas]);

  const filteredTree = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tree;
    const matching = cuentas.filter(
      (c) =>
        c.codigo_cuenta.includes(q) ||
        c.nombre_cuenta.toLowerCase().includes(q),
    );
    return buildPcgeTree(matching);
  }, [tree, cuentas, busqueda]);

  const toggle = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-3 border-b">
        <Input
          placeholder="Buscar código o nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-9"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Estructura secuencial sin puntos · Niveles: 1, 2, 3, 4, 6 y 8 dígitos
        </p>
      </div>
      <div className="max-h-[520px] overflow-y-auto p-2">
        {filteredTree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin cuentas PCGE</p>
        ) : (
          filteredTree.map((node) => (
            <TreeNode
              key={node.codigo_cuenta}
              node={node}
              depth={0}
              selectedCodigo={selectedCodigo}
              onSelect={onSelect}
              onAddChild={onAddChild}
              expanded={expanded}
              toggle={toggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
