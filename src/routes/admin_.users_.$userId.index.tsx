import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Panel, Stat } from "@/components/kipit/AdminBits";
import { naira } from "@/lib/admin-data";
import {
  auditFor,
  findUser,
  investmentsFor,
  kycFor,
  portfolioValue,
  sessionsFor,
  ticketsFor,
  txnsFor,
} from "@/lib/admin-users-data";

export const Route = createFileRoute("/admin_/users_/$userId/")({
  component: Overview,
});

function Overview() {
  const { userId } = Route.useParams();
  const user = findUser(userId)!;
  const txns = txnsFor(userId);
  const investments = investmentsFor(userId);
  const kyc = kycFor(userId);
  const sessions = sessionsFor(userId);
  const tickets = ticketsFor(userId);
  const audit = auditFor(userId);

  return (
    <div className="space-y-5">
      {user.freeze ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/8 p-5">
          <p className="text-[13px] font-extrabold text-destructive">Account frozen</p>
          <p className="mt-1 text-[13px] text-foreground/80">{user.freeze.reason}</p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Frozen {user.freeze.date} by {user.freeze.by}
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Portfolio total" value={naira(portfolioValue(user))} tone="brand" helper="All pools" />
        <Stat label="Wallet" value={naira(user.wallet)} helper="Uninvested cash" />
        <Stat label="Call Account" value={naira(user.call)} helper="Daily accrual" />
        <Stat
          label="Invested"
          value={naira(user.fixed + user.explore)}
          helper="Fixed + Explore principal"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel
          title="Recent transactions"
          action={
            <Link
              to="/admin/users/$userId/transactions"
              params={{ userId }}
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brand"
            >
              View all <ChevronRight className="size-3.5" />
            </Link>
          }
        >
          <ul className="divide-y divide-border/70">
            {txns.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold">{t.label}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {t.ref} · {t.at}
                  </p>
                </div>
                <span className="shrink-0 text-[13.5px] font-bold">{naira(t.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel
            title="KYC"
            action={
              <Link
                to="/admin/users/$userId/kyc"
                params={{ userId }}
                className="text-[12.5px] font-bold text-brand"
              >
                Open
              </Link>
            }
          >
            <p className="text-[13px] text-muted-foreground">
              Tier {kyc.tier} · submitted {kyc.submitted}
            </p>
            <p className="mt-1 text-[13px]">
              {kyc.checks.filter((c) => c.state === "passed").length} of {kyc.checks.length} checks
              passed · reviewer {kyc.reviewer}
            </p>
          </Panel>

          <Panel title="At a glance">
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Active investments</span>
                <span className="font-bold">
                  {investments.filter((i) => i.state === "active").length}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Active sessions</span>
                <span className="font-bold">
                  {sessions.filter((s) => s.status === "active").length}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Open tickets</span>
                <span className="font-bold">
                  {tickets.filter((t) => t.status !== "resolved").length}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Audit entries</span>
                <span className="font-bold">{audit.length}</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
