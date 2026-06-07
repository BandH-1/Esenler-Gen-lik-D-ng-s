import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground ring-border",
  free: "bg-accent/15 text-accent ring-accent/30",
  municipal: "bg-primary/10 text-primary ring-primary/30",
  qr: "bg-warning/20 text-warning-foreground ring-warning/30",
  point: "bg-accent/15 text-accent ring-accent/30",
  student: "bg-primary/10 text-primary ring-primary/30",
  circular: "bg-accent/10 text-accent ring-accent/30",
};

export function TrustBadge({
  variant = "default",
  children,
  className,
}: {
  variant?: keyof typeof TONE;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        TONE[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
