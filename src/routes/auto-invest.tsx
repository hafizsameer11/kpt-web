import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Plus,
  Repeat,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { naira, WALLET } from "@/lib/home-data";
import {
  AUTO_INVEST_DESTINATIONS,
  AUTO_INVEST_FREQUENCIES,
  AUTO_INVEST_RULES,
  type AutoInvestFrequency,
  type AutoInvestRule,
} from "@/lib/invest-data";

export const Route = createFileRoute("/auto-invest")({
  head: () => ({
    meta: [
      { title: "Auto-invest — Fund Your Kipit Plans on a Schedule" },
      {
        name: "description",
        content:
          "Set up recurring transfers from your Kipit wallet into the Call Account or a fixed plan — weekly, fortnightly or monthly.",
      },
      { property: "og:title", content: "Auto-invest — Kipit" },
      {
        property: "og:description",
        content:
          "Automate your investing: pick a plan, an amount and a frequency, and Kipit funds it for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AutoInvestScreen,
});

/** Approximate monthly commitment from a rule's frequency. */
const monthlyValue = (r: AutoInvestRule) =>
  r.frequency === "Weekly"
    ? r.amount * 4
    : r.frequency === "Every 2 weeks"
      ? r.amount * 2
      : r.amount;

function AutoInvestScreen() {
  const { hidden, mask } = useBalanceVisibility();
  const isMobile = useIsMobile();
  const [rules, setRules] = useState<AutoInvestRule[]>(AUTO_INVEST_RULES);
  const [open, setOpen] = useState(false);

  const active = rules.filter((r) => r.active);
  const monthlyTotal = active.reduce((s, r) => s + monthlyValue(r), 0);

  const toggle = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        toast(r.active ? "Auto-invest paused" : "Auto-invest resumed", {
          description: `${r.destination} · ${naira(r.amount)} ${r.frequency.toLowerCase()}`,
        });
        return { ...r, active: !r.active, nextRun: r.active ? "Paused" : "01 Oct 2026" };
      }),
    );
  };

  const addRule = (rule: AutoInvestRule) => {
    setRules((prev) => [rule, ...prev]);
    setOpen(false);
    toast("Auto-invest created", {
      description: `${naira(rule.amount)} into ${rule.destination}, ${rule.frequency.toLowerCase()}.`,
    });
  };

  return (
    <AppShell title="Auto-invest" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────── */}
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
            <Link
              to="/invest"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Invest
            </Link>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Investing automatically each month
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={monthlyTotal} hidden={hidden} mask={mask} />
            </h1>
            <p
              className="k-rise mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold"
              style={{ ["--d" as string]: "80ms" }}
            >
              <Repeat className="size-3.5 text-gold" />
              {active.length} active {active.length === 1 ? "rule" : "rules"} ·{" "}
              {rules.length - active.length} paused
            </p>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-brand px-4 py-3.5 text-brand-foreground press"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/12">
              <Plus className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[13px] font-bold">New auto-invest</span>
              <span className="block text-[11.5px] text-brand-foreground/70">
                Fund a plan weekly, fortnightly or monthly
              </span>
            </span>
          </button>

          <h2 className="mb-2.5 mt-6 px-1 font-display text-[15px] font-extrabold">
            Your schedules
          </h2>

          <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {rules.map((r, i) => (
              <li
                key={r.id}
                className="k-rise card-surface p-4"
                style={{ ["--d" as string]: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
                    <Repeat className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{r.destination}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {r.rate} · {r.frequency}
                    </p>
                  </div>
                  <Switch
                    checked={r.active}
                    onCheckedChange={() => toggle(r.id)}
                    aria-label={`${r.active ? "Pause" : "Resume"} auto-invest into ${r.destination}`}
                  />
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Amount
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-extrabold text-num">
                      {mask(r.amount)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Next run
                    </p>
                    <p className="mt-0.5 truncate text-[12.5px] font-extrabold">
                      {r.nextRun}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Invested
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-extrabold text-num">
                      {mask(r.investedToDate)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <Wallet className="size-3.5" /> Funded from {r.fundedFrom}
                </p>
              </li>
            ))}
          </ul>

          <section className="mt-5 rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold">
              <CalendarClock className="size-4 text-brand" /> How auto-invest works
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              On each run date Kipit moves the amount from your wallet into the plan you
              chose. If your wallet balance is short, the run is skipped and we notify you —
              no fees, no penalty. Pause or edit any schedule at any time.
            </p>
            <Link
              to="/wallet/add-money"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11.5px] font-bold text-brand press"
            >
              <Plus className="size-3.5" /> Top up wallet · {naira(WALLET)} available
            </Link>
          </section>

          <DisclosureStrip />
        </div>
      </div>

      <NewRuleForm
        open={open}
        onOpenChange={setOpen}
        onCreate={addRule}
        isMobile={isMobile}
      />
    </AppShell>
  );
}

/* ── New rule form (bottom sheet on mobile, dialog on desktop) ───────── */

function NewRuleForm({
  open,
  onOpenChange,
  onCreate,
  isMobile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (rule: AutoInvestRule) => void;
  isMobile: boolean;
}) {
  const [destination, setDestination] = useState(AUTO_INVEST_DESTINATIONS[0]!.name);
  const [frequency, setFrequency] = useState<AutoInvestFrequency>("Monthly");
  const [raw, setRaw] = useState("");

  const dest =
    AUTO_INVEST_DESTINATIONS.find((d) => d.name === destination) ??
    AUTO_INVEST_DESTINATIONS[0]!;
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const belowMin = amount > 0 && amount < dest.minimum;
  const valid = amount > 0 && !belowMin;

  const submit = () => {
    if (!valid) return;
    onCreate({
      id: `ai-${Date.now()}`,
      destination: dest.name,
      rate: dest.rate,
      amount,
      frequency,
      nextRun: "01 Oct 2026",
      fundedFrom: "Kipit wallet",
      investedToDate: 0,
      active: true,
    });
    setRaw("");
  };

  const body = (
    <div className="px-5 pb-6 pt-1">
      <p className="font-display text-[17px] font-extrabold">New auto-invest</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        Recurring funding from your Kipit wallet.
      </p>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Destination
      </p>
      <ul className="mt-2 overflow-hidden rounded-xl border border-border">
        {AUTO_INVEST_DESTINATIONS.map((d, i) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => setDestination(d.name)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                i > 0 ? "border-t border-border/60" : ""
              } ${destination === d.name ? "bg-secondary" : "hover:bg-muted/50"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold">{d.name}</span>
                <span className="block text-[11.5px] text-muted-foreground">
                  {d.rate} · min {naira(d.minimum)}
                </span>
              </span>
              {destination === d.name && <Check className="size-4 shrink-0 text-brand" />}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Amount
      </p>
      <div className="mt-2 flex items-baseline gap-1.5 rounded-xl border border-border px-4 py-3">
        <span className="font-display text-[24px] font-extrabold text-muted-foreground">₦</span>
        <input
          inputMode="numeric"
          autoComplete="off"
          aria-label="Auto-invest amount"
          placeholder="0"
          value={amount ? amount.toLocaleString("en-NG") : ""}
          onChange={(e) => setRaw(e.target.value)}
          className="w-full min-w-0 bg-transparent font-display text-[24px] font-extrabold leading-none tracking-[-0.03em] text-num outline-none placeholder:text-muted-foreground/40"
        />
      </div>
      {belowMin && (
        <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
          Minimum for {dest.name} is {naira(dest.minimum)}.
        </p>
      )}

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Frequency
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {AUTO_INVEST_FREQUENCIES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={`rounded-xl border px-2 py-2.5 text-[11.5px] font-bold transition-colors press ${
              frequency === f
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={submit}
        className="mt-6 w-full rounded-xl bg-brand py-3.5 text-[13.5px] font-bold text-brand-foreground disabled:opacity-40 press"
      >
        Create auto-invest
      </button>
      <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
        First run on 01 Oct 2026 · cancel anytime
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92svh] rounded-t-[2rem] bg-card px-0 pb-0 pt-2">
          <DrawerTitle className="sr-only">New auto-invest</DrawerTitle>
          <DrawerDescription className="sr-only">
            Set a recurring investment from your Kipit wallet.
          </DrawerDescription>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {body}
          </div>

        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88svh] overflow-y-auto p-0 pt-5 sm:max-w-md">
        <DialogTitle className="sr-only">New auto-invest</DialogTitle>
        <DialogDescription className="sr-only">
          Set a recurring investment from your Kipit wallet.
        </DialogDescription>
        {body}
      </DialogContent>
    </Dialog>
  );
}
