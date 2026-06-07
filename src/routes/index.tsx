import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Coins,
  MapPin,
  Package,
  Recycle,
  Sparkles,
  Leaf,
  ShieldCheck,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/mock/store";
import { CATEGORY_LABELS, type Category } from "@/lib/mock/types";
import { ItemCard } from "@/components/items/ItemCard";
import { CategoryIcon } from "@/components/items/CategoryIcon";
import { ImpactStat } from "@/components/common/ImpactStat";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Reveal } from "@/components/common/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gençlik Döngüsü — Esenler Belediyesi" },
      {
        name: "description",
        content:
          "Kullanmadığın eşyan, başka bir gencin ihtiyacı olabilir. Esenler'in ücretsiz, güvenli ve sürdürülebilir gençlik takas platformu.",
      },
    ],
  }),
  component: Home,
});

const QUICK_ACTIONS = [
  { to: "/esya-ekle", label: "Eşya Ekle", icon: Plus },
  { to: "/ilanlar", label: "İlanları Gör", icon: Search },
  { to: "/puanlarim", label: "Puanlarım", icon: Coins },
  { to: "/teslim-noktalari", label: "Teslim Noktaları", icon: MapPin },
] as const;

const HOW_IT_WORKS = [
  {
    icon: Plus,
    title: "Eşyanı ekle",
    copy: "Kullanmadığın kitap, kıyafet veya eşyayı birkaç dakikada listele.",
  },
  {
    icon: ShieldCheck,
    title: "Belediye onaylar",
    copy: "Moderasyon ekibi ilanı kontrol eder, kurallara uygunsa yayınlar.",
  },
  {
    icon: QrCode,
    title: "Güvenli teslim",
    copy: "İhtiyaç sahibi genç, belediye noktasında QR ile güvenle teslim alır.",
  },
  {
    icon: Coins,
    title: "Eko-Puan kazan",
    copy: "Teslim tamamlanınca veren gence Esenlink Eko-Puanı yüklenir.",
  },
] as const;

function Home() {
  const items = useStore((s) => s.items);
  const transactions = useStore((s) => s.pointTransactions);

  const active = items.filter((i) => i.status === "aktif");
  const completed = items.filter((i) => i.status === "tamamlandi");
  const totalPoints = transactions.reduce((a, b) => a + b.points, 0);
  const wastePrevented = (completed.length * 1.4 + active.length * 0.2).toFixed(1);

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Hero */}
      <section className="anim-scale-in relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-brand p-6 text-primary-foreground shadow-lift sm:p-8">
        {/* drifting orbs */}
        <div className="anim-float pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
        <div className="anim-float-slow pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-accent/40 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse at 70% 0%, black, transparent 75%)",
          }}
        />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-white/25 backdrop-blur">
            <Leaf className="h-3.5 w-3.5" />
            Esenler · Esenlink
          </div>
          <h1 className="max-w-xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-4xl">
            Kullanmadığın eşya,
            <br />
            <span className="text-white/95">bir gencin ihtiyacına dönüşsün.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/85 sm:text-base">
            Esenler'in ücretsiz, güvenli ve sürdürülebilir gençlik takas
            platformu.
          </p>
          <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-primary-foreground/70">
            <span>Satış yok</span>
            <span className="opacity-50">·</span>
            <span>Kargo yok</span>
            <span className="opacity-50">·</span>
            <span>Adres paylaşımı yok</span>
            <span className="opacity-50">·</span>
            <span>QR ile güvenli teslim</span>
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="group flex items-center gap-2 rounded-2xl bg-white/12 px-3.5 py-3 text-xs font-semibold ring-1 ring-white/20 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/22 active:scale-95"
                >
                  <Icon className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:rotate-6" />
                  {a.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teşvik Edici Paylaşım Sözleri ve Cemil Meriç */}
      <section className="anim-scale-in rounded-[1.8rem] border bg-gradient-to-br from-card to-secondary/30 p-6 shadow-soft backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-muted-foreground">Paylaşım ve Dayanışma Üzerine</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-center border-r-0 md:border-r pr-0 md:pr-6 border-border">
            <blockquote className="italic text-sm text-foreground/90 font-medium leading-relaxed">
              "Kitap bir limandı benim için. Kitaplarda yaşadım. Ve kitaplardaki insanları sokaktakilerden daha çok sevdim."
            </blockquote>
            <cite className="mt-2 block text-[11px] font-bold text-muted-foreground not-italic">
              — Cemil Meriç (Bu Ülke)
            </cite>
          </div>
          <div className="flex flex-col justify-center pl-0 md:pl-2">
            <blockquote className="italic text-sm text-foreground/90 font-medium leading-relaxed">
              "Sahip olduğumuz değil, paylaştığımız şeyler bize değer katar. Eşyalar paylaşıldıkça ömrü uzar, dünya güzelleşir."
            </blockquote>
            <cite className="mt-2 block text-[11px] font-bold text-muted-foreground not-italic">
              — Paylaşım Kültürü
            </cite>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section>
        <Reveal>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Toplulukla başarılan
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Reveal delay={0}>
            <ImpactStat
              label="Kurtarılan Ürün"
              value={completed.length + 47}
              icon={<Recycle className="h-5 w-5" />}
              accent="accent"
            />
          </Reveal>
          <Reveal delay={70}>
            <ImpactStat
              label="Aktif İlan"
              value={active.length}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
          </Reveal>
          <Reveal delay={140}>
            <ImpactStat
              label="Kazanılan Eko-Puan"
              value={totalPoints + 2840}
              icon={<Coins className="h-5 w-5" />}
              accent="warning"
            />
          </Reveal>
          <Reveal delay={210}>
            <ImpactStat
              label="Önlenen Atık"
              value={wastePrevented}
              suffix=" kg"
              icon={<Leaf className="h-5 w-5" />}
              accent="accent"
            />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section>
        <Reveal>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Nasıl çalışır?
          </h2>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 80}>
                <div className="hover-lift group relative h-full overflow-hidden rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur-sm">
                  <span className="absolute right-3 top-2 font-display text-4xl font-extrabold text-secondary">
                    {i + 1}
                  </span>
                  <div className="relative mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand text-primary-foreground shadow-soft transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative text-sm font-semibold">{step.title}</h3>
                  <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.copy}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section>
        <Reveal>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Kategoriler
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c, i) => (
            <Reveal key={c} delay={i * 50} y={16}>
              <Link
                to="/ilanlar"
                search={{ category: c }}
                className="hover-lift group flex h-full flex-col items-center gap-2 rounded-2xl border bg-card/80 p-3 text-center shadow-soft backdrop-blur-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <CategoryIcon category={c} className="h-5 w-5" />
                </div>
                <div className="text-[11px] font-medium leading-tight">
                  {CATEGORY_LABELS[c]}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <Reveal>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Öne çıkan ilanlar
            </h2>
            <Link
              to="/ilanlar"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Tümünü gör
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {active.slice(0, 8).map((item, i) => (
            <Reveal key={item.id} delay={i * 60} y={18}>
              <ItemCard item={item} />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <SafetyNote />
      </Reveal>
    </div>
  );
}
