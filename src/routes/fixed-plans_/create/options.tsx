import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Gift,
  PiggyBank,
  RefreshCcw,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { AmountCounter, Rise } from "@/components/kipit/motion";
import { naira, WALLET } from "@/lib/home-data";
import { TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans_/create/options")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    days: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Plan Options | Kipit" },
      {
        name: "description",
        content:
          "Personalise your fixed plan — name it, set a goal, enable auto-invest, gift it, and choose what happens at maturity.",
      },
      { property: "og:title", content: "Plan Options | Kipit" },
      {
        property: "og:description",
        content:
          "Optional plan name, savings goal, auto-invest, gifting and maturity instructions for your Kipit fixed plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanOptionsScreen,
});

const DAY_MS = 86_400_000;

/** MOB-074 — maturity instruction options. */
const MATURITY_OPTIONS = [
  {
    id: "wallet",
    name: "Move funds to wallet",
    note: "Principal + interest land in your Kipit Wallet at maturity.",
    icon: Wallet,
  },
  {
    id: "rollover",
    name: "Roll over investment",
    note: "Automatically reinvest principal + interest into the same plan.",
    icon: RefreshCcw,
  },
  {
    id: "call",
    name: "Move to Call Account",
    note: "Keep earning daily interest with same-day access.",
    icon: PiggyBank,
  },
] as const;

/** MOB-071 — auto-invest frequencies. */
const FREQUENCIES = ["Weekly", "Monthly"] as const;

