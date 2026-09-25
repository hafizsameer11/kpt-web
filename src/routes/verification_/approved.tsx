import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useEffect } from "react";
import { fetchKyc } from "@/lib/api";
import { setKycTier } from "@/lib/kyc-state";
import { AppShell } from "@/components/kipit/AppShell";
import { TIERS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/approved")({
  head: () => ({
    meta: [
      { title: "Verification Approved | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit Tier 2 verification is approved — withdrawals and higher limits are now unlocked.",
      },
      { property: "og:title", content: "Verification Approved | Kipit" },
      { property: "og:description", content: "Tier 2 approved on Kipit — withdrawals unlocked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycApproved,
});

const tier2 = TIERS[1]!;

function KycApproved() {
  useEffect(() => {
    void fetchKyc()
      .then((kyc) => {
        const tier = kyc.tier === "TIER_2" ? 2 : kyc.tier === "TIER_1" ? 1 : 0;
        setKycTier(tier);
      })
      .catch(() => {
        /* keep prior tier from session */
      });
  }, []);

  return (
    <AppShell title="Verified" navVariant="elevated">
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
                <BadgeCheck className="size-8" strokeWidth={2.4} />
              </span>
            </span>
            <p className="k-success-fade mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Approved
            </p>
            <p className="k-success-fade mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.03em]">
              You're Tier 2 verified
            </p>
            <p className="k-success-fade mx-auto mt-3 max-w-sm text-[12.5px] text-primary-foreground/70">
              Withdrawals are unlocked and your limits have been raised.
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
                Your new limits
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                {tier2.limits.map((l) => (
                  <div key={l.label} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-muted-foreground">{l.label}</dt>
                    <dd className="font-bold text-foreground">{l.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next steps
              </p>
              <p className="mt-3 text-[12.5px] leading-snug text-muted-foreground">
                Add a payout bank account so withdrawals settle straight to you, or put more
                money to work in a fixed plan.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to="/withdraw/accounts"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground press"
                >
                  Payout accounts
                </Link>
                <Link
                  to="/fixed-plans/create"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground press"
                >
                  New plan
                </Link>
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              Back to home <ArrowRight className="size-4" strokeWidth={2.6} />
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
