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

      {/* Mobile bottom tab bar: floating navy glass dock with sliding gold indicator */}
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
    </div>
  );
}
