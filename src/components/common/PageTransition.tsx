import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Re-mounts its children on every pathname change (via `key`) so the
 * `.page-enter` CSS animation replays — giving each route a smooth entrance.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
