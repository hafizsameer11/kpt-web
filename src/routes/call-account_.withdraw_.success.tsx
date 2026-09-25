import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, Wallet } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { useWalletBalance } from "@/lib/wallet-balance";

export const Route = createFileRoute("/call-account_/withdraw_/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
    ref: typeof search["ref"] === "string" ? search["ref"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Moved to Wallet | Kipit Call Account" },
      {
        name: "description",
        content:
          "Your Call Account money is now in your Kipit wallet, ready to reinvest or send to your bank.",
      },
      { property: "og:title", content: "Moved to Wallet | Kipit Call Account" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessScreen,
});

function SuccessScreen() {
  const { amount, ref } = Route.useSearch();
  const walletBalance = useWalletBalance();
  const reference = ref || "—";

  return (
    <AppShell title="Moved to wallet" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <div className="relative">
            <span className="relative mx-auto grid size-16 place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Moved to your wallet
            </p>
            <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num">
              {naira(amount)}
            </p>
            <p className="mt-3 text-[12px] font-medium text-primary-foreground/60">
              Reference {reference}
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <section className="card-surface p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <Wallet className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-foreground">Kipit Wallet</p>
                <p className="text-[12px] text-muted-foreground">
                  New balance {naira(walletBalance)}
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Wallet money earns nothing. Put it back to work, or send it to your bank.
            </p>
          </section>

          <div className="mt-5 space-y-3 md:flex md:gap-3 md:space-y-0">
            <Link
              to="/withdraw"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-8"
            >
              Send to my bank <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/invest"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-[13.5px] font-extrabold text-foreground press md:w-auto md:px-8"
            >
              Invest it instead
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
