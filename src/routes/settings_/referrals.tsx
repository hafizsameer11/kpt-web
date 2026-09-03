import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Share2, Users } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { naira } from "@/lib/home-data";
import { REFERRALS } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals | Invite Friends to Kipit" },
      {
        name: "description",
        content:
          "Share your Kipit referral code, track how many friends have joined and see the rewards you have earned.",
      },
      { property: "og:title", content: "Referrals | Invite Friends to Kipit" },
      { property: "og:description", content: "Invite friends to Kipit and earn rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReferralsScreen,
});

function ReferralsScreen() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  function copy(kind: "code" | "link", value: string) {
    void navigator.clipboard?.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  const stats = [
    { label: "Total referrals", value: String(REFERRALS.total) },
    { label: "Successful referrals", value: String(REFERRALS.successful) },
    { label: "Rewards earned", value: naira(REFERRALS.rewards) },
  ];

  return (
    <SettingsPage
      title="Referrals"
      eyebrow="MOB-150"
      subtitle="Earn a reward each time a friend joins Kipit and funds their first investment."
    >
      <section className="card-surface p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          Your referral code
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="flex-1 rounded-xl border border-dashed border-brand/40 bg-secondary px-4 py-3 text-center font-display text-[20px] font-extrabold tracking-[0.12em] text-brand">
            {REFERRALS.code}
          </span>
          <button
            type="button"
            aria-label="Copy referral code"
            onClick={() => copy("code", REFERRALS.code)}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-border press hover:bg-secondary"
          >
            {copied === "code" ? (
              <Check className="size-4 text-emerald-600" strokeWidth={2.6} />
            ) : (
              <Copy className="size-4" strokeWidth={2.2} />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => copy("link", REFERRALS.link)}
          className="mt-3 flex w-full items-center gap-2 rounded-xl bg-secondary px-3.5 py-3 text-left press"
        >
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-muted-foreground">
            {REFERRALS.link}
          </span>
          <span className="shrink-0 text-[11.5px] font-extrabold text-brand">
            {copied === "link" ? "Copied" : "Copy link"}
          </span>
        </button>
      </section>

      <section className="card-surface mt-4 overflow-hidden p-0">
        <div className="grid grid-cols-3 divide-x divide-border/70">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 px-3 py-4 text-center">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                {s.label}
              </p>
              <p className="mt-1.5 truncate font-display text-[18px] font-extrabold tracking-[-0.03em] text-foreground text-num">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>


      <section className="card-surface mt-4 flex items-start gap-3 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
          <Users className="size-[18px]" strokeWidth={2} />
        </span>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Your friend gets a bonus on their first fixed plan, and you earn a reward once it is
          funded. Rewards are credited to your Kipit wallet.
        </p>
      </section>

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
      >
        <Share2 className="size-4" strokeWidth={2.6} /> Share invite
      </button>
    </SettingsPage>
  );
}
