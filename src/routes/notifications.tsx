import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Megaphone,
  ShieldAlert,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { DashboardSidebar, DashboardTopBar } from "@/components/kipit/DashboardSidebar";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Kipit" },
      {
        name: "description",
        content:
          "Deposits, withdrawals, investment activity, KYC updates and security alerts on your Kipit account.",
      },
      { property: "og:title", content: "Notifications — Kipit" },
      {
        property: "og:description",
        content: "Every update on your Kipit wallet, investments and account security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsScreen,
});

type Item = {
  icon: LucideIcon;
  title: string;
  body: string;
  time: string;
  to: "/portfolio" | "/invest" | "/settings" | "/explore";
  unread?: boolean;
  tone: "gold" | "success" | "neutral" | "danger";
};

const ITEMS: Item[] = [
  {
    icon: ArrowDownToLine,
    title: "Deposit received",
    body: "₦200,000 has landed in your Kipit wallet.",
    time: "Today, 09:14",
    to: "/portfolio",
    unread: true,
    tone: "success",
  },
  {
    icon: TrendingUp,
    title: "Investment created",
    body: "Kipit Fixed Income · ₦750,000 for 90 days at 18.5% p.a.",
    time: "Today, 08:02",
    to: "/invest",
    unread: true,
    tone: "gold",
  },
  {
    icon: ArrowUpFromLine,
    title: "Withdrawal processing",
    body: "₦50,000 to GTBank ••4521 is on its way.",
    time: "Yesterday",
    to: "/portfolio",
    tone: "neutral",
  },
  {
    icon: CheckCircle2,
    title: "Withdrawal successful",
    body: "₦120,000 was paid to Access Bank ••7788.",
    time: "28 Aug",
    to: "/portfolio",
    tone: "success",
  },
  {
    icon: XCircle,
    title: "Withdrawal declined",
    body: "₦30,000 could not be processed. Your funds were returned.",
    time: "26 Aug",
    to: "/portfolio",
    tone: "danger",
  },
  {
    icon: BadgeCheck,
    title: "Investment matured",
    body: "Kipit Starter · ₦500,000 plus ₦18,400 interest paid to wallet.",
    time: "24 Aug",
    to: "/portfolio",
    tone: "gold",
  },
  {
    icon: BadgeCheck,
    title: "KYC approved",
    body: "Tier 2 verification is complete. Your limits have been raised.",
    time: "22 Aug",
    to: "/settings",
    tone: "success",
  },
  {
    icon: ShieldAlert,
    title: "New device login",
    body: "A sign-in from Chrome on Windows, Lagos. Not you? Secure your account.",
    time: "20 Aug",
    to: "/settings",
    tone: "danger",
  },
  {
    icon: Megaphone,
    title: "Product announcement",
    body: "Same-day settlement is now live on all Kipit Fixed Income plans.",
    time: "18 Aug",
    to: "/explore",
    tone: "neutral",
  },
];

const TONES: Record<Item["tone"], string> = {
  gold: "bg-accent text-gold",
  success: "bg-accent text-success",
  neutral: "bg-secondary text-brand",
  danger: "bg-destructive/10 text-destructive",
};

function NotificationCard({ item, readAll }: { item: Item; readAll: boolean }) {
  const Icon = item.icon;
  const unread = item.unread && !readAll;
  return (
    <Link
      to={item.to}
      className={`flex items-start gap-4 rounded-xl border p-4 shadow-card transition-colors hover:border-gold/50 md:items-center ${
        unread ? "border-gold/40 bg-accent/40" : "border-border bg-surface"
      }`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${TONES[item.tone]}`}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{item.title}</span>
          {unread && (
            <span className="k-glow size-2 shrink-0 rounded-full bg-gold" />
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {item.body}
        </span>
        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:hidden">
          {item.time}
        </span>
      </span>
      <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:block">
        {item.time}
      </span>
    </Link>
  );
}

function NotificationsScreen() {
  const [readAll, setReadAll] = useState(false);
  const unreadCount = readAll ? 0 : ITEMS.filter((i) => i.unread).length;
  const today = ITEMS.filter((i) => i.time.startsWith("Today"));
  const earlier = ITEMS.filter((i) => !i.time.startsWith("Today"));

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="md:pl-[17rem]">
        <DashboardTopBar title="Notifications" />
        <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 md:max-w-5xl md:px-10 md:pt-8 md:pb-16">
          <div className="flex items-center justify-between md:hidden">
            <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <Bell className="size-5 text-gold" /> Notifications
            </h1>
            <Link to="/" className="text-xs font-bold text-brand">
              Back to Home
            </Link>
          </div>

          {/* ── Mobile list ─────────────────────────────────── */}
          <ul className="mt-4 space-y-2 md:hidden">
            {ITEMS.map((item, i) => (
              <li
                key={item.title + item.time}
                className="k-rise"
                style={{ ["--d" as string]: `${i * 60}ms` }}
              >
                <NotificationCard item={item} readAll={readAll} />
              </li>
            ))}
          </ul>

          {/* ── Desktop grouped layout ──────────────────────── */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-extrabold tracking-tight">
                  Notifications
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} on your account`
                    : "You're all caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadAll(true)}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-bold text-foreground press hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 className="size-4 text-gold" /> Mark all as read
              </button>
            </div>

            {[
              { label: "Today", items: today },
              { label: "Earlier", items: earlier },
            ].map(
              (group) =>
                group.items.length > 0 && (
                  <section key={group.label} className="mt-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
                      {group.label}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {group.items.map((item, i) => (
                        <li
                          key={item.title + item.time}
                          className="k-rise"
                          style={{ ["--d" as string]: `${i * 60}ms` }}
                        >
                          <NotificationCard item={item} readAll={readAll} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ),
            )}

            <p className="mt-8 text-center text-[11.5px] text-muted-foreground">
              Notifications link through to the related wallet, investment or settings page.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
