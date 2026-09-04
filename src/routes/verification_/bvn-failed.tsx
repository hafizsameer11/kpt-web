import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, LifeBuoy, RefreshCw } from "lucide-react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";

export const Route = createFileRoute("/verification_/bvn-failed")({
  head: () => ({
    meta: [
      { title: "BVN Verification Failed | Kipit" },
      {
        name: "description",
        content:
          "We couldn't match your BVN. Check the digits, confirm your details with your bank and try again.",
      },
      { property: "og:title", content: "BVN Verification Failed | Kipit" },
      { property: "og:description", content: "Your BVN check did not succeed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BvnFailed,
});

const CHECKS = [
  "Confirm all 11 digits are correct — dial *565*0# to see your BVN.",
  "Make sure your Kipit name and date of birth match your bank records.",
  "The phone number on your BVN must be reachable.",
];

function BvnFailed() {
  return (
    <KycStep
      navTitle="BVN Failed"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 1"
      title="We couldn't verify that BVN"
      subtitle="No details were matched. Nothing has been saved to your profile."
      aside={
        <>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Why checks fail</p>
            <ul className="mt-2 space-y-2">
              {[
                "A typo in one of the 11 digits.",
                "Name or date of birth differs from your bank record.",
                "The BVN record is dormant or under review at your bank.",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Nothing was saved</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Your account stays at Tier 0 and no BVN data was stored. You can retry as many times
              as you need.
            </p>
          </section>
        </>
      }
    >
      <section className="card-surface p-4 md:p-5">
        <p className="k-shake flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12.5px] font-semibold text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          The BVN you entered was not found, or the details don't match your Kipit profile.
        </p>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Things to check
        </p>
        <ul className="mt-3 space-y-3 text-[13px]">
          {CHECKS.map((c, i) => (
            <li key={c} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-extrabold text-muted-foreground">
                {i + 1}
              </span>
              <span className="leading-snug text-foreground">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
        <Link to="/verification/bvn" className={kycCta}>
          <RefreshCw className="size-4" strokeWidth={2.6} /> Try again
        </Link>
        <Link to="/settings/help" className={kycGhost}>
          <LifeBuoy className="size-4" /> Contact support
        </Link>
      </div>
    </KycStep>
  );
}
