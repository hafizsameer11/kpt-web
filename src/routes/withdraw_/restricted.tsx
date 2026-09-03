import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, IdCard, Lock, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";

export const Route = createFileRoute("/withdraw_/restricted")({
  head: () => ({
    meta: [
      { title: "Withdrawal Restricted | Kipit" },
      {
        name: "description",
        content:
          "Complete your Kipit verification to unlock withdrawals to your bank account.",
      },
      { property: "og:title", content: "Withdrawal Restricted | Kipit" },
      {
        property: "og:description",
        content: "Finish KYC verification to withdraw funds from Kipit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RestrictedScreen,
});

const NEEDED = [
  "Bank Verification Number (BVN)",
  "A valid government-issued ID",
  "Residential address details",
];

function RestrictedScreen() {
  return (
    <AppShell title="Withdrawal Restricted" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold/15 text-gold">
              <ShieldAlert className="size-8" strokeWidth={2.2} />
            </span>
            <p className="mt-5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
              Withdrawals are locked
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-primary-foreground/70">
              Complete your verification to withdraw funds. Tier 1 accounts can
              fund and invest, but payouts need full KYC.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <section className="card-surface p-4 md:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What you'll need
            </p>
            <ul className="mt-3 space-y-3">
              {NEEDED.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                    <IdCard className="size-4.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/settings"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              Complete Verification <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/withdraw"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Lock className="size-3.5" /> Verification usually completes in a few minutes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
