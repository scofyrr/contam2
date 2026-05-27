import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2, ChevronsUpDown, Search, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sire-registros")({
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

interface ColumnConfig {
  id: string;
  header: string;
  accessorKey: string;
  visible: boolean;
  isNumeric?: boolean;
}

// ============================================
// SOLO LAS COLUMNAS QUE EXISTEN EN LA BD
// ============================================
const ALL_COLUMNS: ColumnConfig[] = [
  { id: "tipo", header: "TIPO", accessorKey: "tipo", visible: true },
  { id: "ruc", header: "RUC", accessorKey: "ruc", visible: true },
  { id: "razon_social", header: "RAZON SOCIAL", accessorKey: "razon_social", visible: true },
  { id: "periodo", header: "PERIODO", accessorKey: "periodo", visible: true },
  { id: "car_sunat", header: "CAR SUNAT", accessorKey: "car_sunat", visible: true },
  { id: "fecha_emision", header: "FECHA EMISIÓN CDP", accessorKey: "fecha_emision", visible: true },
  { id: "fecha_vencimiento", header: "FECHA VENCIMIENTO CDP", accessorKey: "fecha_vencimiento", visible: true },
  { id: "cod_tipo_cdp", header: "COD. TIPO CDP", accessorKey: "cod_tipo_cdp", visible: true },
  { id: "serie_cdp", header: "SERIE CDP", accessorKey: "serie_cdp", visible: true },
  { id: "anio_dam_dsi", header: "AÑO DAM O DSI", accessorKey: "anio_dam_dsi", visible: true },
  { id: "nro_cdp_inicial", header: "NRO CDP INICIAL", accessorKey: "nro_cdp_inicial", visible: true },
  { id: "nro_cdp_final", header: "NRO CDP FINAL", accessorKey: "nro_cdp_final", visible: true },
  { id: "tipo_doc_contraparte", header: "TIPO DOC PROVEEDOR", accessorKey: "tipo_doc_contraparte", visible: true },
  { id: "nro_doc_contraparte", header: "NRO DOC PROVEEDOR", accessorKey: "nro_doc_contraparte", visible: true },
  { id: "nombre_contraparte", header: "NOMBRE CONTRAPARTE", accessorKey: "nombre_contraparte", visible: true },
  { id: "bi_grav", header: "BI GRAV.", accessorKey: "bi_grav", visible: true, isNumeric: true },
  { id: "igv_grav", header: "IGV GRAV.", accessorKey: "igv_grav", visible: true, isNumeric: true },
  { id: "bi_grav_y_no_grav", header: "BI GRAV. Y NO GRAV.", accessorKey: "bi_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "igv_grav_y_no_grav", header: "IGV GRAV. Y NO GRAV.", accessorKey: "igv_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "bi_no_grav", header: "BI NO GRAV.", accessorKey: "bi_no_grav", visible: false, isNumeric: true },
  { id: "igv_no_grav", header: "IGV NO GRAV.", accessorKey: "igv_no_grav", visible: false, isNumeric: true },
  { id: "valor_no_grav", header: "VALOR NO GRAV.", accessorKey: "valor_no_grav", visible: false, isNumeric: true },
  { id: "isc", header: "ISC", accessorKey: "isc", visible: false, isNumeric: true },
  { id: "icbper", header: "ICBPER", accessorKey: "icbper", visible: false, isNumeric: true },
  { id: "otros_tributos", header: "OTROS TRIBUTOS", accessorKey: "otros_tributos", visible: false, isNumeric: true },
  { id: "importe_total", header: "IMPORTE TOTAL", accessorKey: "importe_total", visible: true, isNumeric: true },
  { id: "cod_moneda", header: "MONEDA", accessorKey: "cod_moneda", visible: true },
  { id: "tipo_cambio", header: "TIPO CAMBIO", accessorKey: "tipo_cambio", visible: false, isNumeric: true },
  { id: "fecha_emision_mod", header: "F. EMISION DOC MOD", accessorKey: "fecha_emision_mod", visible: false },
  { id: "tipo_cdp_mod", header: "TIPO CDP MOD", accessorKey: "tipo_cdp_mod", visible: false },
  { id: "serie_cdp_mod", header: "SERIE CDP MOD", accessorKey: "serie_cdp_mod", visible: false },
  { id: "cod_dam_dsi", header: "COD DAM DSI", accessorKey: "cod_dam_dsi", visible: false },
  { id: "nro_cdp_mod", header: "NRO CDP MOD", accessorKey: "nro_cdp_mod", visible: false },
  { id: "clasificacion_bienes_serv", header: "CLASIFICACION", accessorKey: "clasificacion_bienes_serv", visible: false },
  { id: "observaciones", header: "OBSERVACIONES", accessorKey: "observaciones", visible: false },
];

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
  observaciones: "",
  tipo_venta_config: [] as { tipo: string; descripcion: string }[],
  campos_38_41: {},
  campos_libres: {},
});

