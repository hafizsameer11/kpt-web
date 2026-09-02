import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kipit/AppShell";
import {
  ForYouCovers,
  ForYouFeature,
  ForYouList,
} from "@/components/kipit/ForYouVariants";

export const Route = createFileRoute("/for-you-options")({
  head: () => ({
    meta: [
      { title: "For You Design Options — Kipit" },
      {
        name: "description",
        content:
          "Compare three For You content card designs for the Kipit home screen: cover stories, reading list and feature plus chips.",
      },
      { property: "og:title", content: "For You Design Options — Kipit" },
      {
        property: "og:description",
        content:
          "Three side-by-side design directions for the Kipit home For You section.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForYouOptionsScreen,
});

const OPTIONS = [
  {
    key: "A",
    name: "Cover stories",
    note: "Tall poster cards, artwork edge-to-edge, copy on a navy scrim.",
    Component: ForYouCovers,
  },
  {
    key: "B",
    name: "Reading list",
    note: "Compact rows with square art, dense and scannable — no side scroll.",
    Component: ForYouList,
  },
  {
    key: "C",
    name: "Feature + chips",
    note: "One large navy lead story plus two slim supporting cards.",
    Component: ForYouFeature,
  },
];

function ForYouOptionsScreen() {
  return (
    <AppShell title="For you options" navVariant="elevated">
      <div className="space-y-8 pb-4 pt-4">
        <header>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            For you — 3 designs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the one you want and I&apos;ll drop it into Home 2.
          </p>
        </header>

        {OPTIONS.map(({ key, name, note, Component }) => (
          <section key={key}>
            <div className="mb-3 flex items-baseline gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-brand-foreground">
                {key}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-extrabold">{name}</h2>
                <p className="text-[11px] text-muted-foreground">{note}</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-dashed border-border p-3 md:p-4">
              <Component />
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
