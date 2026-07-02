import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface ConfigToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
  id?: string;
}

export function ConfigToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  tooltip,
  id,
}: ConfigToggleProps) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId} className="text-sm text-[#E8EDF5] cursor-pointer">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-3.5 text-[#8899B4]" aria-hidden />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && <p className="text-xs text-[#8899B4]">{description}</p>}
      </div>
      <Switch
        id={inputId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "data-[state=checked]:bg-[#C8A95A] data-[state=unchecked]:bg-[#1A2F4A]",
          "transition-all duration-200",
        )}
        aria-label={label}
      />
    </div>
  );
}
