import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { naira } from "@/lib/home-data";
import { fetchReferrals } from "@/lib/api";
import { REFERRAL_STATUS_META, type ReferralStatus } from "@/lib/settings-data";

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

type ReferralRow = {
  id: string;
  name: string;
  note: string;
  joined: string;
  status: ReferralStatus;
  reward: number;
};

function ReferralsScreen() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [successful, setSuccessful] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [tab, setTab] = useState<"all" | ReferralStatus>("all");
  const [list, setList] = useState<ReferralRow[]>([]);

  useEffect(() => {
    void fetchReferrals()
      .then((data) => {
        setCode(data.code || "");
        setLink(data.link || "");
        setSuccessful(data.successfulReferrals ?? 0);
        setRewards(data.rewardsEarned ?? 0);
        setList(
          (data.people ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            note: p.note,
            joined: new Date(p.joined).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: (p.status === "rewarded" ? "rewarded" : "pending") as ReferralStatus,
            reward: p.reward ?? 0,
          })),
        );
      })
      .catch(() => {
        setCode("");
        setLink("");
        setSuccessful(0);
        setRewards(0);
        setList([]);
      });
  }, []);

  const filtered = list.filter((r) => tab === "all" || r.status === tab);

  function copy(kind: "code" | "link", value: string) {
    void navigator.clipboard?.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  const stats = [
    { label: "Total referrals", value: String(successful) },
    { label: "Successful referrals", value: String(successful) },
    { label: "Rewards earned", value: naira(rewards) },
  ];

  return (
    <SettingsPage
      title="Referrals"
      eyebrow="MOB-150"
      subtitle="Earn a reward each time a friend joins Kipit and funds their first investment."
    >
      <div className="md:hidden">
      <section className="card-surface p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          Your referral code
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="flex-1 rounded-xl border border-dashed border-brand/40 bg-secondary px-4 py-3 text-center font-display text-[20px] font-extrabold tracking-[0.12em] text-brand">
            {code || "—"}
          </span>
          <button
            type="button"
            aria-label="Copy referral code"
            disabled={!code}
            onClick={() => copy("code", code)}
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
          disabled={!link}
          onClick={() => copy("link", link)}
          className="mt-3 flex w-full items-center gap-2 rounded-xl bg-secondary px-3.5 py-3 text-left press"
        >
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-muted-foreground">
            {link || "—"}
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
              <p className="mx-auto max-w-[70px] text-[9.5px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground/80">
                {s.label}
              </p>
              <p className="mt-1.5 truncate font-display text-[18px] font-extrabold tracking-[-0.03em] text-foreground text-num">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface mt-4 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <p className="text-[13px] font-extrabold tracking-[-0.01em] text-foreground">
            People you referred
          </p>
          <span className="text-[11px] font-bold text-muted-foreground">{filtered.length} shown</span>
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto px-4 pb-3 no-scrollbar">
          {(
            [
              ["all", "All"],
              ["rewarded", "Reward earned"],
              ["pending", "Pending"],
              ["expired", "Expired"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold press ${
                tab === id
                  ? "bg-brand text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-border/70 border-t border-border/70">
          {filtered.map((r) => {
            const meta = REFERRAL_STATUS_META[r.status];
            return (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-[13px] font-extrabold text-brand">
                  {r.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold text-foreground">{r.name}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {r.note} · {r.joined}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ring-inset ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                  <p className="mt-1 text-[11.5px] font-extrabold text-foreground text-num">
                    {r.status === "rewarded" ? naira(r.reward) : "—"}
                  </p>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-[12px] text-muted-foreground">
              No referrals in this status yet.
            </li>
          ) : null}
        </ul>
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
        disabled={!link}
        onClick={() => {
          void navigator.clipboard?.writeText(link);
          toast.success("Invite link copied", { description: link });
        }}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
      >
        <Share2 className="size-4" strokeWidth={2.6} /> Share invite
      </button>
      </div>

      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-6">
        <section className="card-surface overflow-hidden p-0">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-5">
            <div>
              <p className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-foreground">
                People you referred
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Track every invite and the reward it earned.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-[11.5px] font-extrabold text-muted-foreground">
              {filtered.length} shown
            </span>
          </div>

          <div className="flex flex-wrap gap-2 px-6 py-4">
            {(
              [
                ["all", "All"],
                ["rewarded", "Reward earned"],
                ["pending", "Pending"],
                ["expired", "Expired"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition ${
                  tab === id
                    ? "bg-brand text-primary-foreground shadow-float"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <table className="w-full border-t border-border/70 text-left">
            <thead>
              <tr className="bg-secondary/50 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-3 font-extrabold">Friend</th>
                <th className="px-4 py-3 font-extrabold">Joined</th>
                <th className="px-4 py-3 font-extrabold">Status</th>
                <th className="px-6 py-3 text-right font-extrabold">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filtered.map((r) => {
                const meta = REFERRAL_STATUS_META[r.status];
                return (
                  <tr key={r.id} className="transition hover:bg-secondary/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-[13px] font-extrabold text-brand">
                          {r.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-extrabold text-foreground">
                            {r.name}
                          </p>
                          <p className="truncate text-[11.5px] text-muted-foreground">{r.note}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12.5px] font-semibold text-muted-foreground">
                      {r.joined}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ring-inset ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[13.5px] font-extrabold text-foreground text-num">
                      {r.status === "rewarded" ? naira(r.reward) : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[12.5px] text-muted-foreground"
                  >
                    No referrals in this status yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <aside className="space-y-4 md:sticky md:top-6">
          <section className="card-surface p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Your referral code
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex-1 rounded-xl border border-dashed border-brand/40 bg-secondary px-4 py-3.5 text-center font-display text-[22px] font-extrabold tracking-[0.12em] text-brand">
                {code || "—"}
              </span>
              <button
                type="button"
                aria-label="Copy referral code"
                disabled={!code}
                onClick={() => copy("code", code)}
                className="grid size-12 shrink-0 place-items-center rounded-xl border border-border press hover:bg-secondary"
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
              disabled={!link}
              onClick={() => copy("link", link)}
              className="mt-3 flex w-full items-center gap-2 rounded-xl bg-secondary px-3.5 py-3 text-left press hover:bg-secondary/70"
            >
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-muted-foreground">
                {link || "—"}
              </span>
              <span className="shrink-0 text-[11.5px] font-extrabold text-brand">
                {copied === "link" ? "Copied" : "Copy link"}
              </span>
            </button>

            <button
              type="button"
              disabled={!link}
              onClick={() => {
                void navigator.clipboard?.writeText(link);
                toast.success("Invite link copied", { description: link });
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
            >
              <Share2 className="size-4" strokeWidth={2.6} /> Share invite
            </button>
          </section>

          <section className="card-surface divide-y divide-border/70 p-0">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-foreground text-num">
                  {s.value}
                </p>
              </div>
            ))}
          </section>

          <section className="card-surface flex items-start gap-3 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <Users className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Your friend gets a bonus on their first fixed plan, and you earn a reward once it is
              funded. Rewards are credited to your Kipit wallet.
            </p>
          </section>
        </aside>
      </div>
    </SettingsPage>
  );
}
