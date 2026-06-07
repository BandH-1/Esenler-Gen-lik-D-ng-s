import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Item } from "@/lib/mock/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/mock/types";
import { CategoryIcon } from "./CategoryIcon";
import { StatusBadge } from "./StatusBadge";
import { EcoPointsBadge } from "./EcoPointsBadge";
import { useStore } from "@/lib/mock/store";

export function ItemCard({ item }: { item: Item }) {
  const handover = useStore((s) =>
    s.handoverPoints.find((h) => h.id === item.handoverPointId),
  );
  return (
    <Link
      to="/ilanlar/$itemId"
      params={{ itemId: item.id }}
      className="hover-lift group flex flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-soft backdrop-blur-sm"
    >
      <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-gradient-to-br from-secondary via-card to-background">
        {/* soft radial glow behind the emoji */}
        <span
          className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, color-mix(in oklch, var(--accent) 16%, transparent), transparent 65%)",
          }}
        />
        <span className="relative text-6xl drop-shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-3">
          {item.images[0]}
        </span>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <StatusBadge status={item.status} />
        </div>
        <div className="absolute right-2 top-2">
          <EcoPointsBadge points={item.ecoPointReward} />
        </div>
        <span className="shimmer-sweep absolute inset-0" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight transition-colors duration-300 group-hover:text-primary">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CategoryIcon category={item.category} className="h-3 w-3" />
          {CATEGORY_LABELS[item.category]}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
            {CONDITION_LABELS[item.condition]}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{handover?.name ?? item.neighborhood}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
