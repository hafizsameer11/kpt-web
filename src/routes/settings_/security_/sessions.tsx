import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { SESSIONS } from "@/lib/settings-data";

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

function SessionsScreen() {
  const [sessions, setSessions] = useState(SESSIONS);

  return (
    <SettingsPage
      title="Active sessions"
      eyebrow="MOB-148"
      backTo="/settings/security"
      backLabel="Security"
      subtitle="If you don't recognise a device, log it out and change your password."
    >
      <ul className="card-surface divide-y divide-border/60 overflow-hidden">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-3.5 px-4 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              {s.device.includes("Mac") ? (
                <Monitor className="size-[18px]" strokeWidth={2} />
              ) : (
                <Smartphone className="size-[18px]" strokeWidth={2} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-[13.5px] font-bold">
                {s.device}
                {s.current ? (
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600">
                    This device
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.context}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{s.lastActive}</p>
            </div>
            {!s.current ? (
              <button
                type="button"
                onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-bold text-foreground press hover:bg-secondary"
              >
                Log out
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setSessions((prev) => prev.filter((x) => x.current))}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-destructive press md:w-auto md:px-10"
      >
        <LogOut className="size-4" strokeWidth={2.6} /> Log out other sessions
      </button>
    </SettingsPage>
  );
}
