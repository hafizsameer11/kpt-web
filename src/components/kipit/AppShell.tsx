import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  TrendingUp,
  Compass,
  PieChart,
  Settings,
  MessageCircle,
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

      {/* Mobile floating Chat to Trade button */}
      {pathname !== "/chat" && (
        <Link
          to="/chat"
          aria-label="Chat to Trade"
          className="fixed bottom-[5.5rem] right-4 z-40 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-primary-foreground shadow-float ring-1 ring-white/15 transition-all duration-300 ease-out hover:scale-105 active:scale-95 md:hidden animate-in slide-in-from-bottom-6 fade-in-0"
        >
          <span className="relative grid size-8 place-items-center rounded-full bg-gold-gradient text-gold-foreground shadow-sm">
            <MessageCircle className="size-[18px]" strokeWidth={2.2} />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-primary" />
          </span>
          <span className="pr-1 text-xs font-bold">Chat to Trade</span>
        </Link>
      )}

      {/* Mobile bottom tab bar */}
      {navVariant === "orbit" ? (
        /* Orbit dock: deep navy glass bar, active tab orbits into a gold squircle */
        <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
          <ul className="grid grid-cols-5 items-end gap-0.5 rounded-xl bg-brand-gradient px-2 pb-1.5 pt-1.5 shadow-float ring-1 ring-white/10">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    aria-label={tab.label}
                    className="flex flex-col items-center gap-0 pt-0.5 press"
                  >
                    <span
                      className={`grid size-8 place-items-center rounded-lg transition-all duration-300 ${
                        active
                          ? "-translate-y-1.5 bg-gold-gradient text-gold-foreground shadow-float"
                          : "text-primary-foreground/55"
                      }`}
                    >
                      <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 1.8} />
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-tight transition-colors ${
                        active
                          ? "-mt-1.5 text-primary-foreground"
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
          <ul className="grid grid-cols-5 items-end rounded-xl border border-border bg-surface/95 px-2 py-1 shadow-float backdrop-blur">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className="flex flex-col items-center gap-0 pt-0.5 text-[11px] font-bold text-muted-foreground"
                  >
                    <span
                      className={`grid size-8 place-items-center rounded-xl transition-all duration-300 ${
                        active
                          ? "-translate-y-1 bg-brand-gradient text-primary-foreground shadow-float"
                          : ""
                      }`}
                    >
                      <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 1.8} />
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
          <ul className="grid grid-cols-5 gap-1 rounded-xl bg-brand-gradient p-1 shadow-float">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className="flex flex-col items-center gap-0 rounded-xl pt-1.5 pb-1 text-[11px] font-semibold text-primary-foreground/60"
                  >
                    <span
                      className={`h-0.5 w-5 rounded-full transition-colors ${
                        active ? "bg-gold" : "bg-transparent"
                      }`}
                    />
                    <Icon
                      className={`size-[18px] ${active ? "text-gold" : ""}`}
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
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
          <ul className="flex items-center justify-between gap-1">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to} className={active ? "flex-1" : ""}>
                  <Link
                    to={tab.to}
                    aria-label={tab.label}
                    className={`flex items-center justify-center gap-1.5 rounded-full pt-2 pb-1.5 text-xs font-semibold transition-all duration-300 ${
                      active
                        ? "bg-brand-gradient px-3 text-primary-foreground shadow-float"
                        : "px-3 text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 1.8} />
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
          <ul className="grid grid-cols-5 rounded-full border border-border bg-surface/95 p-1 shadow-float backdrop-blur">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center gap-0 rounded-full pt-1.5 pb-1 text-[10px] font-bold transition-colors ${
                      active
                        ? "bg-gold-gradient text-gold-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={active ? 2.4 : 1.8} />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
          <ul className="grid grid-cols-5">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center gap-0 pt-2 pb-1.5 text-[11px] font-semibold press ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`relative grid size-7 place-items-center rounded-xl transition-colors ${
                        active ? "bg-brand text-brand-foreground" : ""
                      }`}
                    >
                      <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
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
