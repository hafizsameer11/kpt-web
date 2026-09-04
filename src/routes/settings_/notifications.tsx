import { createFileRoute } from "@tanstack/react-router";
import { Bell, Mail } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { EMAIL_TOGGLES, PUSH_TOGGLES, type ToggleItem } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Settings | Kipit" },
      {
        name: "description",
        content:
          "Choose which Kipit push and email alerts you receive — deposits, withdrawals, investments, maturities and digests.",
      },
      { property: "og:title", content: "Notification Settings | Kipit" },
      { property: "og:description", content: "Control your Kipit push and email alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationSettings,
});

function NotificationSettings() {
  const [push, setPush] = useState<ToggleItem[]>(PUSH_TOGGLES);
  const [email, setEmail] = useState<ToggleItem[]>(EMAIL_TOGGLES);

  return (
    <SettingsPage
      title="Notifications"
      eyebrow="MOB-151"
      subtitle="Alerts about your money are on by default. Marketing is always optional."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:gap-5">
        <Group
          icon={Bell}
          label="Push notifications"
          items={push}
          onToggle={(id) =>
            setPush((p) => p.map((i) => (i.id === id ? { ...i, on: !i.on } : i)))
          }
        />
        <Group
          icon={Mail}
          label="Email notifications"
          items={email}
          onToggle={(id) =>
            setEmail((p) => p.map((i) => (i.id === id ? { ...i, on: !i.on } : i)))
          }
        />

        {/* Desktop-only delivery rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <section className="card-surface overflow-hidden">
              <div className="bg-brand-gradient px-5 py-4">
                <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-gold">
                  Delivery summary
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-primary-foreground">
                  {push.filter((i) => i.on).length + email.filter((i) => i.on).length} alerts on
                </p>
              </div>
              <ul className="divide-y divide-border">
                <li className="flex items-center justify-between px-5 py-3">
                  <span className="text-[12.5px] font-semibold text-foreground">Push</span>
                  <span className="text-[11.5px] font-bold text-brand">
                    {push.filter((i) => i.on).length}/{push.length} on
                  </span>
                </li>
                <li className="flex items-center justify-between px-5 py-3">
                  <span className="text-[12.5px] font-semibold text-foreground">Email</span>
                  <span className="text-[11.5px] font-bold text-brand">
                    {email.filter((i) => i.on).length}/{email.length} on
                  </span>
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
                <button
                  type="button"
                  onClick={() => {
                    setPush((p) => p.map((i) => ({ ...i, on: true })));
                    setEmail((p) => p.map((i) => ({ ...i, on: true })));
                  }}
                  className="rounded-xl bg-brand-gradient px-3 py-2.5 text-[12px] font-extrabold text-primary-foreground press"
                >
                  Enable all
                </button>
                <button
                  type="button"
                  onClick={() => setEmail((p) => p.map((i) => ({ ...i, on: false })))}
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-[12px] font-bold text-foreground press"
                >
                  Mute email
                </button>
              </div>
            </section>

            <section className="card-surface p-5">
              <p className="text-[12.5px] font-extrabold text-foreground">Always sent</p>
              <ul className="mt-2 space-y-2">
                {[
                  "Security alerts and login attempts",
                  "Withdrawal confirmations and receipts",
                  "Regulatory and account status notices",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </SettingsPage>
  );
}

function Group({
  icon: Icon,
  label,
  items,
  onToggle,
}: {
  icon: typeof Bell;
  label: string;
  items: ToggleItem[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Icon className="size-4 text-brand" strokeWidth={2.4} />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      </div>
      <ul className="divide-y divide-border/60">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={item.on}
              aria-label={item.label}
              onClick={() => onToggle(item.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${item.on ? "bg-brand" : "bg-border"}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${item.on ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
