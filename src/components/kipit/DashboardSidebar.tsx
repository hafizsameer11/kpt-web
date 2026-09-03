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
 * Fixed desktop dashboard sidebar — light rail with a navy active pill.
 * Pair with a main column that has `md:pl-[17rem]`.
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-border bg-surface md:flex">
      <div className="px-7 pb-7 pt-7">
        <Logo tone="brand" className="text-2xl" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-4">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? current === "/" || current.startsWith("/home-v")
              : current.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold press ${
                active
                  ? "bg-brand text-brand-foreground shadow-card"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon
                className="size-[18px]"
                strokeWidth={active ? 2.2 : 1.8}
              />
              {item.label}
              {active && (
                <span
                  aria-hidden
                  className="ml-auto size-1.5 rounded-full bg-gold"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 overflow-hidden rounded-lg bg-brand-gradient p-5 text-primary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/55">
          Wallet
        </p>
        <p className="mt-1.5 text-[22px] font-bold text-num">
          {hideBalance ? "₦ • • • • • •" : naira(walletBalance)}
        </p>
        <Link
          to="/wallet/add-money"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/12 px-4 py-2.5 text-xs font-bold text-primary-foreground press hover:bg-white/20"
        >
          <Plus className="size-3.5" /> Fund wallet
        </Link>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        <div className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
          AO
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">Adaeze Okafor</p>
          <p className="text-[11px] text-muted-foreground">Tier 2 verified</p>
        </div>
        <Link
          to="/login"
          aria-label="Sign out"
          className="grid size-8 place-items-center rounded-full text-muted-foreground press hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" />
        </Link>
      </div>
    </aside>
  );
}

/** Desktop dashboard top bar that sits above page content, next to the sidebar. */
export function DashboardTopBar({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 hidden h-[72px] items-center gap-4 border-b border-border bg-background/80 px-8 backdrop-blur-xl md:flex">
      <div>
        <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>
        <p className="text-[12.5px] text-muted-foreground">
          <GreetingText />, Adaeze
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground press hover:bg-secondary"
        >
          <Bell className="size-[18px]" strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-gold ring-2 ring-surface" />
        </Link>
        <Link
          to="/settings"
          aria-label="Profile"
          className="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground press"
        >
          AO
        </Link>
      </div>
    </header>
  );
}
