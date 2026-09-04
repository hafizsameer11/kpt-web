import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange, Download, FileSpreadsheet, History, Repeat, Search } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, Stat } from "@/components/kipit/AdminBits";
import {
  RECENT_EXPORTS,
  REPORT_PACKS,
  SCHEDULED_REPORTS,
  type ReportCategory,
} from "@/lib/admin-console-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin_/reports")({
  head: () => ({
    meta: [
      { title: "Reports & exports — Kipit Admin Console" },
      {
        name: "description",
        content:
          "One place for every Kipit export: ledger, FUM, KYC register, AML pack, withdrawals, support and audit extracts, on demand or scheduled.",
      },
      { property: "og:title", content: "Reports & exports — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Generate, schedule and download every Kipit operational report.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportsCentre,
});

const CATEGORIES: ("All" | ReportCategory)[] = [
  "All",
  "Finance",
  "Compliance",
  "Operations",
  "Growth",
];

function ReportsCentre() {
  const [category, setCategory] = useState<"All" | ReportCategory>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-09-04");
  const [schedules, setSchedules] = useState(SCHEDULED_REPORTS);
  const [run, setRun] = useState<(typeof REPORT_PACKS)[number] | null>(null);
  const [format, setFormat] = useState("CSV");

  const packs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REPORT_PACKS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return [p.name, p.description, p.owner].some((f) => f.toLowerCase().includes(q));
    });
  }, [category, query]);

  return (
    <AdminShell title="Reports & exports" subtitle="Every operational export in one place">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Report packs" value={String(REPORT_PACKS.length)} helper="Across four areas" tone="brand" icon={FileSpreadsheet} />
        <Stat label="Scheduled" value={String(schedules.filter((s) => s.active).length)} helper="Delivered by email" tone="gold" icon={Repeat} />
        <Stat label="Generated today" value="6" helper="Automatic and manual" icon={History} />
        <Stat label="Retention" value="90 days" helper="Downloads expire after" icon={CalendarRange} />
      </div>

      <Panel className="mt-5" title="Reporting period" eyebrow="Applies to every export" icon={CalendarRange}>
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-card px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-card px-3 py-2 text-[13.5px] font-semibold outline-none focus:border-brand"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {["Today", "This week", "This month", "Last month"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toast.success(`Period set to ${p.toLowerCase()}`)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-bold text-muted-foreground transition hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <Link
            to="/admin/analytics"
            className="ml-auto rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-bold transition hover:bg-muted"
          >
            View analytics
          </Link>
        </div>
      </Panel>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              category === c
                ? "bg-brand text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports"
            className="w-52 bg-transparent text-[13px] outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packs.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(11,29,58,0.04),0_12px_28px_-22px_rgba(11,29,58,0.4)]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-md bg-brand/8 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand">
                {p.category}
              </span>
              <span className="text-[11.5px] font-semibold text-muted-foreground">{p.cadence}</span>
            </div>
            <h3 className="mt-2 font-display text-[15.5px] font-extrabold tracking-[-0.01em]">
              {p.name}
            </h3>
            <p className="mt-1 flex-1 text-[12.5px] text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
              <span>Owner · {p.owner}</span>
              <span>Last run {p.lastRun}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRun(p);
                  setFormat(p.formats[0] ?? "CSV");
                }}
                className="flex-1 rounded-lg bg-brand px-3 py-2 text-[12.5px] font-bold text-primary-foreground transition hover:opacity-90"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.success("Schedule created", { description: `${p.name} · ${p.cadence}` })
                }
                className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-bold transition hover:bg-muted"
              >
                Schedule
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Scheduled deliveries" eyebrow="Automatic" icon={Repeat}>
          <ul className="divide-y divide-border/60">
            {schedules.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold">{s.pack}</p>
                  <p className="text-[12.5px] text-muted-foreground">
                    {s.cadence} · {s.recipients}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">Next run {s.next}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.active}
                  onClick={() =>
                    setSchedules((list) =>
                      list.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)),
                    )
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    s.active ? "bg-brand" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                      s.active ? "left-[1.4rem]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent exports" eyebrow="Downloads" icon={History}>
          <ul className="divide-y divide-border/60">
            {RECENT_EXPORTS.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold">{e.name}</p>
                  <p className="text-[12.5px] text-muted-foreground">
                    {e.by} · {e.when} · {e.size}
                  </p>
                </div>
                {e.status === "Ready" ? (
                  <button
                    type="button"
                    onClick={() => toast.success("Download started", { description: e.name })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-bold transition hover:bg-muted"
                  >
                    <Download className="size-3.5" /> Download
                  </button>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    Expired
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Dialog open={run !== null} onOpenChange={(o) => !o && setRun(null)}>
        <DialogContent className="sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Generate {run?.name}</DialogTitle>
            <DialogDescription>
              Period {from} to {to}. Large exports are emailed to you when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {(run?.formats ?? ["CSV"]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
                  format === f
                    ? "bg-brand text-primary-foreground"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRun(null)}
              className="rounded-lg border border-border px-3.5 py-2 text-[13px] font-bold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success("Export queued", {
                  description: `${run?.name} · ${format} · ${from} to ${to}`,
                });
                setRun(null);
              }}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-bold text-primary-foreground transition hover:opacity-90"
            >
              Generate
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
