import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CancelacionesTable } from "@/components/cancelaciones/cancelaciones-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const Route = createFileRoute("/_app/cancelaciones")({
  component: CancelacionesPage,
});

function CancelacionesPage() {
  const [ruc, setRuc] = useState("");
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7).replace("-", ""));

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Link2 className="size-8 text-primary" />
            Cancelaciones (SIRE ↔ Caja)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pantalla de trazabilidad para asientos y movimientos generados por cobro/pago.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          Ajuste por contador
        </Badge>
      </header>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div>
          <Label className="text-xs">RUC (opcional)</Label>
          <Input value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="Filtrar por contribuyente…" />
        </div>
        <div>
          <Label className="text-xs">Periodo (AAAAMM)</Label>
          <Input value={periodo} onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </div>
      </div>

      <CancelacionesTable ruc={ruc.trim() ? ruc.trim() : null} periodo={periodo.trim() ? periodo.trim() : null} />
    </div>
  );
}

