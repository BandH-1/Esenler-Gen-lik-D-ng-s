import { useState } from "react";
import { MessageCircle, ShieldAlert, ShieldCheck, Send, Ban } from "lucide-react";
import { toast } from "sonner";
import { useStore, useCurrentUser, STRIKE_LIMIT } from "@/lib/mock/store";
import { Button } from "@/components/ui/button";

const MAX_LEN = 280;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} gün önce`;
  return `${Math.floor(d / 30)} ay önce`;
}

export function CommentSection({ itemId }: { itemId: string }) {
  // Stable selectors — filter in render (never return a fresh array here).
  const comments = useStore((s) => s.comments);
  const users = useStore((s) => s.users);
  const addComment = useStore((s) => s.addComment);
  const me = useCurrentUser();

  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "blocked" | "error";
    message: string;
  } | null>(null);

  const thread = comments
    .filter((c) => c.itemId === itemId && c.status === "yayinda")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const strikes = me.strikes ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const res = addComment(itemId, value);
    if (res.status === "published") {
      setText("");
      setFeedback(null);
      toast.success(res.message);
    } else if (res.status === "blocked") {
      setFeedback({ kind: "blocked", message: res.message });
      toast.warning(res.message);
    } else if (res.status === "banned") {
      setText("");
      setFeedback(null);
      toast.error(res.message);
    } else {
      setFeedback({ kind: "error", message: res.message });
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border bg-card/70 p-4 shadow-soft backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <MessageCircle className="h-5 w-5 text-primary" />
          Soru & Yorumlar
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
            {thread.length}
          </span>
        </h2>
      </div>

      {/* Rules hint */}
      <div className="flex items-start gap-2 rounded-2xl bg-accent/10 p-3 text-[11px] leading-relaxed text-accent-foreground ring-1 ring-accent/20">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          Saygılı ol. <b>Satış, ödeme, telefon/adres paylaşımı ve hakaret yasaktır</b> —
          bu tür içerikler otomatik engellenir, tekrarı hesabını askıya alır.
        </span>
      </div>

      {/* Composer or ban notice */}
      {me.banned ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
            <Ban className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-destructive">Hesabın askıya alındı</p>
            <p className="mt-0.5 text-muted-foreground">
              {me.banReason ??
                "Topluluk kurallarını ihlal ettiğin için yorum yapamazsın."}{" "}
              İtiraz için belediye moderasyon ekibiyle iletişime geçebilirsin.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <div className="flex gap-2.5">
            <div
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-soft"
              style={{ backgroundColor: me.avatarColor }}
            >
              {me.name[0]}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value.slice(0, MAX_LEN));
                  if (feedback) setFeedback(null);
                }}
                rows={2}
                placeholder="Ürün hakkında bir soru sor veya yorum yaz..."
                className="w-full resize-none rounded-2xl border bg-background/60 p-3 text-sm outline-none transition-all duration-300 focus:border-primary/40 focus:ring-2 focus:ring-ring/40"
              />
              {feedback && (
                <div className="anim-fade-up mt-1.5 flex items-start gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-medium text-destructive ring-1 ring-destructive/20">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">
                    {text.length}/{MAX_LEN}
                  </span>
                  {strikes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-warning-foreground">
                      <ShieldAlert className="h-3 w-3" />
                      Uyarı {strikes}/{STRIKE_LIMIT}
                    </span>
                  )}
                </div>
                <Button type="submit" size="sm" variant="brand" disabled={!text.trim()}>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Gönder
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Thread */}
      <div className="flex flex-col gap-2.5">
        {thread.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card/40 p-5 text-center text-sm text-muted-foreground">
            Henüz yorum yok. İlk soruyu sen sor!
          </p>
        ) : (
          thread.map((c, i) => {
            const author = users.find((u) => u.id === c.userId);
            const mine = c.userId === me.id;
            return (
              <div
                key={c.id}
                className="anim-fade-up flex gap-2.5 rounded-2xl border bg-card/80 p-3 shadow-soft"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-soft"
                  style={{ backgroundColor: author?.avatarColor ?? "#64748b" }}
                >
                  {author?.name?.[0] ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold">
                      {author?.name ?? "Bilinmeyen"}
                    </span>
                    {author?.verificationStatus === "dogrulanmis" && (
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    )}
                    {mine && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                        Sen
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      · {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
