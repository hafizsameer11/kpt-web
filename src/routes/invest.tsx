import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Eye,
  EyeOff,
  Gift,
  Plus,
  RefreshCw,
  Repeat,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { AmountCounter } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import {
  CALL_ACCOUNT,
  FLEX_HOW_IT_WORKS,
  LOCK_HOW_IT_WORKS,
  PLAN_MIN_NAIRA,
  useTenorBands,
  type CatalogTenor,
  type PlanFamily,
} from "@/lib/invest-data";
import {
  useCallAccountLive,
  useHydrateLiveBalances,
  type LiveHolding,
} from "@/lib/live-balances";

function mapLiveHolding(h: LiveHolding) {
  const daysLeft = h.maturityDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(h.maturityDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
        ),
      )
    : 0;
  const date = h.maturityDate
    ? new Date(h.maturityDate).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
  const tenorDays = Math.max(h.tenorDays || 0, daysLeft, 1);
  const elapsed = Math.max(0, tenorDays - daysLeft);
  return {
    id: h.id,
    name: h.name,
    rate: `${h.ratePct}% p.a.`,
    amount: h.amount,
    finalValue: h.valueAtMaturity ?? h.amount + (h.expectedInterest ?? 0),
    date,
    daysLeft,
    totalDays: tenorDays,
    progress: Math.min(100, Math.max(0, Math.round((elapsed / tenorDays) * 100))),
  };
}

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — Kipit Investment Products" },
      {
        name: "description",
        content:
          "Kipit's direct investment products: a liquid Call Account and Kipit Lock / Kipit Flex plans with transparent rate, tenor and minimum investment.",
      },
      { property: "og:title", content: "Invest — Kipit Investment Products" },
      {
        property: "og:description",
        content:
          "Choose the Kipit Call Account for daily interest, or Kipit Lock / Kipit Flex with a clear rate, tenor and minimum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestScreen,
});

function InvestScreen() {
  return (
    <AppShell title="Invest" navVariant="elevated">
      <DesktopInvest />
      <MobileInvest />
    </AppShell>
  );
}

