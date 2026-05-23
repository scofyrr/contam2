import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ChevronsUpDown, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sire-registros")({
  head: () => ({ meta: [{ title: "Registros SIRE — CONTAM" }] }),
  component: SireRegistrosPage,
});

const TIPOS_CDP = [
  { c: "01", l: "01 - Factura" },
  { c: "03", l: "03 - Boleta de Venta" },
  { c: "07", l: "07 - Nota de Crédito" },
  { c: "08", l: "08 - Nota de Débito" },
  { c: "12", l: "12 - Ticket" },
  { c: "00", l: "00 - Otros" },
];
const TIPOS_DOC = [
  { c: "0", l: "0 - No domiciliado" },
  { c: "1", l: "1 - DNI" },
  { c: "4", l: "4 - C.Ext." },
  { c: "6", l: "6 - RUC" },
  { c: "7", l: "7 - Pasaporte" },
];
const MONEDAS = ["PEN", "USD", "EUR"];
const TIPOS_VENTA = ["Mercadería", "Productos", "Servicio", "Sub Productos", "Devoluciones", "Activo"];

type Reg = any;

const empty = (): Reg => ({
  tipo: "VENTA",
  ruc: "",
  razon_social: "",
  periodo: new Date().toISOString().slice(0, 7).replace("-", ""),
  car_sunat: "",
  fecha_emision: new Date().toISOString().slice(0, 10),
  fecha_vencimiento: "",
  cod_tipo_cdp: "01",
  serie_cdp: "",
  anio_dam_dsi: "",
  nro_cdp_inicial: "",
  nro_cdp_final: "",
  tipo_doc_contraparte: "6",
  nro_doc_contraparte: "",
  nombre_contraparte: "",
  bi_grav: 0, igv_grav: 0, bi_grav_y_no_grav: 0, igv_grav_y_no_grav: 0,
  bi_no_grav: 0, igv_no_grav: 0, valor_no_grav: 0,
  isc: 0, icbper: 0, otros_tributos: 0, importe_total: 0,
  cod_moneda: "PEN", tipo_cambio: 1,
  fecha_emision_mod: "", tipo_cdp_mod: "", serie_cdp_mod: "", cod_dam_dsi: "", nro_cdp_mod: "",
  clasificacion_bienes_serv: "",
  id_proyecto_operadores: "",
  pct_participacion: 0,
  impuesto_beneficio: 0,
  car_orig_indicador: "",
  campos_38_41: {},
  campos_libres: {},
  tipo_venta_config: [] as { tipo: string; descripcion: string }[],
  observaciones: "",
});

function SireRegistrosPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ tipo: "TODOS", periodo: "", ruc: "", contraparte: "", cod_tipo_cdp: "TODOS", q: "" });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Reg | null>(null);

  const query = useQuery({
    queryKey: ["registros_sire", filters],
    queryFn: async () => {
      let q = supabase.from("registros_sire").select("*").order("fecha_emision", { ascending: false }).limit(500);
      if (filters.tipo !== "TODOS") q = q.eq("tipo", filters.tipo);
      if (filters.periodo) q = q.eq("periodo", filters.periodo);
      if (filters.ruc) q = q.ilike("ruc", `%${filters.ruc}%`);
      if (filters.contraparte) q = q.ilike("nro_doc_contraparte", `%${filters.contraparte}%`);
      if (filters.cod_tipo_cdp !== "TODOS") q = q.eq("cod_tipo_cdp", filters.cod_tipo_cdp);
      if (filters.q) q = q.or(`razon_social.ilike.%${filters.q}%,nombre_contraparte.ilike.%${filters.q}%,serie_cdp.ilike.%${filters.q}%,nro_cdp_inicial.ilike.%${filters.q}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as Reg[];
    },
  });

  const totals = useMemo(() => {
    const rows = query.data ?? [];
    const f = (k: string) => rows.reduce((s, r: any) => s + Number(r[k] ?? 0), 0);
    return {
      count: rows.length,
      bi: f("bi_grav") + f("bi_grav_y_no_grav") + f("bi_no_grav"),
      igv: f("igv_grav") + f("igv_grav_y_no_grav") + f("igv_no_grav"),
      total: f("importe_total"),
    };
  }, [query.data]);

  const upsert = useMutation({
    mutationFn: async (r: Reg) => {
      const payload = { ...r };
      ["fecha_vencimiento", "fecha_emision_mod"].forEach((k) => { if (!payload[k]) payload[k] = null; });
      ["nro_cdp_final","serie_cdp","tipo_cdp_mod","serie_cdp_mod","cod_dam_dsi","nro_cdp_mod","anio_dam_dsi","car_sunat","clasificacion_bienes_serv","id_proyecto_operadores","car_orig_indicador","observaciones","tipo_doc_contraparte","nro_doc_contraparte","nombre_contraparte"].forEach((k) => { if (payload[k] === "") payload[k] = null; });
      if (payload.id) {
        const { error } = await supabase.from("registros_sire").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("registros_sire").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_sire"] });
      setOpenForm(false); setEditing(null);
      toast.success("Registro guardado");
    },
    onError: (e: any) => toast.error(e.message ?? "Error al guardar"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registros_sire").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["registros_sire"] }); toast.success("Eliminado"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Registros SIRE</h1>
          <p className="text-muted-foreground mt-1 text-sm">Formato extendido SUNAT — 35 columnas + campos libres 41-57.</p>
        </div>
        <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty())}><Plus className="size-4 mr-2" />Nuevo registro</Button>
          </DialogTrigger>
          {editing && <RegistroForm value={editing} onChange={setEditing} onSubmit={() => upsert.mutate(editing)} saving={upsert.isPending} />}
        </Dialog>
      </header>

      {/* Filtros */}
      <div className="rounded-xl border bg-card p-4 mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={filters.tipo} onValueChange={(v) => setFilters({ ...filters, tipo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="VENTA">Ventas</SelectItem>
              <SelectItem value="COMPRA">Compras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Periodo (AAAAMM)</Label>
          <Input value={filters.periodo} onChange={(e) => setFilters({ ...filters, periodo: e.target.value })} placeholder="202601" className="font-mono" />
        </div>
        <div>
          <Label className="text-xs">RUC contribuyente</Label>
          <Input value={filters.ruc} onChange={(e) => setFilters({ ...filters, ruc: e.target.value })} className="font-mono" />
        </div>
        <div>
          <Label className="text-xs">RUC contraparte</Label>
          <Input value={filters.contraparte} onChange={(e) => setFilters({ ...filters, contraparte: e.target.value })} className="font-mono" />
        </div>
        <div>
          <Label className="text-xs">Tipo CDP</Label>
          <Select value={filters.cod_tipo_cdp} onValueChange={(v) => setFilters({ ...filters, cod_tipo_cdp: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              {TIPOS_CDP.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="size-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="pl-8" placeholder="Razón social, serie…" />
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ tipo: "TODOS", periodo: "", ruc: "", contraparte: "", cod_tipo_cdp: "TODOS", q: "" })}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Registros" value={String(totals.count)} />
        <KPI label="Base Imponible" value={totals.bi.toFixed(2)} mono />
        <KPI label="IGV" value={totals.igv.toFixed(2)} mono />
        <KPI label="Importe Total" value={totals.total.toFixed(2)} mono />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {["Tipo","Periodo","F. Emisión","CDP","Serie","Número","Doc. Contraparte","Nombre","BI","IGV","Total","Moneda",""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.isLoading && <tr><td colSpan={13} className="p-8 text-center text-muted-foreground">Cargando…</td></tr>}
              {query.error && <tr><td colSpan={13} className="p-8 text-center text-destructive">{(query.error as any).message}</td></tr>}
              {!query.isLoading && (query.data ?? []).length === 0 && (
                <tr><td colSpan={13} className="p-8 text-center text-muted-foreground">Sin registros para los filtros aplicados.</td></tr>
              )}
              {(query.data ?? []).map((r: any) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><Badge variant={r.tipo === "VENTA" ? "default" : "secondary"}>{r.tipo}</Badge></td>
                  <td className="px-3 py-2 font-mono">{r.periodo}</td>
                  <td className="px-3 py-2 font-mono">{r.fecha_emision}</td>
                  <td className="px-3 py-2 font-mono">{r.cod_tipo_cdp}</td>
                  <td className="px-3 py-2 font-mono">{r.serie_cdp}</td>
                  <td className="px-3 py-2 font-mono">{r.nro_cdp_inicial}</td>
                  <td className="px-3 py-2 font-mono">{r.nro_doc_contraparte}</td>
                  <td className="px-3 py-2 max-w-[220px] truncate">{r.nombre_contraparte}</td>
                  <td className="px-3 py-2 text-right font-mono">{Number(r.bi_grav).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono">{Number(r.igv_grav).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{Number(r.importe_total).toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">{r.cod_moneda}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...r }); setOpenForm(true); }}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("¿Eliminar registro?")) del.mutate(r.id); }}><Trash2 className="size-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${mono ? "font-mono" : "font-display"}`}>{value}</div>
    </div>
  );
}

function RegistroForm({ value, onChange, onSubmit, saving }: { value: Reg; onChange: (r: Reg) => void; onSubmit: () => void; saving: boolean }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const setNum = (k: string, v: string) => set(k, v === "" ? 0 : Number(v));
  const tv: { tipo: string; descripcion: string }[] = Array.isArray(value.tipo_venta_config) ? value.tipo_venta_config : [];
  const toggleTV = (t: string) => {
    const exists = tv.find((x) => x.tipo === t);
    set("tipo_venta_config", exists ? tv.filter((x) => x.tipo !== t) : [...tv, { tipo: t, descripcion: "" }]);
  };
  const setTVDesc = (t: string, d: string) => set("tipo_venta_config", tv.map((x) => x.tipo === t ? { ...x, descripcion: d } : x));

  // Campos libres 41-57
  const cl: Record<string, string> = value.campos_libres ?? {};
  const setCL = (n: number, v: string) => set("campos_libres", { ...cl, [`campo_${n}`]: v });

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{value.id ? "Editar" : "Nuevo"} registro SIRE</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Cabecera */}
        <Section title="Identificación">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Tipo">
              <Select value={value.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENTA">VENTA</SelectItem>
                  <SelectItem value="COMPRA">COMPRA</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="RUC contribuyente *"><Input value={value.ruc} onChange={(e) => set("ruc", e.target.value)} maxLength={11} className="font-mono" /></Field>
            <Field label="Razón social *"><Input value={value.razon_social} onChange={(e) => set("razon_social", e.target.value)} /></Field>
            <Field label="Periodo (AAAAMM) *"><Input value={value.periodo} onChange={(e) => set("periodo", e.target.value)} maxLength={6} className="font-mono" /></Field>
            <Field label="CAR SUNAT"><Input value={value.car_sunat ?? ""} onChange={(e) => set("car_sunat", e.target.value)} className="font-mono" /></Field>
            <Field label="Fecha emisión *"><Input type="date" value={value.fecha_emision} onChange={(e) => set("fecha_emision", e.target.value)} /></Field>
            <Field label="Fecha vencimiento"><Input type="date" value={value.fecha_vencimiento ?? ""} onChange={(e) => set("fecha_vencimiento", e.target.value)} /></Field>
            <Field label="Cód. Tipo CDP *">
              <Select value={value.cod_tipo_cdp} onValueChange={(v) => set("cod_tipo_cdp", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS_CDP.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Serie"><Input value={value.serie_cdp ?? ""} onChange={(e) => set("serie_cdp", e.target.value)} className="font-mono" /></Field>
            <Field label="N° inicial *"><Input value={value.nro_cdp_inicial} onChange={(e) => set("nro_cdp_inicial", e.target.value)} className="font-mono" /></Field>
            <Field label="N° final"><Input value={value.nro_cdp_final ?? ""} onChange={(e) => set("nro_cdp_final", e.target.value)} className="font-mono" /></Field>
            <Field label="Año DAM/DSI"><Input value={value.anio_dam_dsi ?? ""} onChange={(e) => set("anio_dam_dsi", e.target.value)} className="font-mono" /></Field>
          </div>
        </Section>

        <Section title="Contraparte (Cliente / Proveedor)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Tipo doc.">
              <Select value={value.tipo_doc_contraparte ?? ""} onValueChange={(v) => set("tipo_doc_contraparte", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS_DOC.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="N° documento"><Input value={value.nro_doc_contraparte ?? ""} onChange={(e) => set("nro_doc_contraparte", e.target.value)} className="font-mono" /></Field>
            <div className="md:col-span-2"><Field label="Nombre / Razón social"><Input value={value.nombre_contraparte ?? ""} onChange={(e) => set("nombre_contraparte", e.target.value)} /></Field></div>
          </div>
        </Section>

        <Section title="Importes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="BI Gravada"><Input type="number" step="0.01" value={value.bi_grav} onChange={(e) => setNum("bi_grav", e.target.value)} /></Field>
            <Field label="IGV Gravada"><Input type="number" step="0.01" value={value.igv_grav} onChange={(e) => setNum("igv_grav", e.target.value)} /></Field>
            <Field label="BI Grav+NoGrav"><Input type="number" step="0.01" value={value.bi_grav_y_no_grav} onChange={(e) => setNum("bi_grav_y_no_grav", e.target.value)} /></Field>
            <Field label="IGV Grav+NoGrav"><Input type="number" step="0.01" value={value.igv_grav_y_no_grav} onChange={(e) => setNum("igv_grav_y_no_grav", e.target.value)} /></Field>
            <Field label="BI No Gravada"><Input type="number" step="0.01" value={value.bi_no_grav} onChange={(e) => setNum("bi_no_grav", e.target.value)} /></Field>
            <Field label="IGV No Gravada"><Input type="number" step="0.01" value={value.igv_no_grav} onChange={(e) => setNum("igv_no_grav", e.target.value)} /></Field>
            <Field label="Valor No Gravado"><Input type="number" step="0.01" value={value.valor_no_grav} onChange={(e) => setNum("valor_no_grav", e.target.value)} /></Field>
            <Field label="ISC"><Input type="number" step="0.01" value={value.isc} onChange={(e) => setNum("isc", e.target.value)} /></Field>
            <Field label="ICBPER"><Input type="number" step="0.01" value={value.icbper} onChange={(e) => setNum("icbper", e.target.value)} /></Field>
            <Field label="Otros tributos"><Input type="number" step="0.01" value={value.otros_tributos} onChange={(e) => setNum("otros_tributos", e.target.value)} /></Field>
            <Field label="Importe total *"><Input type="number" step="0.01" value={value.importe_total} onChange={(e) => setNum("importe_total", e.target.value)} /></Field>
            <Field label="Moneda">
              <Select value={value.cod_moneda} onValueChange={(v) => set("cod_moneda", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MONEDAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tipo de cambio"><Input type="number" step="0.001" value={value.tipo_cambio} onChange={(e) => setNum("tipo_cambio", e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Tipo de Venta (multi-select)">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3">
              {TIPOS_VENTA.map((t) => {
                const checked = !!tv.find((x) => x.tipo === t);
                return (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={checked} onCheckedChange={() => toggleTV(t)} />{t}
                  </label>
                );
              })}
            </div>
            {tv.length > 0 && (
              <div className="grid md:grid-cols-2 gap-2 pt-2">
                {tv.map((x) => (
                  <div key={x.tipo} className="flex gap-2 items-center">
                    <Badge variant="secondary" className="min-w-[110px] justify-center">{x.tipo}</Badge>
                    <Input placeholder={`Descripción de ${x.tipo}`} value={x.descripcion} onChange={(e) => setTVDesc(x.tipo, e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between"><span>Doc. modificado y campos 33-37</span><ChevronsUpDown className="size-4" /></Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="F. emisión doc. mod."><Input type="date" value={value.fecha_emision_mod ?? ""} onChange={(e) => set("fecha_emision_mod", e.target.value)} /></Field>
              <Field label="Tipo CDP mod."><Input value={value.tipo_cdp_mod ?? ""} onChange={(e) => set("tipo_cdp_mod", e.target.value)} className="font-mono" /></Field>
              <Field label="Serie CDP mod."><Input value={value.serie_cdp_mod ?? ""} onChange={(e) => set("serie_cdp_mod", e.target.value)} className="font-mono" /></Field>
              <Field label="N° CDP mod."><Input value={value.nro_cdp_mod ?? ""} onChange={(e) => set("nro_cdp_mod", e.target.value)} className="font-mono" /></Field>
              <Field label="Cód. DAM/DSI"><Input value={value.cod_dam_dsi ?? ""} onChange={(e) => set("cod_dam_dsi", e.target.value)} className="font-mono" /></Field>
              <Field label="Clasif. bienes/serv."><Input value={value.clasificacion_bienes_serv ?? ""} onChange={(e) => set("clasificacion_bienes_serv", e.target.value)} /></Field>
              <Field label="ID proyecto operadores"><Input value={value.id_proyecto_operadores ?? ""} onChange={(e) => set("id_proyecto_operadores", e.target.value)} /></Field>
              <Field label="% Participación"><Input type="number" step="0.01" value={value.pct_participacion} onChange={(e) => setNum("pct_participacion", e.target.value)} /></Field>
              <Field label="Imp. materia beneficio"><Input type="number" step="0.01" value={value.impuesto_beneficio} onChange={(e) => setNum("impuesto_beneficio", e.target.value)} /></Field>
              <Field label="CAR Orig/Indicador"><Input value={value.car_orig_indicador ?? ""} onChange={(e) => set("car_orig_indicador", e.target.value)} /></Field>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between"><span>Campos libres 41 al 57</span><ChevronsUpDown className="size-4" /></Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 17 }, (_, i) => 41 + i).map((n) => (
                <Field key={n} label={`Campo ${n}`}>
                  <Input value={cl[`campo_${n}`] ?? ""} onChange={(e) => setCL(n, e.target.value)} />
                </Field>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Section title="Observaciones">
          <Input value={value.observaciones ?? ""} onChange={(e) => set("observaciones", e.target.value)} />
        </Section>
      </div>

      <DialogFooter>
        <Button onClick={onSubmit} disabled={saving}>{saving ? "Guardando…" : "Guardar registro"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2 text-foreground/80">{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs">{label}</Label>{children}</div>;
}
