import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Monitor, ShieldAlert, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import {
  fetchSessions,
  logoutOtherSessions,
  revokeSession,
  type ApiSession,
} from "@/lib/api";

export const Route = createFileRoute("/settings_/security_/sessions")({
  head: () => ({
    meta: [
      { title: "Active Sessions | Kipit Security" },
      {
        name: "description",
        content:
          "See every device signed in to your Kipit account, when it was last active, and log any session out.",
      },
      { property: "og:title", content: "Active Sessions | Kipit Security" },
      { property: "og:description", content: "Review and revoke devices signed in to Kipit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionsScreen,
});

type UiSession = {
  id: string;
  device: string;
  context: string;
  lastActive: string;
  current: boolean;
};

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  if (Number.isNaN(then)) return "Unknown";
  if (diffMs < 60_000) return "Active now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function mapSession(s: ApiSession, currentSessionId: string): UiSession {
  const ua = s.userAgent ?? "";
  const isMobile = /iPhone|Android|Mobile/i.test(ua);
  const device =
    s.deviceName?.trim() ||
    (isMobile ? "Mobile · Kipit" : /Mac/i.test(ua) ? "Mac · Browser" : "Desktop · Browser");
  const context = [s.ipAddress ?? "Unknown IP", ua ? ua.slice(0, 48) : "Web session"]
    .filter(Boolean)
    .join(" · ");
  return {
    id: s.id,
    device,
    context,
    lastActive: formatRelative(s.lastActiveAt),
    current: s.id === currentSessionId,
  };
}

function SessionsScreen() {
  const [sessions, setSessions] = useState<UiSession[]>([]);
  const [busy, setBusy] = useState(false);
  const others = sessions.filter((s) => !s.current).length;

  async function reload() {
    try {
      const data = await fetchSessions();
      setSessions(data.sessions.map((s) => mapSession(s, data.currentSessionId)));
    } catch {
      setSessions([]);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleRevoke(id: string) {
    setBusy(true);
    try {
      await revokeSession(id);
      await reload();
    } catch {
      /* keep list */
    } finally {
      setBusy(false);
    }
  }

  async function handleLogoutOthers() {
    setBusy(true);
    try {
      const data = await logoutOtherSessions();
      setSessions(data.sessions.map((s) => mapSession(s, data.currentSessionId)));
    } catch {
      /* keep list */
    } finally {
      setBusy(false);
    }
  }

  const list = (
    <ul className="card-surface divide-y divide-border/60 overflow-hidden">
      {sessions.map((s) => (
        <li key={s.id} className="flex items-center gap-3.5 px-4 py-4 md:px-5 md:py-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25 md:size-11">
            {s.device.includes("Mac") || s.device.includes("Desktop") ? (
              <Monitor className="size-[18px]" strokeWidth={2} />
            ) : (
              <Smartphone className="size-[18px]" strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 truncate text-[13.5px] font-bold md:text-[14.5px]">
              {s.device}
              {s.current ? (
                <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600">
                  This device
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:text-[12.5px]">
              {s.context}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground md:text-[12px]">
              {s.lastActive}
            </p>
          </div>
          {!s.current ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRevoke(s.id)}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-bold text-foreground press hover:bg-secondary disabled:opacity-50 md:px-4 md:py-2 md:text-[12.5px]"
            >
              Log out
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <SettingsPage
      title="Active sessions"
      eyebrow="MOB-148"
      backTo="/settings/security"
      backLabel="Security"
      subtitle="If you don't recognise a device, log it out and change your password."
    >
      {/* Mobile — unchanged */}
      <div className="md:hidden">
        {list}
        <button
          type="button"
          disabled={busy || others === 0}
          onClick={() => void handleLogoutOthers()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-destructive press disabled:opacity-50"
        >
          <LogOut className="size-4" strokeWidth={2.6} /> Log out other sessions
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-[13px] font-extrabold">
                {sessions.length} device{sessions.length === 1 ? "" : "s"} signed in
              </p>
              <p className="text-[12px] text-muted-foreground">
                {others} other session{others === 1 ? "" : "s"}
              </p>
            </div>
            {list}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="card-surface p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold">
                <ShieldAlert className="size-4 text-brand" /> Something look wrong?
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Logging out other sessions signs you out everywhere except this device. You will
                stay signed in here.
              </p>
              <button
                type="button"
                disabled={busy || others === 0}
                onClick={() => void handleLogoutOthers()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card px-5 py-3 text-[13px] font-extrabold text-destructive press disabled:opacity-50"
              >
                <LogOut className="size-4" strokeWidth={2.6} /> Log out other sessions
              </button>
            </section>

            <section className="card-surface p-5">
              <p className="text-[13px] font-extrabold">Next steps</p>
              <ul className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <li>Change your password if a device is unfamiliar.</li>
                <li>Keep your transaction PIN private and never share it.</li>
                <li>Keep your transaction PIN private — Kipit never asks for it.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </SettingsPage>
  );
}
