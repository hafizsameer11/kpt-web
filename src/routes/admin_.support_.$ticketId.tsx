import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  History,
  MessageSquare,
  Receipt,
  Send,
  UserRound,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel } from "@/components/kipit/AdminBits";
import { naira } from "@/lib/admin-data";
import {
  CATEGORY_LABEL,
  PRIORITY_TONE,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_TONE,
  ticketById,
  type TicketMessage,
  type TicketStatus,
} from "@/lib/admin-support-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin_/support_/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Full support ticket view: conversation, customer profile, related transactions and ticket history.",
      },
      { property: "og:title", content: "Ticket detail — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Respond to and resolve a Kipit customer support ticket.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketDetailPage,
});

const AGENTS = ["Tolu A.", "Ngozi E.", "Kelechi M.", "Farida S."];

function TicketDetailPage() {
  const { ticketId } = useParams({ from: "/admin_/support_/$ticketId" });
  const ticket = ticketById(ticketId);

  const [messages, setMessages] = useState<TicketMessage[]>(ticket?.messages ?? []);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "open");
  const [assignee, setAssignee] = useState(ticket?.assignee ?? "Unassigned");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPick, setAssignPick] = useState(AGENTS[0]);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  if (!ticket) {
    return (
      <AdminShell title="Ticket not found" subtitle="ADM-111">
        <Panel className="p-8 text-center">
          <p className="text-[14px] text-muted-foreground">
            This ticket does not exist or has been archived.
          </p>
          <Link
            to="/admin/support"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-[13px] font-bold text-primary-foreground"
          >
            Back to support
          </Link>
        </Panel>
      </AdminShell>
    );
  }

  function sendReply() {
    const body = reply.trim();
    if (!body) {
      toast.error("Write a reply before sending");
      return;
    }
    setMessages((m) => [
      ...m,
      { id: `m${m.length + 1}`, author: assignee === "Unassigned" ? "Support agent" : assignee, role: "agent", at: "Just now", body },
    ]);
    setReply("");
    setStatus("pending");
    toast.success("Reply sent to customer");
  }

  return (
    <AdminShell title={ticket.subject} subtitle={`ADM-111 · ${ticket.ref} · ${ticket.channel}`}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          to="/admin/support"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-bold transition hover:border-brand/30"
        >
          <ArrowLeft className="size-4" />
          Support desk
        </Link>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${TICKET_STATUS_TONE[status]}`}>
          {TICKET_STATUS_LABEL[status]}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${PRIORITY_TONE[ticket.priority]}`}
        >
          {ticket.priority} priority
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground ring-1 ring-border">
          {CATEGORY_LABEL[ticket.category]}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAssignPick(AGENTS[0]);
              setAssignOpen(true);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-bold transition hover:border-brand/30"
          >
            <UserPlus className="size-4" />
            Assign
          </button>
          <button
            type="button"
            onClick={() => setResolveOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-[12.5px] font-bold text-primary-foreground transition hover:opacity-90"
          >
            <CheckCircle2 className="size-4" />
            Resolve ticket
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Panel title="Conversation" icon={MessageSquare} eyebrow={`${messages.length} messages`}>
          <div className="space-y-3 p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 ${
                  m.role === "agent"
                    ? "ml-8 border-brand/20 bg-brand/6"
                    : m.role === "system"
                      ? "border-dashed border-border bg-muted/40"
                      : "mr-8 border-border/80 bg-card"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[12.5px] font-bold">{m.author}</span>
                  <span className="text-[11.5px] text-muted-foreground">{m.at}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/85">{m.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 p-5">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Write a reply to the customer…"
              className="w-full resize-none rounded-xl border border-border bg-muted/30 p-3 text-[13px] outline-none focus:border-brand/40"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[12px] text-muted-foreground">
                Replies are delivered in-app and by email.
              </p>
              <button
                type="button"
                onClick={sendReply}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-bold text-primary-foreground transition hover:opacity-90"
              >
                <Send className="size-4" />
                Send reply
              </button>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Customer" icon={UserRound}>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-brand/8 text-[13px] font-extrabold text-brand">
                  {ticket.user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold">{ticket.user.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{ticket.user.email}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Phone", ticket.user.phone],
                  ["KYC tier", `Tier ${ticket.user.tier}`],
                  ["Joined", ticket.user.joined],
                  ["Wallet", naira(ticket.user.walletBalance)],
                  ["Invested", naira(ticket.user.invested)],
                  ["Interest earned", naira(ticket.user.lifetimeInterest)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="text-[13px] font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              <Link
                to="/admin/users/$userId"
                params={{ userId: ticket.user.id }}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border text-[12.5px] font-bold transition hover:border-brand/30"
              >
                Open full profile
              </Link>
            </div>
          </Panel>

          <Panel title="Relevant transactions" icon={Receipt}>
            <div className="divide-y divide-border/60">
              {ticket.transactions.length === 0 ? (
                <p className="p-5 text-[13px] text-muted-foreground">
                  No transactions linked to this ticket.
                </p>
              ) : (
                ticket.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{t.label}</p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {t.id} · {t.at} · {t.status}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[13px] font-extrabold tabular-nums ${
                        t.amount < 0 ? "text-destructive" : "text-emerald-700"
                      }`}
                    >
                      {t.amount < 0 ? "-" : "+"}
                      {naira(Math.abs(t.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Ticket history" icon={History} eyebrow={`Assignee · ${assignee}`}>
            <ol className="p-5">
              {ticket.history.map((h, i) => (
                <li key={i} className="relative pl-6 pb-4 last:pb-0">
                  <span className="absolute left-0 top-1 size-2.5 rounded-full bg-brand" />
                  {i < ticket.history.length - 1 ? (
                    <span className="absolute left-[4.5px] top-4 h-full w-px bg-border" />
                  ) : null}
                  <p className="text-[13px] font-semibold">{h.label}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {h.at} · {h.by}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign ticket</DialogTitle>
            <DialogDescription>
              Choose the agent who owns {ticket.ref}. They will be notified immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {AGENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAssignPick(a)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition ${
                  assignPick === a ? "border-brand bg-brand/6 text-brand" : "border-border hover:border-brand/30"
                }`}
              >
                {a}
                {assignPick === a ? <CheckCircle2 className="size-4" /> : null}
              </button>
            ))}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="h-10 rounded-lg border border-border px-4 text-[13px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignee(assignPick);
                setAssignOpen(false);
                toast.success(`Ticket assigned to ${assignPick}`);
              }}
              className="h-10 rounded-lg bg-brand px-4 text-[13px] font-bold text-primary-foreground"
            >
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve ticket</DialogTitle>
            <DialogDescription>
              Add a resolution summary for the audit trail. The customer receives a closing message.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
            placeholder="What was done to resolve this?"
            className="w-full resize-none rounded-xl border border-border bg-muted/30 p-3 text-[13px] outline-none focus:border-brand/40"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setResolveOpen(false)}
              className="h-10 rounded-lg border border-border px-4 text-[13px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!resolution.trim()) {
                  toast.error("Add a resolution summary");
                  return;
                }
                setStatus("resolved");
                setResolveOpen(false);
                toast.success(`${ticket.ref} marked resolved`);
              }}
              className="h-10 rounded-lg bg-brand px-4 text-[13px] font-bold text-primary-foreground"
            >
              Mark resolved
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
