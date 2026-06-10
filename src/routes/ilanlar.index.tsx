import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "@/lib/mock/store";
import { CATEGORY_LABELS, CONDITION_LABELS, type Category, type Condition } from "@/lib/mock/types";
import { ItemCard } from "@/components/items/ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

type SearchParams = {
  category?: Category;
  condition?: Condition;
  neighborhood?: string;
  handover?: string;
  sort?: "yeni" | "puan";
};

export const Route = createFileRoute("/ilanlar/")({
  head: () => ({
    meta: [
      { title: "İlanlar — eştakas" },
      {
        name: "description",
        content:
          "Esenler'deki gençlerin paylaştığı ücretsiz eşyaları kategori, mahalle ve teslim noktasına göre filtrele.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: s.category as Category | undefined,
    condition: s.condition as Condition | undefined,
    neighborhood: s.neighborhood as string | undefined,
    handover: s.handover as string | undefined,
    sort: (s.sort as SearchParams["sort"]) ?? "yeni",
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const items = useStore((s) => s.items);
  const handoverPoints = useStore((s) => s.handoverPoints);
  const [q, setQ] = useState("");

  const neighborhoods = useMemo(
    () => Array.from(new Set(items.map((i) => i.neighborhood))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.status === "aktif" || i.status === "rezerve");
    if (search.category) list = list.filter((i) => i.category === search.category);
    if (search.condition) list = list.filter((i) => i.condition === search.condition);
    if (search.neighborhood) list = list.filter((i) => i.neighborhood === search.neighborhood);
    if (search.handover) list = list.filter((i) => i.handoverPointId === search.handover);
    if (q.trim()) list = list.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
    if (search.sort === "puan")
      list = [...list].sort((a, b) => b.ecoPointReward - a.ecoPointReward);
    else list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [items, search, q]);

  const update = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, ...patch }) });

  const hasFilters =
    !!search.category ||
    !!search.condition ||
    !!search.neighborhood ||
    !!search.handover ||
    (search.sort && search.sort !== "yeni");

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">İlanlar</h1>
        <p className="text-sm text-muted-foreground">
          Esenler gençlerinin paylaştığı{" "}
          <span className="font-semibold text-accent">{filtered.length}</span> ücretsiz eşya.
        </p>
      </div>

      {/* Sticky search + filters */}
      <div className="sticky top-[4.2rem] z-20 -mx-1 rounded-2xl border bg-card/70 p-3 shadow-soft backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Eşya ara"
            placeholder="Eşya ara..."
            className="h-11 w-full rounded-xl border bg-background/60 pl-10 pr-3 text-sm outline-none transition-all duration-300 focus:border-primary/40 focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-0.5">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Select
            ariaLabel="Kategori filtresi"
            value={search.category ?? ""}
            onChange={(v) => update({ category: (v as Category) || undefined })}
            options={[
              { value: "", label: "Tüm Kategoriler" },
              ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            ]}
          />
          <Select
            ariaLabel="Durum filtresi"
            value={search.condition ?? ""}
            onChange={(v) => update({ condition: (v as Condition) || undefined })}
            options={[
              { value: "", label: "Tüm Durumlar" },
              ...Object.entries(CONDITION_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            ]}
          />
          <Select
            ariaLabel="Mahalle filtresi"
            value={search.neighborhood ?? ""}
            onChange={(v) => update({ neighborhood: v || undefined })}
            options={[
              { value: "", label: "Tüm Mahalleler" },
              ...neighborhoods.map((n) => ({ value: n, label: n })),
            ]}
          />
          <Select
            ariaLabel="Teslim noktası filtresi"
            value={search.handover ?? ""}
            onChange={(v) => update({ handover: v || undefined })}
            options={[
              { value: "", label: "Tüm Teslim Noktaları" },
              ...handoverPoints.map((h) => ({ value: h.id, label: h.name })),
            ]}
          />
          <Select
            ariaLabel="Sıralama"
            value={search.sort ?? "yeni"}
            onChange={(v) => update({ sort: v as SearchParams["sort"] })}
            options={[
              { value: "yeni", label: "En Yeni" },
              { value: "puan", label: "En Çok Eko-Puan" },
            ]}
          />
          {hasFilters && (
            <Link
              to="/ilanlar"
              className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/20 transition hover:bg-destructive/15"
            >
              <X className="h-3 w-3" /> Temizle
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Sonuç bulunamadı"
          description="Filtreleri sıfırlayıp tekrar dene."
          action={
            <Link
              to="/ilanlar"
              className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)]"
            >
              Filtreleri Temizle
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i, 8) * 45} y={18}>
              <ItemCard item={item} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 shrink-0 rounded-full border bg-background/60 px-3 text-xs font-medium outline-none transition-all duration-300 hover:border-primary/30 focus:border-primary/40 focus:ring-2 focus:ring-ring/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
