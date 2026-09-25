import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Moon,
  Scale,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useTheme } from "@/lib/theme";
import { signOut } from "@/lib/auth-session";
import { useDisplayProfile } from "@/lib/profile-live";

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
      { to: "/verification", icon: ShieldCheck, title: "Verification", sub: "Tiers, BVN, NIN and address checks" },
      { to: "/settings/profile", icon: User, title: "Profile", sub: "Name, date of birth, contact" },
      { to: "/settings/address", icon: Landmark, title: "Address & personal details", sub: "Residence, occupation, source of funds" },
      { to: "/settings/statements", icon: FileText, title: "Statements", sub: "Account, transaction and portfolio" },
      { to: "/withdraw/accounts", icon: Landmark, title: "Bank accounts", sub: "Saved payout destinations" },
    ],
  },
  {
    label: "Security & payments",
    items: [
      { to: "/settings/security", icon: ShieldCheck, title: "Security", sub: "PIN, password, sessions" },
      { to: "/settings/cards", icon: CreditCard, title: "Linked cards", sub: "Cards saved for funding" },
    ],
  },
  {
    label: "Preferences",
    items: [
      { to: "/settings/notifications", icon: Bell, title: "Notifications", sub: "Push and email alerts" },
      { to: "/settings/referrals", icon: Gift, title: "Referrals", sub: "Invite friends and earn rewards" },
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
  const profile = useDisplayProfile();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—";
  const email = profile.email || "—";
  const initials = profile.initials || "—";
  const tier = profile.tier ? `${profile.tier} verified` : "Unverified";
  const memberSince = profile.memberSince;

  async function handleSignOut() {
    await signOut();
    void navigate({ to: "/welcome", replace: true });
  }

  return (
    <AppShell title="Settings" navVariant="elevated">
      {/* ===== MOBILE (unchanged) ===== */}
      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gold font-display text-[22px] font-extrabold text-gold-foreground shadow-float">
              {initials}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[22px] font-extrabold tracking-[-0.03em] md:text-[26px]">
                {name}
              </h1>
              <p className="truncate text-[12px] text-primary-foreground/70">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/18 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-gold">
                  <BadgeCheck className="size-3.5" strokeWidth={2.6} /> {tier}
                </span>
                {memberSince ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-bold">
                    Member since {memberSince}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden" />

          <section className="mb-6 md:hidden">
            <h2 className="mb-2.5 px-1 font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Appearance
            </h2>
            <div className="card-surface overflow-hidden">
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDark}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left press"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                  {isDark ? <Sun className="size-[18px]" strokeWidth={2} /> : <Moon className="size-[18px]" strokeWidth={2} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold tracking-tight">Dark mode</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {isDark ? "On · easier on the eyes at night" : "Off · using light theme"}
                  </p>
                </div>
                <span
                  aria-hidden
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isDark ? "bg-gold" : "bg-border"}`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${isDark ? "left-[22px]" : "left-0.5"}`}
                  />
                </span>
              </button>
            </div>
          </section>

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
            onClick={() => void handleSignOut()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-destructive press md:w-auto md:px-10"
          >
            <LogOut className="size-4" strokeWidth={2.6} /> Log out
          </button>

          <p className="mt-4 px-1 text-[11px] text-muted-foreground">
            Kipit v1.0.0 · Investments carry risk. Returns are not guaranteed.
          </p>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1180px] pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-7 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex items-center justify-between gap-8">
              <div className="flex min-w-0 items-center gap-5">
                <span className="grid size-[68px] shrink-0 place-items-center rounded-2xl bg-gold font-display text-[24px] font-extrabold text-gold-foreground shadow-float">
                  {profile.initials || "—"}
                </span>
                <div className="min-w-0">
                  <h1 className="truncate font-display text-[28px] font-extrabold tracking-[-0.03em]">
                    {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"}
                  </h1>
                  <p className="truncate text-[12.5px] text-primary-foreground/70">
                    {email}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/18 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-gold">
                      <BadgeCheck className="size-3.5" strokeWidth={2.6} /> {profile.tier || "Tier 0"} verified
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-bold">
                      {profile.memberSince ? `Member since ${profile.memberSince}` : "Member"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <Link
                  to="/settings/profile"
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[12.5px] font-extrabold transition-colors hover:bg-white/20"
                >
                  Edit profile
                </Link>
                <Link
                  to="/settings/security"
                  className="rounded-xl bg-gold px-4 py-2.5 text-[12.5px] font-extrabold text-gold-foreground transition-opacity hover:opacity-90"
                >
                  Security centre
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-5 grid grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] items-start gap-5">
            {/* Left: one unified settings list */}
            <div className="card-surface overflow-hidden">
              {GROUPS.map((group, gi) => (
                <section key={group.label} className={gi > 0 ? "border-t border-border" : ""}>
                  <h2 className="bg-secondary/40 px-5 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </h2>
                  <ul className="divide-y divide-border/60">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="group relative flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-secondary/50"
                        >
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
                          />
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25 transition-transform duration-300 group-hover:scale-105">
                            <item.icon className="size-[18px]" strokeWidth={2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-bold tracking-tight">
                              {item.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                              {item.sub}
                            </p>
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

            {/* Right rail: account status + footer */}
            <aside className="space-y-4">
              <div className="card-surface overflow-hidden">
                <p className="border-b border-border/60 bg-secondary/40 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  Account status
                </p>
                <div className="divide-y divide-border/60">
                  {[
                    {
                      to: "/verification" as const,
                      icon: ShieldCheck,
                      label: "Verification",
                      value: tier,
                      note: "Full access to funding and withdrawals",
                    },
                    {
                      to: "/withdraw/accounts" as const,
                      icon: Landmark,
                      label: "Payout accounts",
                      value: "2 saved",
                      note: "Bank destinations for withdrawals",
                    },
                    {
                      to: "/settings/cards" as const,
                      icon: CreditCard,
                      label: "Linked cards",
                      value: "2 cards",
                      note: "Saved cards for quick funding",
                    },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      to={s.to}
                      className="group flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-secondary/50"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                        <s.icon className="size-[18px]" strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {s.label}
                        </p>
                        <p className="mt-0.5 font-display text-[16px] font-extrabold tracking-[-0.01em]">
                          {s.value}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                          {s.note}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card-surface p-5">
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-5 py-2.5 text-[13px] font-extrabold text-destructive transition-colors hover:bg-destructive/5"
                >
                  <LogOut className="size-4" strokeWidth={2.6} /> Log out
                </button>
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  Kipit v1.0.0 · Investments carry risk. Returns are not guaranteed.
                </p>
              </div>
            </aside>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
