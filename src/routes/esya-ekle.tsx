import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { moderateItemSubmission, type ItemModerationResult } from "@/lib/moderation";

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

const CATEGORY_EMOJIS: Record<Category, string[]> = {
  kitap: ["📚", "📖", "📓", "📝", "✍️"],
  kiyafet: ["👕", "👗", "🧥", "👖", "👟", "🧢"],
  okul: ["🎒", "✏️", "📐", "🎨", "🧪", "🧮"],
  elektronik: ["🎧", "📟", "💻", "📱", "🎮", "🔌", "🔋", "⌨️"],
  spor: ["⚽", "🏀", "🛹", "🥋", "🏸", "🏋️"],
  yurt: ["🛏️", "🛋️", "🧴", "☕", "🔌", "🪞"],
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
  const [selectedEmoji, setSelectedEmoji] = useState("📚");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<ItemModerationResult | null>(null);

  useEffect(() => {
    setSelectedEmoji(CATEGORY_EMOJIS[category][0]);
  }, [category]);

  const reward = calculateEcoPoints(category, condition);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoUrl(URL.createObjectURL(file));
      setAiReport(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !consent) return;

    setIsAnalyzing(true);
    setAiReport(null);

    // AI Analizini simüle et
    setTimeout(() => {
      const result = moderateItemSubmission(
        title,
        description,
        category,
        selectedEmoji,
        photo ? photo.name : undefined
      );

      setIsAnalyzing(false);
      setAiReport(result);

      if (result.ok) {
        const attributes: Record<string, string> = {};
        if (category === "kitap" && attrSubject) attributes["Ders"] = attrSubject;
        if (category === "kiyafet" && attrSize) attributes["Beden"] = attrSize;
        
        const imageValue = photoUrl || selectedEmoji;

        addItem({
          title,
          description,
          category,
          condition,
          images: [imageValue],
          neighborhood,
          handoverPointId: handover,
          attributes,
        });
        toast.success("İlanınız AI taramasından başarıyla geçti ve yayınlandı!");
        navigate({ to: "/ilanlarim" });
      } else {
        toast.error("AI Taraması Başarısız: Politikaya aykırı veya uyumsuz içerik tespit edildi.");
      }
    }, 1800);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 py-4 pb-28 md:pb-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Eşya Ekle</h1>
        <p className="text-sm text-muted-foreground">
          Esenler'deki bir başka gence ücretsiz bağışla.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* Photo & Emoji Selector */}
        <Section title="Ürün Görseli" delay={40}>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Büyük Gösterim (Önizleme) */}
            <div className="relative grid aspect-square sm:aspect-auto sm:h-full place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br from-secondary via-card to-background shadow-soft min-h-[160px]">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--accent) 15%, transparent), transparent 60%)",
                }}
              />
              
              {photoUrl ? (
                <img src={photoUrl} alt="Ürün Fotoğrafı" className="h-full w-full object-cover relative z-10" />
              ) : (
                <span className="relative text-6xl drop-shadow-md z-10">{selectedEmoji}</span>
              )}
              
              {/* AI Tarama Çizgisi */}
              {isAnalyzing && (
                <div className="absolute inset-x-0 h-1 bg-accent/80 shadow-[0_0_12px_var(--accent)] animate-[bob_1.5s_ease-in-out_infinite] z-20" />
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1.5px] z-10 flex items-center justify-center text-xs font-semibold text-primary animate-pulse">
                  AI Taraması...
                </div>
              )}

              {photoUrl && !isAnalyzing && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoUrl(null);
                  }}
                  className="absolute right-2.5 top-2.5 z-20 rounded-full bg-destructive/90 p-1.5 text-white shadow hover:bg-destructive active:scale-95 text-xs font-semibold px-2 cursor-pointer transition"
                >
                  Kaldır
                </button>
              )}
            </div>
            
            {/* Alternatif Seçici & Fotoğraf Yükleyici */}
            <div className="sm:col-span-2 flex flex-col justify-between gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Gerçek Fotoğraf Yükleyin
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <label className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed bg-background/50 hover:bg-secondary hover:border-muted-foreground/30 px-4 py-2 text-xs font-semibold cursor-pointer transition-all duration-200">
                    <Camera className="h-4 w-4 text-primary" />
                    <span>{photo ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                  </label>
                </div>

                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Veya Temsili Görsel Seçin
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_EMOJIS[category].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      disabled={!!photo || isAnalyzing}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`h-11 w-11 text-2xl grid place-items-center rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        !photo && selectedEmoji === emoji
                          ? "bg-primary/10 border-primary shadow-soft text-primary font-bold scale-105"
                          : "bg-background/60 hover:bg-secondary hover:border-muted-foreground/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 rounded-xl bg-secondary/50 p-2.5 border">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Fotoğraf yüklerseniz temsili görsel devre dışı kalır. Yüz veya adres içermeyen görseller tercih edin.</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Bilgiler" delay={90}>
          <Field label="Başlık">
            <input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setAiReport(null);
              }}
              placeholder="Örn. TYT Matematik Soru Bankası"
              className="input"
              disabled={isAnalyzing}
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setAiReport(null);
              }}
              rows={3}
              className="input"
              placeholder="Eşyanın durumu, eksikleri, kullanım süresi..."
              disabled={isAnalyzing}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kategori">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category);
                  setAiReport(null);
                }}
                className="input"
                disabled={isAnalyzing}
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
                disabled={isAnalyzing}
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
                disabled={isAnalyzing}
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
                disabled={isAnalyzing}
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
                disabled={isAnalyzing}
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
                disabled={isAnalyzing}
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

        {/* AI Moderasyon Hata Paneli */}
        {aiReport && !aiReport.ok && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col gap-2 anim-scale-in">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              AI Güvenlik ve Uygunluk Raporu
            </div>
            <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
              {aiReport.message}
            </div>
            <div className="text-[10px] text-destructive/80 font-medium bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 mt-1">
              ⚠️ Lütfen ilan başlığını, açıklamasını, kategorisini veya yüklenen resmi politikalarımıza uygun şekilde güncelleyin.
            </div>
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-2 rounded-2xl border bg-card/80 p-3 text-sm shadow-soft backdrop-blur-sm transition hover:border-primary/30">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[color:var(--primary)]"
            disabled={isAnalyzing}
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
          disabled={!consent || !title.trim() || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 relative overflow-hidden"
        >
          {isAnalyzing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              AI Güvenlik Taraması Yapılıyor...
            </>
          ) : (
            "İlanı Yayınla"
          )}
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
