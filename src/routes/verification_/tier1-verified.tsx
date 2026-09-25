import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useEffect } from "react";
import { setKycTier } from "@/lib/kyc-state";
import { AppShell } from "@/components/kipit/AppShell";
import { TIERS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/tier1-verified")({
  head: () => ({
    meta: [
      { title: "Tier 1 Verified | Kipit" },
      {
        name: "description",
        content:
          "Your BVN is verified. Fund your Kipit wallet and start investing, or continue to Tier 2 for withdrawals.",
      },
      { property: "og:title", content: "Tier 1 Verified | Kipit" },
      { property: "og:description", content: "Tier 1 verification complete on Kipit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tier1Verified,
});

const tier1 = TIERS[0]!;

function Tier1Verified() {
  useEffect(() => {
    setKycTier(1);
  }, []);

  return (
    <AppShell title="Tier 1 Verified" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-16 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold"
              />
              <span className="k-success-pop grid size-16 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="k-success-check"
                  />
                </svg>
              </span>
            </span>
            <p className="k-success-fade mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Verification complete
            </p>
            <p className="k-success-fade mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.03em]">
              You're Tier 1 verified
            </p>
            <p className="k-success-fade mx-auto mt-3 max-w-sm text-[12.5px] text-primary-foreground/70">
              You can now fund your wallet and invest in Kipit plans.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your Tier 1 limits
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                {tier1.limits.map((l) => (
                  <div key={l.label} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-muted-foreground">{l.label}</dt>
                    <dd className="font-bold text-foreground">{l.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Unlock withdrawals
              </p>
              <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
                Tier 2 adds your NIN, a live selfie and your address — it takes about 5 minutes
                and unlocks payouts to your bank.
              </p>
              <Link
                to="/verification/tier2"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground press"
              >
                Start Tier 2
              </Link>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/wallet/add-money"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              Add money <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/verification"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Verification centre
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
