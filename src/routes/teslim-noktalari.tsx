import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, QrCode, Navigation } from "lucide-react";
import { useStore } from "@/lib/mock/store";
import { HANDOVER_TYPE_LABELS } from "@/lib/mock/types";
import { Reveal } from "@/components/common/Reveal";

export const Route = createFileRoute("/teslim-noktalari")({
  head: () => ({
    meta: [
      { title: "Teslim Noktaları — Gençlik Döngüsü" },
      {
        name: "description",
        content:
          "Esenler genelinde QR onaylı güvenli teslim noktaları: gençlik merkezleri, kütüphaneler ve belediye hizmet binaları.",
      },
    ],
  }),
  component: HandoverPointsPage,
});

function HandoverPointsPage() {
  const points = useStore((s) => s.handoverPoints);
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Güvenli Teslim Noktaları
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm takaslar bu belediye noktalarında, QR onayıyla tamamlanır.
        </p>
      </div>

      {/* Map placeholder */}
      <div className="anim-scale-in relative grid aspect-[16/8] place-items-center overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-secondary to-accent/12 shadow-card">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
        {/* drifting pins */}
        {points.slice(0, 5).map((p, i) => (
          <span
            key={p.id}
            className="anim-float absolute"
            style={{
              left: `${15 + i * 17}%`,
              top: `${30 + (i % 3) * 18}%`,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            <MapPin className="h-5 w-5 text-primary drop-shadow" fill="currentColor" />
          </span>
        ))}
        <div className="relative rounded-2xl bg-card/70 px-4 py-3 text-center shadow-soft backdrop-blur">
          <Navigation className="mx-auto mb-1 h-6 w-6 text-primary" />
          <div className="text-sm font-semibold">Esenler · Harita</div>
          <div className="text-[11px] text-muted-foreground">
            Harita görünümü yakında
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {points.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <div className="hover-lift group h-full rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {HANDOVER_TYPE_LABELS[p.type]}
                  </div>
                  <h2 className="mt-0.5 font-semibold">{p.name}</h2>
                </div>
                {p.qrEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground ring-1 ring-accent/30">
                    <QrCode className="h-3 w-3 text-accent" /> QR
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  {p.address}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {p.openingHours}
                </div>
                <div>Mahalle: {p.neighborhood}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