function TenorGrid({
  family,
  tenors,
  loading,
  featured = false,
}: {
  family: PlanFamily;
  tenors: CatalogTenor[];
  loading: boolean;
  featured?: boolean;
}) {
  const min = PLAN_MIN_NAIRA;
  return (
    <div className={`grid grid-cols-2 gap-3 ${featured ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4"} md:gap-4`}>
      {loading && !tenors.length ? (
        <p className="col-span-2 text-[12.5px] text-muted-foreground md:col-span-4">
          Loading rates…
        </p>
      ) : null}
      {!loading && !tenors.length ? (
        <p className="col-span-2 text-[12.5px] text-muted-foreground md:col-span-4">
          No tenor bands available.
        </p>
      ) : null}
      {tenors.map((band, i) => (
        <article
          key={`${family}-${band.days}`}
          style={{ ["--d" as string]: `${i * 70}ms` }}
          className="k-rise relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-accent/60"
          />
          <div className="relative">
            <h3 className="font-display text-[15px] font-extrabold leading-tight md:text-base">
              {band.days} days
            </h3>
            <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground md:text-[11px]">
              Matures{" "}
              {new Date(Date.now() + band.days * 86_400_000).toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground md:text-[11px]">
              Min {naira(band.minimum || min)}
            </p>
          </div>
          <div className="relative mt-4">
            <p className="text-[9px] text-muted-foreground md:text-[10px]">Rate p.a.</p>
            <p className="text-xl font-extrabold text-num md:text-2xl">{band.rate}</p>
            <Link
              to="/fixed-plans/create"
              search={{ plan: `${band.days} days`, planType: family }}
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand px-3 py-2 text-[11px] font-extrabold text-brand-foreground press"
            >
              <Plus className="size-3.5" strokeWidth={2.6} />
              Invest
            </Link>
          </div>
        </article>
      ))}
      <article className="k-rise relative flex flex-col justify-between overflow-hidden rounded-xl border border-dashed border-border bg-card/80 p-4 md:p-5">
        <div className="relative">
          <h3 className="font-display text-[15px] font-extrabold leading-tight md:text-base">
            Custom
          </h3>
          <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground md:text-[11px]">
            {family === "FLEX" ? "31–365 days (no ≤30)" : "31–365 days"}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground md:text-[11px]">
            Min {naira(min)}
          </p>
        </div>
        <div className="relative mt-4">
          <Link
            to="/fixed-plans/create"
            search={{ plan: "custom", planType: family }}
            className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-full border border-border bg-secondary px-3 py-2 text-[11px] font-extrabold press"
          >
            <Plus className="size-3.5" strokeWidth={2.6} />
            Choose days
          </Link>
        </div>
      </article>
    </div>
  );
}

function LockFlexTabs({
  lockTenors,
  flexTenors,
  loading,
  catalog,
}: {
  lockTenors: CatalogTenor[];
  flexTenors: CatalogTenor[];
  loading: boolean;
  catalog: ReturnType<typeof useTenorBands>["catalog"];
}) {
  const [tab, setTab] = useState<PlanFamily>("LOCK");
  const lockTitle = catalog?.lock?.title ?? "Kipit Lock";
  const flexTitle = catalog?.flex?.title ?? "Kipit Flex";
  const lockSub =
    catalog?.lock?.subtitle || "Our highest rates, locked till maturity.";
  const flexSub =
    catalog?.flex?.subtitle || "A fixed rate, with a way out after 30 days.";

  return (
    <section className="mt-7 md:mt-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-extrabold">Fixed plans</h2>
        <Link
          to="/fixed-plans"
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
        >
          All plans <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="inline-flex w-full rounded-full border border-border/70 bg-secondary/40 p-1 sm:w-auto">
        {(
          [
            { id: "LOCK" as const, label: lockTitle },
            { id: "FLEX" as const, label: flexTitle },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`flex-1 rounded-full px-4 py-2 text-[12px] font-extrabold transition-colors press sm:flex-none ${
              tab === t.id
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-card p-4 md:p-5">
        <p className="font-display text-[15px] font-extrabold">
          {tab === "LOCK" ? lockTitle : flexTitle}
        </p>
        <p className="mt-0.5 text-[12px] font-semibold text-gold">
          {tab === "LOCK" ? lockSub : flexSub}
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {tab === "LOCK" ? LOCK_HOW_IT_WORKS : FLEX_HOW_IT_WORKS}
        </p>
      </div>

      <div className="mt-4">
        <TenorGrid
          family={tab}
          tenors={tab === "LOCK" ? lockTenors : flexTenors}
          loading={loading}
          featured={tab === "LOCK"}
        />
      </div>
    </section>
  );
}

function MobileInvest() {
  const { hidden, mask } = useBalanceVisibility();
  const { balance: callBalance, rateLabel: callRate } = useCallAccountLive();
  const {
    lockTenors,
    flexTenors,
    loading: ratesLoading,
    catalog,
  } = useTenorBands();
  const live = useHydrateLiveBalances();
  const HOLDINGS = useMemo(() => live.holdings.map(mapLiveHolding), [live.holdings]);
  const custodianNote =
    live.callCustodianNote || CALL_ACCOUNT.custodianNote;

  return (
    <div className="md:hidden">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-12 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[40px]">
              Invest
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/70 md:text-sm">
              Grow your wealth with Kipit&rsquo;s own plans
            </p>

            {/* Call Account — always above Lock/Flex tabs; never call it Flexy */}
            <section className="relative mt-6 rounded-xl border border-white/12 bg-white/8 p-5 backdrop-blur-md md:p-6">
              <Link
                to="/call-account"
                aria-label={`Open ${CALL_ACCOUNT.name}`}
                className="absolute inset-0 z-0 rounded-xl"
              />
              <div className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/75">
                  {CALL_ACCOUNT.name}
                </span>
                <span className="shrink-0 rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-extrabold text-gold-foreground">
                  {callRate}
                </span>
              </div>

              <div className="pointer-events-none relative z-10">
                <p className="mt-4 text-[13px] text-primary-foreground/70">Balance</p>
                <p className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
                  <AmountCounter value={callBalance} hidden={hidden} mask={mask} />
                </p>
                <p className="mt-2 text-[12px] text-primary-foreground/60">
                  {CALL_ACCOUNT.liquidity} &middot; min {naira(CALL_ACCOUNT.minimum)} &middot;
                  earned today {mask(CALL_ACCOUNT.accruedToday)}
                </p>
                {custodianNote ? (
                  <p className="mt-2 text-[11px] leading-snug text-primary-foreground/55">
                    {custodianNote}
                  </p>
                ) : null}
              </div>

              <div className="relative z-10 mt-5 flex flex-wrap gap-2.5">
                <Link
                  to="/call-account/add-money"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gold-gradient px-3 py-3 text-[11px] font-extrabold text-gold-foreground press"
                >
                  Add money <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  to="/call-account/withdraw/wallet"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-3 text-[11px] font-bold text-primary-foreground press"
                >
                  Withdraw <ArrowDownLeft className="size-3.5" />
                </Link>
                <Link
                  to="/call-account"
                  className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-3 text-[11px] font-bold text-primary-foreground press"
                >
                  Activity
                </Link>
              </div>
            </section>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <LockFlexTabs
            lockTenors={lockTenors}
            flexTenors={flexTenors}
            loading={ratesLoading}
            catalog={catalog}
          />

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Your active plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {HOLDINGS.map((h, i) => (
                <li key={h.id} style={{ ["--d" as string]: `${i * 90}ms` }}>
                  <Link
                    to="/portfolio/$holdingId"
                    params={{ holdingId: h.id }}
                    className="k-rise card-surface relative block overflow-hidden p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden />
                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{h.name}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Matures {h.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-extrabold text-num">{mask(h.amount)}</p>
                        <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                          {h.rate}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pl-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="k-fill h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.max(6, h.progress)}%`,
                            ["--d" as string]: `${150 + i * 90}ms`,
                          }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>{h.progress}% of tenor</span>
                        <span>{h.daysLeft} days left</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-7">
            <h2 className="mb-3 px-1 font-display text-base font-extrabold">Invest tools</h2>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm md:grid md:grid-cols-2">
              {[
                {
                  icon: Calculator,
                  label: "Calculator",
                  note: "Model your payout before you commit",
                  to: "/calculator" as const,
                },
                {
                  icon: Repeat,
                  label: "Auto-invest",
                  note: "Fund your plans on a schedule",
                  to: "/auto-invest" as const,
                },
                {
                  icon: Gift,
                  label: "Gift invest",
                  note: "Send a plan to someone",
                  to: "/gifts" as const,
                },
                {
                  icon: RefreshCw,
                  label: "Roll over",
                  note: "Reinvest automatically at maturity",
                  to: "/portfolio/maturities" as const,
                },
              ].map((t, i) => (
                <Link
                  key={t.label}
                  to={t.to}
                  style={{ ["--d" as string]: `${i * 70}ms` }}
                  className={`k-rise group flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-muted/50 ${
                    i > 0 ? "border-t border-border/50 md:border-t-0" : ""
                  } ${i >= 2 ? "md:border-t md:border-border/50" : ""} ${
                    i % 2 === 1 ? "md:border-l md:border-border/50" : ""
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground transition-transform group-hover:scale-105">
                    <t.icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">{t.label}</span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {t.note}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </div>
  );
}

function DesktopInvest() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const navigate = useNavigate();
  const { balance: callBalance, rateLabel: callRate } = useCallAccountLive();
  const {
    lockTenors,
    flexTenors,
    loading: ratesLoading,
    catalog,
  } = useTenorBands();
  const live = useHydrateLiveBalances();
  const HOLDINGS = useMemo(() => live.holdings.map(mapLiveHolding), [live.holdings]);
  const custodianNote =
    live.callCustodianNote || CALL_ACCOUNT.custodianNote;

  return (
    <div className="hidden pb-4 md:block">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 pb-6 pt-6 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/25 blur-3xl"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-[-6rem] size-72 rounded-full bg-white/10 blur-3xl"
            />
            <Link
              to="/call-account"
              aria-label={`Open ${CALL_ACCOUNT.name}`}
              className="absolute inset-0 z-0"
            />
            <div className="pointer-events-none relative z-10">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/60">
                    {CALL_ACCOUNT.name}
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <AmountCounter
                      value={callBalance}
                      hidden={hidden}
                      mask={mask}
                      className="font-display text-[48px] font-extrabold leading-none tracking-[-0.045em] text-num"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      aria-label={hidden ? "Show balances" : "Hide balances"}
                      className="pointer-events-auto mb-1.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 press hover:bg-white/20"
                    >
                      {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-[11px] font-bold text-gold">
                      {callRate}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/75">
                      {CALL_ACCOUNT.liquidity} · min {naira(CALL_ACCOUNT.minimum)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/75">
                      Earned today {mask(CALL_ACCOUNT.accruedToday)}
                    </span>
                  </div>
                  {custodianNote ? (
                    <p className="mt-3 max-w-xl text-[11.5px] leading-snug text-primary-foreground/55">
                      {custodianNote}
                    </p>
                  ) : null}
                </div>
                <Link
                  to="/call-account"
                  className="pointer-events-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold press hover:bg-white/20 lg:inline-flex"
                >
                  Account activity <ChevronRight className="size-3.5" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  to="/call-account/add-money"
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-extrabold text-gold-foreground press"
                >
                  Add money <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  to="/call-account/withdraw/wallet"
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold press hover:bg-white/20"
                >
                  Withdraw <ArrowDownLeft className="size-3.5" />
                </Link>
                <Link
                  to="/fixed-plans/create"
                  search={{ planType: "LOCK" }}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold press hover:bg-white/20"
                >
                  <Plus className="size-3.5" strokeWidth={2.6} /> New Lock plan
                </Link>
              </div>
            </div>
          </section>

          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Your active plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <table className="mt-4 w-full table-fixed text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="w-[38%] pb-2 font-bold">Plan</th>
                  <th className="w-[16%] pb-2 font-bold">Rate</th>
                  <th className="pb-2 font-bold">Progress</th>
                  <th className="pb-2 text-right font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((h) => (
                  <tr
                    key={h.id}
                    onClick={() =>
                      navigate({ to: "/portfolio/$holdingId", params: { holdingId: h.id } })
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate({
                          to: "/portfolio/$holdingId",
                          params: { holdingId: h.id },
                        });
                      }
                    }}
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <td className="py-3.5 pr-4">
                      <p className="text-sm font-bold">{h.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Matures {h.date}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-accent/15 px-2 py-1 text-[11px] font-bold text-brand">
                        {h.rate}
                      </span>
                    </td>
                    <td className="w-[32%] py-3.5 pr-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="k-fill h-full rounded-full bg-brand"
                          style={{ width: `${Math.max(6, h.progress)}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                        <span className="whitespace-nowrap">{h.progress}%</span>
                        <span className="whitespace-nowrap">{h.daysLeft} days left</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right text-sm font-extrabold text-num">
                      {mask(h.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4">
          <section className="card-surface p-6">
            <h2 className="font-display text-base font-extrabold">Invest tools</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {DESKTOP_TOOLS.map((t) => (
                <Link
                  key={t.label}
                  to={t.to}
                  className="group flex items-center gap-3.5 rounded-xl border border-border/60 px-4 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground transition-transform group-hover:scale-105">
                    <t.icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">{t.label}</span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {t.note}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-accent/50"
            />
            <div className="relative">
              <h2 className="font-display text-base font-extrabold">Model your payout</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                See exactly what a tenor and amount return before you commit.
              </p>
              <Link
                to="/calculator"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-extrabold text-brand-foreground press"
              >
                Open calculator <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="card-surface mt-4 p-6">
        <LockFlexTabs
          lockTenors={lockTenors}
          flexTenors={flexTenors}
          loading={ratesLoading}
          catalog={catalog}
        />
      </section>
    </div>
  );
}

const DESKTOP_TOOLS = [
  {
    icon: Calculator,
    label: "Calculator",
    note: "Model your payout before you commit",
    to: "/calculator" as const,
  },
  {
    icon: Repeat,
    label: "Auto-invest",
    note: "Fund your plans on a schedule",
    to: "/auto-invest" as const,
  },
  {
    icon: Gift,
    label: "Gift invest",
    note: "Send a plan to someone",
    to: "/gifts" as const,
  },
  {
    icon: RefreshCw,
    label: "Roll over",
    note: "Reinvest automatically at maturity",
    to: "/portfolio/maturities" as const,
  },
];
