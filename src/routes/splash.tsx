import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AnimatedLogo } from "@/components/kipit/AnimatedLogo";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Welcome to Kipit — Loading" },
      { name: "description", content: "Kipit is starting up your savings and investment account." },
      { property: "og:title", content: "Welcome to Kipit" },
      { property: "og:description", content: "Kipit is starting up your savings and investment account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/welcome" }), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-gradient text-brand-foreground">
      <div className="pointer-events-none absolute -top-20 left-1/2 size-80 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col items-center gap-8">
        <Logo tone="light" className="animate-pulse text-5xl" />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-gold" />
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-foreground/60">
          Grow with intent
        </p>
      </div>
      <style>{`@keyframes loading{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}
