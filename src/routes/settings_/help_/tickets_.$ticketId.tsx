import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import {
  ApiError,
  fetchSupportTicket,
  replySupportTicket,
  type ApiSupportTicket,
  type ApiSupportTicketMessage,
} from "@/lib/api";

export const Route = createFileRoute("/settings_/help_/tickets_/$ticketId")({
  head: () => ({
    meta: [{ title: "Ticket details | Kipit Support" }],
  }),
  component: TicketDetail,
});

function statusLabel(status: string) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

function statusTone(status: string) {
  switch (status) {
    case "RESOLVED":
    case "CLOSED":
      return "bg-emerald-500/12 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-gold/15 text-gold";
    default:
      return "bg-brand/10 text-brand";
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const [ticket, setTicket] = useState<ApiSupportTicket | null>(null);
  const [messages, setMessages] = useState<ApiSupportTicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void fetchSupportTicket(ticketId)
      .then((row) => {
        if (!alive) return;
        setTicket(row);
        const thread =
          row.messages && row.messages.length
            ? row.messages
            : [
                {
                  id: `legacy-${row.id}`,
                  author: "USER",
                  body: row.body,
                  createdAt: row.createdAt,
                },
              ];
        setMessages(thread);
        setError("");
      })
      .catch((err: { message?: string }) => {
        if (alive) setError(err?.message ?? "Could not load ticket");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ticketId]);

  const closed = ticket?.status === "CLOSED" || ticket?.status === "RESOLVED";

  const sendReply = async () => {
    const text = reply.trim();
    if (!ticket || !text || sending || closed) return;
    setSending(true);
    try {
      const message = await replySupportTicket(ticket.id, text);
      setMessages((current) => [...current, message]);
      setReply("");
      toast.success("Reply sent");
      setTicket((current) =>
        current
          ? {
              ...current,
              status: current.status === "OPEN" ? "OPEN" : "IN_PROGRESS",
              updatedAt: message.createdAt,
            }
          : current,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsPage
      title="Ticket details"
      eyebrow="Support"
      backTo="/settings/help/tickets"
      backLabel="My tickets"
    >
      {loading ? (
        <p className="py-16 text-center text-[13px] text-muted-foreground">Loading…</p>
      ) : error || !ticket ? (
        <p className="py-16 text-center text-[13px] text-muted-foreground">{error || "Ticket not found"}</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-border bg-card p-5">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone(ticket.status)}`}
            >
              {statusLabel(ticket.status)}
            </span>
            <h2 className="mt-3 text-[18px] font-bold leading-snug">{ticket.subject}</h2>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {ticket.category} · Ref {ticket.id.slice(-8).toUpperCase()}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Submitted {formatWhen(ticket.createdAt)}
            </p>
            {ticket.attachmentUrl ? (
              <a
                href={ticket.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11.5px] font-bold text-brand press"
              >
                {ticket.attachmentName || "View attachment"}
              </a>
            ) : null}
          </div>

          <div className="space-y-3">
            {messages.map((m) => {
              const fromSupport = m.author === "SUPPORT" || m.author === "SYSTEM";
              return (
                <div
                  key={m.id}
                  className={`rounded-[1.5rem] border p-4 ${
                    fromSupport
                      ? "border-brand/20 bg-brand/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {fromSupport ? "Kipit support" : "You"} · {formatWhen(m.createdAt)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed">
                    {m.body}
                  </p>
                  {m.attachmentUrl ? (
                    <a
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11.5px] font-bold text-brand press"
                    >
                      {m.attachmentName || "View attachment"}
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>

          {!closed ? (
            <div className="rounded-[1.75rem] border border-border bg-card p-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Reply
                </span>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Add more detail for our team…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none focus:border-brand"
                />
              </label>
              <button
                type="button"
                disabled={sending || !reply.trim()}
                onClick={() => void sendReply()}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 sm:w-auto sm:px-8"
              >
                {sending ? "Sending…" : "Send reply"}
              </button>
            </div>
          ) : (
            <p className="rounded-[1.75rem] border border-border bg-secondary/50 px-4 py-3.5 text-[12.5px] leading-relaxed text-muted-foreground">
              This ticket is {statusLabel(ticket.status).toLowerCase()}. Submit a new ticket if you
              still need help.
            </p>
          )}

          <Link
            to="/settings/help/ticket"
            className="inline-flex rounded-full border border-border bg-card px-4 py-2.5 text-[12.5px] font-bold press"
          >
            Submit another ticket
          </Link>
        </div>
      )}
    </SettingsPage>
  );
}
