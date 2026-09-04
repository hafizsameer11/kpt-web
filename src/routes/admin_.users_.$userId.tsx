import { createFileRoute, Link, Outlet, notFound, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Ban, Mail, Phone, Snowflake, TicketCheck } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { StatusPill, TierPill } from "@/components/kipit/AdminBits";
import { findUser, portfolioValue } from "@/lib/admin-users-data";
import { naira } from "@/lib/admin-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin_/users_/$userId")({
  loader: ({ params }) => {
    const user = findUser(params.userId);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.user.name ?? "User";
    return {
      meta: [
        { title: `${name} — Kipit Admin Console` },
        {
          name: "description",
          content: `Administrative profile for ${name}: balances, investments, transactions, KYC, sessions, support and audit trail.`,
        },
        { property: "og:title", content: `${name} — Kipit Admin Console` },
        {
          property: "og:description",
          content: "Customer profile overview for Kipit administrators.",
        },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: AdminUserProfile,
});

const TABS = [
  { label: "Overview", to: "/admin/users/$userId" as const, exact: true },
  { label: "Balances", to: "/admin/users/$userId/balances" as const },
  { label: "Investments", to: "/admin/users/$userId/investments" as const },
  { label: "Transactions", to: "/admin/users/$userId/transactions" as const },
  { label: "KYC", to: "/admin/users/$userId/kyc" as const },
  { label: "Sessions", to: "/admin/users/$userId/sessions" as const },
  { label: "Support", to: "/admin/users/$userId/support" as const },
  { label: "Audit", to: "/admin/users/$userId/audit" as const },
];

function AdminUserProfile() {
  const { user } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <AdminShell title={user.name} subtitle={`ADM-021 · ${user.id}`}>
      <div className="space-y-5">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All users
        </Link>

        {/* Identity header */}
        <section className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-primary-foreground shadow-float">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold text-[16px] font-extrabold text-gold-foreground">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
                  {user.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-primary-foreground/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {user.phone}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TierPill tier={user.tier} />
                  <StatusPill status={user.status} />
                  <span className="text-[12px] text-primary-foreground/60">
                    Joined {user.joined} · last active {user.lastActive}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/55">
                  Portfolio value
                </p>
                <p className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.02em]">
                  {naira(portfolioValue(user))}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Support ticket opened", {
                      description: `A ticket was created for ${user.name}.`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[12.5px] font-bold text-primary-foreground transition hover:bg-white/20"
                >
                  <TicketCheck className="size-4" />
                  New ticket
                </button>
                <button
                  type="button"
                  onClick={() => setFreezeOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-[12.5px] font-bold text-gold-foreground transition hover:opacity-90"
                >
                  {user.status === "frozen" ? (
                    <>
                      <Ban className="size-4" />
                      Unfreeze
                    </>
                  ) : (
                    <>
                      <Snowflake className="size-4" />
                      Freeze account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="no-scrollbar overflow-x-auto rounded-xl border border-border bg-card p-1.5">
          <ul className="flex min-w-max gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.to.replace("$userId", userId);

              return (
                <li key={tab.label}>
                  <Link
                    to={tab.to}
                    params={{ userId }}
                    activeOptions={{ exact: true }}
                    className={`block rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
                      active
                        ? "bg-brand text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Outlet />
      </div>

      {/* Freeze / unfreeze dialog (ADM-033) */}
      <Dialog open={freezeOpen} onOpenChange={setFreezeOpen}>
        <DialogContent className="sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>
              {user.status === "frozen" ? "Unfreeze account" : "Freeze account"}
            </DialogTitle>
            <DialogDescription>
              {user.status === "frozen"
                ? "Restores funding, investing and withdrawals for this customer."
                : "Blocks funding, investing and withdrawals until the freeze is lifted. A reason is mandatory and recorded in the audit log."}
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Reason (required)"
            className="w-full rounded-xl border border-border bg-muted/40 p-3 text-[13px] outline-none focus:border-brand"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFreezeOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-bold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={reason.trim().length < 4}
              onClick={() => {
                setFreezeOpen(false);
                setReason("");
                toast.success(
                  user.status === "frozen" ? "Account unfrozen" : "Account frozen",
                  { description: "Recorded in the audit log (prototype)." },
                );
              }}
              className="rounded-lg bg-destructive px-4 py-2 text-[13px] font-bold text-white transition disabled:opacity-40"
            >
              {user.status === "frozen" ? "Unfreeze" : "Freeze account"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
