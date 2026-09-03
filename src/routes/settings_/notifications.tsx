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
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
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
