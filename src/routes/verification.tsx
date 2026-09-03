import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  Fingerprint,
  IdCard,
  Landmark,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { TIERS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Verification Centre | Kipit" },
      {
        name: "description",
        content:
          "Track your Kipit verification tiers, see what each level unlocks and complete BVN, NIN, selfie and address checks.",
      },
      { property: "og:title", content: "Verification Centre | Kipit" },
      {
        property: "og:description",
        content: "Complete your KYC to unlock higher limits and withdrawals on Kipit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerificationCentre,
});

const CHECKLIST = [
  { icon: Fingerprint, label: "BVN verification", meta: "Tier 1", done: false },
  { icon: IdCard, label: "National Identity Number", meta: "Tier 2", done: false },
  { icon: Camera, label: "Live selfie check", meta: "Tier 2", done: false },
  { icon: Landmark, label: "Address & proof of residence", meta: "Tier 2", done: false },
];

function VerificationCentre() {
  return (
    <AppShell title="Verification" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-gold">
              <ShieldCheck className="size-3.5" strokeWidth={2.6} /> Verification centre
            </span>
            <h1 className="mt-4 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              Unlock your full Kipit account
            </h1>
            <p className="mt-2 max-w-md text-[12.5px] text-primary-foreground/65">
              Verification keeps your money safe and is required by SEC and CBN rules.
              Tier 1 takes about a minute.
            </p>

            <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
              <span className="block h-full w-[10%] rounded-full bg-gold" />
            </div>
            <p className="mt-2 text-[11.5px] text-primary-foreground/60">
              0 of 4 checks completed
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            {TIERS.map((tier) => (
              <section key={tier.id} className="card-surface p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      {tier.id === "tier1" ? (
                        <Fingerprint className="size-5" strokeWidth={2.2} />
                      ) : (
                        <BadgeCheck className="size-5" strokeWidth={2.2} />
                      )}
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold text-foreground">{tier.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">{tier.status}</p>
                    </div>
                  </div>
                  {tier.id === "tier2" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                      <Lock className="size-3" strokeWidth={2.6} /> Locked
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[12.5px] leading-snug text-muted-foreground">
                  {tier.blurb}
                </p>

                <dl className="mt-3 divide-y divide-border text-[12.5px]">
                  {tier.limits.map((l) => (
                    <div key={l.label} className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-muted-foreground">{l.label}</dt>
                      <dd className="font-bold text-foreground">{l.value}</dd>
                    </div>
                  ))}
                </dl>

                <Link
                  to={tier.id === "tier1" ? "/verification/tier1" : "/verification/tier2"}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-[13px] font-extrabold text-primary-foreground shadow-float press"
                >
                  {tier.id === "tier1" ? "Start Tier 1" : "Start Tier 2"}
                  <ArrowRight className="size-4" strokeWidth={2.6} />
                </Link>
              </section>
            ))}
          </div>

          <section className="mt-5">
            <h2 className="mb-2.5 px-1 font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Your checks
            </h2>
            <ul className="card-surface divide-y divide-border/60 overflow-hidden">
              {CHECKLIST.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3.5 px-4 py-3.5">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        item.done ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.done ? (
                        <Check className="size-5" strokeWidth={2.8} />
                      ) : (
                        <Icon className="size-5" strokeWidth={2.2} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-foreground">
                        {item.label}
                      </span>
                      <span className="block text-[11.5px] text-muted-foreground">
                        {item.meta} · {item.done ? "Completed" : "Pending"}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 px-1 text-[11.5px] text-muted-foreground">
              Your data is encrypted and only used to verify your identity as required by law.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
