import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { GreetingText } from "@/components/kipit/SpecBlocks";

export type SidebarItem = { label: string; to: string; icon: LucideIcon };

export const SIDEBAR_NAV: SidebarItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/**
 * Fixed desktop dashboard sidebar (navy rail) — hidden on mobile.
 * Pair with a main column that has `md:pl-64`.
 */
export function DashboardSidebar({
  walletBalance = 500000,
  hideBalance = false,
  activePath,
}: {
  walletBalance?: number;
  hideBalance?: boolean;
  activePath?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = activePath ?? pathname;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-gradient text-primary-foreground md:flex">
      <div className="px-7 pb-8 pt-8">
        <Logo tone="light" className="text-3xl" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/" ? current === "/" || current.startsWith("/home-v") : current.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white/12 text-primary-foreground"
                  : "text-primary-foreground/60 hover:bg-white/8 hover:text-primary-foreground"
              }`}
            >
              <span
                className={`grid size-9 place-items-center rounded-xl ${
                  active ? "bg-gold-gradient text-gold-foreground" : "bg-white/10"
                }`}
              >
                <Icon className="size-4.5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-2xl bg-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
          Wallet
        </p>
        <p className="mt-1 text-xl font-extrabold">
          {hideBalance ? "₦ • • • • • •" : naira(walletBalance)}
        </p>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2.5 text-xs font-bold text-gold-foreground transition-transform active:scale-95"
        >
          <Plus className="size-3.5" /> Fund wallet
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-6 py-5">
        <div className="grid size-10 place-items-center rounded-full bg-gold-gradient text-sm font-bold text-gold-foreground">
          AO
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Adaeze Okafor</p>
          <p className="text-xs text-primary-foreground/60">Tier 2 verified</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          className="grid size-8 place-items-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}

/** Desktop dashboard top bar that sits above page content, next to the sidebar. */
export function DashboardTopBar({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-border bg-surface/90 px-8 backdrop-blur md:flex">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <p className="text-sm font-bold"><GreetingText />, Adaeze</p>
      </div>
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
    </header>
  );
}
