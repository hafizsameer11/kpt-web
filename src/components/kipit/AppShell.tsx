import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  TrendingUp,
  Compass,
  PieChart,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

type Tab = { label: string; to: string; icon: LucideIcon };

const TABS: Tab[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop top navigation */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/90 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Logo className="text-2xl" />
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.to;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
            </button>
            <div className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
              AO
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-0 md:px-6 md:pb-16 md:pt-8">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = pathname === tab.to;
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    active ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-2xl transition-colors ${
                      active ? "bg-accent" : ""
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
