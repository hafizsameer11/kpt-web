import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Kipit — Save and invest with confidence" },
      {
        name: "description",
        content:
          "Create a Kipit account to earn daily interest on your call account and lock in fixed-return plans.",
      },
      { property: "og:title", content: "Kipit — Save and invest with confidence" },
      {
        property: "og:description",
        content: "Earn daily interest, invest in fixed plans and track everything in one app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const highlights = [
  { icon: TrendingUp, label: "Up to 22% p.a. on fixed plans" },
  { icon: Wallet, label: "Daily interest on your call account" },
  { icon: ShieldCheck, label: "SEC-licensed fund manager" },
];

function Welcome() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-brand-gradient text-brand-foreground">
      <div className="pointer-events-none absolute -left-24 top-10 size-80 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14 md:max-w-lg md:justify-center">
        <Logo tone="light" className="text-3xl" />

        <h1 className="mt-12 text-4xl font-semibold leading-[1.1] tracking-tight">
          Your money,
          <br />
          <span className="text-gold">working every day.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-foreground/70">
          Kipit brings your savings, fixed-return plans and curated investment products into one
          simple account.
        </p>

        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-brand-foreground/85">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-gold">
                <Icon className="size-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 pt-12">
          <Link
            to="/signup"
            className="block w-full rounded-xl bg-gold px-5 py-3.5 text-center text-sm font-semibold text-gold-foreground transition active:scale-[0.99]"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="block w-full rounded-xl border border-white/20 px-5 py-3.5 text-center text-sm font-semibold transition hover:bg-white/10"
          >
            Log in
          </Link>
          <p className="pt-2 text-center text-[11px] leading-relaxed text-brand-foreground/50">
            Investments carry risk. Returns are not guaranteed unless expressly stated in the
            product terms.
          </p>
        </div>
      </div>
    </div>
  );
}
