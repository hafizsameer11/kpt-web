import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lock, ShieldCheck } from "lucide-react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";
import { TIERS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/tier1")({
  head: () => ({
    meta: [
      { title: "Start Tier 1 Verification | Kipit" },
      {
        name: "description",
        content:
          "Verify your BVN to complete Kipit Tier 1 and unlock funding and investing in about a minute.",
      },
      { property: "og:title", content: "Start Tier 1 Verification | Kipit" },
      {
        property: "og:description",
        content: "What you need for Kipit Tier 1 verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tier1Intro,
});

const tier1 = TIERS[0]!;

function Tier1Intro() {
  return (
    <KycStep
      navTitle="Tier 1"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 1"
      title="Verify your BVN"
      subtitle="Your BVN confirms your identity with your bank. We never see your bank balance or transactions."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What you'll need
          </p>
          <ul className="mt-3 space-y-3 text-[13px]">
            {tier1.requirements.map((r, i) => (
              <li key={r} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-extrabold text-gold">
                  {i + 1}
                </span>
                <span className="leading-snug text-foreground">{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-[11.5px] text-muted-foreground">
            <Clock className="size-3.5 shrink-0" /> Takes about 1 minute · instant result
          </p>
        </section>

        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What Tier 1 unlocks
          </p>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            {tier1.limits.map((l) => (
              <div key={l.label} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">{l.label}</dt>
                <dd className="font-bold text-foreground">{l.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" /> Withdrawals stay locked until Tier 2
            is approved.
          </p>
        </section>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-card px-3.5 py-3 text-[11.5px] text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
        Kipit uses your BVN only to confirm your name, date of birth and phone number, as
        permitted under CBN guidelines.
      </p>

      <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
        <Link to="/verification/bvn" className={kycCta}>
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </Link>
        <Link to="/verification" className={kycGhost}>
          Do this later
        </Link>
      </div>
    </KycStep>
  );
}
