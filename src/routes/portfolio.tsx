import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kipit/ComingSoon";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Kipit Holdings & Performance" },
      {
        name: "description",
        content: "Review your Kipit holdings, performance over time and full transaction history.",
      },
      { property: "og:title", content: "Portfolio — Kipit Holdings & Performance" },
      { property: "og:description", content: "Holdings, performance and history across your Kipit investments." },
    ],
  }),
  component: () => <ComingSoon screen="MOB-120" title="Portfolio" />,
});
