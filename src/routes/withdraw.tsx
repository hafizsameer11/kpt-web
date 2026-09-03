import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Clock,
  Landmark,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira, WALLET } from "@/lib/home-data";
import {
  maskAccount,
  MIN_WITHDRAWAL,
  payoutEta,
  SAVED_ACCOUNTS,
  TIER,
  WITHDRAWAL_FEE,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw Funds | Kipit" },
      {
        name: "description",
        content:
          "Move money from your Kipit wallet to your Nigerian bank account — instant NIP payouts with zero transfer fees.",
      },
      { property: "og:title", content: "Withdraw Funds | Kipit" },
      {
        property: "og:description",
        content:
          "Withdraw your Kipit wallet balance to a verified payout account in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={2}>
      <WithdrawEntry />
    </KycGuard>
  ),
});

function WithdrawEntry() {
  return (
    <>
      <div className="md:hidden">
        <MobileWithdraw />
      </div>
      <div className="hidden md:block">
        <DesktopWithdraw />
      </div>
    </>
  );
}

function MobileWithdraw() {
  const eligible = TIER.eligible;

  return (
    <AppShell title="Withdraw" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Home
              </Link>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <BadgeCheck className="size-3.5" /> {TIER.label}
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Available to withdraw
            </p>
            <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
              {naira(WALLET)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              Kipit Wallet &middot; {payoutEta}
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
                Withdrawal details
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Minimum">{naira(MIN_WITHDRAWAL)}</Row>
                <Row label="Per transaction limit">{naira(TIER.singleLimit)}</Row>
                <Row label="Daily limit">{naira(TIER.dailyLimit)}</Row>
                <Row label="Transfer fee">
                  {WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                How it works
              </p>
              <ul className="mt-3 space-y-3">
                {[
                  { icon: Landmark, text: "Pick a verified payout account" },
                  { icon: Banknote, text: "Enter the amount to withdraw" },
                  { icon: Clock, text: "Authorize and track until it settles" },
                ].map((s) => (
                  <li key={s.text} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                      <s.icon className="size-4.5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {s.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-5">
            {eligible ? (
              <Link
                to="/withdraw/accounts"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
              >
                Continue <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            ) : (
              <Link
                to="/withdraw/restricted"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
              >
                Continue <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            )}
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Wallet className="size-3.5" />
              {SAVED_ACCOUNTS.length} saved payout account
              {SAVED_ACCOUNTS.length === 1 ? "" : "s"} on file.
            </p>
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
