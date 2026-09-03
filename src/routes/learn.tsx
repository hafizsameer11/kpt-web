import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Clock3, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { feedArt } from "@/components/kipit/art";
import {
  LEARN_ARTICLES,
  LEARN_CATEGORIES,
  type LearnCategory,
} from "@/lib/learn-data";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Kipit guides, updates and announcements" },
      {
        name: "description",
        content:
          "Short reads on tenor, yield, laddering and the Call Account, plus the latest Kipit product updates and announcements.",
      },
      { property: "og:title", content: "Learn — Kipit guides and updates" },
      {
        property: "og:description",
        content:
          "Plain-English investing guides and the latest Kipit product updates in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnScreen,
});

function LearnScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LearnCategory | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEARN_ARTICLES.filter((a) => {
      if (category && a.tag !== category) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.standfirst.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const [lead, ...rest] = results;

  return (
    <AppShell title="Learn" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />
          <div className="relative md:max-w-3xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              For you
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight md:text-3xl">
              Guides, updates and announcements
            </h1>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-primary-foreground/75">
              Short, plain-English reads on how your money works on Kipit.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3">
              <Search className="size-4 shrink-0 text-primary-foreground/70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles"
                aria-label="Search articles"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-primary-foreground outline-none placeholder:font-medium placeholder:text-primary-foreground/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-full bg-white/15 p-1 press"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <Rise>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setCategory(null)}
                aria-pressed={category === null}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[11.5px] font-bold press ${
                  category === null
                    ? "border-transparent bg-brand text-primary-foreground shadow-card"
                    : "border-border bg-card text-foreground"
                }`}
              >
                All
              </button>
              {LEARN_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(category === c ? null : c)}
                  aria-pressed={category === c}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[11.5px] font-bold press ${
                    category === c
                      ? "border-transparent bg-brand text-primary-foreground shadow-card"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Rise>

          {results.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <BookOpen className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-[13px] font-bold">No articles found</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Try a different search or category.
              </p>
            </div>
          ) : (
            <Rise delay={80}>
              <div className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {lead && (
                  <Link
                    to="/learn/$articleId"
                    params={{ articleId: lead.id }}
                    className="relative block overflow-hidden rounded-xl bg-brand-gradient p-5 text-primary-foreground shadow-card press hover:-translate-y-0.5 hover:shadow-float md:col-span-2 md:p-6"
                  >
                    <div className="relative md:flex md:items-center md:gap-6">
                      <img
                        src={feedArt(0)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="mb-4 h-32 w-full rounded-xl object-cover md:mb-0 md:h-40 md:w-64"
                      />
                      <div className="min-w-0">
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]">
                          {lead.tag}
                        </span>
                        <h2 className="mt-3 font-display text-xl font-extrabold leading-snug">
                          {lead.title}
                        </h2>
                        <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/75">
                          {lead.standfirst}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-[11px] font-bold text-brand">
                          Read now <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {rest.map((a, i) => (
                  <Link
                    key={a.id}
                    to="/learn/$articleId"
                    params={{ articleId: a.id }}
                    style={{ ["--d" as string]: `${i * 70}ms` }}
                    className="k-rise card-surface flex items-center gap-3.5 p-3 press hover:-translate-y-0.5 hover:shadow-float md:p-4"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl md:size-24">
                      <img
                        src={feedArt(i + 1)}
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
                        {a.tag}
                      </p>
                      <h3 className="mt-1 font-display text-sm font-bold leading-snug md:text-base">
                        {a.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {a.body}
                      </p>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                        <Clock3 className="size-3" /> {a.readMinutes} min read · {a.date}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </Rise>
          )}

          <div className="mt-8"><DisclosureStrip /></div>
        </div>
      </div>
    </AppShell>
  );
}
