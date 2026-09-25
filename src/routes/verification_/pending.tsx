import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bell, Clock, Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { fetchKyc, tierNumber } from "@/lib/api";
import { setKycTier } from "@/lib/kyc-state";

export const Route = createFileRoute("/verification_/pending")({
  head: () => ({
    meta: [
      { title: "Confirming Your NIN | Kipit" },
      {
        name: "description",
        content: "Your Kipit Tier 2 submission is being confirmed against your NIN.",
      },
      { property: "og:title", content: "Confirming Your NIN | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycPending,
});

function KycPending() {
  const navigate = useNavigate();
  const [statusLabel, setStatusLabel] = useState("PENDING_REVIEW");
  const [ninStatus, setNinStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const kyc = await fetchKyc();
        if (cancelled) return;
        setStatusLabel(kyc.status);
        setNinStatus(kyc.profile?.ninProviderStatus ?? null);
        if (kyc.status === "APPROVED" && kyc.tier === "TIER_2") {
          setKycTier(tierNumber(kyc.tier));
          void navigate({ to: "/verification/approved", replace: true });
          return;
        }
        if (kyc.status === "REJECTED") {
          void navigate({ to: "/verification/rejected", replace: true });
        }
      } catch {
        /* keep polling */
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [navigate]);

  return (
    <AppShell title="Confirming" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold/15 text-gold ring-2 ring-gold/40">
              <Hourglass className="size-8" strokeWidth={2.2} />
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Submitted
            </p>
            <p className="mt-2 font-display text-[28px] font-extrabold leading-tight tracking-[-0.03em]">
              Confirming your NIN
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[12.5px] text-primary-foreground/70">
              We're matching your NIN with Prembly. Status:{" "}
              {statusLabel.replace(/_/g, " ").toLowerCase()}
              {ninStatus ? ` · NIN ${ninStatus.toLowerCase()}` : ""}.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Progress
              </p>
              <ol className="mt-3 space-y-3">
                {[
                  { label: "Documents submitted", done: true },
                  { label: "NIN provider check", done: ninStatus === "SUCCESS" },
                  { label: "Tier 2 approval", done: statusLabel === "APPROVED" },
                ].map((t) => (
                  <li key={t.label} className="flex items-center gap-3">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${
                        t.done ? "bg-gold" : "animate-pulse bg-border"
                      }`}
                    />
                    <span
                      className={`text-[13px] ${
                        t.done ? "font-bold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-[11.5px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> Usually completes within a few minutes
              </p>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What you can do now
              </p>
              <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-muted-foreground">
                <Bell className="mt-0.5 size-4 shrink-0 text-gold" />
                We'll notify you when Tier 2 is approved. You can keep funding your wallet and
                investing — withdrawals unlock after approval.
              </p>
            </section>
          </div>

          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              Back to home <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
