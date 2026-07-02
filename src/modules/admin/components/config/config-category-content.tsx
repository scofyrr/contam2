import type { ReactNode } from "react";
import {
  KPI_LABELS,
  SIDEBAR_MODULE_LABELS,
  TAREA_REGLA_LABELS,
  WIDGET_LABELS,
} from "@/modules/admin/types/admin-config";
import type { EstudioConfigBundle, FeatureFlagRow } from "@/modules/config/types/estudio-config";
import { DEFAULT_ESTUDIO_CONFIG } from "@/modules/config/types/estudio-config";
import { ConfigSection } from "@/modules/admin/components/config/config-section";
import { ConfigToggle } from "@/modules/admin/components/config/config-toggle";
import { ConfigSlider } from "@/modules/admin/components/config/config-slider";
import { ConfigColorPicker, COLORBLIND_PALETTE } from "@/modules/admin/components/config/config-color-picker";
import { ConfigWidgetList } from "@/modules/admin/components/config/config-widget-list";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { ConfigCategory } from "@/modules/admin/types/admin-config";

interface CategoryContentProps {
  category: ConfigCategory;
  working: EstudioConfigBundle;
  flags: FeatureFlagRow[];
  isDirtyCategory: (c: ConfigCategory) => boolean;
  updateDraft: <K extends keyof EstudioConfigBundle>(key: K, value: EstudioConfigBundle[K]) => void;
  onToggleFlag: (codigo: string, activo: boolean) => void;
  canManageFlags?: boolean;
}

const ALL_SIDEBAR_ROUTES = Object.keys(SIDEBAR_MODULE_LABELS);
const NOTIF_MODULOS = ["SIRE", "DIARIO", "CAJA", "TAREAS", "PCGE", "ADMIN"];
const REFRESH_OPTIONS = [15, 30, 60, 120, 300];
const SNOOZE_OPTIONS = [1, 4, 24, 48, 72];

export function ConfigCategoryContent({
  category,
  working,
  flags,
  isDirtyCategory,
  updateDraft,
  onToggleFlag,
  canManageFlags = true,
}: CategoryContentProps) {
  switch (category) {
    case "widgets":
      return <WidgetsPanel working={working} dirty={isDirtyCategory("widgets")} updateDraft={updateDraft} />;
    case "umbrales":
      return <UmbralesPanel working={working} dirty={isDirtyCategory("umbrales")} updateDraft={updateDraft} />;
    case "colores":
      return <ColoresPanel working={working} dirty={isDirtyCategory("colores")} updateDraft={updateDraft} />;
    case "notificaciones":
      return (
        <NotificacionesPanel working={working} dirty={isDirtyCategory("notificaciones")} updateDraft={updateDraft} />
      );
    case "sidebar":
      return <SidebarPanel working={working} dirty={isDirtyCategory("sidebar")} updateDraft={updateDraft} />;
    case "contenido":
      return <ContenidoPanel working={working} dirty={isDirtyCategory("contenido")} updateDraft={updateDraft} />;
    case "tareas":
      return <TareasPanel working={working} dirty={isDirtyCategory("tareas")} updateDraft={updateDraft} />;
    case "flags":
      return <FlagsPanel flags={flags} onToggleFlag={onToggleFlag} canManage={canManageFlags} />;
    default:
      return null;
  }
}

function WidgetsPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const dc = working.dashboard_contador;
  const widgetItems = Object.entries(WIDGET_LABELS).map(([id, label]) => ({ id, label }));

  const restoreOrder = () => {
    updateDraft("dashboard_contador", {
      ...dc,
      widgets: { ...DEFAULT_ESTUDIO_CONFIG.dashboard_contador.widgets },
    });
  };

  return (
    <div className="space-y-6">
      <ConfigSection
        title="Widgets activos"
        description="Orden y visibilidad de secciones del dashboard contador"
        modified={dirty}
      >
        <ConfigWidgetList
          items={widgetItems}
          activeIds={dc.widgets.activos}
          order={dc.widgets.orden}
          onActiveChange={(activos) =>
            updateDraft("dashboard_contador", { ...dc, widgets: { ...dc.widgets, activos } })
          }
          onOrderChange={(orden) =>
            updateDraft("dashboard_contador", { ...dc, widgets: { ...dc.widgets, orden } })
          }
        />
        <Button type="button" variant="ghost" size="sm" className="text-[#C8A95A]" onClick={restoreOrder}>
          Restaurar orden por defecto
        </Button>
        <WidgetLayoutPreview orden={dc.widgets.orden} activos={dc.widgets.activos} />
      </ConfigSection>

      <ConfigSection title="KPIs visibles" modified={dirty}>
        <div className="flex flex-wrap gap-4">
          {Object.entries(KPI_LABELS).map(([id, label]) => (
            <label key={id} className="flex items-center gap-2 text-sm text-[#E8EDF5] cursor-pointer">
              <Checkbox
                checked={dc.kpis_visibles.includes(id)}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...dc.kpis_visibles, id]
                    : dc.kpis_visibles.filter((k) => k !== id);
                  updateDraft("dashboard_contador", { ...dc, kpis_visibles: next });
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </ConfigSection>

      <ConfigSection title="Opciones" modified={dirty}>
        <div className="grid md:grid-cols-2 gap-6">
          <ConfigSlider
            label="Máx. tareas urgentes"
            value={dc.max_tareas_urgentes}
            onChange={(v) => updateDraft("dashboard_contador", { ...dc, max_tareas_urgentes: v })}
            min={1}
            max={20}
          />
          <ConfigSlider
            label="Máx. clientes en gráfico"
            value={dc.max_clientes_grafico}
            onChange={(v) => updateDraft("dashboard_contador", { ...dc, max_clientes_grafico: v })}
            min={1}
            max={20}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label className="text-sm text-[#E8EDF5]">Intervalo de refresh</Label>
            <Select
              value={String(dc.intervalo_refresh_seg)}
              onValueChange={(v) =>
                updateDraft("dashboard_contador", { ...dc, intervalo_refresh_seg: Number(v) })
              }
            >
              <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} segundos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ConfigToggle
          label="Mostrar gamificación"
          checked={dc.mostrar_gamificacion}
          onCheckedChange={(v) => updateDraft("dashboard_contador", { ...dc, mostrar_gamificacion: v })}
        />
        <ConfigToggle
          label="Mostrar sugerencias"
          checked={dc.mostrar_sugerencias}
          onCheckedChange={(v) => updateDraft("dashboard_contador", { ...dc, mostrar_sugerencias: v })}
        />
        <ConfigToggle
          label="Mostrar actividad reciente"
          checked={dc.mostrar_actividad_reciente}
          onCheckedChange={(v) => updateDraft("dashboard_contador", { ...dc, mostrar_actividad_reciente: v })}
        />
      </ConfigSection>
    </div>
  );
}

function WidgetLayoutPreview({ orden, activos }: { orden: string[]; activos: string[] }) {
  return (
    <div className="mt-4 rounded-lg border border-[#C8A95A]/20 bg-[#060B14] p-3">
      <p className="text-[10px] text-[#8899B4] mb-2 uppercase tracking-wider">Vista previa layout</p>
      <div className="space-y-1">
        {orden
          .filter((id) => activos.includes(id))
          .map((id) => (
            <div key={id} className="h-6 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[10px] flex items-center px-2 text-[#8899B4]">
              {WIDGET_LABELS[id] ?? id}
            </div>
          ))}
      </div>
    </div>
  );
}

function UmbralesPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const u = working.umbrales;
  const set = (patch: Partial<typeof u>) => updateDraft("umbrales", { ...u, ...patch });

  return (
    <div className="space-y-6">
      <ConfigSection title="Carga de trabajo" modified={dirty}>
        <div className="grid md:grid-cols-3 gap-4">
          <ConfigSlider label="Carga baja" value={u.carga_baja} onChange={(v) => set({ carga_baja: v })} min={1} max={50} />
          <ConfigSlider label="Carga alta" value={u.carga_alta} onChange={(v) => set({ carga_alta: v })} min={10} max={100} />
          <ConfigSlider label="Carga crítica" value={u.carga_critica} onChange={(v) => set({ carga_critica: v })} min={20} max={200} />
        </div>
        <div className="flex gap-2 mt-2">
          <Badge className="bg-emerald-500/20 text-emerald-400">BAJA ≤{u.carga_baja}</Badge>
          <Badge className="bg-amber-500/20 text-amber-400">ALTA ≤{u.carga_alta}</Badge>
          <Badge className="bg-red-500/20 text-red-400">CRÍTICA ≥{u.carga_critica}</Badge>
        </div>
      </ConfigSection>
      <ConfigSection title="Efectividad" modified={dirty}>
        <ConfigSlider label="Meta (%)" value={u.efectividad_meta} onChange={(v) => set({ efectividad_meta: v })} min={50} max={100} unit="%" />
        <ConfigSlider label="Excelente (%)" value={u.efectividad_excelente} onChange={(v) => set({ efectividad_excelente: v })} min={80} max={100} unit="%" />
        <Progress value={u.efectividad_meta} className="h-2 mt-2" />
      </ConfigSection>
      <ConfigSection title="Inactividad" modified={dirty}>
        <ConfigSlider label="Horas ausente" value={u.horas_inactividad_ausente} onChange={(v) => set({ horas_inactividad_ausente: v })} min={1} max={168} unit="h" />
        <ConfigSlider label="Horas inactivo" value={u.horas_inactividad_inactivo} onChange={(v) => set({ horas_inactividad_inactivo: v })} min={24} max={720} unit="h" />
        <p className="text-xs text-[#8899B4]">🟢 Activo · 🟡 Ausente ({u.horas_inactividad_ausente}h) · 🔴 Inactivo ({u.horas_inactividad_inactivo}h)</p>
      </ConfigSection>
      <ConfigSection title="Tareas" modified={dirty}>
        <ConfigSlider label="Vencidas críticas" value={u.vencidas_criticas} onChange={(v) => set({ vencidas_criticas: v })} min={1} max={50} />
        <ConfigSlider label="Días alerta próxima" value={u.dias_alerta_proxima} onChange={(v) => set({ dias_alerta_proxima: v })} min={1} max={14} unit="d" />
        <ConfigSlider label="Racha mínima logro" value={u.racha_minima_logro} onChange={(v) => set({ racha_minima_logro: v })} min={1} max={30} unit="d" />
      </ConfigSection>
    </div>
  );
}

function ColoresPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const c = working.colores;
  const set = (patch: Partial<typeof c>) => updateDraft("colores", { ...c, ...patch });

  return (
    <div className="space-y-6">
      <ConfigSection title="Paleta de urgencia" modified={dirty}>
        <div className="grid md:grid-cols-2 gap-6">
          <ConfigColorPicker label="Vencida" value={c.urgencia_vencida} onChange={(v) => set({ urgencia_vencida: v })} />
          <ConfigColorPicker label="Hoy" value={c.urgencia_hoy} onChange={(v) => set({ urgencia_hoy: v })} />
          <ConfigColorPicker label="Esta semana" value={c.urgencia_semana} onChange={(v) => set({ urgencia_semana: v })} />
          <ConfigColorPicker label="Normal" value={c.urgencia_normal} onChange={(v) => set({ urgencia_normal: v })} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-[#C8A95A]/30 text-[#C8A95A]"
          onClick={() => updateDraft("colores", { ...c, ...COLORBLIND_PALETTE })}
        >
          Usar paleta recomendada para daltonismo
        </Button>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Vencida", color: c.urgencia_vencida },
            { label: "Hoy", color: c.urgencia_hoy },
            { label: "Semana", color: c.urgencia_semana },
            { label: "Normal", color: c.urgencia_normal },
          ].map((b) => (
            <span key={b.label} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${b.color}33`, color: b.color }}>
              {b.label}
            </span>
          ))}
        </div>
      </ConfigSection>
      <ConfigSection title="Comportamiento visual" modified={dirty}>
        <ConfigToggle label="FAB visible" checked={c.fab_visible} onCheckedChange={(v) => set({ fab_visible: v })} />
        <div className="space-y-2 py-2">
          <Label className="text-sm text-[#E8EDF5]">Posición del FAB</Label>
          <Select value={c.fab_posicion_default} onValueChange={(v) => set({ fab_posicion_default: v })}>
            <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A] w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["bottom-right", "bottom-left", "top-right", "top-left"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ConfigToggle label="Pulso en vencidas" checked={c.pulse_en_vencidas} onCheckedChange={(v) => set({ pulse_en_vencidas: v })} />
        <ConfigToggle label="Reducir animaciones" checked={c.reducir_animaciones_global} onCheckedChange={(v) => set({ reducir_animaciones_global: v })} />
      </ConfigSection>
      <ConfigSection title="Color de acento" modified={dirty}>
        <ConfigColorPicker label="Acento dashboard" value={c.acento} onChange={(v) => set({ acento: v })} />
        <div className="mt-3 h-10 rounded-lg border border-white/10 flex items-center px-4" style={{ borderColor: `${c.acento}66`, color: c.acento }}>
          Elemento de ejemplo con acento
        </div>
      </ConfigSection>
    </div>
  );
}

function NotificacionesPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const n = working.notificaciones;
  const set = (patch: Partial<typeof n>) => updateDraft("notificaciones", { ...n, ...patch });

  return (
    <div className="space-y-6">
      <ConfigSection title="Sonidos" modified={dirty}>
        <ConfigToggle label="Sonidos habilitados por defecto" checked={n.sonidos_habilitados_default} onCheckedChange={(v) => set({ sonidos_habilitados_default: v })} />
        <ConfigToggle label="Solo sonidos críticos" checked={n.solo_sonidos_criticos} onCheckedChange={(v) => set({ solo_sonidos_criticos: v })} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-[#8899B4]">Silencio inicio</Label>
            <Input type="time" value={n.horas_silencio.inicio} onChange={(e) => set({ horas_silencio: { ...n.horas_silencio, inicio: e.target.value } })} className="bg-[#0F1D32] border-[#1A2F4A] mt-1" />
          </div>
          <div>
            <Label className="text-xs text-[#8899B4]">Silencio fin</Label>
            <Input type="time" value={n.horas_silencio.fin} onChange={(e) => set({ horas_silencio: { ...n.horas_silencio, fin: e.target.value } })} className="bg-[#0F1D32] border-[#1A2F4A] mt-1" />
          </div>
        </div>
      </ConfigSection>
      <ConfigSection title="Módulos" modified={dirty}>
        <div className="flex flex-wrap gap-3">
          {NOTIF_MODULOS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-[#E8EDF5]">
              <Checkbox
                checked={n.modulos_activos.includes(m)}
                onCheckedChange={(checked) => {
                  const mods = checked ? [...n.modulos_activos, m] : n.modulos_activos.filter((x) => x !== m);
                  set({ modulos_activos: mods });
                }}
              />
              {m}
            </label>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Label className="text-sm text-[#E8EDF5]">Prioridad mínima</Label>
          <Select value={n.prioridad_minima_default} onValueChange={(v) => set({ prioridad_minima_default: v })}>
            <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A] w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["BAJA", "MEDIA", "ALTA", "CRITICA"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ConfigSection>
      <ConfigSection title="Retención y FAB" modified={dirty}>
        <ConfigSlider label="Días retención" value={n.dias_retencion_notificaciones} onChange={(v) => set({ dias_retencion_notificaciones: v })} min={7} max={90} unit="d" />
        <ConfigToggle label="FAB solo vencidas hoy" checked={n.fab_solo_vencidas_hoy} onCheckedChange={(v) => set({ fab_solo_vencidas_hoy: v })} />
      </ConfigSection>
    </div>
  );
}

function SidebarPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const s = working.sidebar;
  const set = (patch: Partial<typeof s>) => updateDraft("sidebar", { ...s, ...patch });
  const items = ALL_SIDEBAR_ROUTES.map((id) => ({ id, label: SIDEBAR_MODULE_LABELS[id] ?? id }));

  return (
    <div className="grid lg:grid-cols-[1fr_200px] gap-6">
      <div className="space-y-6">
        <ConfigSection title="Módulos visibles" modified={dirty}>
          <ConfigWidgetList
            items={items}
            activeIds={s.modulos}
            order={s.modulos}
            onActiveChange={(modulos) => set({ modulos })}
            onOrderChange={(modulos) => set({ modulos })}
          />
          <div className="mt-4 space-y-2">
            <Label className="text-sm text-[#E8EDF5]">Módulo de inicio</Label>
            <Select value={s.modulo_inicio} onValueChange={(v) => set({ modulo_inicio: v })}>
              <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {s.modulos.map((m) => (
                  <SelectItem key={m} value={m}>{SIDEBAR_MODULE_LABELS[m] ?? m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ConfigSection>
        <ConfigSection title="Funcionalidades" modified={dirty}>
          <ConfigToggle label="Estadísticas SIRE" checked={s.mostrar_estadisticas_sire} onCheckedChange={(v) => set({ mostrar_estadisticas_sire: v })} />
          <ConfigToggle label="Dashboard estadísticas" checked={s.mostrar_dashboard_estadisticas} onCheckedChange={(v) => set({ mostrar_dashboard_estadisticas: v })} />
          <ConfigToggle label="Chat IA" checked={s.mostrar_chat_ai} onCheckedChange={(v) => set({ mostrar_chat_ai: v })} />
          <ConfigToggle label="Lupa accesibilidad" checked={s.mostrar_lupa_accesibilidad} onCheckedChange={(v) => set({ mostrar_lupa_accesibilidad: v })} />
          <ConfigToggle label="Cancelaciones" checked={s.mostrar_cancelaciones} onCheckedChange={(v) => set({ mostrar_cancelaciones: v })} />
        </ConfigSection>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#0D1525] p-3 h-fit">
        <p className="text-[10px] text-[#8899B4] mb-2">Preview sidebar</p>
        <div className="space-y-1">
          {s.modulos.map((m) => (
            <div key={m} className={cn("text-[10px] px-2 py-1.5 rounded", m === s.modulo_inicio && "bg-[#C8A95A]/20 text-[#C8A95A]")}>
              {SIDEBAR_MODULE_LABELS[m] ?? m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContenidoPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const c = working.contenido;
  const set = (patch: Partial<typeof c>) => updateDraft("contenido", { ...c, ...patch });

  return (
    <div className="space-y-6">
      <ConfigSection title="Bienvenida" modified={dirty}>
        <Textarea
          value={c.mensaje_bienvenida}
          onChange={(e) => set({ mensaje_bienvenida: e.target.value })}
          maxLength={500}
          className="bg-[#0F1D32] border-[#1A2F4A] min-h-[80px]"
        />
        <p className="text-[10px] text-[#8899B4]">{c.mensaje_bienvenida.length}/500</p>
        <div className="rounded-lg bg-[#060B14] border border-[#C8A95A]/20 p-4 mt-2">
          <p className="text-sm text-[#E8EDF5]">{c.mensaje_bienvenida}</p>
        </div>
      </ConfigSection>
      <ConfigSection title="Meta mensual" modified={dirty}>
        <Input
          type="number"
          value={c.meta_mensual_monto}
          onChange={(e) => set({ meta_mensual_monto: Number(e.target.value) })}
          className="bg-[#0F1D32] border-[#1A2F4A] max-w-xs"
        />
        <ConfigToggle label="Meta activa" checked={c.meta_mensual_activa} onCheckedChange={(v) => set({ meta_mensual_activa: v })} />
        {c.meta_mensual_activa && <Progress value={65} className="h-2 max-w-md" />}
      </ConfigSection>
      <ConfigSection title="Enlaces rápidos" description="Máximo 6 enlaces" modified={dirty}>
        <div className="space-y-2">
          {c.enlaces_rapidos.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <Input value={e.label} placeholder="Label" onChange={(ev) => {
                const links = [...c.enlaces_rapidos];
                links[i] = { ...e, label: ev.target.value };
                set({ enlaces_rapidos: links });
              }} className="bg-[#0F1D32] border-[#1A2F4A] text-xs" />
              <Input value={e.url} placeholder="/ruta" onChange={(ev) => {
                const links = [...c.enlaces_rapidos];
                links[i] = { ...e, url: ev.target.value };
                set({ enlaces_rapidos: links });
              }} className="bg-[#0F1D32] border-[#1A2F4A] text-xs" />
              <Input value={e.icono} placeholder="Icono" onChange={(ev) => {
                const links = [...c.enlaces_rapidos];
                links[i] = { ...e, icono: ev.target.value };
                set({ enlaces_rapidos: links });
              }} className="bg-[#0F1D32] border-[#1A2F4A] text-xs w-24" />
              <Button type="button" variant="ghost" size="icon" onClick={() => set({ enlaces_rapidos: c.enlaces_rapidos.filter((_, j) => j !== i) })}>
                <Trash2 className="size-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
        {c.enlaces_rapidos.length < 6 && (
          <Button type="button" variant="outline" size="sm" className="mt-2 border-[#C8A95A]/30" onClick={() => set({ enlaces_rapidos: [...c.enlaces_rapidos, { label: "Nuevo", url: "/dashboard", icono: "Link" }] })}>
            <Plus className="size-3.5 mr-1" /> Agregar enlace
          </Button>
        )}
      </ConfigSection>
    </div>
  );
}

function TareasPanel({
  working,
  dirty,
  updateDraft,
}: {
  working: EstudioConfigBundle;
  dirty: boolean;
  updateDraft: CategoryContentProps["updateDraft"];
}) {
  const t = working.tareas_auto;
  const set = (patch: Partial<typeof t>) => updateDraft("tareas_auto", { ...t, ...patch });

  return (
    <div className="space-y-6">
      <ConfigSection title="Reglas activas" modified={dirty}>
        {Object.entries(TAREA_REGLA_LABELS).map(([key, label]) => (
          <ConfigToggle
            key={key}
            label={label}
            checked={t.reglas_activas[key] ?? false}
            onCheckedChange={(v) => set({ reglas_activas: { ...t.reglas_activas, [key]: v } })}
          />
        ))}
      </ConfigSection>
      <ConfigSection title="Parámetros" modified={dirty}>
        <ConfigSlider label="Días anticipación" value={t.dias_anticipacion_vencimiento} onChange={(v) => set({ dias_anticipacion_vencimiento: v })} min={1} max={30} unit="d" />
        <div className="space-y-2 py-2">
          <Label className="text-sm text-[#E8EDF5]">Prioridad default</Label>
          <Select value={t.prioridad_default_nueva} onValueChange={(v) => set({ prioridad_default_nueva: v })}>
            <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A] w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["BAJA", "MEDIA", "ALTA", "CRITICA"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ConfigToggle label="Auto-asignar por RUC" checked={t.auto_asignar_por_ruc} onCheckedChange={(v) => set({ auto_asignar_por_ruc: v })} />
        <div className="space-y-2">
          <Label className="text-sm text-[#E8EDF5]">Horas snooze permitidas</Label>
          <div className="flex flex-wrap gap-2">
            {SNOOZE_OPTIONS.map((h) => (
              <label key={h} className="flex items-center gap-1.5 text-xs text-[#E8EDF5]">
                <Checkbox
                  checked={t.permitir_snooze_horas.includes(h)}
                  onCheckedChange={(checked) => {
                    const hrs = checked
                      ? [...t.permitir_snooze_horas, h].sort((a, b) => a - b)
                      : t.permitir_snooze_horas.filter((x) => x !== h);
                    set({ permitir_snooze_horas: hrs });
                  }}
                />
                {h}h
              </label>
            ))}
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}

function FlagsPanel({
  flags,
  onToggleFlag,
  canManage = true,
}: {
  flags: FeatureFlagRow[];
  onToggleFlag: (codigo: string, activo: boolean) => void;
  canManage?: boolean;
}) {
  return (
    <div className="space-y-4">
      {!canManage && (
        <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Solo lectura: requiere permiso <code className="text-[#C8A95A]">admin.feature_flags</code> para modificar.
        </p>
      )}
      <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        Algunos flags requieren reinicio de la aplicación para surtir efecto completo.
      </p>
      <div className="rounded-xl border border-white/[0.05] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#8899B4] text-xs">
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3 hidden md:table-cell">Descripción</th>
              <th className="text-center p-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.codigo} className="border-b border-white/[0.04]">
                <td className="p-3 font-mono text-xs text-[#8899B4]">{f.codigo}</td>
                <td className="p-3 text-[#E8EDF5]">{f.nombre}</td>
                <td className="p-3 text-[#8899B4] text-xs hidden md:table-cell">{f.descripcion ?? "—"}</td>
                <td className="p-3 text-center">
                  <Switch
                    checked={f.activo}
                    onCheckedChange={(v) => onToggleFlag(f.codigo, v)}
                    disabled={!canManage}
                    className="data-[state=checked]:bg-[#C8A95A]"
                    aria-label={`Activar ${f.nombre}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ConfigHistorialPanel({
  history,
  onRevert,
  canRevert,
  categoryLabel,
}: {
  history: import("@/modules/admin/types/admin-config").ConfigChangeLog[];
  onRevert: (clave: string, id: string) => void;
  canRevert: (log: import("@/modules/admin/types/admin-config").ConfigChangeLog) => boolean;
  categoryLabel: (clave: string) => string;
}) {
  if (!history.length) {
    return <p className="text-sm text-[#8899B4] text-center py-12">Sin cambios registrados</p>;
  }

  return (
    <div className="space-y-3">
      {history.map((log) => (
        <div key={log.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#E8EDF5]">
                {categoryLabel(log.clave)} · {log.cambiadoPorNombre}
              </p>
              <p className="text-[10px] text-[#8899B4] mt-0.5">
                {new Date(log.timestamp).toLocaleString("es-PE")}
                {log.revertido && " · Revertido"}
              </p>
            </div>
            {canRevert(log) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-[#C8A95A]/30 text-[#C8A95A]"
                onClick={() => onRevert(log.clave, log.id)}
              >
                Revertir
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[#8899B4] mt-2 font-mono truncate">
            {JSON.stringify(log.valorAnterior).slice(0, 60)} → {JSON.stringify(log.valorNuevo).slice(0, 60)}
          </p>
        </div>
      ))}
    </div>
  );
}