function sanitizeRegistro(reg: any): Reg {
  const vacio = empty();
  return {
    ...vacio,
    ...reg,
    fecha_vencimiento: reg.fecha_vencimiento ?? "",
    fecha_emision_mod: reg.fecha_emision_mod ?? "",
    tipo_cdp_mod: reg.tipo_cdp_mod ?? "",
    serie_cdp_mod: reg.serie_cdp_mod ?? "",
    cod_dam_dsi: reg.cod_dam_dsi ?? "",
    nro_cdp_mod: reg.nro_cdp_mod ?? "",
    clasificacion_bienes_serv: reg.clasificacion_bienes_serv ?? "",
    observaciones: reg.observaciones ?? "",
    tipo_doc_contraparte: reg.tipo_doc_contraparte ?? "6",
    nro_doc_contraparte: reg.nro_doc_contraparte ?? "",
    nombre_contraparte: reg.nombre_contraparte ?? "",
    serie_cdp: reg.serie_cdp ?? "",
    anio_dam_dsi: reg.anio_dam_dsi ?? "",
    nro_cdp_final: reg.nro_cdp_final ?? "",
    car_sunat: reg.car_sunat ?? "",
    campos_libres: reg.campos_libres ?? {},
    tipo_venta_config: Array.isArray(reg.tipo_venta_config) ? reg.tipo_venta_config : [],
  };
}

function SireRegistrosPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ tipo: "TODOS", periodo: "", ruc: "", contraparte: "", cod_tipo_cdp: "TODOS", q: "" });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Reg | null>(null);
  
  // ✅ CORREGIDO: Verificar si window existe antes de usar localStorage
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sire_columns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return ALL_COLUMNS;
        }
      }
    }
    return ALL_COLUMNS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sire_columns", JSON.stringify(columns));
    }
  }, [columns]);

  const toggleColumn = (columnId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const resetColumns = () => {
    setColumns(ALL_COLUMNS);
  };

  const visibleColumns = columns.filter(col => col.visible);

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
      ["nro_cdp_final","serie_cdp","tipo_cdp_mod","serie_cdp_mod","cod_dam_dsi","nro_cdp_mod","anio_dam_dsi","car_sunat","clasificacion_bienes_serv","observaciones","tipo_doc_contraparte","nro_doc_contraparte","nombre_contraparte"].forEach((k) => { if (payload[k] === "") payload[k] = null; });
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

  const formatValue = (value: any, isNumeric?: boolean) => {
    if (value === null || value === undefined) return "-";
    if (isNumeric && typeof value === "number") return value.toFixed(2);
    return value;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Registros SIRE</h1>
          <p className="text-muted-foreground mt-1 text-sm">Formato extendido SUNAT — 35 columnas + campos libres 41-57.</p>
        </div>
        <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(sanitizeRegistro(empty()))}>
              <Plus className="size-4 mr-2" />Nuevo registro
            </Button>
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
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Registros</div>
          <div className="mt-1 text-xl font-semibold">{String(totals.count)}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Base Imponible</div>
          <div className="mt-1 text-xl font-semibold font-mono">{totals.bi.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">IGV</div>
          <div className="mt-1 text-xl font-semibold font-mono">{totals.igv.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Importe Total</div>
          <div className="mt-1 text-xl font-semibold font-mono">{totals.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Selector de columnas */}
      <details className="mb-3">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          <Settings2 className="size-4 inline mr-2" />
          Personalizar columnas ({visibleColumns.length}/{columns.length})
        </summary>
        <div className="mt-2 p-3 border rounded-lg bg-muted/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Selecciona las columnas a mostrar:</span>
            <Button variant="ghost" size="sm" onClick={resetColumns}>
              Restablecer
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {columns.map(col => (
              <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={col.visible}
                  onCheckedChange={() => toggleColumn(col.id)}
                />
                <span className="truncate">{col.header}</span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Tabla */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {visibleColumns.map((col) => (
                  <th key={col.id} className="px-3 py-2 text-left whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                <th className="px-3 py-2 text-center whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="p-8 text-center text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              ) : query.error ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="p-8 text-center text-destructive">
                    {(query.error as any).message}
                  </td>
                </tr>
              ) : (query.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="p-8 text-center text-muted-foreground">
                    Sin registros para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                (query.data ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    {visibleColumns.map((col) => (
                      <td key={col.id} className="px-3 py-2 whitespace-nowrap">
                        {col.isNumeric ? (
                          <span className="font-mono text-right block">
                            {formatValue(r[col.accessorKey], true)}
                          </span>
                        ) : (
                          formatValue(r[col.accessorKey], false)
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(sanitizeRegistro(r));
                          setOpenForm(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("¿Eliminar registro?")) del.mutate(r.id);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RegistroForm({ value, onChange, onSubmit, saving }: { value: Reg; onChange: (r: Reg) => void; onSubmit: () => void; saving: boolean }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const setNum = (k: string, v: string) => set(k, v === "" ? 0 : Number(v));

  // Tipo de venta (multi-select)
  const tv: { tipo: string; descripcion: string }[] = Array.isArray(value.tipo_venta_config) ? value.tipo_venta_config : [];
  const toggleTV = (t: string) => {
    const exists = tv.find((x) => x.tipo === t);
    set("tipo_venta_config", exists ? tv.filter((x) => x.tipo !== t) : [...tv, { tipo: t, descripcion: "" }]);
  };
  const setTVDesc = (t: string, d: string) => set("tipo_venta_config", tv.map((x) => x.tipo === t ? { ...x, descripcion: d } : x));

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{value.id ? "Editar" : "Nuevo"} registro SIRE</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Datos básicos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={value.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VENTA">VENTA</SelectItem>
                <SelectItem value="COMPRA">COMPRA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">RUC</Label>
            <Input value={value.ruc} onChange={(e) => set("ruc", e.target.value)} maxLength={11} className="font-mono" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Razón Social</Label>
            <Input value={value.razon_social} onChange={(e) => set("razon_social", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Periodo</Label>
            <Input value={value.periodo} onChange={(e) => set("periodo", e.target.value)} placeholder="YYYYMM" className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">Fecha Emisión</Label>
            <Input type="date" value={value.fecha_emision} onChange={(e) => set("fecha_emision", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cód. Tipo CDP</Label>
            <Select value={value.cod_tipo_cdp} onValueChange={(v) => set("cod_tipo_cdp", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_CDP.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Serie</Label>
            <Input value={value.serie_cdp} onChange={(e) => set("serie_cdp", e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">N° Inicial</Label>
            <Input value={value.nro_cdp_inicial} onChange={(e) => set("nro_cdp_inicial", e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">Doc. Proveedor</Label>
            <Input value={value.nro_doc_contraparte} onChange={(e) => set("nro_doc_contraparte", e.target.value)} className="font-mono" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Nombre Proveedor</Label>
            <Input value={value.nombre_contraparte} onChange={(e) => set("nombre_contraparte", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">BI Gravada</Label>
            <Input type="number" step="0.01" value={value.bi_grav} onChange={(e) => setNum("bi_grav", e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">IGV</Label>
            <Input type="number" step="0.01" value={value.igv_grav} onChange={(e) => setNum("igv_grav", e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">Importe Total</Label>
            <Input type="number" step="0.01" value={value.importe_total} onChange={(e) => setNum("importe_total", e.target.value)} className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">Moneda</Label>
            <Select value={value.cod_moneda} onValueChange={(v) => set("cod_moneda", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONEDAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campos Adicionales */}
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold mb-2">Campos Adicionales</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Clasificación de Bienes y Servicios</Label>
              <Input value={value.clasificacion_bienes_serv ?? ""} onChange={(e) => set("clasificacion_bienes_serv", e.target.value)} />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Tipo de Venta (Multi-select)</Label>
              <div className="flex flex-wrap gap-3 mb-2">
                {TIPOS_VENTA.map((t) => {
                  const checked = !!tv.find((x) => x.tipo === t);
                  return (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={checked} onCheckedChange={() => toggleTV(t)} />
                      {t}
                    </label>
                  );
                })}
              </div>
              {tv.length > 0 && (
                <div className="grid md:grid-cols-2 gap-2 pt-2">
                  {tv.map((x) => (
                    <div key={x.tipo} className="flex gap-2 items-center">
                      <Badge variant="secondary" className="min-w-[100px] justify-center">{x.tipo}</Badge>
                      <Input 
                        placeholder="Descripción" 
                        value={x.descripcion} 
                        onChange={(e) => setTVDesc(x.tipo, e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Observaciones</Label>
              <Input value={value.observaciones ?? ""} onChange={(e) => set("observaciones", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button onClick={onSubmit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar registro"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default SireRegistrosPage;