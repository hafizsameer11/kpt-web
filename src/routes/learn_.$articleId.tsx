import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { articleArt } from "@/components/kipit/art";
import { LEARN_ARTICLES, getLearnArticle } from "@/lib/learn-data";

export const Route = createFileRoute("/learn_/$articleId")({
  loader: ({ params }) => {
    const article = getLearnArticle(params.articleId);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article not found — Kipit Learn" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    const title = `${article.title} — Kipit Learn`;
    return {
      meta: [
        { title },
        { name: "description", content: article.standfirst },
        { property: "og:title", content: title },
        { property: "og:description", content: article.standfirst },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticleScreen,
});

type Article = (typeof LEARN_ARTICLES)[number];

function DesktopArticle({
  article,
  index,
  related,
}: {
  article: Article;
  index: number;
  related: Article[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 pb-32 pt-8 text-primary-foreground shadow-float">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[72px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
        />
        <div className="relative max-w-3xl">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
          >
            <ArrowLeft className="size-3.5" /> All articles
          </Link>
          <span className="mt-6 inline-block rounded-full bg-gold px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand">
            {article.tag}
          </span>
          <h1 className="mt-3 font-display text-[32px] font-extrabold leading-tight tracking-[-0.02em]">
            {article.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-primary-foreground/80">
            {article.standfirst}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-[11.5px] font-semibold text-primary-foreground/65">
            <Clock3 className="size-3.5" /> {article.readMinutes} min read · {article.date} ·{" "}
            {article.author}
          </p>
        </div>
      </section>

      {/* Featured image */}
      <div className="relative -mt-24 h-80 overflow-hidden rounded-3xl bg-[#0B1A30] shadow-float">
        <img
          src={articleArt(article.id, Math.max(index, 0))}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/50 to-transparent" />
      </div>

      {/* Body + rail */}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8">
        <article className="space-y-8 rounded-2xl border border-border/60 bg-card p-8 shadow-card">
          {article.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-lg font-extrabold text-foreground">
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p) => (
                  <p key={p} className="text-[13.5px] leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
          {article.cta && (
            <Link
              to={article.cta.to}
              className="flex items-center justify-between gap-3 rounded-xl bg-brand-gradient p-5 text-primary-foreground shadow-card press hover:shadow-float"
            >
              <span className="text-[14px] font-bold">{article.cta.label}</span>
              <ArrowUpRight className="size-4 text-gold" />
            </Link>
          )}
        </article>

        <aside className="sticky top-6 space-y-4">
          <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <h2 className="font-display text-[15px] font-extrabold">Keep reading</h2>
            <div className="mt-3 space-y-3">
              {related.map((a, i) => (
                <Link
                  key={a.id}
                  to="/learn/$articleId"
                  params={{ articleId: a.id }}
                  className="group flex items-start gap-3 rounded-xl border border-border/50 p-3 press hover:bg-muted/40"
                >
                  <img
                    src={articleArt(a.id, i + 1)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">
                      {a.tag}
                    </p>
                    <h3 className="mt-0.5 font-display text-[12.5px] font-bold leading-snug">
                      {a.title}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Clock3 className="size-3" /> {a.readMinutes} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <DisclosureStrip />
        </aside>
      </div>
    </div>
  );
}

function ArticleScreen() {
  const { article } = Route.useLoaderData();
  const index = LEARN_ARTICLES.findIndex((a) => a.id === article.id);
  const related = LEARN_ARTICLES.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <AppShell title="Learn" navVariant="elevated">
      {/* ── Desktop layout ─────────────────────────────────────── */}
      <div className="hidden md:block">
        <DesktopArticle article={article} index={index} related={related} />
      </div>
      {/* ── Mobile layout (unchanged) ──────────────────────────── */}
      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-28 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-36 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> All articles
            </Link>

            <span className="mt-6 inline-block rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand">
              {article.tag}
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-3xl">
              {article.title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/80">
              {article.standfirst}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-primary-foreground/65">
              <Clock3 className="size-3.5" /> {article.readMinutes} min read · {article.date} ·{" "}
              {article.author}
            </p>
          </div>
        </section>

        <Rise>
          <div className="relative -mt-20 overflow-hidden rounded-3xl bg-[#0B1A30] shadow-float md:-mt-28 md:h-80 h-52">
            <img
              src={articleArt(article.id, Math.max(index, 0))}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/60 to-transparent" />
            <svg
              aria-hidden="true"
              viewBox="0 0 400 160"
              preserveAspectRatio="none"
              className="absolute inset-x-0 bottom-0 h-full w-full"
            >
              <defs>
                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.82 0.15 88)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="oklch(0.82 0.15 88)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,140 L40,132 L80,118 L120,124 L160,98 L200,86 L240,64 L280,72 L320,42 L360,28 L400,18 L400,160 L0,160 Z"
                fill="url(#goldArea)"
              />
              <path
                d="M0,140 L40,132 L80,118 L120,124 L160,98 L200,86 L240,64 L280,72 L320,42 L360,28 L400,18"
                fill="none"
                stroke="oklch(0.82 0.15 88)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Rise>

        <Rise delay={80}>
          <article className="mt-6 space-y-6">
            {article.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-base font-extrabold text-foreground md:text-lg">
                  {s.heading}
                </h2>
                <div className="mt-2 space-y-3">
                  {s.paragraphs.map((p) => (
                    <p key={p} className="text-[13px] leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </Rise>

        {article.cta && (
          <Rise delay={140}>
            <Link
              to={article.cta.to}
              className="mt-7 flex items-center justify-between gap-3 rounded-xl bg-brand-gradient p-4 text-primary-foreground shadow-card press hover:shadow-float"
            >
              <span className="text-[13px] font-bold">{article.cta.label}</span>
              <ArrowUpRight className="size-4 text-gold" />
            </Link>
          </Rise>
        )}

        <Rise delay={180}>
          <section className="mt-8">
            <h2 className="font-display text-lg font-extrabold">Keep reading</h2>
            <div className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
              {related.map((a) => (
                <Link
                  key={a.id}
                  to="/learn/$articleId"
                  params={{ articleId: a.id }}
                  className="card-surface flex items-start gap-3 p-4 press hover:-translate-y-0.5 hover:shadow-float"
                >
                  <span aria-hidden className="mt-1 h-10 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {a.tag}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-bold leading-snug">{a.title}</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {a.body}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Rise>

        <div className="mt-8"><DisclosureStrip /></div>
      </div>
    </AppShell>
  );
}
