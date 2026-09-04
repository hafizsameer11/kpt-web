import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Coins, Gift, History, ShieldCheck, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, Stat } from "@/components/kipit/AdminBits";
import {
  REFERRAL_CHANGE_LOG,
  REFERRAL_LEADERS,
  REFERRAL_PROGRAMME,
  REFERRAL_RULES,
} from "@/lib/admin-marketing-data";

export const Route = createFileRoute("/admin_/marketing_/referrals")({
  head: () => ({
    meta: [
      { title: "Referral rules — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Configure Kipit referral rewards, qualifying funding, hold periods, invite expiry and monthly caps.",
      },
      { property: "og:title", content: "Referral rules — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Reward amounts and qualification rules for the Kipit referral programme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReferralRulesPage,
});

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function ReferralRulesPage() {
  const [enabled, setEnabled] = useState(REFERRAL_PROGRAMME.enabled);
  const [requiresKyc, setRequiresKyc] = useState(REFERRAL_PROGRAMME.requiresKyc);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(REFERRAL_RULES.map((r) => [r.id, r.value])),
  );
  const dirty = REFERRAL_RULES.some((r) => values[r.id] !== r.value);

  const setValue = (id: string, raw: string) =>
    setValues((v) => ({ ...v, [id]: raw.replace(/[^0-9]/g, "") }));

  const display = (id: string, kind: string) => {
    const n = Number(values[id] || 0);
    if (kind === "amount") return n.toLocaleString("en-NG");
    return values[id];
  };

  return (
    <AdminShell
      title="Referral rules"
      subtitle="ADM-100 · reward amounts, qualification rules and payout caps"
    >
      <Link
        to="/admin/marketing"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to marketing
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Invites sent"
          value={REFERRAL_PROGRAMME.invitesSent.toLocaleString("en-NG")}
          helper="All time"
          icon={Users}
        />
        <Stat
          label="Qualified referrals"
          value={REFERRAL_PROGRAMME.invitesQualified.toLocaleString("en-NG")}
          helper={`${Math.round(
            (REFERRAL_PROGRAMME.invitesQualified / REFERRAL_PROGRAMME.invitesSent) * 100,
          )}% conversion`}
          tone="gold"
          icon={Gift}
        />
        <Stat
          label="Rewards paid"
          value={naira(REFERRAL_PROGRAMME.rewardsPaid)}
          helper="Credited to wallets"
          tone="brand"
          icon={Coins}
        />
        <Stat
          label="Awaiting approval"
          value={String(REFERRAL_PROGRAMME.pendingApproval)}
          helper="Rule changes in maker-checker"
          icon={ShieldCheck}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Programme rules"
          eyebrow="Configuration"
          icon={Gift}
          action={
            <span className="text-[11px] font-semibold text-muted-foreground">
              Last change {REFERRAL_PROGRAMME.updatedAt} · {REFERRAL_PROGRAMME.updatedBy}
            </span>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {REFERRAL_RULES.map((rule) => (
              <label key={rule.id} className="block">
                <span className="text-[12.5px] font-bold text-foreground">{rule.label}</span>
                <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                  {rule.helper}
                </span>
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-brand/50">
                  {rule.kind === "amount" ? (
                    <span className="text-[13px] font-bold text-muted-foreground">₦</span>
                  ) : null}
                  <input
                    inputMode="numeric"
                    value={display(rule.id, rule.kind)}
                    onChange={(e) => setValue(rule.id, e.target.value)}
                    className="w-full bg-transparent text-[13.5px] font-bold outline-none"
                  />
                  {rule.kind !== "amount" ? (
                    <span className="text-[11.5px] font-semibold text-muted-foreground">
                      {rule.kind === "days" ? "days" : "per month"}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-border/70 pt-4">
            <SwitchRow
              label="Referral programme active"
              helper="Turn off to stop issuing new invite codes"
              on={enabled}
              onChange={setEnabled}
            />
            <SwitchRow
              label="Require completed verification"
              helper="Rewards only release after the invitee passes KYC"
              on={requiresKyc}
              onChange={setRequiresKyc}
            />
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-[12.5px] font-bold text-foreground">Payout destination</p>
                <p className="text-[11.5px] text-muted-foreground">
                  Where qualified rewards are credited
                </p>
              </div>
              <span className="rounded-lg bg-card px-3 py-1.5 text-[12px] font-bold text-foreground ring-1 ring-border">
                {REFERRAL_PROGRAMME.payoutDestination}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!dirty}
              onClick={() =>
                toast.success("Rule change submitted for approval", {
                  description: "A second admin must approve before it goes live.",
                })
              }
              className={`rounded-xl bg-brand-gradient px-5 py-2.5 text-[13px] font-extrabold text-primary-foreground transition ${
                dirty ? "" : "pointer-events-none opacity-40"
              }`}
            >
              Submit for approval
            </button>
            <button
              type="button"
              onClick={() =>
                setValues(Object.fromEntries(REFERRAL_RULES.map((r) => [r.id, r.value])))
              }
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-bold text-foreground hover:bg-muted"
            >
              Reset changes
            </button>
            <span className="text-[11.5px] text-muted-foreground">
              Maker-checker: changes take effect only after a second approval.
            </span>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Top referrers" eyebrow="This quarter" icon={Trophy}>
            <ul className="space-y-3">
              {REFERRAL_LEADERS.map((l, i) => (
                <li key={l.name} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/8 text-[12px] font-extrabold text-brand">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">{l.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {l.qualified} qualified of {l.invites} invites
                    </p>
                  </div>
                  <span className="text-[12.5px] font-extrabold text-foreground">
                    {naira(l.rewarded)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Change history" eyebrow="Audit" icon={History}>
            <ul className="space-y-3">
              {REFERRAL_CHANGE_LOG.map((c) => (
                <li key={c.at} className="border-l-2 border-gold/60 pl-3">
                  <p className="text-[12.5px] font-semibold text-foreground">{c.change}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {c.at} · {c.by} · {c.status}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

function SwitchRow({
  label,
  helper,
  on,
  onChange,
}: {
  label: string;
  helper: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      <div className="min-w-0 pr-4">
        <p className="text-[12.5px] font-bold text-foreground">{label}</p>
        <p className="text-[11.5px] text-muted-foreground">{helper}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${
            on ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
