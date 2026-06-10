import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, MapPin, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock/store";
import type { RequestStatus, ExchangeRequest } from "@/lib/mock/types";
import { StatusBadge } from "@/components/items/StatusBadge";
import { QrPlaceholder } from "@/components/handover/QrPlaceholder";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/taleplerim")({
  head: () => ({
    meta: [
      { title: "Taleplerim — eştakas" },
      { name: "description", content: "Talep ettiğin eşyaların durumu ve QR kodları." },
    ],
  }),
  component: RequestsPage,
});

const TAB_GROUPS: { key: string; label: string; statuses: RequestStatus[] }[] = [
  { key: "bekleyen", label: "Bekleyen", statuses: ["talep-edildi"] },
  { key: "onayli", label: "Onaylı", statuses: ["onaylandi"] },
  { key: "qr", label: "QR Hazır", statuses: ["qr-hazir"] },
  { key: "tamam", label: "Tamamlanan", statuses: ["tamamlandi"] },
  { key: "iptal", label: "İptal", statuses: ["iptal", "suresi-doldu"] },
];

function RequestsPage() {
  const currentUserId = useStore((s) => s.currentUserId);
  // Select the stable array and filter in render (a fresh array from the
  // selector makes useSyncExternalStore loop infinitely).
  const allRequests = useStore((s) => s.requests);
  const requests = allRequests.filter((r) => r.requesterId === currentUserId);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Taleplerim</h1>
        <p className="text-sm text-muted-foreground">
          Talep ettiğin ürünlerin durumunu buradan takip et.
        </p>
      </div>

      <Tabs defaultValue="bekleyen">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TAB_GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_GROUPS.map((g) => {
          const list = requests.filter((r) => g.statuses.includes(r.status));
          return (
            <TabsContent key={g.key} value={g.key} className="mt-4">
              {list.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-5 w-5" />}
                  title="Burada talep yok"
                  description="İlanlardan eşya talep ettiğinde bu sekmeye düşer."
                  action={
                    <Link
                      to="/ilanlar"
                      className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)]"
                    >
                      İlanları Gör
                    </Link>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {list.map((r, i) => (
                    <Reveal key={r.id} delay={i * 60}>
                      <RequestCard request={r} />
                    </Reveal>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function RequestCard({ request }: { request: ExchangeRequest }) {
  const item = useStore((s) => s.items.find((i) => i.id === request.itemId));
  const owner = useStore((s) => s.users.find((u) => u.id === request.ownerId));
  const handover = useStore((s) => s.handoverPoints.find((h) => h.id === request.handoverPointId));
  const approve = useStore((s) => s.markQrReady);
  const complete = useStore((s) => s.completeRequest);
  const cancel = useStore((s) => s.cancelRequest);

  if (!item) return null;

  return (
    <div className="hover-lift flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-soft backdrop-blur-sm sm:flex-row">
      <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary to-background text-4xl shadow-soft">
        {item.images[0]}
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{item.title}</h3>
          <StatusBadge status={request.status} kind="request" />
        </div>
        <div className="text-xs text-muted-foreground">Verici: {owner?.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {handover?.name}
        </div>
        {request.status === "onaylandi" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              approve(request.id);
              toast.success("QR oluşturuldu. Teslim noktasında okutabilirsin.");
            }}
          >
            QR Oluştur (Demo)
          </Button>
        )}
        {request.status === "qr-hazir" && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <QrPlaceholder code={request.qrCode} size={120} />
            <Button
              size="sm"
              variant="brand"
              onClick={() => {
                complete(request.id);
                toast.success("Teslim tamamlandı. Vericinin Eko-Puanı eklendi.");
              }}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Tamamlandı Olarak İşaretle
            </Button>
          </div>
        )}
        {(request.status === "talep-edildi" || request.status === "onaylandi") && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              cancel(request.id);
              toast("Talep iptal edildi.");
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Talebi İptal Et
          </Button>
        )}
      </div>
    </div>
  );
}
