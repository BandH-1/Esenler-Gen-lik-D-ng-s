import { cn } from "@/lib/utils";
import {
  ESENLINK_SYNC_LABELS,
  type EsenlinkSync,
} from "@/lib/mock/types";
import { CheckCircle2, Clock, AlertTriangle, FlaskConical } from "lucide-react";

const TONE: Record<EsenlinkSync, string> = {
  synced: "bg-accent/15 text-accent ring-accent/30",
  pending: "bg-warning/20 text-warning-foreground ring-warning/30",
  failed: "bg-destructive/15 text-destructive ring-destructive/30",
  demo: "bg-primary/10 text-primary ring-primary/20",
};

const ICONS = {
  synced: CheckCircle2,
  pending: Clock,
  failed: AlertTriangle,
  demo: FlaskConical,
} as const;

export function EsenlinkBadge({
  sync,
  className,
}: {
  sync: EsenlinkSync;
  className?: string;
}) {
  const Icon = ICONS[sync];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        TONE[sync],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {ESENLINK_SYNC_LABELS[sync]}
    </span>
  );
}
