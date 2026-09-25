import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  KeyRound,
  Monitor,
  MonitorSmartphone,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { SettingsPage } from "@/components/kipit/SettingsPage";

export const Route = createFileRoute("/settings_/security")({
  head: () => ({
    meta: [
      { title: "Security | Kipit Settings" },
      {
        name: "description",
        content:
          "Change your Kipit password or transaction PIN and review active sessions.",
      },
      { property: "og:title", content: "Security | Kipit Settings" },
      { property: "og:description", content: "PIN, password and session controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityScreen,
});

function SecurityScreen() {
  const links = [
    {
      to: "/settings/security/change-pin" as const,
      icon: KeyRound,
      title: "Change transaction PIN",
      sub: "Use your current PIN to set a new one",
    },
    {
      to: "/settings/security/reset-pin" as const,
      icon: RotateCcw,
      title: "Reset transaction PIN",
      sub: "Forgot your PIN? Verify your identity",
    },
    {
      to: "/settings/security/sessions" as const,
      icon: Monitor,
      title: "Active sessions",
      sub: "Devices signed in to your account",
    },
  ];

  return (
    <SettingsPage
      title="Security"
      eyebrow="MOB-145"
      subtitle="Control how you sign in and how transactions are authorized."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface overflow-hidden">
          <p className="border-b border-border/60 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Credentials
          </p>
          <ul className="divide-y divide-border/60">
            <li>
              <Link
                to="/forgot-password"
                className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left press transition-colors hover:bg-secondary/50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                  <KeyRound className="size-[18px]" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold">Change password</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Reset via email OTP</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="group flex items-center gap-3.5 px-4 py-3.5 press transition-colors hover:bg-secondary/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                    <l.icon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold">{l.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{l.sub}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="card-surface p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                <MonitorSmartphone className="size-[18px]" strokeWidth={2} />
              </span>
              <h2 className="font-display text-[14px] font-extrabold">Biometrics on web</h2>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Face ID and fingerprint are not available in the browser. Use your transaction PIN to
              authorize investments and withdrawals. Enable biometrics in the Kipit mobile app.
            </p>
          </section>

          <section className="card-surface p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                <ShieldCheck className="size-[18px]" strokeWidth={2} />
              </span>
              <h2 className="font-display text-[14px] font-extrabold">Keep your account safe</h2>
            </div>
            <ul className="mt-3 space-y-2.5">
              {[
                "Kipit will never ask for your PIN, password or OTP — not by call, SMS or email.",
                "Use a password you do not reuse anywhere else, and change it every few months.",
                "Sign out of any session you do not recognise from Active sessions.",
              ].map((tip) => (
                <li key={tip} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </SettingsPage>
  );
}
