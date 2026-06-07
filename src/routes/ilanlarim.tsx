import { createFileRoute, Link } from "@tanstack/react-router";
import { ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock/store";
import { ItemCard } from "@/components/items/ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/items/StatusBadge";

export const Route = createFileRoute("/ilanlarim")({
  head: () => ({
    meta: [
      { title: "İlanlarım — Gençlik Döngüsü" },
      { name: "description", content: "Yayınladığın ilanları yönet." },
    ],
  }),
  component: MyListings,
});

function MyListings() {
  const currentUserId = useStore((s) => s.currentUserId);
  // Select the stable array and filter in render (a fresh array from the
  // selector makes useSyncExternalStore loop infinitely).
  const allItems = useStore((s) => s.items);
  const mine = allItems.filter((i) => i.ownerId === currentUserId);
  const remove = useStore((s) => s.removeItem);

  if (mine.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          icon={<ListChecks className="h-5 w-5" />}
          title="Henüz ilanın yok"
          description="İlk eşyanı bağışla, Eko-Puan kazanmaya başla."
          action={
            <Link
              to="/esya-ekle"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)]"
            >
              <Plus className="h-3.5 w-3.5" /> Eşya Ekle
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="anim-fade-up flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">İlanlarım</h1>
          <p className="text-sm text-muted-foreground">
            {mine.length} ilan · durumlarını takip et
          </p>
        </div>
        <Link
          to="/esya-ekle"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)] active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> Yeni
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {mine.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i, 8) * 45} y={18}>
            <div className="flex flex-col gap-2">
              <ItemCard item={item} />
              <div className="flex items-center justify-between px-1">
                <StatusBadge status={item.status} />
                {item.status !== "tamamlandi" && item.status !== "kaldirildi" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] text-destructive"
                    onClick={() => {
                      remove(item.id);
                      toast("İlan kaldırıldı.");
                    }}
                  >
                    Kaldır
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
