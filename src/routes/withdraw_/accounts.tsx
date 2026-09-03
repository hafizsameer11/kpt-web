import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Landmark, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { maskAccount, SAVED_ACCOUNTS } from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/accounts")({
  head: () => ({
    meta: [
      { title: "Select Payout Account | Kipit" },
      {
        name: "description",
        content:
          "Choose one of your verified Nigerian bank accounts to receive your Kipit withdrawal.",
      },
      { property: "og:title", content: "Select Payout Account | Kipit" },
      {
        property: "og:description",
        content: "Pick a saved payout account or add a new bank account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={2}>
      <SelectAccountScreen />
    </KycGuard>
  ),
});

function SelectAccountScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(SAVED_ACCOUNTS[0]?.id ?? "");

  return (
    <>
      <div className="md:hidden">
        <MobileSelectAccount selected={selected} setSelected={setSelected} />
      </div>
      <div className="hidden md:block">
        <DesktopSelectAccount selected={selected} setSelected={setSelected} />
      </div>
    </>
  );
}

function MobileSelectAccount({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <AppShell title="Payout Account" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/withdraw"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Withdraw
            </Link>
            <p className="mt-6 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]">
              Where should we send it?
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-primary-foreground/65">
              <ShieldCheck className="size-3.5" /> Payouts only go to accounts in your name.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Saved accounts
          </p>

          <ul className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {SAVED_ACCOUNTS.map((acct) => {
              const active = acct.id === selected;
              return (
                <li key={acct.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(acct.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors press ${
                      active
                        ? "border-gold bg-gold/[0.07]"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Landmark className="size-5" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-bold text-foreground">
                          {acct.accountName}
                        </span>
                        {acct.primary && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                            Primary
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                        {acct.bank} · {maskAccount(acct.accountNumber)}
                      </span>
                    </span>
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        active ? "border-gold bg-gold text-gold-foreground" : "border-border"
                      }`}
                    >
                      {active && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Link
            to="/withdraw/add-account"
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-card p-3.5 text-left press hover:border-gold/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
              <Plus className="size-5" strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-foreground">
                Add New Account
              </span>
              <span className="block text-[12px] text-muted-foreground">
                We'll verify the account name instantly
              </span>
            </span>
          </Link>

          <div className="mt-5">
            <button
              type="button"
              disabled={!selected}
              onClick={() =>
                void navigate({ to: "/withdraw/amount", search: { acct: selected } })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
