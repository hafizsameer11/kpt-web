import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  Banknote,
  Package,
  Percent,
  SlidersHorizontal,
  Scale,
  Megaphone,
  LifeBuoy,
  Bell,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

type Item = { label: string; to: string; icon: LucideIcon; soon?: boolean };
type Group = { heading: string; items: Item[] };

/** Admin console navigation, mapped to the ADM-0xx sections in the UX spec. */
const GROUPS: Group[] = [
  {
    heading: "Overview",
    items: [{ label: "Executive dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    heading: "Operations",
    items: [
      { label: "Users", to: "/admin", icon: Users, soon: true },
      { label: "Compliance & KYC", to: "/admin", icon: ShieldCheck, soon: true },
      { label: "Transactions", to: "/admin", icon: ArrowLeftRight, soon: true },
      { label: "Withdrawals", to: "/admin", icon: Banknote, soon: true },
      { label: "Reconciliation", to: "/admin", icon: Scale, soon: true },
    ],
  },
  {
    heading: "Products & rates",
    items: [
      { label: "Products", to: "/admin", icon: Package, soon: true },
      { label: "Rate management", to: "/admin", icon: Percent, soon: true },
      { label: "Plan adjustments", to: "/admin", icon: SlidersHorizontal, soon: true },
    ],
  },
  {
    heading: "Growth & care",
    items: [
      { label: "Marketing", to: "/admin", icon: Megaphone, soon: true },
      { label: "Support", to: "/admin", icon: LifeBuoy, soon: true },
    ],
  },
];

/**
 * Administration console shell — a separate operational surface from the
 * consumer app: persistent brand sidebar, operator top bar, dense content.
 */
export function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[16.5rem] flex-col bg-brand-gradient text-primary-foreground lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <Logo tone="light" className="text-xl" />
          <span className="rounded-md bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold">
            Admin
          </span>
        </div>

        <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-6">
          {GROUPS.map((group) => (
            <div key={group.heading} className="mt-5 first:mt-1">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = !item.soon && pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                          active
                            ? "bg-white/12 text-primary-foreground"
                            : "text-primary-foreground/60 hover:bg-white/8 hover:text-primary-foreground"
                        }`}
                      >
                        <Icon
                          className={`size-4 ${active ? "text-gold" : "text-primary-foreground/50"}`}
                          strokeWidth={active ? 2.3 : 1.9}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.soon ? (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-primary-foreground/35">
                            Soon
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-[12px] font-extrabold text-gold-foreground">
              SA
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold">Seyi Adeleke</p>
              <p className="truncate text-[11px] text-primary-foreground/55">Global Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[16.5rem]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 md:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[19px] font-extrabold tracking-[-0.02em]">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <label className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 md:flex">
              <Search className="size-4 text-muted-foreground" />
              <input
                placeholder="Search users, references…"
                className="w-56 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
            </label>

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
