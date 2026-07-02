import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PremiumEmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 fade-in",
        className,
      )}
    >
      <div className="relative mb-6">
        <svg
          className="absolute inset-0 -m-8 size-32 opacity-40"
          viewBox="0 0 128 128"
          aria-hidden
        >
          <defs>
            <linearGradient id="empty-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8A95A" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00C897" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="64" cy="64" r="56" fill="url(#empty-grad)" />
        </svg>
        <div className="relative size-16 rounded-2xl glass-surface shadow-premium-medium grid place-items-center pulse-glow">
          <Icon className="size-8 text-premium-gold" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
