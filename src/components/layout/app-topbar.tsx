import { Maximize2, Minimize2, Moon, Sun } from "lucide-react";

import {
  SystemNotificationsDropdownPremium,
  UrgentTasksTopbarIndicator,
} from "@/components/notifications/system-notifications-dropdown-premium";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUiPreferences } from "@/hooks/use-ui-preferences";
import { cn } from "@/lib/utils";

type AppTopBarProps = {
  title?: string;
};

export function AppTopBar({ title }: AppTopBarProps) {
  const { darkMode, expandedMode, toggleDarkMode } = useUiPreferences();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 glass-surface shadow-premium-subtle px-6 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {expandedMode && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Maximize2 className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Modo Expandido — pantalla completa activa</span>
          </div>
        )}
        {title && !expandedMode && (
          <h2 className="text-sm font-medium text-muted-foreground truncate">{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-2 rounded-xl glass-surface px-3 py-1.5 shadow-premium-subtle">
          {darkMode ? <Moon className="size-3.5 text-primary" /> : <Sun className="size-3.5 text-amber-500" />}
          <Label htmlFor="dark-mode-toggle" className="text-xs cursor-pointer select-none">
            Modo Nocturno
          </Label>
          <Switch
            id="dark-mode-toggle"
            checked={darkMode}
            onCheckedChange={(checked) => {
              if (checked !== darkMode) toggleDarkMode();
            }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn("sm:hidden rounded-xl", darkMode ? "text-primary" : "text-amber-500")}
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Desactivar modo nocturno" : "Activar modo nocturno"}
        >
          {darkMode ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>

        <UrgentTasksTopbarIndicator />
        <SystemNotificationsDropdownPremium />
      </div>
    </header>
  );
}

export function ExpandedModeHint() {
  const { expandedMode, toggleExpandedMode } = useUiPreferences();

  if (!expandedMode) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleExpandedMode}
      className="fixed bottom-20 left-6 z-40 shadow-lg gap-2 rounded-xl bg-background/90 backdrop-blur"
    >
      <Minimize2 className="size-4" />
      Restaurar navegación
    </Button>
  );
}
