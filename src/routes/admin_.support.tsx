import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Download, Gauge, LifeBuoy, Search, Star } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, Stat } from "@/components/kipit/AdminBits";
import {
  CATEGORY_LABEL,
  PRIORITY_TONE,
  SUPPORT_TICKETS,
  SUPPORT_TOTALS,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_TONE,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/admin-support-data";

export const Route = createFileRoute("/admin_/support")({
  head: () => ({
    meta: [
      { title: "Support tickets — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Kipit support desk: triage customer tickets by category, priority and status, and open full conversations.",
      },
      { property: "og:title", content: "Support tickets — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Triage and resolve Kipit customer support tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SupportListPage,
});

const TABS: ("all" | TicketStatus)[] = ["all", "open", "pending", "resolved", "closed"];
const PRIORITIES: ("all" | TicketPriority)[] = ["all", "urgent", "high", "normal", "low"];

function SupportListPage() {
  const [tab, setTab] = useState<"all" | TicketStatus>("open");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUPPORT_TICKETS.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (!q) return true;
      return [t.ref, t.subject, t.user.name, t.user.email, t.assignee].some((f) =>
        f.toLowerCase().includes(q),
      );
    });
  }, [tab, priority, query]);

  return (
    <AdminShell title="Support" subtitle="ADM-110 · customer ticket desk">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Open tickets"
          value={String(SUPPORT_TOTALS.open)}
          helper={`${SUPPORT_TOTALS.urgent} marked urgent`}
          tone="brand"
          icon={LifeBuoy}
        />
        <Stat
          label="Awaiting customer"
          value={String(SUPPORT_TOTALS.pending)}
          helper="Reply expected from user"
          icon={Clock}
        />
        <Stat
          label="Avg first response"
          value={SUPPORT_TOTALS.avgFirstResponse}
          helper={`${SUPPORT_TOTALS.resolvedToday} resolved today`}
          tone="gold"
          icon={Gauge}
        />
        <Stat
          label="Satisfaction"
          value={SUPPORT_TOTALS.csat}
          helper="Rolling 30-day CSAT"
          icon={Star}
        />
      </div>

      <Panel className="mt-5 overflow-hidden">
        <div className="-m-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-bold transition ${
                    tab === t
                      ? "bg-brand text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "All" : TICKET_STATUS_LABEL[t]}
                </button>
              ))}
            </div>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "all" | TicketPriority)}
              className="h-9 rounded-lg border border-border bg-muted/40 px-2.5 text-[12.5px] font-bold capitalize outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "All priorities" : p}
                </option>
              ))}
            </select>

            <label className="ml-auto flex min-w-[16rem] items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ticket, subject, customer or agent"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
            </label>

            <button
              type="button"
              onClick={() => toast.success(`Export queued · ${rows.length} tickets`)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-[12.5px] font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-5 py-2.5">Ticket</th>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-5 py-2.5">Category</th>
                  <th className="px-5 py-2.5">Priority</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Assignee</th>
                  <th className="px-5 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="group border-b border-border/60 transition hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link to="/admin/support/$ticketId" params={{ ticketId: t.id }} className="block">
                        <span className="block text-[13.5px] font-bold group-hover:text-brand">
                          {t.subject}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {t.ref} · {t.channel} · updated {t.updatedAt}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="block text-[13px] font-semibold">{t.user.name}</span>
                      <span className="block text-[12px] text-muted-foreground">{t.user.email}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px]">{CATEGORY_LABEL[t.category]}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${PRIORITY_TONE[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${TICKET_STATUS_TONE[t.status]}`}
                      >
                        {TICKET_STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-muted-foreground">{t.assignee}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="px-5 py-14 text-center text-[13px] text-muted-foreground">
                No tickets match this view.
              </p>
            ) : null}
          </div>
        </div>
      </Panel>
    </AdminShell>
  );
}
