import { cn } from "@/lib/utils";
import {
  ITEM_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  type ItemStatus,
  type RequestStatus,
} from "@/lib/mock/types";

const itemTone: Record<ItemStatus, string> = {
  aktif: "bg-accent/15 text-accent-foreground ring-accent/30",
  incelemede: "bg-warning/20 text-warning-foreground ring-warning/30",
  rezerve: "bg-primary/10 text-primary ring-primary/20",
  "teslim-planlandi": "bg-primary/15 text-primary ring-primary/30",
  tamamlandi: "bg-secondary text-secondary-foreground ring-border",
  reddedildi: "bg-destructive/15 text-destructive ring-destructive/30",
  kaldirildi: "bg-muted text-muted-foreground ring-border",
};

const reqTone: Record<RequestStatus, string> = {
  "talep-edildi": "bg-warning/20 text-warning-foreground ring-warning/30",
  onaylandi: "bg-primary/10 text-primary ring-primary/20",
  "qr-hazir": "bg-accent/15 text-accent-foreground ring-accent/30",
  tamamlandi: "bg-secondary text-secondary-foreground ring-border",
  iptal: "bg-destructive/15 text-destructive ring-destructive/30",
  "suresi-doldu": "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({
  status,
  kind = "item",
  className,
}: {
  status: ItemStatus | RequestStatus;
  kind?: "item" | "request";
  className?: string;
}) {
  const label =
    kind === "item"
      ? ITEM_STATUS_LABELS[status as ItemStatus]
      : REQUEST_STATUS_LABELS[status as RequestStatus];
  const tone = kind === "item" ? itemTone[status as ItemStatus] : reqTone[status as RequestStatus];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
