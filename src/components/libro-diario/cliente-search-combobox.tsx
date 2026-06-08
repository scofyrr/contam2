import { useEffect, useState } from "react";
import { Loader2, Search, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchClientes, type ClienteOption } from "@/lib/cliente-search-service";
import { cn } from "@/lib/utils";

export function ClienteSearchCombobox({
  value,
  onSelect,
  required = false,
}: {
  value: ClienteOption | null;
  onSelect: (cliente: ClienteOption | null) => void;
  /** Muestra indicador de campo obligatorio (multiempresa). */
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ClienteOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchClientes(query);
        setResults(rows);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <Label className="text-xs flex items-center gap-1 mb-1.5">
        <User className="size-3.5" />
        Cliente (RUC o razón social)
        {required ? <span className="text-destructive ml-0.5">*</span> : null}
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Consulta en contribuyentes (mín. 2 caracteres)…"
          value={value ? `${value.ruc} — ${value.razonSocial}` : query}
          onChange={(e) => {
            onSelect(null);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && !value && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.ruc}
              type="button"
              className={cn(
                "flex w-full flex-col gap-0.5 px-3 py-2 text-sm hover:bg-accent text-left",
              )}
              onClick={() => {
                onSelect(c);
                setQuery("");
                setOpen(false);
              }}
            >
              <div>
                <span className="font-mono">{c.ruc}</span>
                <span className="text-muted-foreground ml-2">{c.razonSocial}</span>
              </div>
              {(c.direccion || c.estado) && (
                <span className="text-xs text-muted-foreground truncate">
                  {[c.direccion, c.estado].filter(Boolean).join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {value && (
        <button
          type="button"
          className="text-xs text-muted-foreground mt-1 hover:text-foreground underline"
          onClick={() => onSelect(null)}
        >
          Limpiar selección
        </button>
      )}
    </div>
  );
}
