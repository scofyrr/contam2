import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { FichaRucForm } from "@/components/ficha-ruc/ficha-ruc-form";
import { ExportButtons } from "@/components/export-buttons";
import { emptyFichaRuc, validateFichaRequired } from "@/lib/contribuyentes-factory";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { getDataSourceLabel } from "@/lib/api/config";
import { formatRequestError } from "@/lib/request-error";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contribuyente360ViewPremium } from "@/modules/ficha-ruc/components/contribuyente-360-view-premium";
import { RucSearchComparePremium } from "@/modules/ficha-ruc/components/ruc-search-compare-premium";
import { FileText, LayoutDashboard, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";

const PAGE_TABS = ["360", "editor", "buscar"] as const;
type PageTab = (typeof PAGE_TABS)[number];

export const Route = createFileRoute("/_app/ficha-ruc")({
  component: FichaRucPage,
  validateSearch: (search: Record<string, unknown>) => {
    const tab = search.tab as string;
    const ruc = typeof search.ruc === "string" ? search.ruc.replace(/\D/g, "").slice(0, 11) : "";
    return {
      tab: PAGE_TABS.includes(tab as PageTab) ? (tab as PageTab) : "360",
      ruc: ruc || undefined,
    };
  },
});

async function exportFichaPdf(ficha: FichaRuc) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Ficha RUC — ${ficha.ruc}`, 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [["Campo", "Valor"]],
    body: [
      ["Razón social", ficha.general.razonSocial],
      ["Tipo contribuyente", ficha.general.tipoContribuyente],
      ["Fecha inscripción", ficha.general.fechaInscripcion],
      ["Estado", ficha.general.estadoContribuyente],
      ["Departamento", ficha.domicilioFiscal.departamento],
      ["Provincia", ficha.domicilioFiscal.provincia],
      ["Distrito", ficha.domicilioFiscal.distrito],
      ["Domicilio", ficha.domicilioFiscal.tipoNombreVia],
    ],
    styles: { fontSize: 9 },
  });
  doc.save(`CONTAM_Ficha_RUC_${ficha.ruc}.pdf`);
}

function defaultPeriodo(): string {
  return new Date().toISOString().slice(0, 7).replace("-", "");
}

function FichaRucPage() {
  const { tab: searchTab, ruc: searchRuc } = Route.useSearch();
  const { contribuyentes, getFicha, saveFicha, refresh } = useContribuyentes();
  const [pageTab, setPageTab] = useState<PageTab>(searchTab);
  const [selectedRuc, setSelectedRuc] = useState<string>(searchRuc ?? "");
  const [draft, setDraft] = useState<FichaRuc | null>(null);
  const [saving, setSaving] = useState(false);
  const periodo = defaultPeriodo();

  const options = useMemo(
    () => [...contribuyentes].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)),
    [contribuyentes],
  );

  useEffect(() => {
    if (searchRuc) setSelectedRuc(searchRuc);
  }, [searchRuc]);

  useEffect(() => {
    setPageTab(searchTab);
  }, [searchTab]);

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

  const handleSave = async () => {
    if (!draft) return;
    const err = validateFichaRequired(draft);
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      await saveFicha(draft);
      await refresh();
      toast.success(`Ficha RUC guardada (${getDataSourceLabel()})`);
    } catch (e) {
      toast.error(formatRequestError(e, "No se pudo guardar la ficha RUC"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <FileText className="size-8 text-primary" />
            Ficha RUC Premium
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Expediente 360° · Consulta SUNAT · Enriquecimiento SIRE
          </p>
          <Badge variant="outline" className="mt-2 border-blue-500/50">
            {getDataSourceLabel()}
          </Badge>
        </div>
        {pageTab === "editor" && draft ? (
          <div className="flex flex-wrap gap-2">
            <ExportButtons compact onExportPdf={async () => exportFichaPdf(draft)} />
            <Button size="lg" className="bg-blue-700 hover:bg-blue-800" disabled={saving} onClick={() => void handleSave()}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Guardar ficha
            </Button>
          </div>
        ) : null}
      </header>

      <Tabs value={pageTab} onValueChange={(v) => setPageTab(v as PageTab)}>
        <TabsList>
          <TabsTrigger value="360" className="gap-1">
            <LayoutDashboard className="size-4" /> Vista 360°
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-1">
            <FileText className="size-4" /> Editor
          </TabsTrigger>
          <TabsTrigger value="buscar" className="gap-1">
            <Search className="size-4" /> Buscar / Comparar
          </TabsTrigger>
        </TabsList>

        <div className="rounded-xl border bg-card p-4 mt-4 shadow-sm">
          <Label className="text-sm font-medium">Contribuyente (RUC)</Label>
          <Select value={selectedRuc || undefined} onValueChange={setSelectedRuc} disabled={options.length === 0}>
            <SelectTrigger className="mt-2 max-w-xl">
              <SelectValue placeholder="Seleccione un RUC…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((c) => (
                <SelectItem key={c.ruc} value={c.ruc}>
                  {c.ruc} — {c.razonSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="360" className="mt-4">
          {selectedRuc ? (
            <Contribuyente360ViewPremium
              ruc={selectedRuc}
              periodo={periodo}
              onEdit={() => setPageTab("editor")}
            />
          ) : (
            <p className="text-center text-muted-foreground py-12">Seleccione un RUC para ver el expediente 360°.</p>
          )}
        </TabsContent>

        <TabsContent value="editor" className="mt-4">
          {draft ? (
            <FichaRucForm ficha={draft} onChange={setDraft} />
          ) : (
            <p className="text-center text-muted-foreground py-12">Seleccione un RUC para editar la ficha.</p>
          )}
        </TabsContent>

        <TabsContent value="buscar" className="mt-4">
          <RucSearchComparePremium initialRuc={selectedRuc} onSelectRuc={setSelectedRuc} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
