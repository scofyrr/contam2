import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

import { PcgeTable } from "@/components/pcge/pcge-table";
import { Badge } from "@/components/ui/badge";
import { ConfigContableCard } from "@/components/pcge/config-contable-card";

export const Route = createFileRoute("/_app/pcge")({
  component: PcgePage,
});

function PcgePage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Landmark className="size-8 text-primary" />
            Plan de Cuentas (PCGE)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Mantenimiento de cuentas contables para asientos automáticos y edición manual.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          Editable por contador
        </Badge>
      </header>

      <PcgeTable />

      <div className="mt-6">
        <ConfigContableCard />
      </div>
    </div>
  );
}

