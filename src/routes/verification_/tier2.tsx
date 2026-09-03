import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Clock, IdCard, Landmark, Briefcase } from "lucide-react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";
import { TIERS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/tier2")({
  head: () => ({
    meta: [
      { title: "Start Tier 2 Verification | Kipit" },
      {
        name: "description",
        content:
          "Add your NIN, a live selfie, your address and source of funds to unlock withdrawals on Kipit.",
      },
      { property: "og:title", content: "Start Tier 2 Verification | Kipit" },
      { property: "og:description", content: "What Kipit Tier 2 verification requires." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tier2Intro,
});

const tier2 = TIERS[1]!;

const STEPS = [
  { icon: IdCard, title: "National Identity Number", desc: "11 digits from your NIN slip" },
  { icon: Camera, title: "Live selfie", desc: "A quick liveness check on camera" },
  { icon: Landmark, title: "Address & proof", desc: "Where you live plus one document" },
  { icon: Briefcase, title: "Occupation & funds", desc: "How you earn and invest" },
];

function Tier2Intro() {
  return (
    <KycStep
      navTitle="Tier 2"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Unlock withdrawals"
      subtitle="Four short steps. Have your NIN and a recent utility bill or bank statement handy."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What we'll ask for
          </p>
          <ul className="mt-3 space-y-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-foreground">
                      {i + 1}. {s.title}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground">{s.desc}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-[11.5px] text-muted-foreground">
            <Clock className="size-3.5 shrink-0" /> About 5 minutes · most reviews finish within
            24 hours
          </p>
        </section>

        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What Tier 2 unlocks
          </p>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            {tier2.limits.map((l) => (
              <div key={l.label} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">{l.label}</dt>
                <dd className="font-bold text-foreground">{l.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11.5px] text-muted-foreground">
            Your documents are stored securely and only reviewed by the Kipit compliance team.
          </p>
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
        <Link to="/verification/nin" className={kycCta}>
          Start Tier 2 <ArrowRight className="size-4" strokeWidth={2.6} />
        </Link>
        <Link to="/verification" className={kycGhost}>
          Do this later
        </Link>
      </div>
    </KycStep>
  );
}
