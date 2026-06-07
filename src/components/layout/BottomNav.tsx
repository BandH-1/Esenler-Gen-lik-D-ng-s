import { Link } from "@tanstack/react-router";
import { Home, Search, Plus, Inbox, User } from "lucide-react";

type NavItem = {
  to: "/" | "/ilanlar" | "/esya-ekle" | "/taleplerim" | "/profil";
  label: string;
  icon: typeof Home;
  exact?: boolean;
  fab?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Ana Sayfa", icon: Home, exact: true },
  { to: "/ilanlar", label: "İlanlar", icon: Search },
  { to: "/esya-ekle", label: "Ekle", icon: Plus, fab: true },
  { to: "/taleplerim", label: "Taleplerim", icon: Inbox },
  { to: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-md px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <ul className="flex items-end justify-between rounded-[1.6rem] border border-border/60 bg-background/80 px-2 py-1.5 shadow-lift backdrop-blur-xl">
          {items.map((it) => {
            const Icon = it.icon;
            if (it.fab) {
              return (
                <li key={it.to} className="flex-1">
                  <Link
                    to={it.to}
                    aria-label={it.label}
                    className="group mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-[var(--glow-primary)] ring-4 ring-background transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
                  >
                    <Icon className="h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-90" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={it.to} className="flex-1">
                <Link
                  to={it.to}
                  activeOptions={{ exact: it.exact }}
                  className="group flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors duration-300 data-[status=active]:text-primary"
                >
                  <span className="relative flex h-6 items-center">
                    <Icon className="h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-data-[status=active]:-translate-y-0.5 group-data-[status=active]:scale-110" />
                  </span>
                  {it.label}
                  <span className="h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity duration-300 group-data-[status=active]:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
