import { ClienteSearchCombobox } from "@/components/libro-diario/cliente-search-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClienteOption } from "@/lib/cliente-search-service";

function formatPeriodoInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function EmpresaPeriodoFilters({
  cliente,
  onClienteChange,
  periodo,
  onPeriodoChange,
  periodoDefault,
}: {
  cliente: ClienteOption | null;
  onClienteChange: (cliente: ClienteOption | null) => void;
  periodo: string;
  onPeriodoChange: (periodo: string) => void;
  periodoDefault?: string;
}) {
  const periodoValue = periodo || periodoDefault || "";

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <ClienteSearchCombobox required value={cliente} onSelect={onClienteChange} />
      <div>
        <Label className="text-xs">
          Periodo (AAAAMM) <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="202605"
          value={periodoValue}
          onChange={(e) => onPeriodoChange(formatPeriodoInput(e.target.value))}
        />
      </div>
    </div>
  );
}

export function RequireRucEmptyState({ context }: { context: string }) {
  return (
    <div className="py-12 px-4 text-center text-sm text-muted-foreground rounded-lg border border-dashed bg-muted/20">
      <p className="font-medium text-foreground mb-1">Selecciona un contribuyente (RUC)</p>
      <p>{context}</p>
    </div>
  );
}
