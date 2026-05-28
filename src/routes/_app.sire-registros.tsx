import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Search, RotateCcw, Settings2, AlertCircle } from "lucide-react";
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

// Campos obligatorios
const REQUIRED_FIELDS = [
  "ruc",
  "razon_social", 
  "periodo",
  "cod_tipo_cdp",
  "serie_cdp",
  "nro_cdp_inicial",
  "tipo_doc_contraparte",
  "nro_doc_contraparte",
  "nombre_contraparte",
  "importe_total",
  "cod_moneda"
];

type Reg = any;

interface ColumnConfig {
  id: string;
  header: string;
  accessorKey: string;
  visible: boolean;
  isNumeric?: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { id: "ruc", header: "RUC *", accessorKey: "ruc", visible: true },
  { id: "razon_social", header: "RAZON SOCIAL *", accessorKey: "razon_social", visible: true },
  { id: "periodo", header: "PERIODO *", accessorKey: "periodo", visible: true },
  { id: "car_sunat", header: "CAR SUNAT", accessorKey: "car_sunat", visible: true },
  { id: "fecha_emision", header: "FECHA EMISIÓN CDP", accessorKey: "fecha_emision", visible: true },
  { id: "fecha_vencimiento", header: "FECHA VENCIMIENTO CDP", accessorKey: "fecha_vencimiento", visible: true },
  { id: "cod_tipo_cdp", header: "COD. TIPO CDP *", accessorKey: "cod_tipo_cdp", visible: true },
  { id: "serie_cdp", header: "SERIE CDP *", accessorKey: "serie_cdp", visible: true },
  { id: "anio_dam_dsi", header: "AÑO DAM O DSI", accessorKey: "anio_dam_dsi", visible: true },
  { id: "nro_cdp_inicial", header: "NRO CDP INICIAL *", accessorKey: "nro_cdp_inicial", visible: true },
  { id: "nro_cdp_final", header: "NRO CDP FINAL", accessorKey: "nro_cdp_final", visible: true },
  { id: "tipo_doc_contraparte", header: "TIPO DOC PROVEEDOR *", accessorKey: "tipo_doc_contraparte", visible: true },
  { id: "nro_doc_contraparte", header: "NRO DOC PROVEEDOR *", accessorKey: "nro_doc_contraparte", visible: true },
  { id: "nombre_contraparte", header: "NOMBRES/RAZÓN SOCIAL *", accessorKey: "nombre_contraparte", visible: true },
  { id: "bi_adq_grav", header: "BI ADQ. GRAV.", accessorKey: "bi_adq_grav", visible: true, isNumeric: true },
  { id: "igv_adq_grav", header: "IGV ADQ. GRAV.", accessorKey: "igv_adq_grav", visible: true, isNumeric: true },
  { id: "bi_adq_grav_y_no_grav", header: "BI ADQ. GRAV. Y NO GRAV.", accessorKey: "bi_adq_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "igv_adq_grav_y_no_grav", header: "IGV ADQ. GRAV. Y NO GRAV.", accessorKey: "igv_adq_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "bi_adq_no_grav", header: "BI ADQ. NO GRAV.", accessorKey: "bi_adq_no_grav", visible: false, isNumeric: true },
  { id: "igv_adq_no_grav", header: "IGV ADQ. NO GRAV.", accessorKey: "igv_adq_no_grav", visible: false, isNumeric: true },
  { id: "valor_adq_no_grav", header: "VALOR ADQ. NO GRAV.", accessorKey: "valor_adq_no_grav", visible: false, isNumeric: true },
  { id: "isc", header: "ISC", accessorKey: "isc", visible: false, isNumeric: true },
  { id: "icbper", header: "ICBPER", accessorKey: "icbper", visible: false, isNumeric: true },
  { id: "otros_tributos", header: "OTROS TRIBUTOS Y CARGOS", accessorKey: "otros_tributos", visible: false, isNumeric: true },
  { id: "importe_total", header: "IMPORTE TOTAL CDP *", accessorKey: "importe_total", visible: true, isNumeric: true },
  { id: "cod_moneda", header: "CÓD. MONEDA *", accessorKey: "cod_moneda", visible: true },
  { id: "tipo_cambio", header: "TIPO DE CAMBIO", accessorKey: "tipo_cambio", visible: false, isNumeric: true },
  { id: "fecha_emision_mod", header: "FECHA EMISIÓN DOC MODIFICADO", accessorKey: "fecha_emision_mod", visible: false },
  { id: "tipo_cdp_mod", header: "TIPO CDP MODIFICADO", accessorKey: "tipo_cdp_mod", visible: false },
  { id: "serie_cdp_mod", header: "SERIE CDP MODIFICADO", accessorKey: "serie_cdp_mod", visible: false },
  { id: "cod_dam_dsi", header: "COD. DAM O DSI", accessorKey: "cod_dam_dsi", visible: false },
  { id: "nro_cdp_mod", header: "NRO CDP MODIFICADO", accessorKey: "nro_cdp_mod", visible: false },
  { id: "clasificacion_bienes_serv", header: "CLASIFICACION DE BIENES Y SERVICIOS", accessorKey: "clasificacion_bienes_serv", visible: false },
  { id: "id_proyecto", header: "ID PROYECTO", accessorKey: "id_proyecto", visible: false },
  { id: "operadores", header: "OPERADORES", accessorKey: "operadores", visible: false },
  { id: "porcentaje_participacion", header: "% PARTICIPACION", accessorKey: "porcentaje_participacion", visible: false, isNumeric: true },
  { id: "impuesto_materia_beneficio", header: "IMPUESTO MATERIA DE BENEFICIO", accessorKey: "impuesto_materia_beneficio", visible: false },
  { id: "car_orig_indicador", header: "CAR ORIG/INDICADOR", accessorKey: "car_orig_indicador", visible: false },
];

