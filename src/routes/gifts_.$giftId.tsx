import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift as GiftIcon,
  Quote,
  Share2,
  User,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { getGift } from "@/lib/gift-data";

export const Route = createFileRoute("/gifts_/$giftId")({
  loader: ({ params }) => {
    const gift = getGift(params.giftId);
    if (!gift) throw notFound();
    return { gift };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Gift not found | Kipit" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Gift to ${loaderData.gift.recipient} | Kipit`;
    const description = `${loaderData.gift.product} gift of ₦${loaderData.gift.amount.toLocaleString("en-NG")} — status, claim details and maturity.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: GiftDetailScreen,
});

function GiftDetailScreen() {
  const { gift } = Route.useLoaderData();
  const { mask, hidden } = useBalanceVisibility();

  const claimed = gift.status === "Claimed";
  const expired = gift.status === "Expired";

  return (
    <AppShell title="Gift detail" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/gifts"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Gifts
            </Link>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Gift amount
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={gift.amount} hidden={hidden} mask={mask} />
            </h1>
            <div className="k-rise mt-3 flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "80ms" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">
                <GiftIcon className="size-3.5 text-gold" /> {gift.product}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                  claimed
                    ? "bg-gold-gradient text-brand"
                    : expired
                      ? "bg-white/10 text-primary-foreground/70"
                      : "bg-white/15 text-gold"
                }`}
              >
                {claimed ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                {gift.status}
              </span>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {/* Recipient */}
            <article className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Recipient
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                  <User className="size-[18px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold">{gift.recipient}</p>
                  <p className="text-[11.5px] text-muted-foreground">{gift.phone}</p>
                </div>
              </div>
            </article>

            {/* Investment */}
            <article className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Investment
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-y-3">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Rate</dt>
                  <dd className="mt-0.5 text-[14px] font-extrabold text-gold">{gift.rate}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Tenor</dt>
                  <dd className="mt-0.5 text-[14px] font-extrabold">{gift.tenor}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Matures
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold">{gift.maturityDate}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Value at maturity
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-extrabold text-num">
                    {mask(gift.expectedPayout)}
                  </dd>
                </div>
              </dl>
            </article>
          </div>

          {/* Message */}
          <article className="card-surface relative mt-3 overflow-hidden p-4 md:mt-4 md:p-5">
            <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-gold-gradient" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Your message
            </p>
            <div className="mt-2.5 flex gap-2.5">
              <Quote className="size-4 shrink-0 text-gold" />
              <p className="text-[13.5px] leading-[1.6]">{gift.message}</p>
            </div>
          </article>

          {/* Claim status */}
          <article className="card-surface mt-3 p-4 md:mt-4 md:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Claim status
            </p>
            <ol className="mt-3.5 space-y-3.5">
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="mt-1 size-2.5 rounded-full bg-brand" />
                <div>
                  <p className="text-[13px] font-bold">Gift sent</p>
                  <p className="text-[11px] text-muted-foreground">{gift.sentDate}</p>
                </div>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span
                  className={`mt-1 size-2.5 rounded-full ${
                    claimed ? "bg-gold k-glow" : expired ? "bg-muted-foreground/40" : "bg-gold/40"
                  }`}
                />
                <div>
                  <p className="text-[13px] font-bold">
                    {claimed
                      ? "Claimed by recipient"
                      : expired
                        ? "Claim window expired"
                        : "Awaiting claim"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {claimed
                      ? gift.claimedDate
                      : expired
                        ? `Expired ${gift.expiresDate}`
                        : `Expires ${gift.expiresDate}`}
                  </p>
                </div>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="mt-1 size-2.5 rounded-full bg-border" />
                <div>
                  <p className="text-[13px] font-bold">Matures for recipient</p>
                  <p className="text-[11px] text-muted-foreground">{gift.maturityDate}</p>
                </div>
              </li>
            </ol>
          </article>

          {!claimed && !expired && (
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-[13px] font-bold text-brand-foreground press"
            >
              <Share2 className="size-4" /> Resend claim link
            </button>
          )}
          {expired && (
            <Link
              to="/fixed-plans/create"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-[13px] font-bold text-brand-foreground press"
            >
              <CalendarDays className="size-4" /> Send again
            </Link>
          )}

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
