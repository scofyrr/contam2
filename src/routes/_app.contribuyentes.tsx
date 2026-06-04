import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useContribuyentes, useContribuyentesKpis } from "@/hooks/use-contribuyentes";
import type { Contribuyente, EstadoCliente } from "@/lib/contribuyentes-types";
import { emptyContribuyente, validateRuc } from "@/lib/contribuyentes-factory";
import { rucExists } from "@/lib/contribuyentes-service";
import { getDataSourceLabel } from "@/lib/api/config";
import { formatRequestError } from "@/lib/request-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Building2, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { ExportButtons } from "@/components/export-buttons";
import { exportContribuyentesExcel } from "@/lib/export-service";
import {
  CONTRIBUYENTES_IMPORT_COLUMNS,
  readImportFile,
  validateImportColumns,
} from "@/lib/import-service";
import { bulkUpsertContribuyentes } from "@/lib/contribuyentes-service";

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
          <Input type="password" value={clave} onChange={(e) => onClave(e.target.value)} />
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
  const { loading, error, contribuyentes, upsertContribuyente, removeContribuyente, refresh } =
    useContribuyentes();
  const kpis = useContribuyentesKpis(contribuyentes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Contribuyente>(emptyContribuyente());
  const [isEdit, setIsEdit] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingRuc, setDeletingRuc] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contribuyentes;
    return contribuyentes.filter(
      (c) => c.ruc.includes(term) || c.razonSocial.toLowerCase().includes(term),
    );
  }, [contribuyentes, q]);

  const openNew = () => {
    setForm(emptyContribuyente());
    setIsEdit(false);
    setOpen(true);
  };

  const openEdit = (c: Contribuyente) => {
    setForm({ ...c });
    setIsEdit(true);
    setOpen(true);
  };

  const save = async () => {
    const cleanRuc = form.ruc.replace(/\D/g, "").slice(0, 11);
    const rucErr = validateRuc(cleanRuc);
    if (rucErr) {
      toast.error(rucErr);
      return;
    }
    if (!form.razonSocial.trim()) {
      toast.error("Razón Social es obligatoria");
      return;
    }

    setSaving(true);
    try {
      if (!isEdit) {
        const exists = await rucExists(cleanRuc);
        if (exists) {
          toast.error(`El RUC ${cleanRuc} ya está registrado`);
          return;
        }
      }

      await upsertContribuyente({ ...form, ruc: cleanRuc });
      toast.success(isEdit ? "Contribuyente actualizado" : "Contribuyente registrado");
      setOpen(false);
    } catch (e: unknown) {
      const msg = formatRequestError(e, "No se pudo guardar el contribuyente");
      if (msg.includes("duplicate") || msg.includes("23505") || msg.includes("409")) {
        toast.error("El RUC ya existe en la base de datos");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruc: string) => {
    if (!confirm(`¿Eliminar contribuyente ${ruc}?`)) return;
    setDeletingRuc(ruc);
    try {
      await removeContribuyente(ruc);
      toast.success("Contribuyente eliminado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    } finally {
      setDeletingRuc(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Cargando contribuyentes ({getDataSourceLabel()})…
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Building2 className="size-8 text-primary" />
            Contribuyentes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Maestro de clientes sincronizado con Supabase · tabla{" "}
            <code className="text-xs">contribuyentes</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons
            compact
            disabled={contribuyentes.length === 0}
            onExportExcel={async () => exportContribuyentesExcel(contribuyentes)}
            onImportExcel={async (file) => {
              const rows = await readImportFile(file);
              const validation = validateImportColumns(rows, CONTRIBUYENTES_IMPORT_COLUMNS);
              if (!validation.ok) {
                throw new Error(
                  `Columnas faltantes: ${validation.missing.join(", ")}. Use la plantilla de exportación CONTAM.`,
                );
              }
              const mapped: Contribuyente[] = rows.map((row) => ({
                ...emptyContribuyente(),
                ruc: String(row.ruc ?? "").replace(/\D/g, "").slice(0, 11),
                razonSocial: String(row.razon_social ?? ""),
                estado: (String(row.estado ?? "ACTIVO") as Contribuyente["estado"]),
                cat1ra: Boolean(row.cat1ra),
                cat2da: Boolean(row.cat2da),
                cat3ra: Boolean(row.cat3ra),
                cat4taRetenciones: Boolean(row.cat4ta_retenciones),
                cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
                cat5ta: Boolean(row.cat5ta),
              }));
              await bulkUpsertContribuyentes(mapped);
              await refresh();
            }}
          />
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
                  {!isEdit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Debe ser único en el sistema.
                    </p>
                  )}
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
                  <Input value={form.otros} onChange={(e) => setForm({ ...form, otros: e.target.value })} />
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
                        checked={form[key]}
                        onCheckedChange={(v) =>
                          setForm({
                            ...form,
                            [key]: !!v,
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
                  onUsuario={(v) => setForm({ ...form, claveSol: { ...form.claveSol, usuario: v } })}
                  onClave={(v) => setForm({ ...form, claveSol: { ...form.claveSol, clave: v } })}
                />
                <CredPair
                  label="AFP NET"
                  usuario={form.afpNet.usuario}
                  clave={form.afpNet.clave}
                  onUsuario={(v) => setForm({ ...form, afpNet: { ...form.afpNet, usuario: v } })}
                  onClave={(v) => setForm({ ...form, afpNet: { ...form.afpNet, clave: v } })}
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
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void refresh()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                      {CATEGORIAS.filter((cat) => c[cat.key]).map((cat) => (
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
                      disabled={deletingRuc === c.ruc}
                      onClick={() => void handleDelete(c.ruc)}
                    >
                      {deletingRuc === c.ruc ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
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
