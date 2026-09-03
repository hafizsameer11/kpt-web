import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { DEMO_BVN } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/bvn-processing")({
  validateSearch: z.object({ bvn: z.string().catch("") }),
  head: () => ({
    meta: [
      { title: "Verifying Your BVN | Kipit" },
      {
        name: "description",
        content: "We're checking your BVN details with NIBSS — this only takes a few seconds.",
      },
      { property: "og:title", content: "Verifying Your BVN | Kipit" },
      { property: "og:description", content: "Your BVN check is in progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BvnProcessing,
});

const STEPS = ["Encrypting your BVN", "Checking with NIBSS", "Matching your Kipit profile"];

function BvnProcessing() {
  const { bvn } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => {
      void navigate({
        to: bvn === DEMO_BVN ? "/verification/bvn-match" : "/verification/bvn-failed",
        replace: true,
      });
    }, 2600);
    return () => window.clearTimeout(t);
  }, [bvn, navigate]);

  return (
    <AppShell title="Verifying" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center text-primary-foreground md:mx-0 md:min-h-[60vh] md:rounded-xl md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-20 place-items-center">
              <span
                aria-hidden
                className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:1.1s]"
              />
              <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold">
                <Fingerprint className="size-7" strokeWidth={2.2} />
              </span>
            </span>

            <p className="k-success-fade mt-7 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              Verifying your BVN
            </p>
            <p className="k-success-fade mt-2 text-[12.5px] text-primary-foreground/65">
              Please keep this screen open.
            </p>

            <ul className="k-success-fade mx-auto mt-7 w-full max-w-xs space-y-2.5 text-left">
              {STEPS.map((step) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-semibold"
                >
                  <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-gold" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
