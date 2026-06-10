import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function EcoPointsBadge({ points, className }: { points: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground shadow-soft ring-1 ring-accent/30 backdrop-blur-sm",
        className,
      )}
    >
      <Coins className="h-3 w-3 text-accent" />+{points}
    </span>
  );
}
