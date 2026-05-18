import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generarRVIE, generarRCE } from "@/lib/sire.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sire")({
  head: () => ({ meta: [{ title: "Exportar SIRE — CONTAM" }] }),
  component: SirePage,
});

function SirePage() {
  const [ruc, setRuc] = useState("20100000001");
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [periodo, setPeriodo] = useState(defaultPeriod);
  const [preview, setPreview] = useState<{ nombre: string; contenido: string; totalFilas: number } | null>(null);

  const rvieFn = useServerFn(generarRVIE);
  const rceFn = useServerFn(generarRCE);

  async function exportar(tipo: "RVIE" | "RCE") {
    try {
      const fn = tipo === "RVIE" ? rvieFn : rceFn;
      const res = await fn({ data: { ruc, periodo } });
      setPreview(res);
      const blob = new Blob([res.contenido], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.nombre;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${tipo}: ${res.totalFilas} fila(s) exportadas`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error generando archivo");
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Exportar archivos SIRE</h1>
        <p className="text-muted-foreground mt-1">
          Genera los archivos planos según el formato del Anexo 2 (RS N.° 112-2021/SUNAT). Libros{" "}
          <span className="font-mono">140400</span> (RVIE) y <span className="font-mono">130400</span> (RCE).
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <Label>RUC (11 dígitos)</Label>
          <Input value={ruc} onChange={(e) => setRuc(e.target.value)} maxLength={11} className="font-mono" />
        </div>
        <div>
          <Label>Periodo (AAAAMM)</Label>
          <Input value={periodo} onChange={(e) => setPeriodo(e.target.value)} maxLength={6} className="font-mono" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportar("RVIE")} className="flex-1"><FileDown className="size-4 mr-2" />RVIE</Button>
          <Button onClick={() => exportar("RCE")} variant="secondary" className="flex-1"><FileDown className="size-4 mr-2" />RCE</Button>
        </div>
      </div>

      {preview && (
        <div className="mt-6 rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3">
            <FileText className="size-5 text-primary" />
            <div>
              <div className="font-medium font-mono text-sm">{preview.nombre}</div>
              <div className="text-xs text-muted-foreground">{preview.totalFilas} filas · separador <code>|</code> · codificación UTF-8</div>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto max-h-96 bg-muted/30">{preview.contenido || "(sin datos en el periodo)"}</pre>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed bg-muted/20 p-5 text-sm">
        <div className="font-medium mb-2">Integración API SUNAT SIRE</div>
        <p className="text-muted-foreground leading-relaxed">
          El cliente de envío (token OAuth2 con Client ID/Secret + Usuario y Clave SOL, subida resumible TUS.IO del ZIP,
          consulta de ticket y descarga del CDR) está implementado como server function en{" "}
          <code className="bg-background px-1 rounded">src/lib/sire.functions.ts</code>. Configura los secretos{" "}
          <code className="bg-background px-1 rounded">SUNAT_CLIENT_ID</code> y{" "}
          <code className="bg-background px-1 rounded">SUNAT_CLIENT_SECRET</code> para habilitar el envío real.
        </p>
      </div>
    </div>
  );
}
