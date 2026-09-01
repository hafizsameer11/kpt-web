import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kipit/ComingSoon";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Kipit Investment Marketplace" },
      {
        name: "description",
        content: "Discover partner investment opportunities in the Kipit marketplace, with rate, tenor and minimums shown together.",
      },
      { property: "og:title", content: "Explore — Kipit Investment Marketplace" },
      { property: "og:description", content: "Discover partner investment opportunities in the Kipit marketplace." },
    ],
  }),
  component: () => <ComingSoon screen="MOB-080" title="Explore" />,
});
