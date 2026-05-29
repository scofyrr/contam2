import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useContribuyentes, useContribuyentesKpis } from "@/hooks/use-contribuyentes";
import type { Contribuyente, EstadoCliente } from "@/lib/contribuyentes-types";
import { emptyContribuyente, validateRuc } from "@/lib/contribuyentes-factory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
export const Route = createFileRoute("/_app/contribuyentes")({
  component: ContribuyentesPage,
});

const CATEGORIAS = [
  { key: "cat1ra" as const, label: "1RA CATEGORIA" },
  { key: "cat2da" as const, label: "2DA CATEGORIA" },
  { key: "cat3ra" as const, label: "3RA CATEGORIA" },
  { key: "cat4taRetenciones" as const, label: "4TA CATEG. RETENCIONES" },
  { key: "cat4taCtaPropia" as const, label: "4TA CATEG.-CTA.PROPIA" },
  { key: "cat5ta" as const, label: "5TA CATEGORIA" },
];

function CredPair({
  label,
  usuario,
  clave,
  onUsuario,
  onClave,
}: {
  label: string;
  usuario: string;
  clave: string;
  onUsuario: (v: string) => void;
  onClave: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
      <p className="text-xs font-semibold text-blue-800">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Usuario</Label>
          <Input value={usuario} onChange={(e) => onUsuario(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Clave</Label>
          <Input
            type="password"
            value={clave}
            onChange={(e) => onClave(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function estadoBadge(estado: EstadoCliente) {
  if (estado === "ACTIVO")
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Activo</Badge>;
  if (estado === "INACTIVO")
    return <Badge className="bg-blue-600 hover:bg-blue-600">Inactivo</Badge>;
  return <Badge className="bg-red-600 hover:bg-red-600">De baja</Badge>;
}

function ContribuyentesPage() {
  const { contribuyentes, upsertContribuyente, removeContribuyente } = useContribuyentes();
  const kpis = useContribuyentesKpis(contribuyentes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Contribuyente>(emptyContribuyente());
  const [isEdit, setIsEdit] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contribuyentes;
    return contribuyentes.filter(
      (c) =>
        c.ruc.includes(term) ||
        c.razonSocial.toLowerCase().includes(term),
    );
  }, [contribuyentes, q]);

  const openNew = () => {
    setForm(emptyContribuyente());
    setIsEdit(false);
    setOpen(true);
  };

  const openEdit = (c: Contribuyente) => {
    setForm({ ...c, categorias: { ...c.categorias } });
    setIsEdit(true);
    setOpen(true);
  };

  const save = () => {
    const rucErr = validateRuc(form.ruc);
    if (rucErr) {
      toast.error(rucErr);
      return;
    }
    if (!form.razonSocial.trim()) {
      toast.error("Razón Social es obligatoria");
      return;
    }
    upsertContribuyente({ ...form, ruc: form.ruc.replace(/\D/g, "") });
    toast.success(isEdit ? "Contribuyente actualizado" : "Contribuyente registrado");
    setOpen(false);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Building2 className="size-8 text-primary" />
            Contribuyentes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Maestro de clientes, categorías tributarias y credenciales de portales (modo demo ·
            localStorage)
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="size-4 mr-2" />
              Nuevo contribuyente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar contribuyente" : "Registrar contribuyente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>RUC * (11 dígitos)</Label>
                  <Input
                    value={form.ruc}
                    disabled={isEdit}
                    maxLength={11}
                    onChange={(e) =>
                      setForm({ ...form, ruc: e.target.value.replace(/\D/g, "").slice(0, 11) })
                    }
                  />
                </div>
                <div>
                  <Label>Estado del cliente</Label>
                  <Select
                    value={form.estado}
                    onValueChange={(v) => setForm({ ...form, estado: v as EstadoCliente })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                      <SelectItem value="DE_BAJA">De baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Razón Social *</Label>
                  <Input
                    value={form.razonSocial}
                    onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Otros</Label>
                  <Input
                    value={form.otros}
                    onChange={(e) => setForm({ ...form, otros: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha V. Declaración</Label>
                  <Input
                    type="date"
                    value={form.fechaVencimientoDeclaracion}
                    onChange={(e) =>
                      setForm({ ...form, fechaVencimientoDeclaracion: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-3">Registro de categorías</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CATEGORIAS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.categorias[key]}
                        onCheckedChange={(v) =>
                          setForm({
                            ...form,
                            categorias: { ...form.categorias, [key]: !!v },
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-sm font-medium">Central de credenciales</p>
              <div className="grid md:grid-cols-2 gap-3">
                <CredPair
                  label="CLAVE SOL"
                  usuario={form.claveSol.usuario}
                  clave={form.claveSol.clave}
                  onUsuario={(v) =>
                    setForm({ ...form, claveSol: { ...form.claveSol, usuario: v } })
                  }
                  onClave={(v) =>
                    setForm({ ...form, claveSol: { ...form.claveSol, clave: v } })
                  }
                />
                <CredPair
                  label="AFP NET"
                  usuario={form.afpNet.usuario}
                  clave={form.afpNet.clave}
                  onUsuario={(v) =>
                    setForm({ ...form, afpNet: { ...form.afpNet, usuario: v } })
                  }
                  onClave={(v) =>
                    setForm({ ...form, afpNet: { ...form.afpNet, clave: v } })
                  }
                />
                <CredPair
                  label="VALIDEZ CPE"
                  usuario={form.validezCpe.usuario}
                  clave={form.validezCpe.clave}
                  onUsuario={(v) =>
                    setForm({ ...form, validezCpe: { ...form.validezCpe, usuario: v } })
                  }
                  onClave={(v) =>
                    setForm({ ...form, validezCpe: { ...form.validezCpe, clave: v } })
                  }
                />
                <CredPair
                  label="CLAVES SIRE"
                  usuario={form.clavesSire.usuario}
                  clave={form.clavesSire.clave}
                  onUsuario={(v) =>
                    setForm({ ...form, clavesSire: { ...form.clavesSire, usuario: v } })
                  }
                  onClave={(v) =>
                    setForm({ ...form, clavesSire: { ...form.clavesSire, clave: v } })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-2 border-blue-200/60 bg-blue-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="size-4 text-blue-700" />
              Total contribuyentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-800">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-200/60 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{kpis.activos}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">{kpis.inactivos}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200/60 bg-red-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">De baja</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{kpis.deBaja}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 max-w-sm">
        <Label className="text-xs">Buscar por RUC o razón social</Label>
        <Input placeholder="20123456789…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RUC</TableHead>
              <TableHead>Razón social</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Venc. declaración</TableHead>
              <TableHead>Categorías</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay contribuyentes. Registre el primero con el botón superior.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.ruc}>
                  <TableCell className="font-mono font-medium">{c.ruc}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.razonSocial}</TableCell>
                  <TableCell>{estadoBadge(c.estado)}</TableCell>
                  <TableCell className="text-sm">{c.fechaVencimientoDeclaracion || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIAS.filter((cat) => c.categorias[cat.key]).map((cat) => (
                        <Badge key={cat.key} variant="outline" className="text-[10px]">
                          {cat.label.split(" ")[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => {
                        if (confirm(`¿Eliminar contribuyente ${c.ruc}?`)) {
                          removeContribuyente(c.ruc);
                          toast.success("Eliminado");
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
