import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCircle2, Megaphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DashboardSidebar, DashboardTopBar } from "@/components/kipit/DashboardSidebar";
import { fetchNotifications, markNotificationRead } from "@/lib/api";

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
  id: string;
  title: string;
  body: string;
  time: string;
  to: "/portfolio" | "/invest" | "/settings" | "/explore" | "/";
  unread: boolean;
};

function pathFromHref(href: string | null): Item["to"] {
  const h = (href || "").toLowerCase();
  if (h.includes("invest") || h.includes("plan") || h.includes("call")) return "/invest";
  if (h.includes("explore")) return "/explore";
  if (h.includes("setting") || h.includes("kyc") || h.includes("security")) return "/settings";
  if (h.includes("home")) return "/";
  return "/portfolio";
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
}

function NotificationCard({
  item,
  onOpen,
}: {
  item: Item;
  onOpen: (item: Item) => void;
}) {
  return (
    <Link
      to={item.to}
      onClick={() => onOpen(item)}
      className={`flex items-start gap-4 rounded-xl border p-4 shadow-card transition-colors hover:border-gold/50 md:items-center ${
        item.unread ? "border-gold/40 bg-accent/40" : "border-border bg-surface"
      }`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${
          item.unread ? "bg-accent text-gold" : "bg-secondary text-brand"
        }`}
      >
        <Bell className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{item.title}</span>
          {item.unread && <span className="k-glow size-2 shrink-0 rounded-full bg-gold" />}
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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchNotifications();
      setItems(
        (rows ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          body: row.body,
          time: formatWhen(row.createdAt),
          to: pathFromHref(row.href),
          unread: !row.read,
        })),
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (item: Item) => {
    if (!item.unread) return;
    try {
      await markNotificationRead(item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)),
      );
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    const unread = items.filter((i) => i.unread);
    await Promise.all(unread.map((i) => markNotificationRead(i.id).catch(() => null)));
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = items.filter((i) => i.unread).length;
  const today = items.filter((i) => i.time.startsWith("Today"));
  const earlier = items.filter((i) => !i.time.startsWith("Today"));

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

          {loading ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <div className="mt-16 flex flex-col items-center px-6 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <Megaphone className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Deposits, investments and account updates will show up here.
              </p>
            </div>
          ) : (
            <>
              <ul className="mt-4 space-y-2 md:hidden">
                {items.map((item, i) => (
                  <li
                    key={item.id}
                    className="k-rise"
                    style={{ ["--d" as string]: `${i * 60}ms` }}
                  >
                    <NotificationCard item={item} onOpen={(n) => void open(n)} />
                  </li>
                ))}
              </ul>

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
                    onClick={() => void markAll()}
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
                              key={item.id}
                              className="k-rise"
                              style={{ ["--d" as string]: `${i * 60}ms` }}
                            >
                              <NotificationCard item={item} onOpen={(n) => void open(n)} />
                            </li>
                          ))}
                        </ul>
                      </section>
                    ),
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
