import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Info, Sparkles, Coins } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock/store";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  calculateEcoPoints,
  type Category,
  type Condition,
} from "@/lib/mock/types";
import { Button } from "@/components/ui/button";
import { SafetyNote } from "@/components/common/SafetyNote";
import { CountUp } from "@/components/common/CountUp";

export const Route = createFileRoute("/esya-ekle")({
  head: () => ({
    meta: [
      { title: "Eşya Ekle — Gençlik Döngüsü" },
      {
        name: "description",
        content:
          "Kullanmadığın eşyayı Esenler gençlerine ücretsiz bağışla, Eko-Puan kazan.",
      },
    ],
  }),
  component: AddItemPage,
});

const CATEGORY_EMOJI: Record<Category, string> = {
  kitap: "📚",
  kiyafet: "👕",
  okul: "🎒",
  elektronik: "🎧",
  spor: "⚽",
  yurt: "🛏️",
};

function AddItemPage() {
  const navigate = useNavigate();
  const addItem = useStore((s) => s.addItem);
  const handoverPoints = useStore((s) => s.handoverPoints);
  const neighborhoods = Array.from(
    new Set(handoverPoints.map((h) => h.neighborhood)),
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("kitap");
  const [condition, setCondition] = useState<Condition>("iyi");
  const [neighborhood, setNeighborhood] = useState(neighborhoods[0] ?? "");
  const [handover, setHandover] = useState(handoverPoints[0]?.id ?? "");
  const [attrSubject, setAttrSubject] = useState("");
  const [attrSize, setAttrSize] = useState("");
  const [consent, setConsent] = useState(false);

  const reward = calculateEcoPoints(category, condition);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !consent) return;
    const attributes: Record<string, string> = {};
    if (category === "kitap" && attrSubject) attributes["Ders"] = attrSubject;
    if (category === "kiyafet" && attrSize) attributes["Beden"] = attrSize;
    addItem({
      title,
      description,
      category,
      condition,
      images: [CATEGORY_EMOJI[category]],
      neighborhood,
      handoverPointId: handover,
      attributes,
    });
    toast.success("İlanın moderasyon için gönderildi.");
    navigate({ to: "/ilanlarim" });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Eşya Ekle</h1>
        <p className="text-sm text-muted-foreground">
          Esenler'deki bir başka gence ücretsiz bağışla.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* Photo placeholder */}
        <Section title="Fotoğraf" delay={40}>
          <div className="group grid aspect-[5/3] cursor-pointer place-items-center rounded-2xl border-2 border-dashed bg-secondary/40 text-center transition-all duration-300 hover:border-primary/40 hover:bg-secondary/60">
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Camera className="h-7 w-7 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
              <div className="text-xs font-medium">Fotoğraf ekle (yer tutucu)</div>
              <div className="text-[10px]">
                Yüz, ev veya adres içeren fotoğraf yükleme.
              </div>
            </div>
          </div>
        </Section>

        <Section title="Bilgiler" delay={90}>
          <Field label="Başlık">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn. TYT Matematik Soru Bankası"
              className="input"
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input"
              placeholder="Eşyanın durumu, eksikleri, kullanım süresi..."
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kategori">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="input"
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Durum">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="input"
              >
                {Object.entries(CONDITION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {category === "kitap" && (
            <Field label="Ders / Sınav">
              <input
                value={attrSubject}
                onChange={(e) => setAttrSubject(e.target.value)}
                placeholder="Örn. Matematik / TYT"
                className="input"
              />
            </Field>
          )}
          {category === "kiyafet" && (
            <Field label="Beden">
              <input
                value={attrSize}
                onChange={(e) => setAttrSize(e.target.value)}
                placeholder="Örn. M, 38, 42"
                className="input"
              />
            </Field>
          )}
        </Section>

        <Section title="Teslim" delay={140}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mahalle">
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="input"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Teslim Noktası">
              <select
                value={handover}
                onChange={(e) => setHandover(e.target.value)}
                className="input"
              >
                {handoverPoints.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground ring-1 ring-warning/30">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Ev adresi paylaşma. Teslim sadece belediyenin güvenli noktalarında
            yapılır.
          </div>
        </Section>

        {/* Pre-listing Eko-Puan preview */}
        <section className="anim-fade-up relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent/12 to-primary/12 p-4 ring-1 ring-accent/20" style={{ animationDelay: "190ms" }}>
          <div
            className="anim-float pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
            style={{
              background: "radial-gradient(circle, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tahmini Eko-Puan
                </div>
                <div className="font-display text-3xl font-bold leading-tight tabular-nums">
                  +
                  <CountUp key={reward} value={reward} duration={700} />
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    Eko-Puan
                  </span>
                </div>
              </div>
            </div>
            <Coins className="h-6 w-6 text-accent" />
          </div>
          <p className="relative mt-2 text-[11px] text-muted-foreground">
            Puan, ürün güvenli teslim noktasında teslim edildikten sonra hesabına
            yüklenir.
          </p>
        </section>

        <label className="flex cursor-pointer items-start gap-2 rounded-2xl border bg-card/80 p-3 text-sm shadow-soft backdrop-blur-sm transition hover:border-primary/30">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[color:var(--primary)]"
          />
          <span>
            Bu ürünü <b>tamamen ücretsiz</b> devredeceğimi onaylıyorum. Satış,
            ödeme, kargo veya adres paylaşımı yoktur.
          </span>
        </label>

        <SafetyNote />

        <Button
          type="submit"
          size="lg"
          variant="brand"
          disabled={!consent || !title.trim()}
          className="w-full"
        >
          İlanı Yayınla
        </Button>
      </form>

      <style>{`.input{width:100%;height:42px;padding:0 12px;border:1px solid var(--border);border-radius:12px;background:color-mix(in oklch, var(--background) 60%, transparent);font-size:14px;outline:none;transition:border-color .25s, box-shadow .25s}.input:focus{border-color:color-mix(in oklch, var(--primary) 40%, transparent);box-shadow:0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)}textarea.input{height:auto;padding-top:9px;padding-bottom:9px}`}</style>
    </div>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="anim-fade-up rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
