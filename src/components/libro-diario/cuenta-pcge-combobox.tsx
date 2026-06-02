import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCuentaPcge, type PcgeCuenta } from "@/lib/pcge-service";

export function CuentaPcgeCombobox({
  value,
  onChange,
  cuentas,
  disabled,
}: {
  value: string;
  onChange: (codigo_cuenta: string) => void;
  cuentas: PcgeCuenta[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = cuentas.find((c) => c.codigo_cuenta === value);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cuentas.slice(0, 80);
    return cuentas
      .filter((c) =>
        `${c.codigo_cuenta} ${c.nombre_cuenta}`.toLowerCase().includes(needle),
      )
      .slice(0, 80);
  }, [cuentas, q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-mono h-8 text-xs"
        >
          {selected ? formatCuentaPcge(selected) : value ? `[${value}]` : "Cuenta…"}
          <ChevronsUpDown className="ml-2 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar cuenta PCGE…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 h-8"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Sin resultados</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.codigo_cuenta}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent",
                  value === c.codigo_cuenta && "bg-accent",
                )}
                onClick={() => {
                  onChange(c.codigo_cuenta);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("size-3", value === c.codigo_cuenta ? "opacity-100" : "opacity-0")}
                />
                <span className="truncate">{formatCuentaPcge(c)}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
