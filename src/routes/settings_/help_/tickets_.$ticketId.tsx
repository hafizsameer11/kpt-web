import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import {
  ApiError,
  API_BASE,
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

function resolveUploadUrl(url: string | null | undefined): string {
  const v = (url ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/uploads/")) return `${API_BASE}${v}`;
  const marker = "/uploads/";
  const idx = v.indexOf(marker);
  if (idx >= 0) return `${API_BASE}${v.slice(idx)}`;
  return v;
}

function isImageAttachment(url?: string | null, name?: string | null) {
  const hay = `${name || ""} ${url || ""}`.toLowerCase();
  if (/\.pdf(\?|#|$)/i.test(hay)) return false;
  if (/\.(jpe?g|png|webp|gif|heic|heif)(\?|#|$)/i.test(hay)) return true;
  if (/\/uploads\/support\//i.test(hay) && !/\.pdf(\?|#|$)/i.test(hay)) return true;
  return false;
}

function TicketAttachment({
  url,
  name,
}: {
  url: string;
  name?: string | null;
}) {
  const resolved = resolveUploadUrl(url);
  if (!resolved) return null;
  const image = isImageAttachment(resolved, name);

  if (image) {
    return (
      <a
        href={resolved}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block overflow-hidden rounded-2xl border border-border bg-secondary press"
      >
        <img
          src={resolved}
          alt={name || "Attachment"}
          className="mx-auto max-h-72 w-full object-cover"
        />
        <span className="flex items-center justify-center gap-2 px-3 py-2.5 text-center text-[12.5px] font-bold text-brand">
          <Paperclip className="size-3.5" strokeWidth={2.2} />
          {name || "Tap to open image"}
        </span>
      </a>
    );
  }

  return (
    <a
      href={resolved}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-center text-[12.5px] font-bold text-brand press"
    >
      <Paperclip className="size-3.5" strokeWidth={2.2} />
      {name || "View attachment"}
    </a>
  );
}

function buildTicketThread(row: ApiSupportTicket): ApiSupportTicketMessage[] {
  let thread: ApiSupportTicketMessage[] =
    row.messages && row.messages.length
      ? row.messages.map((m) => ({ ...m }))
      : [
          {
            id: `legacy-${row.id}`,
            author: "USER",
            body: row.body,
            attachmentUrl: row.attachmentUrl,
            attachmentName: row.attachmentName,
            createdAt: row.createdAt,
          },
        ];

  if (row.attachmentUrl && !thread.some((m) => m.attachmentUrl)) {
    const firstUser = thread.findIndex((m) => m.author === "USER");
    if (firstUser >= 0) {
      thread[firstUser] = {
        ...thread[firstUser]!,
        attachmentUrl: row.attachmentUrl,
        attachmentName: row.attachmentName ?? thread[firstUser]!.attachmentName,
      };
    } else {
      thread = [
        {
          id: `attach-${row.id}`,
          author: "USER",
          body: row.body || "",
          attachmentUrl: row.attachmentUrl,
          attachmentName: row.attachmentName,
          createdAt: row.createdAt,
        },
        ...thread,
      ];
    }
  }
  return thread;
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
        setMessages(buildTicketThread(row));
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
            <h2 className="mt-3 text-center text-[18px] font-bold leading-snug md:text-left">
              {ticket.subject}
            </h2>
            <p className="mt-2 text-center text-[12.5px] text-muted-foreground md:text-left">
              {ticket.category} · Ref {ticket.id.slice(-8).toUpperCase()}
            </p>
            <p className="mt-1 text-center text-[12px] text-muted-foreground md:text-left">
              Submitted {formatWhen(ticket.createdAt)}
            </p>
            {ticket.attachmentUrl ? (
              <TicketAttachment url={ticket.attachmentUrl} name={ticket.attachmentName} />
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="px-1 text-center text-[12px] font-bold uppercase tracking-wide text-muted-foreground md:text-left">
              Conversation
            </p>
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
                  <p className="text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground md:text-left">
                    {fromSupport ? "Kipit support" : "You"} · {formatWhen(m.createdAt)}
                  </p>
                  {m.body?.trim() ? (
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
                      {m.body}
                    </p>
                  ) : null}
                  {m.attachmentUrl ? (
                    <TicketAttachment url={m.attachmentUrl} name={m.attachmentName} />
                  ) : null}
                </div>
              );
            })}
          </div>

          {!closed ? (
            <div className="rounded-[1.75rem] border border-border bg-card p-4">
              <label className="block">
                <span className="block text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground md:text-left">
                  Reply
                </span>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Add more detail for our team…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-[14px] text-foreground outline-none focus:border-brand"
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
            <p className="text-center text-[12.5px] text-muted-foreground">
              This ticket is {statusLabel(ticket.status).toLowerCase()}.{" "}
              <Link to="/settings/help/ticket" className="font-bold text-brand underline-offset-2 hover:underline">
                Submit a new ticket
              </Link>{" "}
              if you still need help.
            </p>
          )}
        </div>
      )}
    </SettingsPage>
  );
}
