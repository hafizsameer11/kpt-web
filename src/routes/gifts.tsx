import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Gift as GiftIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import {
  GIFT_TABS,
  hydrateGiftsFromApi,
  type Gift,
  type GiftTab,
} from "@/lib/gift-data";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Gift Investments | Kipit" },
      {
        name: "description",
        content:
          "Track every Kipit investment you have gifted — sent, pending claim and claimed — with recipient, plan, amount and status.",
      },
      { property: "og:title", content: "Gift Investments | Kipit" },
      {
        property: "og:description",
        content:
          "See the gifts you have sent on Kipit, who has claimed them and what each gifted plan is worth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GiftsScreen,
});

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-gold/15 text-gold",
  Claimed: "bg-brand/10 text-brand",
  Expired: "bg-muted text-muted-foreground",
};

function GiftsScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const [tab, setTab] = useState<GiftTab>("Sent");
  const [gifts, setGifts] = useState<Gift[]>([]);

  useEffect(() => {
    void hydrateGiftsFromApi().then(setGifts);
  }, []);

  const list = tab === "Sent" ? gifts : gifts.filter((g) => g.status === tab);
  const totalGifted = gifts.reduce((s, g) => s + g.amount, 0);

  return (
    <AppShell title="Gift investments" navVariant="elevated">
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
                  to="/portfolio"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Portfolio
                </Link>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Total gifted
                </p>
                <p className="mt-1 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  <AmountCounter value={totalGifted} hidden={hidden} mask={mask} />
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                  <GiftIcon className="size-3.5 text-gold" />
                  {gifts.length} gifts sent
                </p>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex gap-2">
                  {GIFT_TABS.map((t) => {
                    const active = t === tab;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`press rounded-xl px-5 py-3 text-left transition-colors ${
                          active
                            ? "bg-gold text-brand shadow-float"
                            : "bg-white/10 text-primary-foreground hover:bg-white/15"
                        }`}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                          {t}
                        </p>
                        <p className="mt-0.5 font-display text-[20px] font-extrabold text-num">
                          {(t === "Sent" ? gifts : gifts.filter((g) => g.status === t)).length}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <Link
                  to="/fixed-plans/create"
                  className="press inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-[13px] font-extrabold text-brand shadow-float"
                >
                  <Plus className="size-4" strokeWidth={2.4} /> Send a new gift
                </Link>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-display text-[17px] font-extrabold">
                  {tab === "Sent" ? "All gifts" : `${tab} gifts`}
                </h2>
              </div>
              {list.length > 0 ? (
                <ul className="divide-y divide-border/60">
                  {list.map((g) => (
                    <li key={g.id}>
                      <Link
                        to="/gifts/$giftId"
                        params={{ giftId: g.id }}
                        className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                          <GiftIcon className="size-5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-extrabold">{g.recipient}</p>
                          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                            {g.product} · {g.tenor} · {g.rate}
                          </p>
                        </div>
                        <div className="w-28 text-right">
                          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            Amount
                          </p>
                          <p className="mt-0.5 text-[14px] font-extrabold text-num">
                            {mask(g.amount)}
                          </p>
                        </div>
                        <div className="w-28 text-right">
                          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            {g.status === "Claimed" ? "Claimed" : "Sent"}
                          </p>
                          <p className="mt-0.5 text-[11.5px] font-semibold">
                            {g.claimedDate ?? g.sentDate}
                          </p>
                        </div>
                        <span
                          className={`w-20 shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-extrabold uppercase tracking-[0.08em] ${STATUS_STYLE[g.status]}`}
                        >
                          {g.status}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-12 text-center text-[12.5px] text-muted-foreground">
                  No {tab.toLowerCase()} gifts yet.
                </p>
              )}
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-[15px] font-extrabold">How gifting works</h2>
                <ol className="mt-3 space-y-3">
                  {[
                    "Pick a plan and amount, then add the recipient's phone number.",
                    "They get an SMS with a claim link — no Kipit account needed to receive it.",
                    "Once claimed, the plan starts earning in their name immediately.",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-extrabold text-brand">
                        {i + 1}
                      </span>
                      <p className="text-[12px] leading-[1.6] text-muted-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-[15px] font-extrabold">Awaiting claim</h2>
                {gifts.filter((g) => g.status === "Pending").length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {gifts.filter((g) => g.status === "Pending").map((g) => (
                      <li key={g.id}>
                        <Link
                          to="/gifts/$giftId"
                          params={{ giftId: g.id }}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-secondary/50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[12.5px] font-bold">
                              {g.recipient}
                            </span>
                            <span className="block text-[10.5px] text-muted-foreground">
                              Expires {g.expiresDate}
                            </span>
                          </span>
                          <span className="text-[12px] font-extrabold text-num">
                            {mask(g.amount)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[12px] text-muted-foreground">
                    All gifts have been claimed.
                  </p>
                )}
              </section>
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
              to="/portfolio"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Portfolio
            </Link>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Total gifted
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={totalGifted} hidden={hidden} mask={mask} />
            </h1>
            <p
              className="k-rise mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold"
              style={{ ["--d" as string]: "80ms" }}
            >
              <GiftIcon className="size-3.5 text-gold" />
              {gifts.length} gifts sent
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Tabs */}
          <div className="flex gap-2">
            {GIFT_TABS.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-full border py-2 text-[12px] font-bold transition-colors press ${
                    active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {t} · {(t === "Sent" ? gifts : gifts.filter((g) => g.status === t)).length}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {list.map((g, i) => (
              <li key={g.id} className="k-rise" style={{ ["--d" as string]: `${i * 60}ms` }}>
                <Link
                  to="/gifts/$giftId"
                  params={{ giftId: g.id }}
                  className="card-surface block p-4 press transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
                      <GiftIcon className="size-[18px]" strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[13.5px] font-extrabold">{g.recipient}</p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${STATUS_STYLE[g.status]}`}
                        >
                          {g.status}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {g.product} · {g.tenor} · {g.rate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Gift amount
                      </p>
                      <p className="mt-0.5 text-[15px] font-extrabold text-num">
                        {mask(g.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {g.status === "Claimed" ? "Claimed" : "Sent"}
                        </p>
                        <p className="mt-0.5 text-[11.5px] font-semibold">
                          {g.claimedDate ?? g.sentDate}
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {list.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No {tab.toLowerCase()} gifts yet.
            </p>
          )}

          <Link
            to="/fixed-plans/create"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-[13px] font-bold text-brand-foreground press"
          >
            <Plus className="size-4" /> Send a new gift
          </Link>

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
