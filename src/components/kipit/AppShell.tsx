import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  TrendingUp,
  Compass,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { DashboardSidebar, DashboardTopBar } from "./DashboardSidebar";

type Tab = { label: string; to: string; icon: LucideIcon };

const TABS: Tab[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function AppShell({
  children,
  title = "Dashboard",
  navVariant = "classic",
}: {
  children: ReactNode;
  title?: string;
  navVariant?: "classic" | "floating" | "morph" | "aurora";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop dashboard sidebar */}
      <DashboardSidebar />

      <div className="md:pl-64">
        <DashboardTopBar title={title} />

        <main className="w-full px-4 pb-28 pt-0 md:px-8 md:pb-16 md:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {navVariant === "morph" ? (
        /* Morphing bar: the active tab expands into a navy pill with its label */
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
          <ul className="flex items-center justify-between gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.to;
              const Icon = tab.icon;
              return (
                <li key={tab.to} className={active ? "flex-1" : ""}>
                  <Link
                    to={tab.to}
                    aria-label={tab.label}
                    className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-all duration-300 ${
                      active
                        ? "bg-brand-gradient px-4 text-primary-foreground shadow-float"
                        : "px-3 text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                    {active && <span className="truncate">{tab.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : navVariant === "floating" ? (
        /* Floating pill dock with gold active pill */
        <nav className="fixed inset-x-4 bottom-4 z-40 md:hidden">
          <ul className="grid grid-cols-5 rounded-full border border-border bg-surface/95 p-1.5 shadow-float backdrop-blur">
            {TABS.map((tab) => {
              const active = pathname === tab.to;
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-bold transition-colors ${
                      active
                        ? "bg-gold-gradient text-gold-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4.5" strokeWidth={active ? 2.4 : 1.8} />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
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
      )}
    </div>
  );
}
