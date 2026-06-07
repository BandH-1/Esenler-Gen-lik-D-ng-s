import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { AppBackground } from "./AppBackground";
import { PageTransition } from "@/components/common/PageTransition";
import {
  Home,
  Search,
  Plus,
  Inbox,
  ListChecks,
  MapPin,
  Coins,
  User,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  to:
    | "/"
    | "/ilanlar"
    | "/esya-ekle"
    | "/taleplerim"
    | "/ilanlarim"
    | "/teslim-noktalari"
    | "/puanlarim"
    | "/profil"
    | "/yonetim";
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const primaryNav: NavItem[] = [
  { to: "/", label: "Ana Sayfa", icon: Home, exact: true },
  { to: "/ilanlar", label: "İlanları Gör", icon: Search },
  { to: "/esya-ekle", label: "Eşya Ekle", icon: Plus },
  { to: "/taleplerim", label: "Taleplerim", icon: Inbox },
  { to: "/ilanlarim", label: "İlanlarım", icon: ListChecks },
];

const secondaryNav: NavItem[] = [
  { to: "/teslim-noktalari", label: "Teslim Noktaları", icon: MapPin },
  { to: "/puanlarim", label: "Eko-Puan", icon: Coins },
  { to: "/profil", label: "Profil", icon: User },
  { to: "/yonetim", label: "Yönetim", icon: ShieldCheck },
];

function NavLink({ to, label, icon: Icon, exact }: NavItem) {
  return (
    <li>
      <Link
        to={to}
        activeOptions={{ exact }}
        className="group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground data-[status=active]:text-primary-foreground"
      >
        {/* animated active background pill */}
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 rounded-xl bg-brand opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-10 group-data-[status=active]:scale-x-100 group-data-[status=active]:opacity-100" />
        <Icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 group-data-[status=active]:scale-110" />
        {label}
      </Link>
    </li>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AppBackground />
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-0 md:px-4 md:py-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-60 shrink-0 md:block">
          <nav className="rounded-2xl border bg-card/70 p-2.5 shadow-soft backdrop-blur-xl">
            <ul className="flex flex-col gap-0.5">
              {primaryNav.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
            </ul>
            <div className="my-2 px-3">
              <div className="h-px bg-border" />
            </div>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Hesap & Belediye
            </p>
            <ul className="flex flex-col gap-0.5">
              {secondaryNav.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
            </ul>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-28 md:px-0 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
