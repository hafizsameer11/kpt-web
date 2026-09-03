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

      {/* Mobile bottom tab bar: light frosted bar with gold active pill */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="relative">
          {/* sliding active pill */}
          <span
            className="pointer-events-none absolute left-0 top-1 h-[3.1rem] w-[20%] px-2 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="block size-full rounded-2xl bg-primary/[0.07]" />
          </span>
          <ul className="relative grid grid-cols-5">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    className="flex flex-col items-center gap-1 pb-1.5 pt-2 press"
                  >
                    <Icon
                      className={`size-[21px] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={active ? 2.2 : 1.7}
                    />
                    <span
                      className={`text-[10px] tracking-tight transition-colors ${
                        active ? "font-semibold text-primary" : "font-medium text-muted-foreground"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`h-[3px] w-6 rounded-full transition-all duration-300 ${
                        active ? "bg-gold opacity-100" : "opacity-0"
                      }`}
                    />
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
