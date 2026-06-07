import { Link } from "@tanstack/react-router";
import { Recycle, Coins, LogIn, LogOut } from "lucide-react";
import { useCurrentUser } from "@/lib/mock/store";
import { useAuth, useProfile, signOut } from "@/hooks/use-auth";

export function Header() {
  const mockUser = useCurrentUser();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const balance = profile?.eco_point_balance ?? mockUser.ecoPointBalance;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      {/* gradient hairline */}
      <div className="h-0.5 w-full bg-brand opacity-80" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand text-primary-foreground shadow-soft transition-transform duration-500 group-hover:scale-105">
            <Recycle className="h-5 w-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-180" />
            <span className="shimmer-sweep absolute inset-0" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm font-bold tracking-tight">
              Gençlik Döngüsü
            </div>
            <div className="hidden truncate text-[10px] text-muted-foreground sm:block">
              Esenler Belediyesi · Esenlink
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/puanlarim"
            aria-label={`${balance} Eko-Puan`}
            className="group flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/12 px-3 py-1.5 text-xs font-semibold text-accent-foreground ring-1 ring-accent/25 transition-all duration-300 hover:bg-accent/20 hover:ring-accent/40 active:scale-95"
          >
            <Coins className="h-3.5 w-3.5 text-accent transition-transform duration-500 group-hover:rotate-[20deg]" />
            <span className="tabular-nums">{balance}</span>
            <span className="hidden sm:inline">Eko-Puan</span>
            <span className="sm:hidden">EP</span>
          </Link>
          {user ? (
            <button
              onClick={() => signOut()}
              aria-label="Çıkış yap"
              title="Çıkış yap"
              className="grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground active:scale-90"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              aria-label="Giriş yap"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:bg-muted active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Giriş</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
