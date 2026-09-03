import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { feedArt } from "@/components/kipit/art";
import { LEARN_ARTICLES, getLearnArticle } from "@/lib/learn-data";

export const Route = createFileRoute("/learn/$articleId")({
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

function ArticleScreen() {
  const { article } = Route.useLoaderData();
  const index = LEARN_ARTICLES.findIndex((a) => a.id === article.id);
  const related = LEARN_ARTICLES.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <AppShell title="Learn" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-12 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
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
          <img
            src={feedArt(Math.max(index, 0))}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="-mt-6 h-40 w-full rounded-xl object-cover shadow-card md:h-56"
          />
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

        <DisclosureStrip className="mt-8" />
      </div>
    </AppShell>
  );
}
