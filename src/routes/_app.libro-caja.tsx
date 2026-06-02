import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";

import { MovimientosCajaTable } from "@/components/caja/movimientos-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/libro-caja")({
  component: LibroCajaPage,
});

function LibroCajaPage() {
  const [ruc, setRuc] = useState("");
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7).replace("-", ""));

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Wallet className="size-8 text-primary" />
            Libro Caja y Bancos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Flujo de efectivo con saldo acumulado. Movimientos manuales y cancelaciones de SIRE.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          Formato SUNAT (base)
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

      <MovimientosCajaTable ruc={ruc.trim() ? ruc.trim() : null} periodo={periodo.trim() ? periodo.trim() : null} />
    </div>
  );
}

