import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { REPORTS, REPORT_PERIODS, type ReportPeriod } from "@/lib/reports-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Kipit Reports | Portfolio performance" },
      {
        name: "description",
        content:
          "Monthly, quarterly and annual Kipit reports — portfolio growth, interest earned, average rate and a plain-English performance summary.",
      },
      { property: "og:title", content: "Kipit Reports | Portfolio performance" },
      {
        property: "og:description",
        content:
          "Track portfolio growth, interest earned and average rate across monthly, quarterly and annual Kipit reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsScreen,
});

function GrowthChart({ series, labels }: { series: number[]; labels: string[] }) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  return (
    <div className="flex h-32 items-end justify-between gap-1.5">
      {series.map((v, i) => {
        const pct = 22 + ((v - min) / Math.max(max - min, 1)) * 78;
        const last = i === series.length - 1;
        return (
          <div key={labels[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className={`k-grow w-full rounded-t-md ${last ? "bg-gold-gradient" : "bg-brand/20"}`}
              style={{ height: `${pct}%`, ["--d" as string]: `${i * 60}ms` }}
            />
            <span
              className={`text-[9.5px] font-semibold ${last ? "text-foreground" : "text-muted-foreground/70"}`}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReportsScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const [period, setPeriod] = useState<ReportPeriod>("Monthly");
  const r = REPORTS[period];

  const download = () =>
    toast.success(`${period} report downloaded`, {
      description: "Saved as PDF to your device.",
    });

  return (
    <AppShell title="Kipit reports" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div>
                <Link
                  to="/portfolio"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Portfolio
                </Link>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  {r.label} · closing value
                </p>
                <p className="mt-1 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  <AmountCounter value={r.closingValue} hidden={hidden} mask={mask} />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-[11.5px] font-extrabold text-gold">
                    <ArrowUpRight className="size-3.5" /> +{r.growthPct}% growth
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                    {r.range}
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex gap-2">
                  {REPORT_PERIODS.map((p) => {
                    const active = p === period;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`press rounded-xl px-5 py-3 text-left transition-colors ${
                          active
                            ? "bg-gold text-brand shadow-float"
                            : "bg-white/10 text-primary-foreground hover:bg-white/15"
                        }`}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                          Period
                        </p>
                        <p className="mt-0.5 font-display text-[16px] font-extrabold">{p}</p>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={download}
                  className="press inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-[13px] font-extrabold hover:bg-white/15"
                >
                  <Download className="size-4" strokeWidth={2.4} /> Download PDF
                </button>
              </div>
            </div>
          </section>

          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Interest earned", value: mask(r.interestEarned), gold: true },
              { label: "Average rate", value: r.averageRate, gold: false },
              { label: "Contributions", value: mask(r.contributions), gold: false },
              { label: "Withdrawals", value: mask(r.withdrawals), gold: false },
            ].map((m) => (
              <article key={m.label} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  {m.label}
                </p>
                <p
                  className={`mt-1.5 font-display text-[22px] font-extrabold text-num ${
                    m.gold ? "text-gold" : ""
                  }`}
                >
                  {m.value}
                </p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                    Portfolio growth
                  </h2>
                  <p className="mt-1.5 font-display text-[28px] font-extrabold text-num">
                    {mask(r.closingValue - r.openingValue)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1.5 text-[12px] font-extrabold text-gold">
                  <TrendingUp className="size-4" /> +{r.growthPct}%
                </span>
              </div>
              <div className="mt-6">
                <GrowthChart series={r.series} labels={r.seriesLabels} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-[12px]">
                <span className="text-muted-foreground">Opening {mask(r.openingValue)}</span>
                <span className="font-bold">Closing {mask(r.closingValue)}</span>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
              <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-gold-gradient" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                Performance summary
              </h2>
              <p className="mt-3 text-[13.5px] leading-[1.7]">{r.summary}</p>
              <p className="mt-4 border-t border-border/60 pt-4 text-[12.5px]">
                <span className="text-muted-foreground">Best performer · </span>
                <span className="font-extrabold">{r.bestPerformer}</span>
              </p>
            </section>
          </div>
        </div>
      </div>

      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Portfolio
            </Link>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              {r.label} · closing value
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={r.closingValue} hidden={hidden} mask={mask} />
            </h1>
            <div className="k-rise mt-3 flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "80ms" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-[11px] font-extrabold text-gold">
                <ArrowUpRight className="size-3.5" /> +{r.growthPct}% growth
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">
                {r.range}
              </span>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Period selector */}
          <div className="flex gap-2">
            {REPORT_PERIODS.map((p) => {
              const active = p === period;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex-1 rounded-full border py-2 text-[12px] font-bold transition-colors press ${
                    active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Portfolio growth */}
          <article className="card-surface mt-4 p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Portfolio growth
                </p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
                  {mask(r.closingValue - r.openingValue)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <TrendingUp className="size-3.5" /> +{r.growthPct}%
              </span>
            </div>
            <div className="mt-4">
              <GrowthChart series={r.series} labels={r.seriesLabels} />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11.5px]">
              <span className="text-muted-foreground">Opening {mask(r.openingValue)}</span>
              <span className="font-bold">Closing {mask(r.closingValue)}</span>
            </div>
          </article>

          {/* Metrics */}
          <div className="mt-3 grid grid-cols-2 gap-3 md:mt-4 md:grid-cols-4 md:gap-4">
            {[
              { label: "Interest earned", value: mask(r.interestEarned), gold: true },
              { label: "Average rate", value: r.averageRate, gold: false },
              { label: "Contributions", value: mask(r.contributions), gold: false },
              { label: "Withdrawals", value: mask(r.withdrawals), gold: false },
            ].map((m, i) => (
              <article
                key={m.label}
                className="k-rise card-surface p-4"
                style={{ ["--d" as string]: `${i * 60}ms` }}
              >
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {m.label}
                </p>
                <p
                  className={`mt-1 text-[16px] font-extrabold text-num ${m.gold ? "text-gold" : ""}`}
                >
                  {m.value}
                </p>
              </article>
            ))}
          </div>

          {/* Performance summary */}
          <article className="card-surface relative mt-3 overflow-hidden p-4 md:mt-4 md:p-6">
            <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-gold-gradient" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Performance summary
            </p>
            <p className="mt-2.5 text-[13.5px] leading-[1.65]">{r.summary}</p>
            <p className="mt-3 border-t border-border/60 pt-3 text-[12px]">
              <span className="text-muted-foreground">Best performer · </span>
              <span className="font-extrabold">{r.bestPerformer}</span>
            </p>
          </article>

          <button
            type="button"
            onClick={() =>
              toast.success(`${period} report downloaded`, {
                description: "Saved as PDF to your device.",
              })
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-[13px] font-bold text-brand-foreground press"
          >
            <Download className="size-4" /> Download {period.toLowerCase()} report (PDF)
          </button>

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
