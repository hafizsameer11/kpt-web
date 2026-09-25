import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock3, LifeBuoy, MessageCircle, Ticket } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { fetchSupportTickets, type ApiSupportTicket } from "@/lib/api";

export const Route = createFileRoute("/settings_/help_/tickets")({
  head: () => ({
    meta: [
      { title: "My tickets | Kipit Support" },
      {
        name: "description",
        content: "Track support tickets you've submitted to Kipit.",
      },
    ],
  }),
  component: MyTickets,
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

function MyTickets() {
  const [rows, setRows] = useState<ApiSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    void fetchSupportTickets()
      .then((data) => {
        if (alive) setRows(data);
      })
      .catch((err: { message?: string }) => {
        if (alive) setError(err?.message ?? "Could not load tickets");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  return (
    <SettingsPage
      title="My tickets"
      eyebrow="Support"
      subtitle="Everything you've submitted to Kipit support."
      backTo="/settings/help"
      backLabel="Help centre"
    >
      <div className="mb-4 flex justify-end">
        <Link
          to="/settings/help/ticket"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[12.5px] font-bold text-brand-foreground press"
        >
          <MessageCircle className="size-4" strokeWidth={2.6} /> New ticket
        </Link>
      </div>

      {loading ? (
        <p className="py-16 text-center text-[13px] text-muted-foreground">Loading tickets…</p>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2.5 text-[12.5px] font-bold press"
          >
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.75rem] border border-border bg-card px-6 py-12 text-center">
          <LifeBuoy className="mx-auto size-8 text-brand" />
          <p className="mt-3 text-[15px] font-bold">No tickets yet</p>
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            Submit a ticket from Help, or ask Ask AI to file one for you.
          </p>
          <Link
            to="/settings/help/ticket"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[12.5px] font-bold text-brand-foreground press"
          >
            <Ticket className="size-4" /> Submit a ticket
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border bg-card">
          {rows.map((ticket) => (
            <Link
              key={ticket.id}
              to="/settings/help/tickets/$ticketId"
              params={{ ticketId: ticket.id }}
              className="flex items-center gap-3 px-4 py-3.5 press hover:bg-secondary/40"
            >
              <span
                className={`grid size-9 place-items-center rounded-full ${statusTone(ticket.status)}`}
              >
                <Clock3 className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold">{ticket.subject}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  {ticket.category} · {formatWhen(ticket.createdAt)}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(ticket.status)}`}
                >
                  {statusLabel(ticket.status)}
                </span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </SettingsPage>
  );
}
