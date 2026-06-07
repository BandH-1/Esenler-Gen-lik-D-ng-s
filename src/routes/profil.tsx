import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  MapPin,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  ShieldQuestion,
  ArrowRight,
  Ban,
  ShieldAlert,
} from "lucide-react";
import { useCurrentUser, useStore, STRIKE_LIMIT } from "@/lib/mock/store";
import { SCHOOL_LABELS } from "@/lib/mock/types";
import { CountUp } from "@/components/common/CountUp";
import { Reveal } from "@/components/common/Reveal";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profilim — Gençlik Döngüsü" },
      { name: "description", content: "Esenlink doğrulamalı gençlik profilin." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useCurrentUser();
  // NOTE: select the stable array and filter in render. Returning a fresh
  // array from the selector makes useSyncExternalStore loop infinitely.
  const allItems = useStore((s) => s.items);
  const items = allItems.filter(
    (i) => i.ownerId === user.id && i.status === "tamamlandi",
  );

  const eligibility = [
    { label: "Genç (15-29)", ok: user.age >= 15 && user.age <= 29 },
    { label: "Öğrenci statüsü", ok: user.userType === "ogrenci" },
    { label: "Okul türü onaylı", ok: !!SCHOOL_LABELS[user.schoolType] },
    { label: "Esenler bağlantısı", ok: !!user.neighborhood },
    {
      label: "Esenlink doğrulaması",
      ok: user.verificationStatus === "dogrulanmis",
    },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 py-4">
      <div className="anim-scale-in overflow-hidden rounded-3xl border bg-card/80 shadow-card backdrop-blur-sm">
        <div className="relative h-24 overflow-hidden bg-brand">
          <div className="anim-float pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
        </div>
        <div className="-mt-12 flex flex-col items-center gap-2 p-4 pt-0">
          <div
            className="grid h-24 w-24 place-items-center rounded-full text-3xl font-bold text-white shadow-lift ring-4 ring-card"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name[0]}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 font-display text-lg font-bold">
              {user.name}
              {user.verificationStatus === "dogrulanmis" && (
                <ShieldCheck className="h-4 w-4 text-accent" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {SCHOOL_LABELS[user.schoolType]} · {user.age} yaş
            </div>
          </div>
          <div className="mt-1 flex gap-2">
            <Stat label="Güven Puanı" value={user.trustScore} />
            <Stat label="Tamamlanan" value={items.length + 2} />
            <Stat label="Eko-Puan" value={user.ecoPointBalance} />
          </div>
        </div>
      </div>

      {user.banned ? (
        <div className="anim-fade-up flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
            <Ban className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-destructive">Hesabın askıya alındı</p>
            <p className="mt-0.5 text-muted-foreground">
              {user.banReason ?? "Topluluk kurallarını ihlal ettin."} Yorum
              yapamaz ve eşya talep edemezsin. İtiraz için belediye moderasyon
              ekibiyle iletişime geç.
            </p>
          </div>
        </div>
      ) : (user.strikes ?? 0) > 0 ? (
        <div className="anim-fade-up flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/15 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning/25 text-warning-foreground">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-warning-foreground">
              Topluluk uyarısı: {user.strikes}/{STRIKE_LIMIT}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              İçeriklerin topluluk kurallarına aykırı bulundu. {STRIKE_LIMIT}.
              uyarıda hesabın otomatik olarak askıya alınır.
            </p>
          </div>
        </div>
      ) : null}

      <Reveal>
        <section className="rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-semibold">Uygunluk Kontrolü</h2>
          <ul className="space-y-2 text-sm">
            {eligibility.map((e, i) => (
              <li
                key={e.label}
                className="anim-slide-in flex items-center gap-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {e.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : (
                  <ShieldQuestion className="h-4 w-4 text-warning-foreground" />
                )}
                <span className={e.ok ? "" : "text-muted-foreground"}>
                  {e.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal delay={60}>
        <section className="rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur-sm">
          <h2 className="mb-2 text-sm font-semibold">Bilgilerim</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {SCHOOL_LABELS[user.schoolType]}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {user.neighborhood}, Esenler
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Esenlink üzerinden doğrulandı
            </li>
          </ul>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <Link
          to="/yonetim"
          className="group flex items-center justify-between rounded-2xl border bg-card/80 p-4 text-sm font-semibold shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Belediye Yönetim Paneli
          </span>
          <span className="flex items-center gap-1 text-primary">
            Aç
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </Reveal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-1.5 text-center">
      <div className="font-display text-base font-bold leading-none tabular-nums">
        <CountUp value={value} duration={1000} />
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
