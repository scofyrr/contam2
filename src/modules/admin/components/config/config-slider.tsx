import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ConfigSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  preview?: ReactNode;
  className?: string;
}

export function ConfigSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  preview,
  className,
}: ConfigSliderProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm text-[#E8EDF5]">{label}</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 border-[#1A2F4A] bg-[#0F1D32] hover:bg-[#1A2F4A]"
            onClick={() => onChange(clamp(value - step))}
            aria-label={`Reducir ${label}`}
          >
            <Minus className="size-3" />
          </Button>
          <span className="min-w-[3rem] text-center text-sm tabular-nums text-[#C8A95A] font-medium">
            {value}
            {unit && <span className="text-[#8899B4] text-xs ml-0.5">{unit}</span>}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 border-[#1A2F4A] bg-[#0F1D32] hover:bg-[#1A2F4A]"
            onClick={() => onChange(clamp(value + step))}
            aria-label={`Aumentar ${label}`}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(clamp(v))}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:bg-[#C8A95A] [&_.bg-primary]:bg-[#C8A95A]/40"
        aria-label={label}
      />
      {preview}
    </div>
  );
}
