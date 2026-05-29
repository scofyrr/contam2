import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { FichaRucForm } from "@/components/ficha-ruc/ficha-ruc-form";
import { emptyFichaRuc, validateFichaRequired } from "@/lib/contribuyentes-factory";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ficha-ruc")({
  component: FichaRucPage,
});

function FichaRucPage() {
  const { contribuyentes, getFicha, saveFicha } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState<string>("");
  const [draft, setDraft] = useState<FichaRuc | null>(null);

  const options = useMemo(
    () =>
      [...contribuyentes].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)),
    [contribuyentes],
  );

  useEffect(() => {
    if (!selectedRuc && options.length > 0) {
      setSelectedRuc(options[0].ruc);
    }
  }, [options, selectedRuc]);

  useEffect(() => {
    if (!selectedRuc) {
      setDraft(null);
      return;
    }
    const existing = getFicha(selectedRuc);
    const c = contribuyentes.find((x) => x.ruc === selectedRuc);
    if (existing) {
      setDraft(structuredClone(existing));
    } else {
      setDraft(emptyFichaRuc(selectedRuc, c?.razonSocial ?? ""));
    }
  }, [selectedRuc, getFicha, contribuyentes]);

  const handleSave = () => {
    if (!draft) return;
    const err = validateFichaRequired(draft);
    if (err) {
      toast.error(err);
      return;
    }
    saveFicha(draft);
    toast.success("Ficha RUC guardada (localStorage)");
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <FileText className="size-8 text-primary" />
            Ficha RUC
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualizador y editor indexado por RUC · Solo 3 campos obligatorios al guardar
          </p>
          <Badge variant="secondary" className="mt-2">
            Modo demo · sincronizado con módulo Contribuyentes
          </Badge>
        </div>
        <Button
          size="lg"
          className="bg-blue-700 hover:bg-blue-800"
          disabled={!draft}
          onClick={handleSave}
        >
          <Save className="size-4 mr-2" />
          Guardar ficha
        </Button>
      </header>

      <div className="rounded-xl border bg-card p-4 mb-6 shadow-sm">
        <Label className="text-sm font-medium">Seleccionar contribuyente (RUC)</Label>
        <Select
          value={selectedRuc || undefined}
          onValueChange={setSelectedRuc}
          disabled={options.length === 0}
        >
          <SelectTrigger className="mt-2 max-w-xl">
            <SelectValue placeholder="Seleccione un RUC registrado…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((c) => (
              <SelectItem key={c.ruc} value={c.ruc}>
                {c.ruc} — {c.razonSocial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {options.length === 0 && (
          <p className="text-sm text-amber-700 mt-2">
            Registre primero un contribuyente en el módulo Contribuyentes.
          </p>
        )}
      </div>

      {draft ? (
        <FichaRucForm ficha={draft} onChange={setDraft} />
      ) : (
        <p className="text-center text-muted-foreground py-12">
          Seleccione un RUC para cargar la ficha.
        </p>
      )}
    </div>
  );
}
