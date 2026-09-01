import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kipit/ComingSoon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kipit Profile & Security" },
      {
        name: "description",
        content: "Manage your Kipit profile, verification tier, transaction PIN, biometrics and account controls.",
      },
      { property: "og:title", content: "Settings — Kipit Profile & Security" },
      { property: "og:description", content: "Profile, security and account controls for your Kipit account." },
    ],
  }),
  component: () => <ComingSoon screen="MOB-140" title="Settings" />,
});
