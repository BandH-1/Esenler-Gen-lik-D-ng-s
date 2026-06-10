import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Coins,
  Recycle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Gift,
  Info,
  Download,
  FileText,
  LogIn,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth, useProfile } from "@/hooks/use-auth";
import {
  TX_STATUS_LABELS,
  TX_SYNC_FROM_STATUS,
  TX_TYPE_LABELS,
  downloadCsv,
  downloadTxPdf,
  fetchTransactions,
  monthlySummary,
} from "@/lib/eco-points";
import { ImpactStat } from "@/components/common/ImpactStat";
import { EsenlinkBadge } from "@/components/common/EsenlinkBadge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/common/CountUp";
import { Reveal } from "@/components/common/Reveal";
import { useCurrentUser, useStore } from "@/lib/mock/store";
import {
  POINT_STATUS_LABELS,
  type EsenlinkSync,
  type PointTransaction,
  type User as MockUser,
} from "@/lib/mock/types";

export const Route = createFileRoute("/puanlarim")({
  head: () => ({
    meta: [
      { title: "Eko-Puan Cüzdanım — eştakas" },
      {
        name: "description",
        content:
          "Eko-Puan cüzdanın. Esenlink puan sistemine bağlı bakiye, bekleyen puanlar, dağıtılan puanlar ve çevresel etki.",
      },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile();
  const mockUser = useCurrentUser();
  const allMockTransactions = useStore((s) => s.pointTransactions);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["eco-tx", user?.id],
    enabled: !!user,
    queryFn: () => fetchTransactions({ userId: user!.id }),
  });

  if (authLoading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Yükleniyor…</div>;
  }

  if (!user) {
    return (
      <DemoWalletPage
        user={mockUser}
        transactions={allMockTransactions.filter((t) => t.userId === mockUser.id)}
      />
    );
  }

  const balance = profile?.eco_point_balance ?? 0;
  const completed = history.filter(
    (t) => t.status === "completed" || t.status === "synced_to_esenlink",
  );
  const pending = history.filter((t) => t.status === "pending");
  const totalEarned = completed.reduce((a, b) => a + b.points, 0);
  const pendingPoints = pending.reduce((a, b) => a + b.points, 0);
  const syncedPoints = history
    .filter((t) => t.status === "synced_to_esenlink")
    .reduce((a, b) => a + b.points, 0);

  const now = new Date();
  const thisMonth = completed
    .filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((a, b) => a + b.points, 0);
  const completedGives = completed.filter(
    (t) => t.transaction_type === "earned_from_giving",
  ).length;

  const monthly = monthlySummary(history);

  const exportRows = history.map((t) => ({
    Tarih: new Date(t.created_at).toLocaleString("tr-TR"),
    Tür: TX_TYPE_LABELS[t.transaction_type],
    Puan: t.points,
    Durum: TX_STATUS_LABELS[t.status],
    Açıklama: t.reason ?? "",
  }));
  const summaryRows = monthly.map((m) => ({
    Ay: m.label,
    Kazanılan: m.earned,
    Bekleyen: m.pending,
    Düşülen: m.penalty,
    Net: m.net,
    İşlem: m.count,
  }));

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Eko-Puan Cüzdanım</h1>
        <p className="text-sm text-muted-foreground">
          Eko-Puan yalnızca ürün veren kullanıcıya yüklenir. Puanların Esenlink sistemine aktarılır.
        </p>
      </div>

      {/* Hero balance card */}
      <div className="anim-scale-in relative overflow-hidden rounded-3xl border border-white/10 bg-brand p-6 text-primary-foreground shadow-lift">
        <div className="anim-float pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="anim-float-slow pointer-events-none absolute -bottom-14 left-6 h-36 w-36 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-white/25 backdrop-blur">
              <Coins className="h-3.5 w-3.5" /> Esenlink · Eko-Puan
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold ring-1 ring-white/25 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Bağlantı: Aktif
            </span>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80">
              Eko-Puanım
            </div>
            <div className="font-display text-6xl font-extrabold leading-tight tabular-nums">
              <CountUp value={balance} />
            </div>
          </div>
          {pendingPoints > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
              <Clock className="h-3 w-3" />
              Bekleyen Eko-Puan: +{pendingPoints}
            </div>
          )}
        </div>
      </div>

      {/* Quick metric grid */}
      <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ImpactStat
          label="Bu ay kazandığın"
          value={thisMonth}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="accent"
        />
        <ImpactStat
          label="Toplam kazanılan"
          value={totalEarned}
          icon={<Coins className="h-5 w-5" />}
          accent="primary"
        />
        <ImpactStat
          label="Esenlink'e aktarılan"
          value={syncedPoints}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="accent"
        />
        <ImpactStat
          label="Teslim edilen ürün"
          value={completedGives}
          icon={<Gift className="h-5 w-5" />}
          accent="warning"
        />
      </Reveal>

      {/* Environmental impact */}
      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Recycle className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold">Çevresel Etki</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Tile label="Yeniden kullanıma kazandırılan" value={completedGives} />
          <Tile label="Tahmini önlenen atık" value={`${(completedGives * 1.4).toFixed(1)} kg`} />
          <Tile label="Tahmini tasarruf" value={`₺${completedGives * 180}`} />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Tahminler ürün başına ortalama değerler kullanılarak hesaplanır.
        </p>
      </section>

      {/* Esenlink integration status */}
      <section className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Esenlink Entegrasyonu</h2>
        <div className="flex flex-wrap items-center gap-2">
          <EsenlinkBadge sync="synced" />
          <EsenlinkBadge sync="pending" />
          <EsenlinkBadge sync="failed" />
          <EsenlinkBadge sync="demo" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Esenlink entegrasyonu demo modunda gösterilmektedir. Puan bakiyen tamamlanan teslimattan
          sonra Esenlink hesabına otomatik aktarılır.
        </p>
      </section>

      {/* Monthly summary + export */}
      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Aylık Özet</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!history.length}
              onClick={() => {
                downloadCsv(`eko-puan-gecmisi-${user.id.slice(0, 6)}.csv`, exportRows);
                toast.success("CSV indiriliyor.");
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!history.length}
              onClick={() => {
                void downloadTxPdf(
                  `eko-puan-cuzdan-${user.id.slice(0, 6)}.pdf`,
                  `Eko-Puan Cuzdan Raporu — ${profile?.full_name ?? user.email ?? "Kullanici"}`,
                  exportRows,
                  summaryRows,
                )
                  .then(() => toast.success("PDF indiriliyor."))
                  .catch((err) =>
                    toast.error(err instanceof Error ? err.message : "PDF oluşturulamadı."),
                  );
              }}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
        {monthly.length === 0 ? (
          <p className="text-xs text-muted-foreground">Henüz bir işlem yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left">Ay</th>
                  <th className="px-2 py-1.5 text-right">Kazanılan</th>
                  <th className="px-2 py-1.5 text-right">Bekleyen</th>
                  <th className="px-2 py-1.5 text-right">Düşülen</th>
                  <th className="px-2 py-1.5 text-right">Net</th>
                  <th className="px-2 py-1.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month} className="border-t">
                    <td className="px-2 py-1.5 font-medium">{m.label}</td>
                    <td className="px-2 py-1.5 text-right text-accent">+{m.earned}</td>
                    <td className="px-2 py-1.5 text-right text-warning-foreground">{m.pending}</td>
                    <td className="px-2 py-1.5 text-right text-destructive">−{m.penalty}</td>
                    <td className="px-2 py-1.5 text-right font-bold">{m.net}</td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rules */}
      <section className="rounded-2xl border bg-warning/10 p-4 ring-1 ring-warning/20">
        <div className="mb-2 flex items-center gap-1.5 text-warning-foreground">
          <Info className="h-4 w-4" />
          <h2 className="text-sm font-semibold">Puan Kuralları</h2>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Puan kazanmak için teslimatın QR ile tamamlanması gerekir.</li>
          <li>• Başarısız veya iptal edilen teslimatlarda puan yüklenmez.</li>
          <li>• Belediye gerekli durumlarda şüpheli puanları incelemeye alabilir.</li>
        </ul>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Puan Geçmişi</h2>
        <div className="divide-y rounded-2xl border bg-card">
          {isLoading && (
            <div className="p-6 text-center text-sm text-muted-foreground">Yükleniyor…</div>
          )}
          {!isLoading && history.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Henüz Eko-Puan kazanmadın. Kullanmadığın bir ürünü paylaşarak başlayabilirsin.
            </div>
          )}
          {history.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {t.reason ?? TX_TYPE_LABELS[t.transaction_type]}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {new Date(t.created_at).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <EsenlinkBadge sync={TX_SYNC_FROM_STATUS(t.status)} />
                </div>
              </div>
              <div
                className={
                  "font-display text-base font-bold " +
                  (t.status === "pending"
                    ? "text-warning-foreground"
                    : t.transaction_type === "penalty"
                      ? "text-destructive line-through"
                      : "text-accent")
                }
              >
                {t.transaction_type === "penalty" ? "−" : "+"}
                {t.points}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function mockSyncFromStatus(status: PointTransaction["status"]): EsenlinkSync {
  if (status === "tamamlandi") return "synced";
  if (status === "bekliyor") return "pending";
  if (status === "donduruldu") return "failed";
  return "demo";
}

function DemoWalletPage({
  user,
  transactions,
}: {
  user: MockUser;
  transactions: PointTransaction[];
}) {
  const completed = transactions.filter((t) => t.status === "tamamlandi");
  const pending = transactions.filter((t) => t.status === "bekliyor");
  const totalEarned = completed.reduce((a, b) => a + b.points, 0);
  const pendingPoints = pending.reduce((a, b) => a + b.points, 0);
  const completedGives = completed.length;

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Eko-Puan Cüzdanım</h1>
        <p className="text-sm text-muted-foreground">
          Demo verileri gösteriliyor. Esenlink bakiyeni görmek için giriş yap.
        </p>
      </div>

      <div className="anim-scale-in relative overflow-hidden rounded-3xl border border-white/10 bg-brand p-6 text-primary-foreground shadow-lift">
        <div className="anim-float pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-white/25 backdrop-blur">
              <Coins className="h-3.5 w-3.5" /> Demo Eko-Puan
            </div>
            <Link to="/auth">
              <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs">
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Giriş
              </Button>
            </Link>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80">
              Eko-Puanım
            </div>
            <div className="font-display text-6xl font-extrabold leading-tight tabular-nums">
              <CountUp value={user.ecoPointBalance} />
            </div>
          </div>
          {pendingPoints > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
              <Clock className="h-3 w-3" />
              Bekleyen Eko-Puan: +{pendingPoints}
            </div>
          )}
        </div>
      </div>

      <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ImpactStat
          label="Toplam kazanılan"
          value={totalEarned}
          icon={<Coins className="h-5 w-5" />}
          accent="primary"
        />
        <ImpactStat
          label="Bekleyen"
          value={pendingPoints}
          icon={<Clock className="h-5 w-5" />}
          accent="warning"
        />
        <ImpactStat
          label="Esenlink'e aktarılan"
          value={totalEarned}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="accent"
        />
        <ImpactStat
          label="Teslim edilen ürün"
          value={completedGives}
          icon={<Gift className="h-5 w-5" />}
          accent="warning"
        />
      </Reveal>

      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Demo Modu</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Bu ekran giriş yapmadan uygulamanın çalışma şeklini göstermek için mock verileri kullanır.
          Gerçek bakiye ve transfer geçmişi Esenlink hesabıyla eşleştirilir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Puan Geçmişi</h2>
        <div className="divide-y rounded-2xl border bg-card">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Henüz Eko-Puan işlemi yok.
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.reason}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>
                      {new Date(t.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <EsenlinkBadge sync={mockSyncFromStatus(t.status)} />
                    <span>{POINT_STATUS_LABELS[t.status]}</span>
                  </div>
                </div>
                <div className="font-display text-base font-bold text-accent">+{t.points}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="font-display text-lg font-bold">{value}</div>
      <div className="text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}
