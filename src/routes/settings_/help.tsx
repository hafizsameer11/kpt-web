import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, MessageCircle, Phone, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { FAQS, FAQ_CATEGORIES, POPULAR_QUESTIONS } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/help")({
  head: () => ({
    meta: [
      { title: "Help Centre | Kipit Support" },
      {
        name: "description",
        content:
          "Search Kipit FAQs by category, read the most popular answers or contact support directly from the app.",
      },
      { property: "og:title", content: "Help Centre | Kipit Support" },
      { property: "og:description", content: "Answers to common Kipit questions and ways to reach support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpCentre,
});

function HelpCentre() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    );
  }, [query, category]);

  return (
    <SettingsPage
      title="Help & support"
      eyebrow="MOB-152"
      subtitle="Find an answer in seconds, or talk to a human."
    >
      <div className="md:hidden">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles..."
          aria-label="Search help articles"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-[13.5px] font-semibold outline-none focus:border-brand"
        />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {["All", ...FAQ_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors press ${
              category === c
                ? "bg-brand text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!query && category === "All" ? (
        <section className="card-surface mt-4 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <TrendingUp className="size-4 text-brand" strokeWidth={2.4} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Popular questions
            </p>
          </div>
          <ul className="divide-y divide-border/60">
            {POPULAR_QUESTIONS.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => setQuery(q.split(" ").slice(2, 5).join(" "))}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold press hover:bg-secondary/50"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-surface mt-4 divide-y divide-border/60 overflow-hidden">
        {results.map((f) => (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(open === f.q ? null : f.q)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left press hover:bg-secondary/50"
              aria-expanded={open === f.q}
            >
              <span className="min-w-0 flex-1 text-[13px] font-bold">{f.q}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${open === f.q ? "rotate-180" : ""}`}
              />
            </button>
            {open === f.q ? (
              <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-muted-foreground">{f.a}</p>
            ) : null}
          </div>
        ))}
        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
            No articles match “{query}”. Try a different search or contact support.
          </p>
        ) : null}
      </section>

      <section className="card-surface mt-4 p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          Contact support
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <Link
            to="/settings/help/ticket"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press"
          >
            <MessageCircle className="size-4" strokeWidth={2.6} /> Submit a ticket
          </Link>
          <a
            href="tel:+2347000547480"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-bold press"
          >
            <Phone className="size-4" strokeWidth={2.4} /> Call us
          </a>
        </div>
        <p className="mt-3 text-[11.5px] text-muted-foreground">
          Support is available Monday to Saturday, 8am – 8pm WAT.
        </p>
      </section>
    </SettingsPage>
  );
}
