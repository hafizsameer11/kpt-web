import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kipit/ComingSoon";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — Kipit Investment Products" },
      {
        name: "description",
        content: "Browse Kipit's direct investment plans with clear rate, tenor and minimum investment.",
      },
      { property: "og:title", content: "Invest — Kipit Investment Products" },
      { property: "og:description", content: "Kipit investment plans with transparent rate, tenor and minimums." },
    ],
  }),
  component: () => <ComingSoon screen="MOB-060" title="Invest" />,
});
