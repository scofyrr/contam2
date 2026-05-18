import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listEntidades, createEntidad, deleteEntidad } from "@/lib/entidades.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/entidades")({
  head: () => ({ meta: [{ title: "Entidades — CONTAM" }] }),
  component: EntidadesPage,
});

const TIPO_DOC: Record<string, string> = {
  "0": "Sin documento",
  "1": "DNI",
  "4": "Carnet Extranjería",
  "6": "RUC",
  "7": "Pasaporte",
  "A": "Cédula diplomática",
  "B": "DI país residencia",
  "C": "TIN",
  "D": "ITIN",
  "E": "CUI",
};

function EntidadesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listEntidades);
  const createFn = useServerFn(createEntidad);
  const delFn = useServerFn(deleteEntidad);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipo_documento: "6",
    numero_documento: "",
    razon_social: "",
    direccion: "",
    tipo: "CLIENTE" as "CLIENTE" | "PROVEEDOR" | "AMBOS",
    email: "",
    telefono: "",
  });

  const q = useQuery({ queryKey: ["entidades"], queryFn: () => listFn() });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createFn({ data: form as any });
      toast.success("Entidad creada");
      setOpen(false);
      setForm({ ...form, numero_documento: "", razon_social: "", direccion: "", email: "", telefono: "" });
      qc.invalidateQueries({ queryKey: ["entidades"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar entidad?")) return;
    try {
      await delFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["entidades"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Entidades</h1>
          <p className="text-muted-foreground mt-1">Base centralizada de clientes y proveedores (Catálogo 06 SUNAT).</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Nueva entidad</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar entidad</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo doc.</Label>
                  <Select value={form.tipo_documento} onValueChange={(v) => setForm({ ...form, tipo_documento: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_DOC).map(([k, v]) => <SelectItem key={k} value={k}>{k} — {v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Número</Label>
                  <Input required value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Razón social / Nombre</Label>
                <Input required value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENTE">Cliente</SelectItem>
                      <SelectItem value="PROVEEDOR">Proveedor</SelectItem>
                      <SelectItem value="AMBOS">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>
              <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Doc.</th>
              <th className="text-left p-3">Razón social</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Email</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((e: any) => (
              <tr key={e.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{e.tipo_documento}-{e.numero_documento}</td>
                <td className="p-3 font-medium">{e.razon_social}</td>
                <td className="p-3"><span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">{e.tipo}</span></td>
                <td className="p-3 text-muted-foreground">{e.email ?? "—"}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => del(e.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {q.data?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay entidades registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
