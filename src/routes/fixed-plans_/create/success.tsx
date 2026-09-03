import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PiggyBank, RefreshCcw, Wallet } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans_/create/success")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    days: z.number().catch(0),
    name: z.string().catch(""),
    maturity: z.enum(["wallet", "rollover", "call"]).catch("wallet"),
  }),
  head: () => ({
    meta: [
      { title: "Investment Created | Kipit Fixed Plans" },
      {
        name: "description",
        content:
          "Your Kipit fixed plan is active — see your rate, maturity date and expected payout.",
      },
      { property: "og:title", content: "Investment Created | Kipit Fixed Plans" },
      {
        property: "og:description",
        content: "Your fixed investment plan is now active on Kipit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanSuccessScreen,
});

const DAY_MS = 86_400_000;

const MATURITY_LABEL = {
  wallet: { label: "Move funds to wallet", icon: Wallet },
  rollover: { label: "Roll over investment", icon: RefreshCcw },
  call: { label: "Move to Call Account", icon: PiggyBank },
} as const;

function PlanSuccessScreen() {
  const { amount, days, name, maturity } = Route.useSearch();
  const band = TENOR_BANDS.find(
    (b) => Number(b.days.replace(/\D/g, "")) === days,
  );
  const ratePct = band ? Number(band.rate.replace(/[^0-9.]/g, "")) : 14;
  const rateLabel = band ? band.rate : `${ratePct}%`;
  const productName = name || band?.name || "Kipit Fixed Plan";
  const interest = Math.round((amount * (ratePct / 100) * days) / 365);
  const payout = amount + interest;
  const maturityDate = new Date(Date.now() + days * DAY_MS).toLocaleDateString(
    "en-NG",
    { day: "2-digit", month: "short", year: "numeric" },
  );
  const reference = `KPT-FP-${String(Math.abs(amount + days) % 100000).padStart(5, "0")}`;
  const MaturityIcon = MATURITY_LABEL[maturity].icon;

  return (
    <AppShell title="Investment Created" navVariant="elevated">
      <div className="pb-2">
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
              Investment created
            </p>
            <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              {productName} · {rateLabel} p.a. for {days} days
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
                Plan details
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Reference">{reference}</Row>
                <Row label="Plan">{productName}</Row>
                <Row label="Rate">{rateLabel} p.a.</Row>
                <Row label="Maturity date">{maturityDate}</Row>
                <Row label="At maturity">
                  <span className="inline-flex items-center gap-1.5">
                    <MaturityIcon className="size-3.5 text-gold" />
                    {MATURITY_LABEL[maturity].label}
                  </span>
                </Row>
                <Row label="Status">
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    Active
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Expected payout
              </p>
              <p className="mt-2 font-display text-[30px] font-extrabold leading-none text-num">
                {naira(payout)}
              </p>
              <p className="mt-2 text-[12px] font-semibold text-emerald-600">
                +{naira(interest)} interest by {maturityDate}
              </p>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Indicative. Early liquidation may reduce interest earned.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/fixed-plans"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              View plan <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Back to portfolio
            </Link>
            <Link
              to="/fixed-plans/create"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Create another plan
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
      <dd className="text-right font-bold text-foreground">{children}</dd>
    </div>
  );
}
