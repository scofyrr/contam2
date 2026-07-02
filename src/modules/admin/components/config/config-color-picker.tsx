import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESETS = ["#00D4FF", "#FF0000", "#FF6B00", "#FFB800", "#00C897", "#C8A95A", "#A78BFA", "#FF5E7A"];

interface ConfigColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  showContrast?: boolean;
}

function contrastRatio(hex: string, bg = "#060B14"): number {
  const parse = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  };
  const lum = ([r, g, b]: readonly [number, number, number]) => {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(bg);
  const l1 = lum([r1, g1, b1]);
  const l2 = lum([r2, g2, b2]);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function ConfigColorPicker({ label, value, onChange, showContrast = true }: ConfigColorPickerProps) {
  const ratio = useMemo(() => {
    try {
      return contrastRatio(value);
    } catch {
      return 0;
    }
  }, [value]);

  const contrastOk = ratio >= 4.5;

  return (
    <div className="space-y-2">
      <Label className="text-sm text-[#E8EDF5]">{label}</Label>
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="size-10 rounded-full border-2 border-white/20 shadow-inner shrink-0"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-xs bg-[#0F1D32] border-[#1A2F4A] uppercase"
          maxLength={7}
          aria-label={`Color ${label}`}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 rounded cursor-pointer border-0 bg-transparent"
          aria-label={`Selector de color ${label}`}
        />
        {showContrast && (
          <span
            className={cn(
              "text-[10px] tabular-nums",
              contrastOk ? "text-[#00C897]" : "text-[#FF5E7A]",
            )}
          >
            Contraste {ratio.toFixed(1)}:1
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              "size-6 rounded-full border-2 transition-transform hover:scale-110",
              value === c ? "border-[#C8A95A] ring-2 ring-[#C8A95A]/40" : "border-white/10",
            )}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            aria-label={`Preset ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

export const COLORBLIND_PALETTE = {
  urgencia_vencida: "#D55E00",
  urgencia_hoy: "#E69F00",
  urgencia_semana: "#F0E442",
  urgencia_normal: "#56B4E9",
  acento: "#009E73",
};
