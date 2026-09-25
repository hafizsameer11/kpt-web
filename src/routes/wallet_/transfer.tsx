import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check, Clock, Copy, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { hydrateWalletFundingFromApi, VIRTUAL_ACCOUNT } from "@/lib/wallet-data";
import { ApiError, confirmTransferFunding, isAuthenticated } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet_/transfer")({
  validateSearch: z.object({ amount: z.number().catch(0) }),
  head: () => ({
    meta: [
      { title: "Bank Transfer Details | Kipit" },
      {
        name: "description",
        content:
          "Transfer to your dedicated Kipit account number and your wallet is credited instantly.",
      },
      { property: "og:title", content: "Bank Transfer Details | Kipit" },
      {
        property: "og:description",
        content: "Copy your dedicated Kipit account details and send your transfer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransferDetails,
});

function TransferDetails() {
  const { amount } = Route.useSearch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [va, setVa] = useState({ bank: "", accountNumber: "", accountName: "" });
  const [vaError, setVaError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void hydrateWalletFundingFromApi().then((ok) => {
      if (ok) {
        setVa({ ...VIRTUAL_ACCOUNT });
        setVaError(false);
      } else {
        setVa({ bank: "", accountNumber: "", accountName: "" });
        setVaError(true);
      }
    });
  }, []);

  function copy(label: string, value: string) {
    void navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  }

  const sentTransfer = async () => {
    if (busy) return;
    if (!isAuthenticated()) {
      toast.error("Sign in to confirm a transfer.");
      void navigate({ to: "/welcome" });
      return;
    }
    setBusy(true);
    const watchAfter = new Date().toISOString();
    try {
      // Confirm once here (creates Monnify pending intent) — processing only polls credits.
      await confirmTransferFunding(amount);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("kipit:transfer-watch-after", watchAfter);
        window.sessionStorage.setItem("kipit:transfer-confirmed", "1");
      }
      void navigate({
        to: "/wallet/processing",
        search: { amount, method: "transfer", pending: true },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not confirm transfer.");
      setBusy(false);
    }
  };

  const steps = [
    "Open your bank app and add the account above as a beneficiary.",
    `Send exactly ${naira(amount)} from an account in your own name.`,
    "Your Kipit wallet is credited automatically — usually in seconds.",
  ];

  return (
    <AppShell title="Bank Transfer" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div>
                <Link
                  to="/wallet/add-money"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Add money
                </Link>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Transfer this amount
                </p>
                <p className="mt-2 font-display text-[52px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  {naira(amount)}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-primary-foreground/65">
                  <ShieldCheck className="size-4" /> This account belongs only to you — reuse
                  it any time.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-[12.5px] font-extrabold text-gold">
                <Building2 className="size-4" /> {va.bank}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" strokeWidth={2.2} />
                </span>
                <div>
                  <h2 className="text-[15px] font-extrabold text-foreground">
                    Your dedicated account
                  </h2>
                  <p className="text-[12.5px] text-muted-foreground">{va.bank}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {vaError || !va.accountNumber ? (
                  <p className="text-[12.5px] text-muted-foreground">
                    Could not load your dedicated account. Please try again.
                  </p>
                ) : null}
                <CopyRow
                  label="Account number"
                  value={va.accountNumber || "—"}
                  copied={copied === "Account number"}
                  onCopy={() => copy("Account number", va.accountNumber)}
                  mono
                />
                <CopyRow
                  label="Account name"
                  value={va.accountName}
                  copied={copied === "Account name"}
                  onCopy={() => copy("Account name", va.accountName)}
                />
                <CopyRow
                  label="Bank"
                  value={va.bank}
                  copied={copied === "Bank"}
                  onCopy={() => copy("Bank", va.bank)}
                />
              </div>
            </section>

            <div className="sticky top-6 space-y-4">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                  How it works
                </h2>
                <ol className="mt-3 space-y-3 text-[13px] text-foreground">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-extrabold text-gold">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-[11.5px] text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" /> Transfers from third-party accounts
                  are returned for compliance reasons.
                </p>
              </section>
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void sentTransfer()}
                  className="press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float"
                >
                  {busy ? "Confirming…" : "I've sent the transfer"}
                </button>
                <Link
                  to="/"
                  className="press inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground hover:border-primary/40"
                >
                  Do this later
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/wallet/add-money"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Add money
            </Link>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Transfer this amount
            </p>
            <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-primary-foreground/65">
              <ShieldCheck className="size-3.5" /> This account belongs only to you — reuse it
              any time.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-foreground">
                    Your dedicated account
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {va.bank}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {vaError || !va.accountNumber ? (
                  <p className="text-[12px] text-muted-foreground">
                    Could not load your dedicated account. Please try again.
                  </p>
                ) : null}
                <CopyRow
                  label="Account number"
                  value={va.accountNumber || "—"}
                  copied={copied === "Account number"}
                  onCopy={() => copy("Account number", va.accountNumber)}
                  mono
                />
                <CopyRow
                  label="Account name"
                  value={va.accountName}
                  copied={copied === "Account name"}
                  onCopy={() => copy("Account name", va.accountName)}
                />
                <CopyRow
                  label="Bank"
                  value={va.bank}
                  copied={copied === "Bank"}
                  onCopy={() => copy("Bank", va.bank)}
                />
              </div>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                How it works
              </p>
              <ol className="mt-3 space-y-3 text-[13px] text-foreground">
                {[
                  "Open your bank app and add the account above as a beneficiary.",
                  `Send exactly ${naira(amount)} from an account in your own name.`,
                  "Your Kipit wallet is credited automatically — usually in seconds.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-extrabold text-gold">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-[11.5px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> Transfers from third-party accounts are
                returned for compliance reasons.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => void sentTransfer()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              {busy ? "Confirming…" : "I've sent the transfer"}
            </button>
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Do this later
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left press hover:border-gold/40"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`mt-0.5 block truncate text-[14px] font-extrabold text-foreground ${
            mono ? "text-num tracking-[0.08em]" : ""
          }`}
        >
          {value}
        </span>
      </span>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
          copied ? "bg-gold text-gold-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {copied ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
