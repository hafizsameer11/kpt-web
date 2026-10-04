import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import {
  addPayoutAccount,
  BANKS,
  commitPayoutAccountLocal,
  hydratePayoutFromApi,
  resolvePayoutAccountViaApi,
  type PayoutBank,
  type ResolvedPayoutAccount,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/add-account")({
  head: () => ({
    meta: [
      { title: "Add Payout Account | Kipit" },
      {
        name: "description",
        content:
          "Add and verify a Nigerian bank account to receive your Kipit withdrawals.",
      },
      { property: "og:title", content: "Add Payout Account | Kipit" },
      {
        property: "og:description",
        content: "Enter your bank and account number — we verify the name instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={2}>
      <AddAccountScreen />
    </KycGuard>
  ),
});

type Stage = "form" | "verifying" | "confirm";

function AddAccountScreen() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<PayoutBank[]>([]);
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [verifiedName, setVerifiedName] = useState("");
  const [pendingResolved, setPendingResolved] = useState<ResolvedPayoutAccount | null>(null);
  const [busyConfirm, setBusyConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void hydratePayoutFromApi().then(() => setBanks([...BANKS]));
  }, []);

  const bankName = banks.find((b) => b.code === bank)?.name ?? "";
  const valid = bank !== "" && number.length === 10;

  function abandonPending() {
    setPendingResolved(null);
    setVerifiedName("");
    setStage("form");
  }

  async function verify() {
    setError(null);
    setStage("verifying");
    try {
      // Resolve-only — no PayoutBank row until Confirm (app-safe additive API).
      const resolved = await resolvePayoutAccountViaApi(bank, number);
      setVerifiedName(resolved.accountName);
      setPendingResolved(resolved);
      setStage("confirm");
    } catch (err) {
      setStage("form");
      setError(err instanceof Error ? err.message : "Could not verify account.");
    }
  }

  async function confirm() {
    if (!pendingResolved || busyConfirm) return;
    setBusyConfirm(true);
    setError(null);
    try {
      const account = await addPayoutAccount(
        pendingResolved.bankCode,
        pendingResolved.accountNumber,
        { commitLocal: true },
      );
      commitPayoutAccountLocal(account);
      void navigate({
        to: "/withdraw/amount",
        search: { acct: account.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save payout account.");
    } finally {
      setBusyConfirm(false);
    }
  }

  return (
    <AppShell title="Add Account" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/withdraw/accounts"
              onClick={() => {
                if (stage === "confirm" && pendingResolved) {
                  abandonPending();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Payout accounts
            </Link>
            <p className="mt-6 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]">
              Add a payout account
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-primary-foreground/65">
              <ShieldCheck className="size-3.5" /> The account name must match your Kipit profile.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="md:mx-auto md:grid md:max-w-5xl md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
          {stage === "confirm" ? (
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Confirm account name
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/[0.07] p-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <BadgeCheck className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold text-foreground">
                    {verifiedName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {bankName} · {number}
                  </p>
                </div>
              </div>

              {error ? (
                <p className="mt-3 text-[12px] font-semibold text-destructive">{error}</p>
              ) : null}

              <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
                <button
                  type="button"
                  disabled={busyConfirm}
                  onClick={() => void confirm()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 md:w-auto md:px-10"
                >
                  {busyConfirm ? "Saving…" : "Confirm"}{" "}
                  <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <button
                  type="button"
                  disabled={busyConfirm}
                  onClick={() => abandonPending()}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
                >
                  Edit details
                </button>
              </div>
            </section>
          ) : (
            <section className="card-surface p-4 md:p-5">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Bank
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                  <Landmark className="size-4 shrink-0 text-muted-foreground" />
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    disabled={stage === "verifying"}
                    className="w-full bg-transparent py-3 text-[13.5px] font-semibold text-foreground outline-none"
                  >
                    <option value="">
                      {banks.length ? "Select your bank" : "Loading banks…"}
                    </option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Account number
                </span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={number}
                  disabled={stage === "verifying"}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit NUBAN"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-[13.5px] font-semibold outline-none"
                />
              </label>

              {error ? (
                <p className="mt-3 text-[12px] font-semibold text-destructive">{error}</p>
              ) : null}

              {stage === "verifying" ? (
                <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-[13px] font-bold text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Verifying account…
                </p>
              ) : (
                <button
                  type="button"
                  disabled={!valid}
                  onClick={() => void verify()}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none"
                >
                  Verify account <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
              )}
            </section>
          )}

          <aside className="hidden space-y-4 md:block">
            <section className="card-surface p-5">
              <p className="text-[12.5px] font-extrabold text-foreground">Before you add it</p>
              <ul className="mt-2 space-y-2">
                {[
                  "The account must be in your own name — third-party payouts are declined.",
                  "We verify the name with your bank instantly, no documents needed.",
                  "Only NGN current or savings accounts can receive withdrawals.",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
            <section className="card-surface p-5">
              <p className="text-[12.5px] font-extrabold text-foreground">Name mismatch?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                If the verified name doesn't match your Kipit profile, update your profile or reach
                out to support and we'll help sort it out.
              </p>
              <Link
                to="/settings/help/ticket"
                className="mt-3 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2.5 text-[12.5px] font-bold text-foreground press"
              >
                Contact support
              </Link>
            </section>
          </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
