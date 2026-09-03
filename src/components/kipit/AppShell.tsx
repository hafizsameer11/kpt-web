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
  navVariant?: "classic" | "floating" | "morph" | "aurora" | "elevated" | "orbit";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" || pathname.startsWith("/home-v") : pathname === to;
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => isActive(t.to)),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop dashboard sidebar */}
      <DashboardSidebar />

      <div className="md:pl-[17rem]">
        <DashboardTopBar title={title} />

        <main className="mx-auto w-full max-w-[1360px] px-4 pb-28 pt-0 md:px-8 md:pb-16 md:pt-7">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {navVariant === "orbit" ? (
        /* Orbit dock: deep navy glass bar, active tab orbits into a gold squircle */
        <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <ul className="grid grid-cols-5 items-end gap-0.5 rounded-xl bg-brand-gradient px-2 pb-2.5 pt-3 shadow-float ring-1 ring-white/10">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    aria-label={tab.label}
                    className="flex flex-col items-center gap-1.5 press"
                  >
                    <span
                      className={`grid size-10 place-items-center rounded-lg transition-all duration-300 ${
                        active
                          ? "-translate-y-2.5 bg-gold-gradient text-gold-foreground shadow-float"
                          : "text-primary-foreground/55"
                      }`}
                    >
                      <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 1.8} />
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-tight transition-colors ${
                        active
                          ? "-mt-2 text-primary-foreground"
                          : "text-primary-foreground/45"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : navVariant === "elevated" ? (

        /* Elevated dock: white card, active tab lifts into a navy squircle */
        <nav className="fixed inset-x-4 bottom-4 z-40 md:hidden">
          <ul className="grid grid-cols-5 items-end rounded-xl border border-border bg-surface/95 px-2 py-2 shadow-float backdrop-blur">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted-foreground"
                  >
                    <span
                      className={`grid size-10 place-items-center rounded-xl transition-all duration-300 ${
                        active
                          ? "-translate-y-2 bg-brand-gradient text-primary-foreground shadow-float"
                          : ""
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                    </span>
                    <span className={active ? "-mt-1 text-brand" : ""}>{tab.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : navVariant === "aurora" ? (
        /* Aurora dock: dark glass bar, gold indicator rail above the active tab */
        <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <ul className="grid grid-cols-5 gap-1 rounded-xl bg-brand-gradient p-2 shadow-float">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className="flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-primary-foreground/60"
                  >
                    <span
                      className={`h-0.5 w-6 rounded-full transition-colors ${
                        active ? "bg-gold" : "bg-transparent"
                      }`}
                    />
                    <Icon
                      className={`size-5 ${active ? "text-gold" : ""}`}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                    <span className={active ? "text-primary-foreground" : ""}>
                      {tab.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : navVariant === "morph" ? (
        /* Morphing bar: the active tab expands into a navy pill with its label */
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
          <ul className="flex items-center justify-between gap-1">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
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
              const active = isActive(tab.to);
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
        /* Default dock: floating navy glass bar with a sliding gold indicator */
        <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] md:hidden">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-brand-gradient px-1.5 pb-2 pt-2.5 shadow-float ring-1 ring-white/12">
            <span className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gold/40" />
            {/* sliding indicator */}
            <span
              className="pointer-events-none absolute left-1.5 top-1.5 h-[3.4rem] w-[calc((100%-0.75rem)/5)] rounded-2xl bg-white/10 ring-1 ring-gold/25 transition-transform duration-400 ease-out"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            <ul className="relative grid grid-cols-5">
              {TABS.map((tab) => {
                const active = isActive(tab.to);
                const Icon = tab.icon;
                return (
                  <li key={tab.to}>
                    <Link
                      to={tab.to}
                      aria-label={tab.label}
                      className="flex flex-col items-center gap-1 py-1.5 press"
                    >
                      <span
                        className={`grid size-8 place-items-center rounded-xl transition-all duration-300 ${
                          active
                            ? "bg-gold-gradient text-gold-foreground shadow-float"
                            : "text-primary-foreground/55"
                        }`}
                      >
                        <Icon className="size-[18px]" strokeWidth={active ? 2.3 : 1.8} />
                      </span>
                      <span
                        className={`text-[10px] font-semibold tracking-tight transition-colors ${
                          active ? "text-primary-foreground" : "text-primary-foreground/50"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
