import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="anim-scale-in flex flex-col items-center justify-center gap-2.5 rounded-3xl border border-dashed bg-card/50 p-10 text-center backdrop-blur-sm">
      <div className="anim-float grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground shadow-soft">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
