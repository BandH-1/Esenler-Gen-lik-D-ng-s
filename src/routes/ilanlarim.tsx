import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock/store";
import { ItemCard } from "@/components/items/ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/items/StatusBadge";
import { type Item, type Category } from "@/lib/mock/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORY_EMOJIS: Record<Category, string[]> = {
  kitap: ["📚", "📖", "📓", "📝", "✍️"],
  kiyafet: ["👕", "👗", "🧥", "👖", "👟", "🧢"],
  okul: ["🎒", "✏️", "📐", "🎨", "🧪", "🧮"],
  elektronik: ["🎧", "📟", "💻", "📱", "🎮", "🔌", "🔋", "⌨️"],
  spor: ["⚽", "🏀", "🛹", "🥋", "🏸", "🏋️"],
  yurt: ["🛏️", "🛋️", "🧴", "☕", "🔌", "🪞"],
};

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
  const allItems = useStore((s) => s.items);
  const mine = allItems.filter((i) => i.ownerId === currentUserId);
  const remove = useStore((s) => s.removeItem);
  const updateItemImage = useStore((s) => s.updateItemImage);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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
            <div className="flex flex-col gap-2 bg-card border rounded-3xl p-2.5 shadow-soft">
              <ItemCard item={item} />
              <div className="flex flex-col gap-1.5 px-1 mt-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  {item.status !== "tamamlandi" && item.status !== "kaldirildi" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-destructive px-1.5 hover:bg-destructive/10 cursor-pointer"
                      onClick={() => {
                        remove(item.id);
                        toast("İlan kaldırıldı.");
                      }}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                {item.status !== "tamamlandi" && item.status !== "kaldirildi" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-[10px] py-1 border-dashed hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer"
                    onClick={() => setEditingItem(item)}
                  >
                    ✏️ Görseli Değiştir
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Emoji Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temsili Görseli Düzenle</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="flex flex-col gap-4 py-3">
              <div className="flex items-center gap-3 bg-secondary/35 p-3 rounded-2xl border">
                <div className="text-4xl">{editingItem.images[0]}</div>
                <div>
                  <div className="font-semibold text-sm">{editingItem.title}</div>
                  <div className="text-[10px] text-muted-foreground">Kategori: {editingItem.category}</div>
                </div>
              </div>
              
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Yeni Temsili Görsel Seçin
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORY_EMOJIS[editingItem.category as Category]?.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        updateItemImage(editingItem.id, emoji);
                        toast.success("Ürün görseli başarıyla güncellendi.");
                        setEditingItem(null);
                      }}
                      className={`h-12 w-12 text-2xl grid place-items-center rounded-xl border cursor-pointer transition-all duration-200 active:scale-95 ${
                        editingItem.images[0] === emoji
                          ? "bg-primary/10 border-primary shadow-soft text-primary font-bold scale-105"
                          : "bg-background hover:bg-secondary hover:border-muted-foreground/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
