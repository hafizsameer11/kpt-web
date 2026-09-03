import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Info, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";

export const Route = createFileRoute("/call-account_/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Deposit Successful | Kipit Call Account" },
      {
        name: "description",
        content:
          "Your money is now in your Kipit Call Account and starts earning daily interest immediately.",
      },
      { property: "og:title", content: "Deposit Successful | Kipit Call Account" },
      {
        property: "og:description",
        content: "Your Call Account deposit was successful and starts earning today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessScreen,
});

const RATE = 0.145;

function SuccessScreen() {
  const { amount } = Route.useSearch();
  const dailyInterest = Math.round((amount * RATE) / 365);
  const monthlyInterest = Math.round((amount * RATE) / 12);
  const reference = `KPT-CA-${String(Math.abs(amount) % 100000).padStart(5, "0")}`;

  return (
    <AppShell title="Successful" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:shadow-float">
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
              Added to Call Account
            </p>
            <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              Interest starts accruing today at {CALL_ACCOUNT.rate}
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
                Receipt
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Reference">{reference}</Row>
                <Row label="From">Kipit Wallet</Row>
                <Row label="To">Call Account</Row>
                <Row label="Status">
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    Successful
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <TrendingUp className="size-3.5" /> Projected earnings
              </p>
              <div className="mt-3 flex divide-x divide-border">
                <div className="flex-1 pr-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Per day</p>
                  <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num">
                    {naira(dailyInterest)}
                  </p>
                </div>
                <div className="flex-1 pl-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Per month</p>
                  <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num">
                    {naira(monthlyInterest)}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                Indicative — accrues daily, credited monthly.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/call-account"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              View Call Account <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{children}</dd>
    </div>
  );
}
