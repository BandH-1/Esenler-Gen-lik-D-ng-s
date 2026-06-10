import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

export function ImpactStat({
  label,
  value,
  icon,
  accent = "primary",
  animate = true,
  suffix = "",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "primary" | "accent" | "warning";
  animate?: boolean;
  suffix?: string;
}) {
  const tone = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    warning: "bg-warning/20 text-warning-foreground",
  }[accent];

  const isNumericish =
    typeof value === "number" || (typeof value === "string" && /^[\d.,]+$/.test(value));

  return (
    <div className="hover-lift group flex items-center gap-3 rounded-2xl border bg-card/80 p-3 shadow-soft backdrop-blur-sm">
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6",
          tone,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl font-bold leading-tight tabular-nums">
          {animate && isNumericish ? (
            <CountUp value={value} suffix={suffix} />
          ) : (
            <>
              {value}
              {suffix}
            </>
          )}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
