import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Recycle,
  ShieldCheck,
  Check,
  X,
  Flag,
  Settings,
  Download,
  Snowflake,
  RotateCcw,
  RefreshCw,
  FileText,
  MessageCircle,
  Ban,
  UserCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/mock/store";
import {
  CATEGORY_LABELS,
  HANDOVER_TYPE_LABELS,
  type Category,
} from "@/lib/mock/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactStat } from "@/components/common/ImpactStat";
import { Reveal } from "@/components/common/Reveal";
import { VIOLATION_LABELS } from "@/lib/moderation";
import { StatusBadge } from "@/components/items/StatusBadge";
import { EsenlinkBadge } from "@/components/common/EsenlinkBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  TX_STATUS_LABELS,
  TX_SYNC_FROM_STATUS,
  TX_TYPE_LABELS,
  downloadCsv,
  downloadTxPdf,
  fetchTransactions,
  monthlySummary,
  type EcoTx,
} from "@/lib/eco-points";

export const Route = createFileRoute("/yonetim")({
  head: () => ({
    meta: [
      { title: "Belediye Yönetim Paneli — Gençlik Döngüsü" },
      {
        name: "description",
        content:
          "Esenler Belediyesi yöneticileri için ilan moderasyonu, güvenli teslim, Eko-Puan ve döngüsel etki paneli.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const items = useStore((s) => s.items);
  const requests = useStore((s) => s.requests);
  const reports = useStore((s) => s.reports);
  const transactions = useStore((s) => s.pointTransactions);
  const handoverPoints = useStore((s) => s.handoverPoints);
  const users = useStore((s) => s.users);
  const comments = useStore((s) => s.comments);
  const moderationEvents = useStore((s) => s.moderationEvents);
  const unbanUser = useStore((s) => s.unbanUser);

  const totalListings = items.length;
  const activeListings = items.filter((i) => i.status === "aktif").length;
  const pendingMod = items.filter((i) => i.status === "incelemede").length;
  const completed = requests.filter((r) => r.status === "tamamlandi").length;
  const safeHandovers = completed;
  const openReports = reports.filter((r) => r.status === "acik").length;
  const distributedPoints = transactions
    .filter((t) => t.status === "tamamlandi")
    .reduce((a, b) => a + b.points, 0);
  const reusedItems = completed + 121;
  const wastePrevented = (reusedItems * 1.4).toFixed(0);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="anim-fade-up flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-soft">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Belediye Yönetim Paneli
          </h1>
          <p className="text-sm text-muted-foreground">
            Esenler Belediyesi · Gençlik Döngüsü
          </p>
        </div>
      </div>

      {/* Top metrics */}
      <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <ImpactStat
          label="Toplam İlan"
          value={totalListings}
          icon={<Package className="h-5 w-5" />}
          accent="primary"
        />
        <ImpactStat
          label="Aktif İlan"
          value={activeListings}
          icon={<Package className="h-5 w-5" />}
          accent="accent"
        />
        <ImpactStat
          label="Bekleyen Moderasyon"
          value={pendingMod}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="warning"
        />
        <ImpactStat
          label="Güvenli Teslim"
          value={safeHandovers}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="accent"
        />
        <ImpactStat
          label="Dağıtılan Eko-Puan"
          value={distributedPoints}
          icon={<Coins className="h-5 w-5" />}
          accent="warning"
        />
        <ImpactStat
          label="Önlenen Atık (kg)"
          value={wastePrevented}
          icon={<Recycle className="h-5 w-5" />}
          accent="primary"
        />
      </Reveal>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="moderation">Moderasyon</TabsTrigger>
          <TabsTrigger value="reports">Şikayetler</TabsTrigger>
          <TabsTrigger value="handovers">Teslimler</TabsTrigger>
          <TabsTrigger value="points">Eko-Puan</TabsTrigger>
          <TabsTrigger value="community">Topluluk</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="settings">Politikalar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="moderation" className="mt-4">
          <ModerationTab />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="handovers" className="mt-4">
          <HandoversTab />
        </TabsContent>
        <TabsContent value="points" className="mt-4">
          <PointsTab />
        </TabsContent>
        <TabsContent value="community" className="mt-4">
          <CommunityTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <ExportButton label="İlan Raporu CSV" />
        <ExportButton label="Eko-Puan Raporu" />
        <ExportButton label="Etki Raporu" />
        <ExportButton label="Güvenli Teslim Raporu" />
      </div>
    </div>
  );

  function OverviewTab() {
    const categoryData = (Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({
      name: CATEGORY_LABELS[c].split(" ")[0],
      Adet: items.filter((i) => i.category === c).length,
    }));

    const neighborhoodCounts: Record<string, number> = {};
    items.forEach((i) => {
      neighborhoodCounts[i.neighborhood] =
        (neighborhoodCounts[i.neighborhood] ?? 0) + 1;
    });
    const topNeighborhoods = Object.entries(neighborhoodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const monthly = [
      { ay: "Şub", Puan: 180 },
      { ay: "Mar", Puan: 240 },
      { ay: "Nis", Puan: 320 },
      { ay: "May", Puan: 410 },
      { ay: "Haz", Puan: 380 },
      { ay: "Tem", Puan: distributedPoints },
    ];

    return (
      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-1 text-sm font-semibold">Döngüsel Etki</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Tahmini {reusedItems} ürün yeniden kullanıma kazandırıldı.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile label="Kitap" value={64} />
            <Tile label="Kıyafet" value={38} />
            <Tile label="Elektronik" value={19} />
            <Tile label="Tahmini aile tasarrufu" value={`₺${reusedItems * 180}`} />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Kategori Dağılımı">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="Adet" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Aylık Eko-Puan">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ay" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="Puan"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">En Aktif Mahalleler</h2>
            <ul className="space-y-2">
              {topNeighborhoods.map(([n, c]) => (
                <li key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-28 truncate">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(c / topNeighborhoods[0][1]) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-muted-foreground">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Top Veren Gençler</h2>
            <ul className="space-y-2">
              {users
                .filter((u) => u.userType === "ogrenci")
                .sort((a, b) => b.ecoPointBalance - a.ecoPointBalance)
                .slice(0, 5)
                .map((u, i) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/40 p-2 text-sm"
                  >
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {u.neighborhood}
                      </div>
                    </div>
                    <span className="font-display font-bold text-accent">
                      {u.ecoPointBalance}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  function ModerationTab() {
    const approveItem = useStore((s) => s.approveItem);
    const rejectItem = useStore((s) => s.rejectItem);
    const removeItem = useStore((s) => s.removeItem);
    const [filter, setFilter] = useState<
      "incelemede" | "aktif" | "reddedildi" | "kaldirildi" | "tamamlandi"
    >("incelemede");
    const filtered = items.filter((i) => i.status === filter);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["incelemede", "Bekleyen"],
              ["aktif", "Aktif"],
              ["reddedildi", "Reddedilen"],
              ["kaldirildi", "Kaldırılan"],
              ["tamamlandi", "Tamamlanan"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 " +
                (filter === k
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-muted-foreground ring-border hover:bg-secondary")
              }
            >
              {l}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Ürün</th>
                <th className="px-3 py-2 text-left">Sahip</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Mahalle</th>
                <th className="px-3 py-2 text-left">Durum</th>
                <th className="px-3 py-2 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    Bu filtrede ilan yok.
                  </td>
                </tr>
              )}
              {filtered.map((i) => {
                const owner = users.find((u) => u.id === i.ownerId);
                return (
                  <tr key={i.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{i.images[0]}</span>
                        <span className="font-medium">{i.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">{owner?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {CATEGORY_LABELS[i.category]}
                    </td>
                    <td className="px-3 py-2 text-xs">{i.neighborhood}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        {i.status === "incelemede" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                approveItem(i.id);
                                toast.success("İlan onaylandı.");
                              }}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => {
                                rejectItem(i.id);
                                toast("İlan reddedildi.");
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {i.status === "aktif" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => {
                              removeItem(i.id);
                              toast("İlan kaldırıldı.");
                            }}
                          >
                            Kaldır
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ReportsTab() {
    return (
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Ürün</th>
              <th className="px-3 py-2 text-left">Şikayet</th>
              <th className="px-3 py-2 text-left">Bildiren</th>
              <th className="px-3 py-2 text-left">Durum</th>
              <th className="px-3 py-2 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  Aktif şikayet yok.
                </td>
              </tr>
            )}
            {reports.map((r) => {
              const item = items.find((i) => i.id === r.itemId);
              const reporter = users.find((u) => u.id === r.reporterId);
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item?.title ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.reason}</td>
                  <td className="px-3 py-2 text-xs">{reporter?.name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                      Açık
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast("Şikayet kapatıldı.")}
                      >
                        Kapat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => toast("Kullanıcı uyarıldı.")}
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function HandoversTab() {
    const hpActivity = handoverPoints.map((h) => {
      const reqs = requests.filter((r) => r.handoverPointId === h.id);
      return {
        ...h,
        completed: reqs.filter((r) => r.status === "tamamlandi").length,
        pending: reqs.filter((r) => r.status === "qr-hazir").length,
        total: reqs.length,
      };
    });

    return (
      <div className="flex flex-col gap-4">
        <section className="overflow-x-auto rounded-2xl border bg-card">
          <h3 className="px-4 pt-3 text-sm font-semibold">Aktif Teslimler</h3>
          <table className="mt-2 w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Ürün</th>
                <th className="px-3 py-2 text-left">QR Kodu</th>
                <th className="px-3 py-2 text-left">Teslim Noktası</th>
                <th className="px-3 py-2 text-left">Durum</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const it = items.find((i) => i.id === r.itemId);
                const hp = handoverPoints.find(
                  (h) => h.id === r.handoverPointId,
                );
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-medium">
                      {it?.title ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <code className="rounded bg-secondary px-1.5 py-0.5 text-[11px]">
                        {r.qrCode}
                      </code>
                    </td>
                    <td className="px-3 py-2 text-xs">{hp?.name}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} kind="request" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="overflow-x-auto rounded-2xl border bg-card">
          <h3 className="px-4 pt-3 text-sm font-semibold">
            Güvenli Teslim Noktası Performansı
          </h3>
          <table className="mt-2 w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Nokta</th>
                <th className="px-3 py-2 text-left">Mahalle</th>
                <th className="px-3 py-2 text-left">Tür</th>
                <th className="px-3 py-2 text-right">Tamamlanan</th>
                <th className="px-3 py-2 text-right">Bekleyen</th>
                <th className="px-3 py-2 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {hpActivity.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{h.name}</td>
                  <td className="px-3 py-2 text-xs">{h.neighborhood}</td>
                  <td className="px-3 py-2 text-xs">
                    {HANDOVER_TYPE_LABELS[h.type]}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-accent">
                    {h.completed}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-warning-foreground">
                    {h.pending}
                  </td>
                  <td className="px-3 py-2 text-right">{h.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  function PointsTab() {
    const qc = useQueryClient();
    const { data: liveTx = [], isLoading } = useQuery({
      queryKey: ["admin-eco-tx"],
      queryFn: () => fetchTransactions(),
    });
    const { data: profilesMap = {} } = useQuery({
      queryKey: ["admin-profiles-map"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email");
        if (error) throw error;
        const m: Record<string, { name: string; email: string | null }> = {};
        (data ?? []).forEach((p) => {
          m[p.id] = { name: p.full_name || p.email || "—", email: p.email };
        });
        return m;
      },
    });

    const monthly = useMemo(() => monthlySummary(liveTx), [liveTx]);

    const exportRows = liveTx.map((t) => ({
      Tarih: new Date(t.created_at).toLocaleString("tr-TR"),
      Kullanıcı: profilesMap[t.user_id]?.name ?? t.user_id.slice(0, 8),
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

    async function updateTxStatus(t: EcoTx, status: EcoTx["status"]) {
      const { error } = await supabase
        .from("eco_point_transactions")
        .update({ status })
        .eq("id", t.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["admin-eco-tx"] });
      qc.invalidateQueries({ queryKey: ["eco-tx"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    }

    async function reverseTx(t: EcoTx) {
      const { error } = await supabase.from("eco_point_transactions").insert({
        user_id: t.user_id,
        points: Math.abs(t.points),
        transaction_type: "penalty",
        status: "completed",
        item_id: t.item_id,
        handover_id: t.handover_id,
        reason: `Geri alındı: ${t.reason ?? "—"}`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["admin-eco-tx"] });
      qc.invalidateQueries({ queryKey: ["eco-tx"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    }

    return (
      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Aylık Eko-Puan Özeti</h3>
              <p className="text-[11px] text-muted-foreground">
                Canlı veritabanından — bakiyeler otomatik senkronlanır.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!liveTx.length}
                onClick={() => {
                  downloadCsv(
                    `eko-puan-islemleri-${new Date().toISOString().slice(0, 10)}.csv`,
                    exportRows,
                  );
                  toast.success("CSV indiriliyor.");
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> İşlem CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!summaryRows.length}
                onClick={() => {
                  downloadCsv(
                    `eko-puan-aylik-${new Date().toISOString().slice(0, 10)}.csv`,
                    summaryRows,
                  );
                  toast.success("Aylık özet CSV indiriliyor.");
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Aylık CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!liveTx.length}
                onClick={() => {
                  downloadTxPdf(
                    `eko-puan-raporu-${new Date().toISOString().slice(0, 10)}.pdf`,
                    "Eko-Puan Islem ve Aylik Ozet Raporu",
                    exportRows,
                    summaryRows,
                  );
                  toast.success("PDF indiriliyor.");
                }}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
              </Button>
            </div>
          </div>
          {monthly.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Henüz işlem yok.
            </p>
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
                      <td className="px-2 py-1.5 text-right text-accent">
                        +{m.earned}
                      </td>
                      <td className="px-2 py-1.5 text-right text-warning-foreground">
                        {m.pending}
                      </td>
                      <td className="px-2 py-1.5 text-right text-destructive">
                        −{m.penalty}
                      </td>
                      <td className="px-2 py-1.5 text-right font-bold">
                        {m.net}
                      </td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">
                        {m.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Açıklama</th>
                <th className="px-3 py-2 text-left">Kullanıcı</th>
                <th className="px-3 py-2 text-right">Puan</th>
                <th className="px-3 py-2 text-left">Durum</th>
                <th className="px-3 py-2 text-left">Esenlink</th>
                <th className="px-3 py-2 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!isLoading && liveTx.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    Henüz Eko-Puan işlemi yok. (Staff yetkisi yoksa yalnızca
                    kendi işlemlerin görünür.)
                  </td>
                </tr>
              )}
              {liveTx.map((t) => {
                const sync = TX_SYNC_FROM_STATUS(t.status);
                return (
                  <tr key={t.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium">
                        {t.reason ?? TX_TYPE_LABELS[t.transaction_type]}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {profilesMap[t.user_id]?.name ?? t.user_id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-right font-display font-bold">
                      {t.transaction_type === "penalty" ? "−" : "+"}
                      {t.points}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {TX_STATUS_LABELS[t.status]}
                    </td>
                    <td className="px-3 py-2">
                      <EsenlinkBadge sync={sync} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        {t.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateTxStatus(t, "synced_to_esenlink").then(() =>
                                toast.success("Yeniden senkronize edildi."),
                              )
                            }
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateTxStatus(t, "failed").then(() =>
                              toast("Puan donduruldu."),
                            )
                          }
                        >
                          <Snowflake className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() =>
                            reverseTx(t).then(() =>
                              toast("Puan geri alındı."),
                            )
                          }
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }




  function CommunityTab() {
    const userName = (id: string) =>
      users.find((u) => u.id === id)?.name ?? id.slice(0, 6);
    const bannedUsers = users.filter((u) => u.banned);
    const publishedCount = comments.filter((c) => c.status === "yayinda").length;
    const blockedCount = moderationEvents.filter(
      (e) => e.type === "engellendi",
    ).length;
    const TYPE_LABELS: Record<string, string> = {
      engellendi: "İçerik engellendi",
      ban: "Otomatik ban",
      "ban-kaldirildi": "Ban kaldırıldı",
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Yayında yorum" value={publishedCount} />
          <Tile label="Engellenen içerik" value={blockedCount} />
          <Tile label="Askıdaki hesap" value={bannedUsers.length} />
        </div>

        {/* Banned users */}
        <section className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Ban className="h-4 w-4 text-destructive" />
            Askıya Alınan Hesaplar
          </h3>
          {bannedUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Askıya alınmış hesap yok.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {bannedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-destructive/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: u.avatarColor }}
                    >
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {u.banReason ?? "Topluluk kuralı ihlali"}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      unbanUser(u.id);
                      toast.success(`${u.name} hesabının banı kaldırıldı.`);
                    }}
                  >
                    <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Banı Kaldır
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Moderation log */}
        <section className="overflow-x-auto rounded-2xl border bg-card">
          <h3 className="flex items-center gap-2 px-4 pt-3 text-sm font-semibold">
            <MessageCircle className="h-4 w-4 text-primary" />
            Moderasyon Günlüğü
          </h3>
          <table className="mt-2 w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Kullanıcı</th>
                <th className="px-3 py-2 text-left">Olay</th>
                <th className="px-3 py-2 text-left">Sebep</th>
                <th className="px-3 py-2 text-left">İçerik</th>
                <th className="px-3 py-2 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {moderationEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    Henüz moderasyon kaydı yok.
                  </td>
                </tr>
              )}
              {moderationEvents.map((e) => (
                <tr key={e.id} className="border-t align-top">
                  <td className="px-3 py-2 font-medium">{userName(e.userId)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                        (e.type === "ban"
                          ? "bg-destructive/15 text-destructive"
                          : e.type === "ban-kaldirildi"
                            ? "bg-accent/15 text-accent"
                            : "bg-warning/20 text-warning-foreground")
                      }
                    >
                      {TYPE_LABELS[e.type] ?? e.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {e.violations.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      ) : (
                        e.violations.map((v) => (
                          <span
                            key={v}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                          >
                            {VIOLATION_LABELS[v]}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-2 max-w-[18rem] text-xs text-muted-foreground">
                      {e.text ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-[11px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  function UsersTab() {
    return (
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">İsim</th>
              <th className="px-3 py-2 text-left">Okul</th>
              <th className="px-3 py-2 text-left">Mahalle</th>
              <th className="px-3 py-2 text-left">Doğrulama</th>
              <th className="px-3 py-2 text-right">Güven</th>
              <th className="px-3 py-2 text-right">Puan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2 text-xs capitalize">
                  {u.schoolType.replace("-", " ")}
                </td>
                <td className="px-3 py-2 text-xs">{u.neighborhood}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      {u.verificationStatus === "dogrulanmis"
                        ? "Doğrulandı"
                        : "Bekliyor"}
                    </span>
                    {u.banned && (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        Askıda
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {u.trustScore}
                </td>
                <td className="px-3 py-2 text-right font-display font-bold text-accent">
                  {u.ecoPointBalance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function SettingsTab() {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Platform Kuralları</h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Satış yasak — yalnızca ücretsiz takas</li>
            <li>✓ Ödeme talebi yasak</li>
            <li>✓ Kargo yok — sadece güvenli noktada teslim</li>
            <li>✓ Adres paylaşımı yasak</li>
            <li>✓ Belediye güvenli teslim noktası zorunlu</li>
            <li>✓ QR onayı zorunlu</li>
            <li>✓ Puan yalnızca tamamlanan teslimattan sonra</li>
          </ul>
        </section>
        <section className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-1 text-sm font-semibold">
            <Settings className="h-4 w-4" /> Politika Ayarları
          </h3>
          <ul className="space-y-2 text-xs">
            <Row label="Kullanıcı başına maks. aktif ilan" value="10" />
            <Row label="Aylık maks. Eko-Puan" value="500" />
            <Row label="İlan süresi" value="30 gün" />
            <Row label="Minimum güven skoru (oto-onay)" value="80" />
            <Row label="İzinli kategoriler" value="6 kategori" />
            <Row label="Yasak kelimeler" value="42 kelime" />
          </ul>
        </section>
      </div>
    );
  }
}

function ExportButton({ label }: { label: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toast.success(`${label} dışa aktarıldı (demo).`)}
    >
      <Download className="mr-1.5 h-3.5 w-3.5" /> {label}
    </Button>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="font-display text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
