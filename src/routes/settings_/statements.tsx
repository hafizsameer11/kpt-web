import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, FileText, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { STATEMENT_KINDS, type StatementKind } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/statements")({
  head: () => ({
    meta: [
      { title: "Statements | Kipit Settings" },
      {
        name: "description",
        content:
          "Generate an account, transaction or portfolio statement summary for any date range — view, download, or print from your browser.",
      },
      { property: "og:title", content: "Statements | Kipit Settings" },
      { property: "og:description", content: "Generate Kipit statements for any period." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatementsScreen,
});

const PRESETS = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 6 months", days: 182 },
  { label: "Year to date", days: 0 },
] as const;

/** Local calendar day — avoids UTC shifting "today" past midnight. */
function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayIso() {
  return iso(new Date());
}

function clampToToday(value: string) {
  const today = todayIso();
  if (!value) return today;
  return value > today ? today : value;
}

function fmt(d: string) {
  const date = new Date(`${d}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function defaultRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 90);
  return { start: iso(from), end: iso(today) };
}

function StatementsScreen() {
  const navigate = useNavigate();
  const initial = defaultRange();
  const today = todayIso();
  const [kind, setKind] = useState<StatementKind>("Account statement");
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);

  const rangeError = useMemo(() => {
    if (!start || !end) return "Choose a start and end date.";
    if (start > today || end > today) return "Dates cannot be in the future.";
    if (start > end) return "Start date must be on or before the end date.";
    return null;
  }, [start, end, today]);

  const generate = () => {
    if (rangeError) return;
    const safeStart = clampToToday(start);
    const safeEnd = clampToToday(end);
    const from = safeStart <= safeEnd ? safeStart : safeEnd;
    const to = safeStart <= safeEnd ? safeEnd : safeStart;
    navigate({ to: "/settings/statements/generated", search: { kind, start: from, end: to } });
  };

  const setStartDate = (value: string) => {
    const next = clampToToday(value);
    setStart(next);
    if (end && next > end) setEnd(next);
  };

  const setEndDate = (value: string) => {
    const next = clampToToday(value);
    setEnd(next);
    if (start && next < start) setStart(next);
  };

  const applyPreset = (days: number) => {
    const now = new Date();
    setEnd(iso(now));
    if (days === 0) {
      setStart(`${now.getFullYear()}-01-01`);
      return;
    }
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    setStart(iso(from));
  };

  return (
    <SettingsPage
      title="Statements"
      eyebrow="MOB-143"
      subtitle="Printable summaries you can share with a bank, employer or adviser."
    >
      {/* Mobile — unchanged */}
      <div className="space-y-4 md:hidden">
        <section className="card-surface overflow-hidden">
          <p className="border-b border-border/60 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Statement type
          </p>
          <ul className="divide-y divide-border/60">
            {STATEMENT_KINDS.map((s) => {
              const active = s.kind === kind;
              return (
                <li key={s.kind}>
                  <button
                    type="button"
                    onClick={() => setKind(s.kind)}
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left press transition-colors hover:bg-secondary/50"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${
                        active
                          ? "bg-brand text-gold ring-gold/25"
                          : "bg-secondary text-muted-foreground ring-border"
                      }`}
                    >
                      <FileText className="size-[18px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold">{s.kind}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</p>
                    </div>
                    {active ? (
                      <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Period
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">Start date</span>
              <input
                type="date"
                value={start}
                max={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">End date</span>
              <input
                type="date"
                value={end}
                max={today}
                min={start || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-brand"
              />
            </label>
          </div>
          {rangeError ? (
            <p className="mt-2 text-[12px] font-semibold text-destructive">{rangeError}</p>
          ) : null}
        </section>

        <button
          type="button"
          disabled={Boolean(rangeError)}
          onClick={generate}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
        >
          Generate statement
        </button>

        <p className="px-1 text-[11.5px] leading-relaxed text-muted-foreground">
          Statements are stamped and include a verification reference. Generating one does not
          change your holdings.
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-5">
            <section className="card-surface p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                Statement type
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {STATEMENT_KINDS.map((s) => {
                  const active = s.kind === kind;
                  return (
                    <button
                      key={s.kind}
                      type="button"
                      onClick={() => setKind(s.kind)}
                      className={`flex h-full flex-col items-start rounded-2xl border p-4 text-left transition-all press ${
                        active
                          ? "border-brand bg-secondary/60 ring-2 ring-brand/25"
                          : "border-border bg-card hover:-translate-y-0.5 hover:shadow-float"
                      }`}
                    >
                      <span
                        className={`grid size-10 place-items-center rounded-xl ring-1 ring-inset ${
                          active
                            ? "bg-brand text-gold ring-gold/25"
                            : "bg-secondary text-muted-foreground ring-border"
                        }`}
                      >
                        <FileText className="size-[18px]" strokeWidth={2} />
                      </span>
                      <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-extrabold">
                        {s.kind}
                        {active ? <Check className="size-3.5 text-brand" strokeWidth={3} /> : null}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                        {s.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="card-surface p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                Period
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.days)}
                    className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[12px] font-bold text-muted-foreground transition-colors hover:border-brand hover:text-brand press"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11.5px] font-semibold text-muted-foreground">
                    Start date
                  </span>
                  <input
                    type="date"
                    value={start}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-[13.5px] font-semibold outline-none focus:border-brand"
                  />
                </label>
                <label className="block">
                  <span className="text-[11.5px] font-semibold text-muted-foreground">
                    End date
                  </span>
                  <input
                    type="date"
                    value={end}
                    max={today}
                    min={start || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-[13.5px] font-semibold outline-none focus:border-brand"
                  />
                </label>
              </div>
              {rangeError ? (
                <p className="mt-3 text-[12.5px] font-semibold text-destructive">{rangeError}</p>
              ) : null}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="card-surface overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border/60 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                  <FileText className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-extrabold">{kind}</p>
                  <p className="text-[11.5px] text-muted-foreground">Printable · stamped ref</p>
                </div>
              </div>
              <dl className="divide-y divide-border/60 px-5 text-[12.5px]">
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-muted-foreground">From</dt>
                  <dd className="font-bold">{fmt(start)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-muted-foreground">To</dt>
                  <dd className="font-bold">{fmt(end)}</dd>
                </div>
              </dl>
              <div className="p-5 pt-1">
                <button
                  type="button"
                  disabled={Boolean(rangeError)}
                  onClick={generate}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
                >
                  Generate statement
                </button>
              </div>
            </section>

            <section className="card-surface flex items-start gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                <ShieldCheck className="size-[18px]" strokeWidth={2} />
              </span>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                Statements are stamped and include a verification reference a bank can check.
                Generating one does not change your holdings.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </SettingsPage>
  );
}
