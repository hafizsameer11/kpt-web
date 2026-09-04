import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart3, Download, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel } from "@/components/kipit/AdminBits";
import {
  ANALYTICS_KPIS,
  CHANNEL_MIX,
  GROWTH_SERIES,
  NET_FLOW_SERIES,
  PRODUCT_MIX,
  RETENTION_SERIES,
} from "@/lib/admin-console-data";

export const Route = createFileRoute("/admin_/analytics")({
  head: () => ({
    meta: [
      { title: "Reports & analytics — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Kipit growth, retention, flow and product-mix analytics: signups, funded rate, net flow, rollover and cohort retention.",
      },
      { property: "og:title", content: "Reports & analytics — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Growth, retention and portfolio analytics for Kipit operators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = ["30 days", "90 days", "6 months", "Year"] as const;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(11,29,58,0.12)",
  fontSize: 12,
  fontWeight: 600,
} as const;

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("6 months");

  return (
    <AdminShell title="Reports & analytics" subtitle="Growth, flows, retention and product mix">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              range === r
                ? "bg-brand text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}

        <Link
          to="/admin/reports"
          className="ml-auto rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-bold transition hover:bg-muted"
        >
          Reports centre
        </Link>
        <button
          type="button"
          onClick={() => toast.success("Analytics pack exported", { description: `${range} · XLSX` })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[12.5px] font-bold text-primary-foreground transition hover:opacity-90"
        >
          <Download className="size-4" /> Export
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ANALYTICS_KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(11,29,58,0.04),0_12px_28px_-22px_rgba(11,29,58,0.4)]"
          >
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {k.label}
            </p>
            <div className="mt-1.5 flex items-end gap-2">
              <p className="font-display text-[24px] font-extrabold tracking-[-0.025em]">{k.value}</p>
              <span
                className={`mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  k.up ? "bg-emerald-500/12 text-emerald-700" : "bg-destructive/10 text-destructive"
                }`}
              >
                {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {k.delta}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{k.helper}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel title="Acquisition & activation" eyebrow="Customers" icon={TrendingUp}>
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_SERIES} margin={{ left: -18, right: 6, top: 8 }}>
                <defs>
                  <linearGradient id="gSign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gFund" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(11,29,58,0.08)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Area
                  type="monotone"
                  name="Signups"
                  dataKey="signups"
                  stroke="var(--brand)"
                  strokeWidth={2.4}
                  fill="url(#gSign)"
                />
                <Area
                  type="monotone"
                  name="Funded"
                  dataKey="funded"
                  stroke="var(--gold)"
                  strokeWidth={2.4}
                  fill="url(#gFund)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Portfolio mix" eyebrow="FUM by product (₦m)" icon={PieIcon}>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PRODUCT_MIX}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                >
                  {PRODUCT_MIX.map((s) => (
                    <Cell key={s.id} fill={s.tone} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {PRODUCT_MIX.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-[12.5px]">
                <span className="size-2.5 rounded-full" style={{ background: s.tone }} />
                <span className="font-semibold">{s.label}</span>
                <span className="ml-auto font-bold">₦{s.value}m</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Deposits vs withdrawals" eyebrow="₦ millions" icon={BarChart3}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={NET_FLOW_SERIES} margin={{ left: -18, right: 6, top: 8 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(11,29,58,0.08)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(11,29,58,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Bar name="Deposits" dataKey="deposits" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                <Bar name="Withdrawals" dataKey="withdrawals" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Cohort retention" eyebrow="% still invested" icon={TrendingUp}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RETENTION_SERIES} margin={{ left: -18, right: 6, top: 8 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(11,29,58,0.08)" vertical={false} />
                <XAxis dataKey="cohort" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Line name="Month 1" dataKey="m1" stroke="var(--brand)" strokeWidth={2.4} dot={false} />
                <Line name="Month 2" dataKey="m2" stroke="var(--gold)" strokeWidth={2.4} dot={false} />
                <Line name="Month 3" dataKey="m3" stroke="#4C7DF0" strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Funding channel mix" eyebrow="Share of deposits">
          <ul className="space-y-3.5">
            {CHANNEL_MIX.map((c) => (
              <li key={c.channel}>
                <div className="flex items-center justify-between text-[13px] font-semibold">
                  <span>{c.channel}</span>
                  <span className="font-bold">{c.value}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Active customers" eyebrow="Monthly active investors">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_SERIES} margin={{ left: -18, right: 6, top: 8 }}>
                <defs>
                  <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(11,29,58,0.08)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="var(--brand)"
                  strokeWidth={2.4}
                  fill="url(#gActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
