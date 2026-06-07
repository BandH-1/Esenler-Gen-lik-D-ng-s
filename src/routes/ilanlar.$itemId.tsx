import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Flag, ShieldCheck, User2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock/store";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  HANDOVER_TYPE_LABELS,
} from "@/lib/mock/types";
import { CategoryIcon } from "@/components/items/CategoryIcon";
import { StatusBadge } from "@/components/items/StatusBadge";
import { EcoPointsBadge } from "@/components/items/EcoPointsBadge";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Reveal } from "@/components/common/Reveal";
import { CommentSection } from "@/components/comments/CommentSection";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ilanlar/$itemId")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title
          ? `${loaderData.title} — Gençlik Döngüsü`
          : "İlan — Gençlik Döngüsü",
      },
      {
        name: "description",
        content:
          "Esenler gençlerinin paylaştığı ücretsiz eşya. Belediye güvenli teslim noktasında QR ile teslim alınır.",
      },
    ],
  }),
  component: ItemDetail,
  notFoundComponent: () => (
    <div className="py-12 text-center">
      <h2 className="font-display text-lg font-bold">İlan bulunamadı</h2>
      <Link
        to="/ilanlar"
        className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
      >
        Tüm ilanlara dön
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="py-12 text-center text-sm text-muted-foreground">
      Bir hata oluştu.
    </div>
  ),
  loader: ({ params }) => {
    const item = useStore
      .getState()
      .items.find((i) => i.id === params.itemId);
    return { itemId: params.itemId, title: item?.title };
  },
});

function ItemDetail() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const item = useStore((s) => s.items.find((i) => i.id === itemId));
  const owner = useStore((s) => s.users.find((u) => u.id === item?.ownerId));
  const handover = useStore((s) =>
    s.handoverPoints.find((h) => h.id === item?.handoverPointId),
  );
  const currentUserId = useStore((s) => s.currentUserId);
  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const requestItem = useStore((s) => s.requestItem);
  const reportItem = useStore((s) => s.reportItem);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  if (!item) throw notFound();

  const isMine = item.ownerId === currentUserId;
  const isBanned = !!me?.banned;
  const canRequest = !isMine && item.status === "aktif" && !isBanned;

  const handleRequest = () => {
    requestItem(item.id);
    setConfirmOpen(false);
    toast.success("Talebin gönderildi. Verici onaylayınca QR oluşturulur.");
    navigate({ to: "/taleplerim" });
  };

  return (
    <div className="flex flex-col gap-5 py-4 pb-28 md:pb-4">
      <Link
        to="/ilanlar"
        className="anim-fade-up group inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
        İlanlara dön
      </Link>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Image */}
        <div className="anim-scale-in relative grid aspect-square place-items-center overflow-hidden rounded-3xl border bg-gradient-to-br from-secondary via-card to-background shadow-card">
          <div
            className="anim-float pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--accent) 20%, transparent), transparent 60%)",
            }}
          />
          <span className="anim-float relative text-[140px] drop-shadow-md">
            {item.images[0]}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <div className="anim-fade-up flex flex-wrap items-center gap-2" style={{ animationDelay: "60ms" }}>
            <StatusBadge status={item.status} />
            <EcoPointsBadge points={item.ecoPointReward} />
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
              <CategoryIcon category={item.category} className="h-3 w-3" />
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          <h1 className="anim-fade-up font-display text-2xl font-bold leading-tight tracking-tight" style={{ animationDelay: "120ms" }}>
            {item.title}
          </h1>
          <p className="anim-fade-up text-sm leading-relaxed text-muted-foreground" style={{ animationDelay: "170ms" }}>
            {item.description}
          </p>

          <dl className="anim-fade-up grid grid-cols-2 gap-2 rounded-2xl border bg-card/80 p-3 text-xs shadow-soft backdrop-blur-sm" style={{ animationDelay: "220ms" }}>
            <Row label="Durum">{CONDITION_LABELS[item.condition]}</Row>
            <Row label="Mahalle">{item.neighborhood}</Row>
            {item.attributes &&
              Object.entries(item.attributes).map(([k, v]) => (
                <Row key={k} label={k}>
                  {v}
                </Row>
              ))}
          </dl>

          {/* Owner */}
          {owner && (
            <div className="anim-fade-up flex items-center gap-3 rounded-2xl border bg-card/80 p-3 shadow-soft backdrop-blur-sm" style={{ animationDelay: "270ms" }}>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-soft leading-none"
                style={{ backgroundColor: owner.avatarColor }}
              >{owner.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {owner.name}
                  {owner.verificationStatus === "dogrulanmis" && (
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Güven puanı {owner.trustScore} · Esenlink doğrulamalı
                </div>
              </div>
            </div>
          )}

          {/* Handover */}
          {handover && (
            <div className="anim-fade-up rounded-2xl border bg-card/80 p-3 shadow-soft backdrop-blur-sm" style={{ animationDelay: "320ms" }}>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                {handover.name}
              </div>
              <div className="space-y-0.5 text-[12px] text-muted-foreground">
                <div>{handover.address}</div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {handover.openingHours}
                  </span>
                  <span>{HANDOVER_TYPE_LABELS[handover.type]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Desktop actions */}
          <div className="hidden gap-2 sm:flex">
            <Button
              size="lg"
              variant="brand"
              className="flex-1"
              disabled={!canRequest}
              onClick={() => setConfirmOpen(true)}
            >
              {isMine
                ? "Bu senin ilanın"
                : isBanned
                  ? "Hesabın askıda"
                  : canRequest
                    ? "Talep Et"
                    : "Şu an talep edilemez"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setReportOpen(true)}>
              <Flag className="mr-1.5 h-4 w-4" />
              Bildir
            </Button>
          </div>
        </div>
      </div>

      <Reveal>
        <SafetyNote />
      </Reveal>

      {/* Community Q&A / forum */}
      <Reveal>
        <CommentSection itemId={item.id} />
      </Reveal>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-[5.5rem] z-30 px-4 sm:hidden">
        <div className="flex gap-2 rounded-2xl border bg-card/90 p-2 shadow-lift backdrop-blur-xl">
          <Button
            variant="brand"
            className="flex-1"
            disabled={!canRequest}
            onClick={() => setConfirmOpen(true)}
          >
            {isMine
              ? "Bu senin ilanın"
              : isBanned
                ? "Hesabın askıda"
                : canRequest
                  ? "Talep Et"
                  : "Talep edilemez"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Request confirm */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Talebini onayla</DialogTitle>
            <DialogDescription>
              Bu eşyayı belediyenin güvenli teslim noktasında almayı kabul
              ediyorum. Hiçbir ödeme yapılmayacak.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl border bg-secondary/40 p-3 text-xs">
            <div className="flex items-center gap-2">
              <User2 className="h-3.5 w-3.5" /> Verici: {owner?.name}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Teslim: {handover?.name}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="brand" onClick={handleRequest}>
              Talebi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İlanı bildir</DialogTitle>
            <DialogDescription>
              Bildirimin belediye moderasyon ekibine iletilir.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            className="min-h-[100px] w-full rounded-xl border bg-card p-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-ring/40"
            placeholder="Sebep yaz..."
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() => {
                if (!reportText.trim()) return;
                reportItem(item.id, reportText.trim());
                setReportOpen(false);
                setReportText("");
                toast.success("Bildirimin alındı.");
              }}
            >
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