const empty = (): Reg => ({
  id: undefined,
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
  bi_adq_grav: 0,
  igv_adq_grav: 0,
  bi_adq_grav_y_no_grav: 0,
  igv_adq_grav_y_no_grav: 0,
  bi_adq_no_grav: 0,
  igv_adq_no_grav: 0,
  valor_adq_no_grav: 0,
  isc: 0,
  icbper: 0,
  otros_tributos: 0,
  importe_total: 0,
  cod_moneda: "PEN",
  tipo_cambio: 1,
  fecha_emision_mod: "",
  tipo_cdp_mod: "",
  serie_cdp_mod: "",
  cod_dam_dsi: "",
  nro_cdp_mod: "",
  clasificacion_bienes_serv: "",
  id_proyecto: "",
  operadores: "",
  porcentaje_participacion: 0,
  impuesto_materia_beneficio: "",
  car_orig_indicador: "",
  campos_38_41: {},
  campos_libres: {},
});

function validateRequiredFields(reg: Reg): string[] {
  const missing: string[] = [];
  REQUIRED_FIELDS.forEach(field => {
    const value = reg[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  });
  return missing;
}

function sanitizeRegistro(reg: any): Reg {
  const vacio = empty();
  const sanitized = {
    ...vacio,
    ...reg,
  };
  
  Object.keys(vacio).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === null) {
      sanitized[key] = vacio[key];
    }
  });
  
  return sanitized;
}

function SireRegistrosPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ 
    tipo: "TODOS", 
    periodo: "", 
    ruc: "", 
    contraparte: "", 
    cod_tipo_cdp: "TODOS", 
    q: "" 
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Reg | null>(null);
  
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sire_columns_v2");
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
      localStorage.setItem("sire_columns_v2", JSON.stringify(columns));
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
      bi: f("bi_adq_grav") + f("bi_adq_grav_y_no_grav") + f("bi_adq_no_grav"),
      igv: f("igv_adq_grav") + f("igv_adq_grav_y_no_grav") + f("igv_adq_no_grav"),
      total: f("importe_total"),
    };
  }, [query.data]);

  const upsert = useMutation({
    mutationFn: async (r: Reg) => {
      // Validar campos obligatorios
      const missingFields = validateRequiredFields(r);
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(f => {
          const col = ALL_COLUMNS.find(c => c.accessorKey === f);
          return col ? col.header : f;
        }).join(", ");
        throw new Error(`Campos obligatorios faltantes: ${fieldNames}`);
      }

      const payload = { ...r };
      if (payload.id === undefined) {
        delete payload.id;
      }
      
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") {
          payload[key] = null;
        }
      });
      
      if (r.id) {
        const { error } = await supabase.from("registros_sire").update(payload).eq("id", r.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("registros_sire").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_sire"] });
      setOpenForm(false);
      setEditing(null);
      toast.success("Registro guardado");
    },
    onError: (e: any) => {
      console.error("Error al guardar:", e);
      toast.error(e.message ?? "Error al guardar");
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registros_sire").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["registros_sire"] }); 
      toast.success("Eliminado"); 
    },
    onError: (e: any) => toast.error(e.message),
  });

  const formatValue = (value: any, isNumeric?: boolean) => {
    if (value === null || value === undefined) return "-";
    if (isNumeric && typeof value === "number") return value.toFixed(2);
    return value;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Registros SIRE</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Formato SUNAT completo - Los campos marcados con * son obligatorios
          </p>
        </div>
        <Dialog open={openForm} onOpenChange={(o) => { 
          setOpenForm(o); 
          if (!o) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(sanitizeRegistro(empty()))}>
              <Plus className="size-4 mr-2" />Nuevo registro
            </Button>
          </DialogTrigger>
          {editing && (
            <RegistroForm 
              key={editing.id || "new"} 
              value={editing} 
              onChange={setEditing} 
              onSubmit={() => upsert.mutate(editing)} 
              saving={upsert.isPending} 
            />
          )}
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
          <Label className="text-xs">RUC/DNI contraparte</Label>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
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
  const [errors, setErrors] = useState<string[]>([]);
  
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const setNum = (k: string, v: string) => {
    const num = v === "" ? 0 : parseFloat(v);
    set(k, isNaN(num) ? 0 : num);
  };

  const handleSubmit = () => {
    const missingFields = validateRequiredFields(value);
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => {
        const col = ALL_COLUMNS.find(c => c.accessorKey === f);
        return col ? col.header.replace(' *', '') : f;
      });
      setErrors(fieldNames);
      toast.error(`Complete los campos obligatorios: ${fieldNames.join(", ")}`);
      return;
    }
    setErrors([]);
    onSubmit();
  };

  const isRequired = (fieldName: string) => {
    return REQUIRED_FIELDS.includes(fieldName);
  };

  const getFieldClass = (fieldName: string) => {
    return errors.includes(fieldName) ? "border-red-500 focus:ring-red-500" : "";
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{value.id ? "Editar" : "Nuevo"} registro SIRE</DialogTitle>
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
          <AlertCircle className="size-4" />
          Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios
        </div>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Datos del contribuyente */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Datos del Contribuyente</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                RUC <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.ruc || ""} 
                onChange={(e) => set("ruc", e.target.value)} 
                maxLength={11} 
                className={`font-mono ${getFieldClass("ruc")}`}
                placeholder="20XXXXXXXXX"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs flex items-center gap-1">
                Razón Social <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.razon_social || ""} 
                onChange={(e) => set("razon_social", e.target.value)} 
                className={getFieldClass("razon_social")}
                placeholder="Nombre o razón social del contribuyente"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                Periodo <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.periodo || ""} 
                onChange={(e) => set("periodo", e.target.value)} 
                placeholder="AAAAMM" 
                className={`font-mono ${getFieldClass("periodo")}`}
              />
            </div>
            <div>
              <Label className="text-xs">CAR SUNAT</Label>
              <Input 
                value={value.car_sunat || ""} 
                onChange={(e) => set("car_sunat", e.target.value)} 
                className="font-mono"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        {/* Documento */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Documento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                Cód. Tipo CDP <span className="text-red-500">*</span>
              </Label>
              <Select value={value.cod_tipo_cdp || "01"} onValueChange={(v) => set("cod_tipo_cdp", v)}>
                <SelectTrigger className={getFieldClass("cod_tipo_cdp")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CDP.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                Serie CDP <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.serie_cdp || ""} 
                onChange={(e) => set("serie_cdp", e.target.value)} 
                className={`font-mono ${getFieldClass("serie_cdp")}`}
                placeholder="Ej: F001"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                N° Inicial <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.nro_cdp_inicial || ""} 
                onChange={(e) => set("nro_cdp_inicial", e.target.value)} 
                className={`font-mono ${getFieldClass("nro_cdp_inicial")}`}
                placeholder="Número inicial"
              />
            </div>
            <div>
              <Label className="text-xs">N° Final</Label>
              <Input 
                value={value.nro_cdp_final || ""} 
                onChange={(e) => set("nro_cdp_final", e.target.value)} 
                className="font-mono"
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label className="text-xs">Año DAM/DSI</Label>
              <Input 
                value={value.anio_dam_dsi || ""} 
                onChange={(e) => set("anio_dam_dsi", e.target.value)} 
                placeholder="AAAA" 
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Fecha Emisión</Label>
              <Input 
                type="date" 
                value={value.fecha_emision || ""} 
                onChange={(e) => set("fecha_emision", e.target.value)} 
              />
            </div>
            <div>
              <Label className="text-xs">Fecha Vencimiento</Label>
              <Input 
                type="date" 
                value={value.fecha_vencimiento || ""} 
                onChange={(e) => set("fecha_vencimiento", e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Contraparte */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Contraparte (Proveedor/Cliente)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                Tipo Doc. <span className="text-red-500">*</span>
              </Label>
              <Select value={value.tipo_doc_contraparte || "6"} onValueChange={(v) => set("tipo_doc_contraparte", v)}>
                <SelectTrigger className={getFieldClass("tipo_doc_contraparte")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOC.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                N° Documento <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.nro_doc_contraparte || ""} 
                onChange={(e) => set("nro_doc_contraparte", e.target.value)} 
                className={`font-mono ${getFieldClass("nro_doc_contraparte")}`}
                placeholder="RUC, DNI o documento"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs flex items-center gap-1">
                Nombres/Razón Social <span className="text-red-500">*</span>
              </Label>
              <Input 
                value={value.nombre_contraparte || ""} 
                onChange={(e) => set("nombre_contraparte", e.target.value)} 
                className={getFieldClass("nombre_contraparte")}
                placeholder="Nombre o razón social de la contraparte"
              />
            </div>
          </div>
        </div>

        {/* Valores Monetarios */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Valores Monetarios</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">BI Adq. Grav.</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={value.bi_adq_grav ?? 0} 
                onChange={(e) => setNum("bi_adq_grav", e.target.value)} 
                className="font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-xs">IGV Adq. Grav.</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={value.igv_adq_grav ?? 0} 
                onChange={(e) => setNum("igv_adq_grav", e.target.value)} 
                className="font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                Importe Total <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="number" 
                step="0.01" 
                value={value.importe_total ?? 0} 
                onChange={(e) => setNum("importe_total", e.target.value)} 
                className={`font-mono ${getFieldClass("importe_total")}`}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                Moneda <span className="text-red-500">*</span>
              </Label>
              <Select value={value.cod_moneda || "PEN"} onValueChange={(v) => set("cod_moneda", v)}>
                <SelectTrigger className={getFieldClass("cod_moneda")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo Cambio</Label>
              <Input 
                type="number" 
                step="0.001" 
                value={value.tipo_cambio ?? 1} 
                onChange={(e) => setNum("tipo_cambio", e.target.value)} 
                className="font-mono"
                placeholder="1.000"
              />
            </div>
          </div>
        </div>

        {/* Campos Opcionales */}
        <details className="bg-muted/20 p-4 rounded-lg">
          <summary className="text-sm font-semibold cursor-pointer">Campos Opcionales (Click para expandir)</summary>
          <div className="mt-3 space-y-4">
            {/* BI y IGV adicionales */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Base Imponible e IGV Adicionales</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">BI Grav. y No Grav.</Label>
                  <Input type="number" step="0.01" value={value.bi_adq_grav_y_no_grav ?? 0} onChange={(e) => setNum("bi_adq_grav_y_no_grav", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">IGV Grav. y No Grav.</Label>
                  <Input type="number" step="0.01" value={value.igv_adq_grav_y_no_grav ?? 0} onChange={(e) => setNum("igv_adq_grav_y_no_grav", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">BI No Grav.</Label>
                  <Input type="number" step="0.01" value={value.bi_adq_no_grav ?? 0} onChange={(e) => setNum("bi_adq_no_grav", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">IGV No Grav.</Label>
                  <Input type="number" step="0.01" value={value.igv_adq_no_grav ?? 0} onChange={(e) => setNum("igv_adq_no_grav", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Valor No Grav.</Label>
                  <Input type="number" step="0.01" value={value.valor_adq_no_grav ?? 0} onChange={(e) => setNum("valor_adq_no_grav", e.target.value)} className="font-mono" />
                </div>
              </div>
            </div>

            {/* ISC, ICBPER y otros tributos */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Otros Tributos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">ISC</Label>
                  <Input type="number" step="0.01" value={value.isc ?? 0} onChange={(e) => setNum("isc", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">ICBPER</Label>
                  <Input type="number" step="0.01" value={value.icbper ?? 0} onChange={(e) => setNum("icbper", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Otros Tributos</Label>
                  <Input type="number" step="0.01" value={value.otros_tributos ?? 0} onChange={(e) => setNum("otros_tributos", e.target.value)} className="font-mono" />
                </div>
              </div>
            </div>

            {/* Documento Modificado */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Documento Modificado</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">F. Emisión Mod.</Label>
                  <Input type="date" value={value.fecha_emision_mod || ""} onChange={(e) => set("fecha_emision_mod", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Tipo CDP Mod.</Label>
                  <Select value={value.tipo_cdp_mod || "01"} onValueChange={(v) => set("tipo_cdp_mod", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_CDP.map((t) => <SelectItem key={t.c} value={t.c}>{t.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Serie CDP Mod.</Label>
                  <Input value={value.serie_cdp_mod || ""} onChange={(e) => set("serie_cdp_mod", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">N° CDP Mod.</Label>
                  <Input value={value.nro_cdp_mod || ""} onChange={(e) => set("nro_cdp_mod", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">COD DAM/DSI</Label>
                  <Input value={value.cod_dam_dsi || ""} onChange={(e) => set("cod_dam_dsi", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Clasificación y Proyecto */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Clasificación y Proyecto</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Clasificación de Bienes</Label>
                  <Input value={value.clasificacion_bienes_serv || ""} onChange={(e) => set("clasificacion_bienes_serv", e.target.value)} placeholder="BIEN" />
                </div>
                <div>
                  <Label className="text-xs">ID Proyecto</Label>
                  <Input value={value.id_proyecto || ""} onChange={(e) => set("id_proyecto", e.target.value)} placeholder="123456789" />
                </div>
              </div>
            </div>

            {/* Operadores e Impuestos */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Operadores e Impuestos</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Operadores</Label>
                  <Input value={value.operadores || ""} onChange={(e) => set("operadores", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">% Participación</Label>
                  <Input type="number" step="0.01" value={value.porcentaje_participacion ?? 0} onChange={(e) => setNum("porcentaje_participacion", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Impuesto Materia Beneficio</Label>
                  <Input value={value.impuesto_materia_beneficio || ""} onChange={(e) => set("impuesto_materia_beneficio", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">CAR ORIG/Indicador</Label>
                  <Input value={value.car_orig_indicador || ""} onChange={(e) => set("car_orig_indicador", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>

      <DialogFooter className="mt-4">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar registro"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default SireRegistrosPage;