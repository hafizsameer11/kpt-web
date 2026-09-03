import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Gift,
  Landmark,
  LifeBuoy,
  LogOut,
  Scale,
  ShieldCheck,
  User,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { PROFILE } from "@/lib/settings-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kipit Profile & Security" },
      {
        name: "description",
        content:
          "Manage your Kipit profile, verification tier, payout accounts, transaction PIN, biometrics, notifications and legal documents.",
      },
      { property: "og:title", content: "Settings — Kipit Profile & Security" },
      {
        property: "og:description",
        content: "Profile, security and account controls for your Kipit account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsHome,
});

type Item = {
  to:
    | "/verification"
    | "/settings/profile"
    | "/settings/address"
    | "/settings/statements"
    | "/settings/security"
    | "/settings/cards"
    | "/settings/referrals"
    | "/settings/notifications"
    | "/settings/help"
    | "/settings/legal"
    | "/withdraw/accounts";
  icon: typeof User;
  title: string;
  sub: string;
  meta?: string;
};

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Account",
    items: [
      { to: "/verification", icon: ShieldCheck, title: "Verification", sub: "Tiers, BVN, NIN and address checks", meta: PROFILE.tier },
      { to: "/settings/profile", icon: User, title: "Profile", sub: "Name, date of birth, contact", meta: PROFILE.tier },
      { to: "/settings/address", icon: Landmark, title: "Address & personal details", sub: "Residence, occupation, source of funds" },
      { to: "/settings/statements", icon: FileText, title: "Statements", sub: "Account, transaction and portfolio" },
      { to: "/withdraw/accounts", icon: Landmark, title: "Bank accounts", sub: "Saved payout destinations", meta: "2 saved" },
    ],
  },
  {
    label: "Security & payments",
    items: [
      { to: "/settings/security", icon: ShieldCheck, title: "Security", sub: "PIN, password, biometrics, sessions" },
      { to: "/settings/cards", icon: CreditCard, title: "Linked cards", sub: "Cards saved for funding", meta: "2 cards" },
    ],
  },
  {
    label: "Preferences",
    items: [
      { to: "/settings/notifications", icon: Bell, title: "Notifications", sub: "Push and email alerts" },
      { to: "/settings/referrals", icon: Gift, title: "Referrals", sub: "Invite friends and earn rewards", meta: "9 joined" },
    ],
  },
  {
    label: "Support & legal",
    items: [
      { to: "/settings/help", icon: LifeBuoy, title: "Help & support", sub: "FAQs, guides and tickets" },
      { to: "/settings/legal", icon: Scale, title: "Legal documents", sub: "Terms, privacy, risk disclosure" },
    ],
  },
];

function SettingsHome() {
  return (
    <AppShell title="Settings" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gold font-display text-[22px] font-extrabold text-gold-foreground shadow-float">
              {PROFILE.initials}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[22px] font-extrabold tracking-[-0.03em] md:text-[26px]">
                {PROFILE.firstName} {PROFILE.lastName}
              </h1>
              <p className="truncate text-[12px] text-primary-foreground/70">{PROFILE.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/18 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-gold">
                  <BadgeCheck className="size-3.5" strokeWidth={2.6} /> {PROFILE.tier} verified
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-bold">
                  Member since {PROFILE.memberSince}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden" />

          <div className="space-y-6 md:grid md:grid-cols-2 md:items-start md:gap-5 md:space-y-0">
            {GROUPS.map((group) => (
              <section key={group.label}>
                <h2 className="mb-2.5 px-1 font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                  {group.label}
                </h2>
                <ul className="card-surface divide-y divide-border/60 overflow-hidden">
                  {group.items.map((item, i) => (
                    <li key={item.to} style={{ ["--d" as string]: `${i * 50}ms` }} className="k-rise">
                      <Link
                        to={item.to}
                        className="group relative flex items-center gap-3.5 px-4 py-3.5 press transition-colors hover:bg-secondary/50"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
                        />
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25 transition-transform duration-300 group-hover:scale-105">
                          <item.icon className="size-[18px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold tracking-tight">{item.title}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.sub}</p>
                        </div>
                        {item.meta ? (
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-extrabold text-muted-foreground">
                            {item.meta}
                          </span>
                        ) : null}
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-destructive press md:w-auto md:px-10"
          >
            <LogOut className="size-4" strokeWidth={2.6} /> Log out
          </button>

          <p className="mt-4 px-1 text-[11px] text-muted-foreground">
            Kipit v1.0.0 (prototype) · Investments carry risk. Returns are not guaranteed.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
