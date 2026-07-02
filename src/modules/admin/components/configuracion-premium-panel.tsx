import { useRef, useState } from "react";
import {
  Bell,
  Bot,
  Download,
  Eye,
  FileEdit,
  Gauge,
  History,
  Layout,
  Loader2,
  Palette,
  RefreshCw,
  Rocket,
  Settings,
  Smartphone,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAdminConfig } from "@/hooks/use-admin-config";
import { EstudioConfigOverrideProvider } from "@/hooks/estudio-config-override";
import { CONFIG_CATEGORIES, type ConfigCategory } from "@/modules/admin/types/admin-config";
import { adminConfigService } from "@/modules/admin/services/admin-config-service";
import {
  ConfigCategoryContent,
  ConfigHistorialPanel,
} from "@/modules/admin/components/config/config-category-content";
import { ContadorDashboardPremium } from "@/modules/dashboard/components/contador-dashboard-premium";
import { useRendimientoContadores } from "@/hooks/use-admin-metrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permissions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Gauge,
  Palette,
  Bell,
  Smartphone,
  FileEdit,
  Bot,
  Rocket,
  History,
};

export function ConfiguracionPremiumPanel() {
  const {
    working,
    flags,
    activeCategory,
    setActiveCategory,
    updateDraft,
    isDirty,
    isDirtyCategory,
    saveStatus,
    saveAll,
    saveCurrentCategory,
    discardAll,
    toggleFlag,
    revertChange,
    isLoading,
    isSaving,
    history,
    lastChange,
    previewBundle,
    categoryLabel,
    recargar,
  } = useAdminConfig();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const contadores = useRendimientoContadores();
  const canManageFlags = usePermission("admin.feature_flags");
  const [previewContadorId, setPreviewContadorId] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const activeInfo = CONFIG_CATEGORIES.find((c) => c.id === activeCategory)!;
  const ActiveIcon = ICON_MAP[activeInfo.icono] ?? Settings;

  const handleExport = async () => {
    try {
      const blob = await adminConfigService.exportConfig();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contam-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Configuración exportada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    }
  };

  const handleImport = async (file: File) => {
    const result = await adminConfigService.importConfig(file);
    if (result.errors.length) {
      toast.error(`Importados: ${result.imported}, errores: ${result.errors.join("; ")}`);
    } else {
      toast.success(`Importados ${result.imported} elementos`);
    }
    recargar();
  };

  const handleSave = async () => {
    setConfirmSaveOpen(false);
    if (activeCategory === "flags" || activeCategory === "historial") {
      await saveAll();
    } else if (isDirtyCategory(activeCategory)) {
      await saveCurrentCategory();
    } else {
      await saveAll();
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#0A1628] to-[#080E1E] text-[#E8EDF5]">
      <div className="border-b border-white/[0.06] bg-[#0A1628]/90 backdrop-blur px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#C8A95A]/15 border border-[#C8A95A]/30 grid place-items-center">
              <Settings className="size-5 text-[#C8A95A]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold">Configuración del Estudio</h1>
              <p className="text-xs text-[#8899B4]">Centro de comando — control remoto del dashboard contador</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-white/10" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-3.5 mr-1.5" />
              Vista previa
            </Button>
            <Button variant="outline" size="sm" className="border-white/10" onClick={handleExport}>
              <Download className="size-3.5 mr-1.5" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="border-white/10" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5 mr-1.5" />
              Importar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="ghost" size="sm" onClick={recargar}>
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
        <aside className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#0D1525] p-3">
          <nav className="space-y-0.5" aria-label="Categorías de configuración">
            {CONFIG_CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icono] ?? Settings;
              const active = activeCategory === cat.id;
              const dirty = cat.id !== "historial" && cat.id !== "flags" && isDirtyCategory(cat.id as ConfigCategory);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.descripcion}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all border-l-2",
                    active
                      ? "bg-[#C8A95A]/10 border-l-[#C8A95A] text-[#C8A95A]"
                      : "border-l-transparent text-[#8899B4] hover:bg-white/[0.03] hover:text-[#E8EDF5]",
                  )}
                >
                  <Icon className="size-4 shrink-0" style={{ color: active ? cat.color : undefined }} />
                  <span className="flex-1 truncate">{cat.nombre}</span>
                  {dirty && <span className="size-2 rounded-full bg-[#C8A95A] shrink-0" aria-label="Modificado" />}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 bg-white/5" />
              <Skeleton className="h-48 rounded-xl bg-white/5" />
            </div>
          ) : activeCategory === "historial" ? (
            <div>
              <header className="mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History className="size-5 text-[#8899B4]" />
                  Historial de cambios
                </h2>
              </header>
              <ConfigHistorialPanel
                history={history}
                onRevert={(clave, id) => revertChange({ clave, id })}
                canRevert={(log) => adminConfigService.canRevert(log)}
                categoryLabel={categoryLabel}
              />
            </div>
          ) : (
            <>
              <header className="mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ActiveIcon className="size-5" style={{ color: activeInfo.color }} />
                  {activeInfo.nombre}
                </h2>
                <p className="text-sm text-[#8899B4] mt-1">{activeInfo.descripcion}</p>
              </header>
              <ConfigCategoryContent
                category={activeCategory}
                working={working}
                flags={flags}
                isDirtyCategory={isDirtyCategory}
                updateDraft={updateDraft}
                onToggleFlag={(codigo, activo) => toggleFlag({ codigo, activo })}
                canManageFlags={canManageFlags}
              />
            </>
          )}
        </main>
      </div>

      <footer className="sticky bottom-0 border-t border-white/[0.06] bg-[#0A1628]/95 backdrop-blur px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-[#8899B4]">
            {lastChange ? (
              <p>
                Último cambio: <span className="text-[#E8EDF5]">{lastChange.cambiadoPorNombre}</span> modificó{" "}
                <span className="text-[#C8A95A]">{categoryLabel(lastChange.clave)}</span>{" "}
                {formatDistanceToNow(new Date(lastChange.timestamp), { addSuffix: true, locale: es })}
              </p>
            ) : (
              <p>Sin cambios recientes</p>
            )}
            <p className="mt-0.5">Los cambios se reflejarán en los dashboards en la próxima recarga (máx. 5 min por caché).</p>
            {saveStatus === "saved" && (
              <p className="text-[#00C897] mt-1">✓ Guardado correctamente</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              disabled={!isDirty || isSaving}
              onClick={() => setConfirmDiscardOpen(true)}
            >
              Descartar
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#C8A95A] to-amber-600 text-[#0A1628] font-semibold hover:opacity-90"
              disabled={(!isDirty && activeCategory !== "flags") || isSaving}
              onClick={() => setConfirmSaveOpen(true)}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Guardar cambios
            </Button>
            <Button variant="outline" size="sm" className="border-[#C8A95A]/30 text-[#C8A95A]" onClick={() => setPreviewOpen(true)}>
              Vista previa →
            </Button>
          </div>
        </div>
      </footer>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-[#0A1628] border-[#C8A95A]/30 p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-[#E8EDF5]">Vista previa — Dashboard Contador</DialogTitle>
                <DialogDescription className="text-[#8899B4]">
                  Renderizado con la configuración actual (incluye cambios sin guardar)
                </DialogDescription>
              </div>
              <BadgePreview />
            </div>
            <div className="mt-3 max-w-xs">
              <Select
                value={previewContadorId || contadores.data?.[0]?.userId || ""}
                onValueChange={setPreviewContadorId}
              >
                <SelectTrigger className="bg-[#0F1D32] border-[#1A2F4A]">
                  <SelectValue placeholder="Seleccionar contador" />
                </SelectTrigger>
                <SelectContent>
                  {(contadores.data ?? []).map((c) => (
                    <SelectItem key={c.userId} value={c.userId}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto border-t border-[#C8A95A]/20 bg-[#060B14] relative">
            <EstudioConfigOverrideProvider bundle={previewBundle}>
              <ContadorDashboardPremium />
            </EstudioConfigOverrideProvider>
          </div>
          <DialogFooter className="px-6 py-4 shrink-0 border-t border-white/[0.06]">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cerrar preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent className="bg-[#0A1628] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar configuración?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cambios afectarán a todos los contadores del estudio. Se aplicarán en la próxima recarga de su dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleSave()} className="bg-[#C8A95A] text-[#0A1628]">
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent className="bg-[#0A1628] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderán todas las modificaciones pendientes sin guardar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                discardAll();
                setConfirmDiscardOpen(false);
              }}
              className="bg-red-500/90"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BadgePreview() {
  return (
    <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded border border-[#C8A95A]/50 text-[#C8A95A] bg-[#C8A95A]/10">
      VISTA PREVIA
    </span>
  );
}
