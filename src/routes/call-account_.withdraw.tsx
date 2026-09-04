import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Info,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";

export const Route = createFileRoute("/call-account_/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw from Call Account | Kipit" },
      {
        name: "description",
        content:
          "Move money out of your Kipit Call Account — instantly to your wallet, or straight out to your verified bank account.",
      },
      { property: "og:title", content: "Withdraw from Call Account | Kipit" },
      {
        property: "og:description",
        content:
          "Choose where your Call Account money goes: your Kipit wallet or your bank account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={1}>
      <WithdrawChoice />
    </KycGuard>
  ),
});

function WithdrawChoice() {
  return (
    <AppShell title="Withdraw" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />
          <div className="relative">
            <Link
              to="/call-account"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Call Account
            </Link>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Available in Call Account
            </p>
            <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
              {naira(CALL_ACCOUNT.balance)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5" /> Fully liquid &middot; no penalty, no notice period
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Where should the money go?
          </p>

          <div className="mt-3 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <Option
              to="/call-account/withdraw/wallet"
              icon={Wallet}
              title="Move to my wallet"
              badge="Instant · Free"
              body="Lands in your Kipit wallet straight away, ready to reinvest. Wallet money earns nothing."
            />
            <Option
              to="/withdraw"
              icon={Building2}
              title="Send to my bank"
              badge="Within 5 minutes"
              body="Goes out through your wallet to a payout account verified in your name."
            />
          </div>

          <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Your wallet is the settlement account for everything on Kipit, so money
            always passes through it on its way to your bank.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Option({
  to,
  icon: Icon,
  title,
  badge,
  body,
}: {
  to: string;
  icon: typeof Wallet;
  title: string;
  badge: string;
  body: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="card-surface flex items-start gap-3 p-4 press md:p-5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-bold text-foreground">{title}</span>
          <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-extrabold text-primary">
            {badge}
          </span>
        </span>
        <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
          {body}
        </span>
      </span>
      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
