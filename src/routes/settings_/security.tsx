import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Fingerprint, KeyRound, Monitor, RotateCcw, ScanFace } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";

export const Route = createFileRoute("/settings_/security")({
  head: () => ({
    meta: [
      { title: "Security | Kipit Settings" },
      {
        name: "description",
        content:
          "Change your Kipit password or transaction PIN, manage biometric login and authorization, and review active sessions.",
      },
      { property: "og:title", content: "Security | Kipit Settings" },
      { property: "og:description", content: "PIN, password, biometrics and session controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityScreen,
});

function SecurityScreen() {
  const [bioLogin, setBioLogin] = useState(true);
  const [bioAuth, setBioAuth] = useState(true);

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
              <button
                type="button"
                className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left press transition-colors hover:bg-secondary/50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                  <KeyRound className="size-[18px]" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold">Change password</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Last changed 4 months ago</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
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

        <section className="card-surface overflow-hidden">
          <p className="border-b border-border/60 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Biometrics
          </p>
          <ul className="divide-y divide-border/60">
            <Toggle
              icon={ScanFace}
              title="Biometric login"
              sub="Sign in with Face ID or fingerprint"
              on={bioLogin}
              onChange={setBioLogin}
            />
            <Toggle
              icon={Fingerprint}
              title="Biometric transaction authorization"
              sub="Approve payouts and investments without typing your PIN"
              on={bioAuth}
              onChange={setBioAuth}
            />
          </ul>
        </section>
      </div>
    </SettingsPage>
  );
}

function Toggle({
  icon: Icon,
  title,
  sub,
  on,
  onChange,
}: {
  icon: typeof ScanFace;
  title: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="flex items-center gap-3.5 px-4 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </li>
  );
}
