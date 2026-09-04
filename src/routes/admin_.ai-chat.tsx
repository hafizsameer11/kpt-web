import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Download,
  Flag,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, Stat } from "@/components/kipit/AdminBits";
import {
  CHAT_SESSIONS,
  CHAT_TOTALS,
  CHAT_VOLUME,
  HANDOFF_DESTINATIONS,
  INTENT_LABEL,
  INTENT_MIX,
  OUTCOME_LABEL,
  OUTCOME_TONE,
  TOP_QUESTIONS,
  type ChatIntent,
  type ChatOutcome,
} from "@/lib/admin-chat-data";

export const Route = createFileRoute("/admin_/ai-chat")({
  head: () => ({
    meta: [
      { title: "Ask AI usage & history — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Monitor Kipit Ask AI usage: session volume, intents, containment, handoffs and full conversation history.",
      },
      { property: "og:title", content: "Ask AI usage & history — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Session volume, intents, containment and full Ask AI transcripts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AiChatLogPage,
});

const OUTCOMES: ("all" | ChatOutcome)[] = ["all", "resolved", "handoff", "escalated", "abandoned"];
const INTENTS: ("all" | ChatIntent)[] = [
  "all",
  "balance",
  "product",
  "explain",
  "maturity",
  "transaction",
  "funding",
  "unsupported",
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  fontWeight: 600,
} as const;

function AiChatLogPage() {
  const [outcome, setOutcome] = useState<"all" | ChatOutcome>("all");
  const [intent, setIntent] = useState<"all" | ChatIntent>("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAT_SESSIONS.filter((s) => {
      if (outcome !== "all" && s.outcome !== outcome) return false;
      if (intent !== "all" && s.topIntent !== intent) return false;
      if (flaggedOnly && !s.flagged) return false;
      if (!q) return true;
      return [s.ref, s.user.name, s.user.email, s.handoffTo ?? "", ...s.transcript.map((t) => t.text)].some(
        (f) => f.toLowerCase().includes(q),
      );
    });
  }, [outcome, intent, flaggedOnly, query]);

  const maxIntent = Math.max(...INTENT_MIX.map((i) => i.sessions));

  return (
    <AdminShell title="Ask AI" subtitle="Assistant usage, containment and conversation history">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Sessions (30 days)"
          value={CHAT_TOTALS.sessions30d.toLocaleString("en-NG")}
          helper={`${CHAT_TOTALS.sessionsToday} started today`}
          tone="brand"
          icon={MessageSquare}
        />
        <Stat
          label="Unique users"
          value={CHAT_TOTALS.activeUsers30d.toLocaleString("en-NG")}
          helper={`${CHAT_TOTALS.messages30d.toLocaleString("en-NG")} messages exchanged`}
          icon={Users}
        />
        <Stat
          label="Contained in chat"
          value={CHAT_TOTALS.containment}
          helper={`${CHAT_TOTALS.handoffRate} handed off to a journey`}
          tone="gold"
          icon={ShieldCheck}
        />
        <Stat
          label="Flagged conversations"
          value={String(CHAT_TOTALS.flagged)}
          helper={`Avg response ${CHAT_TOTALS.avgResponse} · ${CHAT_TOTALS.avgTurns} turns`}
          icon={Flag}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Panel title="Daily sessions by outcome" eyebrow="Last 14 days" icon={Activity} className="xl:col-span-2">
          <div className="h-[240px] p-5 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHAT_VOLUME} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="resolved" stackId="a" fill="var(--brand)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="handoff" stackId="a" fill="var(--gold)" />
                <Bar dataKey="abandoned" stackId="a" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Intent mix" eyebrow="Sessions in the last 30 days">
          <div className="space-y-3 p-5">
            {INTENT_MIX.map((i) => (
              <div key={i.intent}>
                <div className="flex items-center justify-between text-[12.5px] font-semibold">
                  <span>{INTENT_LABEL[i.intent]}</span>
                  <span className="text-muted-foreground">{i.sessions}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-brand"
                    style={{ width: `${Math.round((i.sessions / maxIntent) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Most asked questions" eyebrow="With in-chat resolution rate">
          <div className="divide-y divide-border/60">
            {TOP_QUESTIONS.map((q) => (
              <div key={q.text} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-[13px] font-semibold">{q.text}</span>
                <span className="shrink-0 text-[12px] text-muted-foreground">
                  {q.asked} asked ·{" "}
                  <span className={q.resolvedPct >= 80 ? "text-emerald-600" : "text-destructive"}>
                    {q.resolvedPct}% resolved
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Where chat hands off" eyebrow="Secure journeys opened from Ask AI">
          <div className="divide-y divide-border/60">
            {HANDOFF_DESTINATIONS.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-[13px] font-semibold">{d.label}</span>
                <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand ring-1 ring-brand/20">
                  {d.count}
                </span>
              </div>
            ))}
            <p className="px-5 py-3 text-[12px] text-muted-foreground">
              Ask AI never authorises or moves money — every action is confirmed by the customer in the
              secure journey.
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 overflow-hidden">
        <div className="-m-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-bold transition ${
                    outcome === o
                      ? "bg-brand text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o === "all" ? "All" : OUTCOME_LABEL[o]}
                </button>
              ))}
            </div>

            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value as "all" | ChatIntent)}
              className="h-9 rounded-lg border border-border bg-muted/40 px-2.5 text-[12.5px] font-bold outline-none"
            >
              {INTENTS.map((i) => (
                <option key={i} value={i}>
                  {i === "all" ? "All intents" : INTENT_LABEL[i]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFlaggedOnly((v) => !v)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12.5px] font-bold transition ${
                flaggedOnly
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flag className="size-4" />
              Flagged only
            </button>

            <label className="ml-auto flex min-w-[16rem] items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reference, customer or message text"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
            </label>

            <button
              type="button"
              onClick={() => toast.success(`Export queued · ${rows.length} conversations`)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-[12.5px] font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[68rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-5 py-2.5">Conversation</th>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-5 py-2.5">Top intent</th>
                  <th className="px-5 py-2.5">Turns</th>
                  <th className="px-5 py-2.5">Duration</th>
                  <th className="px-5 py-2.5">Outcome</th>
                  <th className="px-5 py-2.5">Started</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="group border-b border-border/60 transition hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link to="/admin/ai-chat/$sessionId" params={{ sessionId: s.id }} className="block">
                        <span className="flex items-center gap-2 text-[13.5px] font-bold group-hover:text-brand">
                          {s.ref}
                          {s.flagged ? (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10.5px] font-bold text-destructive ring-1 ring-destructive/20">
                              Flagged
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {s.device}
                          {s.handoffTo ? ` · ${s.handoffTo}` : ""}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="block text-[13px] font-semibold">{s.user.name}</span>
                      <span className="block text-[12px] text-muted-foreground">{s.user.email}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px]">{INTENT_LABEL[s.topIntent]}</td>
                    <td className="px-5 py-3 text-[13px] text-muted-foreground">{s.turns}</td>
                    <td className="px-5 py-3 text-[13px] text-muted-foreground">{s.duration}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${OUTCOME_TONE[s.outcome]}`}
                      >
                        {OUTCOME_LABEL[s.outcome]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{s.startedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="px-5 py-14 text-center text-[13px] text-muted-foreground">
                No conversations match this view.
              </p>
            ) : null}
          </div>
        </div>
      </Panel>
    </AdminShell>
  );
}
