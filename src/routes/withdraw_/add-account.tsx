import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { BANKS, SAVED_ACCOUNTS } from "@/lib/withdraw-data";

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
  component: AddAccountScreen,
});

type Stage = "form" | "verifying" | "confirm";

const VERIFIED_NAME = "Adebayo O. Ilesanmi";

function AddAccountScreen() {
  const navigate = useNavigate();
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [stage, setStage] = useState<Stage>("form");

  const bankName = BANKS.find((b) => b.code === bank)?.name ?? "";
  const valid = bank !== "" && number.length === 10;

  function verify() {
    setStage("verifying");
    window.setTimeout(() => setStage("confirm"), 1600);
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

          {stage === "confirm" ? (
            <section className="card-surface p-4 md:max-w-lg md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Confirm account name
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/[0.07] p-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <BadgeCheck className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold text-foreground">
                    {VERIFIED_NAME}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {bankName} · {number}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: "/withdraw/amount",
                      search: { acct: SAVED_ACCOUNTS[0]?.id ?? "pa1" },
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
                >
                  Confirm <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
                >
                  Edit details
                </button>
              </div>
            </section>
          ) : (
            <section className="card-surface p-4 md:max-w-lg md:p-5">
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
                    <option value="">Select your bank</option>
                    {BANKS.map((b) => (
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
                  placeholder="10-digit account number"
                  value={number}
                  disabled={stage === "verifying"}
                  onChange={(e) =>
                    setNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold tracking-[0.06em] text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:tracking-normal placeholder:text-muted-foreground focus:border-gold"
                />
              </label>

              {stage === "verifying" ? (
                <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-[13px] font-bold text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Verifying account…
                </p>
              ) : (
                <button
                  type="button"
                  disabled={!valid}
                  onClick={verify}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none"
                >
                  Verify account <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
