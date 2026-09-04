import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Ban,
  Clock,
  FileText,
  Lock,
  LockOpen,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Panel, Stat } from "@/components/kipit/AdminBits";
import { findUser, portfolioValue } from "@/lib/admin-users-data";
import { naira } from "@/lib/admin-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin_/users_/$userId/frozen")({
  loader: ({ params }) => {
    const user = findUser(params.userId);
    if (!user) throw notFound();
    return { user };
  },
  component: FrozenState,
});

const RESTRICTIONS = [
  { label: "Wallet funding", blocked: true },
  { label: "New investments", blocked: true },
  { label: "Withdrawals and payouts", blocked: true },
  { label: "Adding payout banks", blocked: true },
  { label: "Sign in and view balances", blocked: false },
  { label: "Contact support", blocked: false },
];

const TIMELINE = [
  { id: "t-1", title: "Account frozen", detail: "Source of funds evidence outstanding", by: "Ify Chukwu · Compliance", when: "29 Aug 2026, 11:04" },
  { id: "t-2", title: "Customer notified", detail: "Email and in-app notice delivered", by: "System", when: "29 Aug 2026, 11:05" },
  { id: "t-3", title: "Evidence requested", detail: "Payslips and bank statement for the last 3 months", by: "Ify Chukwu · Compliance", when: "30 Aug 2026, 09:20" },
  { id: "t-4", title: "Partial documents received", detail: "One statement uploaded, payslips outstanding", by: "Customer", when: "02 Sep 2026, 18:41" },
];

function FrozenState() {
  const { user } = Route.useLoaderData();
  const [frozen, setFrozen] = useState(user.status === "frozen");
  const [unfreezeOpen, setUnfreezeOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-5">
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 ${
          frozen ? "border-destructive/30 bg-destructive/8" : "border-emerald-500/25 bg-emerald-500/8"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`grid size-12 place-items-center rounded-2xl ${
              frozen ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-700"
            }`}
          >
            {frozen ? <Lock className="size-5" /> : <LockOpen className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[20px] font-extrabold tracking-[-0.02em]">
              {frozen ? "This account is frozen" : "This account has full access"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {frozen
                ? `${user.name} cannot fund, invest or withdraw. Balances stay intact and continue to earn where already invested.`
                : `${user.name} can fund, invest and withdraw normally.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => (frozen ? setUnfreezeOpen(true) : setFreezeOpen(true))}
            className={`rounded-lg px-4 py-2.5 text-[13px] font-bold transition hover:opacity-90 ${
              frozen
                ? "bg-brand text-primary-foreground"
                : "bg-destructive text-destructive-foreground"
            }`}
          >
            {frozen ? "Lift restriction" : "Freeze account"}
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Status"
          value={frozen ? "Frozen" : "Active"}
          helper={frozen ? "Applied 29 Aug 2026" : "No restriction"}
          tone="brand"
          icon={ShieldAlert}
        />
        <Stat label="Balances held" value={naira(portfolioValue(user))} helper="Across all pockets" tone="gold" icon={Wallet} />
        <Stat label="Days restricted" value={frozen ? "6" : "0"} helper="Target review 5 working days" icon={Clock} />
        <Stat label="Open compliance case" value="AML-2291" helper="Source of funds review" icon={FileText} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="What is blocked" eyebrow="Customer experience" icon={Ban}>
          <ul className="space-y-2.5">
            {RESTRICTIONS.map((r) => (
              <li
                key={r.label}
                className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5"
              >
                <span
                  className={`size-2 rounded-full ${r.blocked ? "bg-destructive" : "bg-emerald-500"}`}
                />
                <span className="flex-1 text-[13.5px] font-semibold">{r.label}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    r.blocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-500/12 text-emerald-700"
                  }`}
                >
                  {frozen ? (r.blocked ? "Blocked" : "Allowed") : "Allowed"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-muted/50 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Message shown to the customer
            </p>
            <p className="mt-1 text-[13px]">
              “Your account is temporarily restricted while we complete a routine check. Your money
              is safe. Please send the documents requested by our team.”
            </p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Restriction history" eyebrow="Audit trail">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {TIMELINE.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[1.55rem] top-1.5 size-2.5 rounded-full bg-gold ring-4 ring-card" />
                  <p className="text-[13.5px] font-bold">{t.title}</p>
                  <p className="text-[12.5px] text-muted-foreground">{t.detail}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {t.by} · {t.when}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Add a case note" eyebrow="Internal only">
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record what you checked or what is still outstanding…"
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13.5px] outline-none transition focus:border-brand"
            />
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Link
                to="/admin/compliance/frozen"
                className="rounded-lg border border-border px-3.5 py-2 text-[13px] font-bold transition hover:bg-muted"
              >
                All frozen accounts
              </Link>
              <Link
                to="/admin/compliance/aml"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[13px] font-bold transition hover:bg-muted"
              >
                Open AML case <ArrowRight className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (!note.trim()) return;
                  setNote("");
                  toast.success("Note added to the case");
                }}
                className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-bold text-primary-foreground transition hover:opacity-90"
              >
                Save note
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={unfreezeOpen} onOpenChange={setUnfreezeOpen}>
        <DialogContent className="sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Lift the restriction?</DialogTitle>
            <DialogDescription>
              {user.name} regains funding, investing and withdrawal access immediately. The change is
              recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUnfreezeOpen(false)}
              className="rounded-lg border border-border px-3.5 py-2 text-[13px] font-bold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setFrozen(false);
                setUnfreezeOpen(false);
                toast.success("Restriction lifted", { description: `${user.name} has full access.` });
              }}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-bold text-primary-foreground transition hover:opacity-90"
            >
              Lift restriction
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={freezeOpen} onOpenChange={setFreezeOpen}>
        <DialogContent className="sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Freeze this account</DialogTitle>
            <DialogDescription>
              Blocks funding, investing and withdrawals until lifted. A reason is mandatory.
            </DialogDescription>
          </DialogHeader>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for the restriction"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13.5px] outline-none focus:border-brand"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFreezeOpen(false)}
              className="rounded-lg border border-border px-3.5 py-2 text-[13px] font-bold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!reason.trim()}
              onClick={() => {
                setFrozen(true);
                setFreezeOpen(false);
                setReason("");
                toast.success("Account frozen", { description: `${user.name} is now restricted.` });
              }}
              className="rounded-lg bg-destructive px-3.5 py-2 text-[13px] font-bold text-destructive-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Freeze account
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