function PlanOptionsScreen() {
  const { amount, days } = Route.useSearch();
  const band = TENOR_BANDS.find(
    (b) => Number(b.days.replace(/\D/g, "")) === days,
  );
  const rate = band ? band.rate : "—";

  /* MOB-070 — optional fields */
  const [planName, setPlanName] = useState("");
  const [goal, setGoal] = useState("");
  const [target, setTarget] = useState("");

  /* MOB-071 — auto-invest */
  const [autoInvest, setAutoInvest] = useState(false);
  const [autoAmount, setAutoAmount] = useState("");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("Monthly");
  const todayISO = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayISO);

  /* MOB-072/073 — gift */
  const [forWhom, setForWhom] = useState<"self" | "gift">("self");
  const [recipient, setRecipient] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  /* MOB-074 — maturity instruction */
  const [maturity, setMaturity] = useState<(typeof MATURITY_OPTIONS)[number]["id"]>("wallet");

  const maturityDate = days
    ? new Date(Date.now() + days * DAY_MS).toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const giftValid =
    forWhom === "self" || (recipient.trim().length > 1 && recipientContact.trim().length > 3);

  return (
    <AppShell title="Plan Options" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero summary ───────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/fixed-plans/create/tenor"
              search={{ amount }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Tenor
            </Link>
            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Almost there
            </p>
            <p
              className="k-rise mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              <AmountCounter value={amount} hidden={false} mask={(v) => naira(v)} />
            </p>
            <p
              className="k-rise mt-3 text-[12px] font-medium text-primary-foreground/60"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {days} days at {rate} p.a.
              {maturityDate ? ` · matures ${maturityDate}` : ""}
            </p>
          </div>
        </section>

        {/* ── Sheet ──────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            {/* MOB-070 — optional plan details */}
            <Rise>
              <section className="card-surface p-4 md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Personalise <span className="normal-case tracking-normal">(optional)</span>
                </p>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-foreground">Plan name</span>
                    <input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g. December Detty Fund"
                      maxLength={40}
                      className="mt-1.5 w-full rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold/60"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-foreground">Savings goal</span>
                    <input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. School fees"
                      maxLength={60}
                      className="mt-1.5 w-full rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold/60"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-foreground">Target amount</span>
                    <div className="mt-1.5 flex items-baseline gap-1 rounded-2xl border border-border/70 bg-background px-3.5 py-3 transition-colors focus-within:border-gold/60">
                      <span className="text-[13px] font-bold text-muted-foreground">₦</span>
                      <input
                        inputMode="numeric"
                        value={target}
                        onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="5,000,000"
                        className="w-full bg-transparent text-[13.5px] font-medium text-num outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </label>
                </div>
              </section>
            </Rise>

            {/* MOB-071 — auto-invest */}
            <Rise delay={60}>
              <section className="card-surface p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-foreground">Auto-invest</p>
                    <p className="text-[12px] text-muted-foreground">
                      Top up this plan on a schedule.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoInvest}
                    aria-label="Enable auto-invest"
                    onClick={() => setAutoInvest((v) => !v)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 press ${
                      autoInvest ? "bg-gold" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-6 rounded-full bg-card shadow transition-all duration-200 ${
                        autoInvest ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {autoInvest && (
                  <div className="k-rise mt-4 space-y-3">
                    <label className="block">
                      <span className="text-[12px] font-semibold text-foreground">Amount</span>
                      <div className="mt-1.5 flex items-baseline gap-1 rounded-2xl border border-border/70 bg-background px-3.5 py-3 transition-colors focus-within:border-gold/60">
                        <span className="text-[13px] font-bold text-muted-foreground">₦</span>
                        <input
                          inputMode="numeric"
                          value={autoAmount}
                          onChange={(e) => setAutoAmount(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="50,000"
                          className="w-full bg-transparent text-[13.5px] font-medium text-num outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FREQUENCIES.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFrequency(f)}
                          aria-pressed={frequency === f}
                          className={`rounded-2xl border py-2.5 text-[12.5px] font-bold transition-colors press ${
                            frequency === f
                              ? "border-gold/60 bg-gold/10 text-foreground"
                              : "border-border/70 bg-background text-muted-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <label className="block">
                      <span className="text-[12px] font-semibold text-foreground">Start date</span>
                      <input
                        type="date"
                        value={startDate}
                        min={todayISO}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1.5 w-full rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium text-foreground outline-none transition-colors focus:border-gold/60"
                      />
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3.5 py-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                        <Wallet className="size-4" strokeWidth={2.4} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-bold text-foreground">
                          Kipit Wallet
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          Funding source · {naira(WALLET)} available
                        </span>
                      </span>
                      <Check className="size-4 shrink-0 text-gold" strokeWidth={3} />
                    </div>
                    {autoAmount && Number(autoAmount) > WALLET && (
                      <p className="k-shake rounded-2xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                        Auto-invest amount is above your wallet balance of {naira(WALLET)}.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </Rise>

            {/* MOB-072/073 — gift */}
            <Rise delay={120}>
              <section className="card-surface p-4 md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Who is this plan for?
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "self", name: "For myself", icon: User },
                      { id: "gift", name: "Send as a gift", icon: Gift },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setForWhom(o.id)}
                      aria-pressed={forWhom === o.id}
                      className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-colors press ${
                        forWhom === o.id
                          ? "border-gold/60 bg-gold/10"
                          : "border-border/70 bg-background hover:bg-muted/40"
                      }`}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-xl ${
                          forWhom === o.id ? "bg-gold text-gold-foreground" : "bg-primary/[0.06] text-foreground"
                        }`}
                      >
                        <o.icon className="size-4" strokeWidth={2.4} />
                      </span>
                      <span className="truncate text-[12px] font-bold text-foreground">{o.name}</span>
                    </button>
                  ))}
                </div>

                {forWhom === "gift" && (
                  <div className="k-rise mt-4 space-y-3">
                    <input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Recipient name"
                      maxLength={50}
                      aria-label="Recipient name"
                      className="w-full rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold/60"
                    />
                    <input
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      placeholder="Recipient email or phone"
                      aria-label="Recipient email or phone"
                      className="w-full rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold/60"
                    />
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Personal message (optional)"
                      rows={2}
                      maxLength={140}
                      aria-label="Personal message"
                      className="w-full resize-none rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-[13.5px] font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold/60"
                    />
                    {!giftValid && (recipient || recipientContact) && (
                      <p className="k-shake rounded-2xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                        Add the recipient's name and email or phone to gift this plan.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </Rise>

            {/* MOB-074 — maturity instruction */}
            <Rise delay={180}>
              <section className="card-surface p-4 md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  At maturity
                </p>
                <div className="mt-3 space-y-2">
                  {MATURITY_OPTIONS.map((o) => {
                    const active = maturity === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setMaturity(o.id)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors press ${
                          active
                            ? "border-gold/60 bg-gold/[0.07]"
                            : "border-border/70 bg-background hover:bg-muted/40"
                        }`}
                      >
                        <span
                          className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                            active ? "border-gold bg-gold" : "border-muted-foreground/30"
                          }`}
                        >
                          {active && (
                            <Check
                              key={o.id}
                              className="k-pop size-3 text-gold-foreground"
                              strokeWidth={4}
                            />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold text-foreground">{o.name}</span>
                          <span className="block text-[11.5px] text-muted-foreground">{o.note}</span>
                        </span>
                        <o.icon
                          className={`size-4 shrink-0 ${active ? "text-gold" : "text-muted-foreground/40"}`}
                          strokeWidth={2.2}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            </Rise>
          </div>

          {/* CTA → MOB-075 Plan Review */}
          <div className="mt-5">
            <button
              type="button"
              disabled={!giftValid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                giftValid ? "k-glow" : "opacity-40 shadow-none"
              }`}
            >
              Review plan
              <ChevronDown className="size-4 rotate-[-90deg]" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground md:text-left">
              Next: review the full summary and confirm your investment.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
