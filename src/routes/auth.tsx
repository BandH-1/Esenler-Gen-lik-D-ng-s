import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Recycle, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { BrandMark } from "@/components/common/BrandMark";
import { SafetyNote } from "@/components/common/SafetyNote";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Giriş Yap — eştakas" },
      { name: "description", content: "eştakas hesabına giriş yap veya yeni hesap oluştur." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Geçerli bir e-posta adresi gir.").max(255);
const passwordSchema = z.string().min(6, "Şifre en az 6 karakter olmalı.").max(72);
const nameSchema = z.string().trim().min(2, "İsim en az 2 karakter olmalı.").max(80);

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const eml = emailSchema.parse(email);
      const pwd = passwordSchema.parse(password);
      if (mode === "signup") {
        const nm = nameSchema.parse(fullName);
        const { error } = await supabase.auth.signUp({
          email: eml,
          password: pwd,
          options: {
            data: { full_name: nm },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        toast.success("Hesabın oluşturuldu. Hoş geldin!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: eml, password: pwd });
        if (error) throw error;
        toast.success("Giriş başarılı.");
      }
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0]?.message : err instanceof Error ? err.message : "Bir sorun oluştu.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) toast.error("Google ile giriş başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <Link to="/" className="anim-fade-down group flex items-center gap-2.5">
        <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-brand text-primary-foreground shadow-soft transition-transform duration-500 group-hover:scale-105">
          <Recycle className="h-5 w-5 transition-transform duration-700 group-hover:rotate-180" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold">eştakas</div>
          <div className="text-[11px] text-muted-foreground">Esenler Belediyesi · Esenlink</div>
        </div>
      </Link>

      <div className="grid gap-6 md:grid-cols-12 items-stretch">
        <div className="md:col-span-5 flex flex-col gap-4 justify-between rounded-3xl border bg-card/85 p-6 shadow-card backdrop-blur-sm anim-scale-in">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-secondary/35 shadow-soft max-h-[220px]">
              <img 
                src="https://img.internethaber.com/rcman/Cw400h400q95_95/storage/files/images/2020/12/30/tevfik-goksu-c9Wz_cover.jpg" 
                alt="Mehmet Tevfik Göksu" 
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 text-white">
                <div className="font-display text-xs font-bold leading-none">Mehmet Tevfik Göksu</div>
                <div className="text-[9px] opacity-90 mt-1 leading-none">Esenler Belediye Başkanı</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative rounded-xl bg-secondary/40 p-3 border border-border/50">
                <blockquote className="text-[12px] italic text-foreground/90 leading-relaxed font-medium">
                  "Paylaştığın senindir, biriktirdiğin değil."
                </blockquote>
                <cite className="mt-1.5 block text-[10px] font-bold text-muted-foreground not-italic">
                  — Mevlânâ Celâleddîn-i Rûmî
                </cite>
              </div>

              <div className="relative rounded-xl bg-secondary/40 p-3 border border-border/50">
                <blockquote className="text-[12px] italic text-foreground/90 leading-relaxed font-medium">
                  "İnsanlar sevilmek için yaratıldılar. Eşyalar ise kullanılmak için. Dünyadaki kaosun nedeni; eşyaların sevilmeleri ve insanların kullanılmalarıdır."
                </blockquote>
                <cite className="mt-1.5 block text-[10px] font-bold text-muted-foreground not-italic">
                  — Cemil Meriç
                </cite>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-muted-foreground text-center pt-3 border-t">
            Esenler Belediyesi Sosyal Dayanışma ve Paylaşım Projesidir.
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-center rounded-3xl border bg-card/85 p-6 shadow-card backdrop-blur-sm anim-scale-in" style={{ animationDelay: "80ms" }}>
          <h1 className="font-display text-xl font-bold tracking-tight">
            {mode === "signin" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esenler'de yaşayan veya okuyan gençler için ücretsiz paylaşım platformu.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border bg-background/60 px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.5 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Google ile devam et
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            veya
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ad Soyad</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                  placeholder="Elif Demir"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="ornek@okul.edu.tr"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)] active:scale-[0.98] disabled:opacity-50"
            >
              {mode === "signin" ? "Giriş Yap" : "Hesap Oluştur"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
          >
            {mode === "signin"
              ? "Hesabın yok mu? Yeni hesap oluştur"
              : "Zaten hesabın var mı? Giriş yap"}
          </button>
        </div>
      </div>

      <SafetyNote />
      <p className="text-center text-[11px] text-muted-foreground">
        <ShieldCheck className="mr-1 inline h-3 w-3" />
        Hesabın belediye sistemine güvenli şekilde bağlanır. Adres, telefon ve ödeme bilgisi paylaşılmaz.
      </p>

      <style>{`.auth-input{margin-top:4px;width:100%;border:1px solid var(--border);border-radius:12px;background:color-mix(in oklch, var(--background) 60%, transparent);padding:10px 12px;font-size:14px;outline:none;transition:border-color .25s, box-shadow .25s}.auth-input:focus{border-color:color-mix(in oklch, var(--primary) 40%, transparent);box-shadow:0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)}`}</style>
    </div>
  );
}
