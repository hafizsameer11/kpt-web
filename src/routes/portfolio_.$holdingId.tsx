import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Download,
  FileText,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import {
  accruedInterest,
  getHolding,
  holdingTxnId,
  naira,
} from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/$holdingId")({
  loader: ({ params }) => {
    const holding = getHolding(params.holdingId);
    if (!holding) throw notFound();
    return { holding };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Holding unavailable | Kipit" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const h = loaderData.holding;
    const title = `${h.name} — Holding Detail | Kipit`;
    const description = `${h.rate} · principal ${naira(h.principal)}, maturing ${h.maturityDate} with an expected payout of ${naira(h.expectedPayout)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: HoldingNotFound,
  component: HoldingDetailScreen,
});

function HoldingNotFound() {
  return (
    <AppShell title="Portfolio" navVariant="elevated">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-xl font-extrabold">Holding unavailable</h1>
        <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
          We couldn't find this investment. It may have matured already.
        </p>
        <Link
          to="/portfolio"
          className="mt-5 rounded-full bg-brand-gradient px-5 py-2.5 text-[12.5px] font-extrabold text-primary-foreground press"
        >
          Back to Portfolio
        </Link>
      </div>
    </AppShell>
  );
}

function HoldingDetailScreen() {
  const { holding: h } = Route.useLoaderData();
  const { hidden, mask } = useBalanceVisibility();

  const elapsed = h.totalDays - h.daysLeft;
  const progress = Math.min(100, Math.max(4, Math.round((elapsed / h.totalDays) * 100)));
  const accrued = accruedInterest(h);

  return (
    <AppShell title="Holding" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-5 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-7 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-24 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary-foreground/70 press"
            >
              <ArrowLeft className="size-4" /> Portfolio
            </Link>

            <div className="k-rise mt-5">
              <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">
                {h.kind}
              </span>
              <h1 className="mt-2 font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em] md:text-[30px]">
                {h.name}
              </h1>
              <p className="mt-1 truncate text-[12px] text-primary-foreground/60">{h.issuer}</p>
            </div>

            <div
              className="k-rise mt-5 flex flex-wrap items-end gap-x-6 gap-y-3"
              style={{ ["--d" as string]: "60ms" }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] text-primary-foreground/55">
                  Principal
                </p>
                <p className="mt-1 font-display text-[30px] font-extrabold leading-none text-num md:text-[36px]">
                  <AmountCounter value={h.principal} hidden={hidden} mask={mask} />
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
                {h.rate}
              </span>
            </div>

            {/* Progress */}
            <div
              className="k-rise mt-6 rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur-md"
              style={{ ["--d" as string]: "120ms" }}
            >
              <div className="flex items-center justify-between text-[11px] text-primary-foreground/70">
                <span>{elapsed} days elapsed</span>
                <span>{h.daysLeft} days remaining</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="k-fill h-full rounded-full bg-gold"
                  style={{ width: `${progress}%`, ["--d" as string]: "200ms" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-primary-foreground/60">
                <span>Started {h.startDate}</span>
                <span>Matures {h.maturityDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Key figures */}
          <section className="k-rise card-surface overflow-hidden">
            <div className="grid grid-cols-2">
              {[
                { label: "Interest accrued", value: mask(accrued), gold: true },
                { label: "Expected payout", value: mask(h.expectedPayout), gold: false },
                { label: "Rate", value: h.rate, gold: false },
                { label: "Tenor", value: `${h.totalDays} days`, gold: false },
              ].map((cell, i) => (
                <div
                  key={cell.label}
                  className={`p-4 ${i % 2 === 0 ? "border-r border-border/60" : ""} ${i < 2 ? "border-b border-border/60" : ""}`}
                >
                  <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    {cell.label}
                  </p>
                  <p
                    className={`mt-1.5 text-[17px] font-extrabold text-num ${cell.gold ? "text-gold" : ""}`}
                  >
                    {cell.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Maturity instruction */}
          <section className="k-rise mt-5 card-surface p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  At maturity
                </p>
                <p className="mt-1 text-[13.5px] font-bold">{h.maturityInstruction}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  {h.canManageMaturity
                    ? "You can change this up to 24 hours before maturity."
                    : "Set by the issuer — this instruction cannot be changed."}
                </p>
              </div>
            </div>
            {h.canManageMaturity ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Maturity instruction updated", {
                      description: "This plan will roll over at the prevailing rate.",
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-gradient px-4 py-3 text-[12px] font-extrabold text-primary-foreground press"
                >
                  <RefreshCw className="size-3.5" /> Roll over
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Maturity instruction updated", {
                      description: "Principal and interest will be paid to your wallet.",
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-3 text-[12px] font-extrabold press"
                >
                  <Wallet className="size-3.5" /> Pay to wallet
                </button>
              </div>
            ) : null}
          </section>

          {/* Transactions */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Transactions</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {h.transactions.length} entries
              </span>
            </div>
            <ul className="card-surface divide-y divide-border/60 overflow-hidden">
              {h.transactions.map((t, i) => (
                <li
                  key={`${t.label}-${i}`}
                  style={{ ["--d" as string]: `${i * 60}ms` }}
                  className="k-rise"
                >
                  <Link
                    to="/portfolio/transactions/$txnId"
                    params={{ txnId: holdingTxnId(h.id, i) }}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/60 active:bg-secondary"
                  >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                      t.direction === "in"
                        ? "bg-gold/15 text-gold"
                        : "bg-secondary text-brand"
                    }`}
                  >
                    {t.direction === "in" ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.date}</p>
                  </div>
                  <p className="shrink-0 text-[13px] font-extrabold text-num">{mask(t.amount)}</p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Documents */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Documents</h2>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-bold text-brand">
                {h.documents.length} Files
              </span>
            </div>
            <ul className="card-surface divide-y divide-border/60 overflow-hidden">
              {h.documents.map((d, i) => (
                <li key={d.label} style={{ ["--d" as string]: `${i * 60}ms` }} className="k-rise">
                  <button
                    type="button"
                    onClick={() => toast.success(`${d.label} downloaded`)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{d.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {d.kind} · {d.size}
                      </p>
                    </div>
                    <Download className="size-4 shrink-0 text-gold" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">Tap to download PDF</p>
          </section>

          <DisclosureStrip variant={h.kind === "Fixed plan" ? "fixed" : "marketplace"} />
        </div>
      </div>
    </AppShell>
  );
}
