import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { AnimatedLogo } from "@/components/kipit/AnimatedLogo";

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
  {
    icon: TrendingUp,
    label: "Up to 22% p.a.",
    detail: "on fixed-return plans",
  },
  {
    icon: Wallet,
    label: "Daily interest",
    detail: "on your call account balance",
  },
  {
    icon: ShieldCheck,
    label: "SEC-licensed",
    detail: "fund manager, funds held separately",
  },
];

function Welcome() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-brand-gradient text-brand-foreground">
      {/* ambient field */}
      <div className="pointer-events-none absolute -left-28 -top-16 size-96 rounded-full bg-gold/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-28 top-1/3 size-96 rounded-full bg-white/12 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-14rem] mx-auto h-[26rem] w-[130%] rounded-[100%] border-t border-white/10 bg-white/[0.04]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(70% 55% at 50% 25%, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14 md:max-w-lg md:justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-0 lg:pb-0 lg:pt-0">
        <div className="contents lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-16">
        <div className="animate-rise" style={{ animationDelay: "40ms" }}>
          <AnimatedLogo tone="light" className="text-3xl" />
        </div>

        <span
          className="animate-rise mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold"
          style={{ animationDelay: "160ms" }}
        >
          <span className="size-1.5 rounded-full bg-gold" />
          Wealth, simplified
        </span>

        <h1
          className="animate-rise mt-5 text-[2.1rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.35rem] md:text-[2.6rem] lg:text-[3.2rem]"
          style={{ animationDelay: "240ms" }}
        >
          Your money,
          <br />
          <span className="bg-gradient-to-r from-gold via-gold to-[oklch(0.92_0.11_92)] bg-clip-text text-transparent">
            working every day.
          </span>
        </h1>
        <p
          className="animate-rise mt-4 line-clamp-2 max-w-[19rem] text-sm leading-snug text-brand-foreground/70 sm:max-w-sm sm:leading-relaxed lg:max-w-md lg:text-base"
          style={{ animationDelay: "320ms" }}
        >
          Save, invest in fixed-return plans, and track everything in one simple account.
        </p>

        <ul className="mt-9 space-y-2.5 lg:mt-10 lg:max-w-lg">
          {highlights.map(({ icon: Icon, label, detail }, i) => (
            <li
              key={label}
              className="animate-rise group flex items-center gap-3.5 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3.5 backdrop-blur-sm transition hover:border-gold/35 hover:bg-white/[0.11]"
              style={{ animationDelay: `${400 + i * 90}ms` }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-inset ring-gold/25">
                <Icon className="size-[1.15rem]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{label}</span>
                <span className="block truncate text-xs text-brand-foreground/60">{detail}</span>
              </span>
            </li>
          ))}
        </ul>

        </div>

        <div
          className="animate-rise mt-auto space-y-3 pt-12 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:space-y-0 lg:border-l lg:border-white/10 lg:bg-white/[0.06] lg:px-16 lg:py-16 lg:pt-16 lg:backdrop-blur-md"
          style={{ animationDelay: "700ms" }}
        >
          <div className="contents lg:mx-auto lg:block lg:w-full lg:max-w-sm lg:space-y-3">
          <div className="hidden lg:block lg:pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Get started in minutes</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-foreground/65">
              Open an account with just your email. No documents needed to look around.
            </p>
          </div>
          <Link
            to="/signup"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 text-center text-sm font-semibold text-gold-foreground shadow-[0_16px_40px_-16px_oklch(0.82_0.15_88_/_0.8)] transition active:scale-[0.99] hover:brightness-105"
          >
            Create account
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="block w-full rounded-2xl border border-white/20 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold backdrop-blur-sm transition hover:bg-white/10"
          >
            I already have an account
          </Link>
          <p className="pt-2 text-center text-[11px] leading-relaxed text-brand-foreground/50">
            Investments carry risk. Returns are not guaranteed unless expressly stated in the
            product terms.
          </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes welcome-rise {
          0% { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-rise {
          opacity: 0;
          animation: welcome-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-rise { animation-duration: 0.01ms; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
