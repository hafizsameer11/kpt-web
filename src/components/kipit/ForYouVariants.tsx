import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { feedArt } from "@/components/kipit/art";
import { FEED } from "@/lib/home-data";

function SectionHead({ label = "For you" }: { label?: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">{label}</h2>
      <Link
        to="/explore"
        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground press hover:bg-secondary"
      >
        View all
      </Link>
    </div>
  );
}

/**
 * Variant A — "Cover stories".
 * Tall poster cards: artwork fills the card, copy sits on a navy scrim at the
 * bottom. Reads like a premium magazine rack.
 */
export function ForYouCovers() {
  return (
    <section>
      <SectionHead />
      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar md:mt-4 md:grid md:grid-cols-3 md:overflow-visible md:gap-4">
        {FEED.map((item, i) => (
          <article
            key={item.title}
            className="relative h-[19rem] w-[72vw] max-w-[16rem] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card press hover:-translate-y-0.5 hover:shadow-float md:h-[21rem] md:w-auto md:max-w-none"
          >
            <img
              src={feedArt(i)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-brand via-brand/90 to-transparent"
            />
            <div className="relative flex h-full flex-col justify-end p-5 text-primary-foreground">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand">
                  {item.tag}
                </span>
                <span aria-hidden className="h-px w-6 bg-gold/50" />
              </div>
              <h3 className="font-display text-lg font-extrabold leading-snug">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/75">
                {item.body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                Read <ArrowUpRight className="size-3" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Variant B — "Reading list".
 * Compact horizontal rows: square artwork left, copy right. Dense, scannable,
 * stacks vertically on mobile instead of scrolling sideways.
 */
export function ForYouList() {
  return (
    <section>
      <SectionHead />
      <div className="mt-3 grid gap-2.5 md:mt-4 md:grid-cols-3 md:gap-4">
        {FEED.map((item, i) => (
          <article
            key={item.title}
            className="card-surface flex items-center gap-3.5 p-3 press hover:-translate-y-0.5 hover:shadow-float md:flex-col md:items-start md:gap-3 md:p-4"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl md:h-28 md:w-full">
              <img
                src={feedArt(i)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="size-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1 bg-gold-gradient"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">
                {item.tag}
              </p>
              <h3 className="mt-1 font-display text-sm font-bold leading-snug md:text-base">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground md:text-xs">
                {item.body}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground md:hidden" />
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Variant C — "Feature + chips".
 * One large navy feature card followed by slim, text-only chips. Gives the
 * lead story real weight without three heavy cards competing.
 */
export function ForYouFeature({ className = "" }: { className?: string }) {
  const [lead, ...rest] = FEED;
  return (
    <section className={className}>
      <SectionHead />
      <div className="mt-3 grid gap-2.5 md:mt-4 md:grid-cols-[1.4fr_1fr] md:gap-4">
        {lead && (
          <article className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 text-primary-foreground shadow-card press hover:-translate-y-0.5 hover:shadow-float md:p-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full bg-gold/25 blur-3xl"
            />
            <div className="relative">
              <img
                src={feedArt(0)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="mb-4 h-32 w-full rounded-2xl object-cover md:h-40"
              />
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-primary-foreground/85">
                {lead.tag}
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold leading-snug">
                {lead.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/75">
                {lead.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-[11px] font-bold text-brand">
                Read now <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </article>
        )}

        <div className="grid gap-2.5 md:gap-4">
          {rest.map((item, i) => (
            <article
              key={item.title}
              className="card-surface flex items-start gap-3 p-4 press hover:-translate-y-0.5 hover:shadow-float"
            >
              <span
                aria-hidden
                className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${
                  i === 0 ? "bg-gold" : "bg-brand"
                }`}
              />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {item.tag}
                </p>
                <h3 className="mt-1 font-display text-sm font-bold leading-snug">{item.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Variant D — "Bento mosaic".
 * Asymmetric magazine grid: one large lead tile plus smaller supporting tiles.
 * Mobile scrolls horizontally with mixed widths; desktop locks into a bento.
 */
export function ForYouBento({ className = "" }: { className?: string }) {
  const cards = FEED.slice(0, 2);
  return (
    <section className={className}>
      <SectionHead />
      <div className="mt-3 grid grid-cols-2 gap-3 md:mt-4 md:gap-4">
        {cards.map((item, i) => (
          <article
            key={item.title}
            className="card-surface relative flex flex-col justify-between overflow-hidden rounded-xl p-3 press hover:-translate-y-0.5 hover:shadow-float md:rounded-2xl md:p-4"
          >
            <div className="relative -mx-3 -mt-3 h-24 overflow-hidden md:-mx-4 md:-mt-4 md:h-32">
              <img
                src={feedArt(i)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="size-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent md:h-8"
              />
            </div>
            <div className="relative mt-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">
                {item.tag}
              </p>
              <h3 className="mt-1 font-display text-xs font-bold leading-snug md:text-sm">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground md:text-[11px]">
                {item.body}
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gold md:mt-3 md:text-[10px]">
              Read <ArrowUpRight className="size-3" />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
