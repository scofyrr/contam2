import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfigSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  modified?: boolean;
  children: ReactNode;
  className?: string;
}

export function ConfigSection({
  title,
  description,
  icon,
  modified,
  children,
  className,
}: ConfigSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {icon && <span className="mt-0.5 text-[#C8A95A]">{icon}</span>}
          <div>
            <h3 className="text-sm font-semibold text-[#E8EDF5]">{title}</h3>
            {description && <p className="text-xs text-[#8899B4] mt-0.5">{description}</p>}
          </div>
        </div>
        {modified && (
          <Badge className="bg-[#00C897]/15 text-[#00C897] border-[#00C897]/30 text-[10px]">
            Modificado
          </Badge>
        )}
      </div>
      {children}
    </section>
  );
}
