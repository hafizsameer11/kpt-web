import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Check, ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/success")({
  head: () => ({
    meta: [
      { title: "Account created — Kipit" },
      { name: "description", content: "Your Kipit account is ready. Complete verification to unlock funding and investing." },
      { property: "og:title", content: "Account created — Kipit" },
      { property: "og:description", content: "Your Kipit account is ready to use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountCreated,
});

function AccountCreated() {
  const name = signupDraft.firstName || "there";
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-gold text-gold-foreground">
          <Check className="size-10" strokeWidth={3} />
        </span>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">Welcome to Kipit, {name}!</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-foreground/70">
          Your account has been created. You can explore the app right away.
        </p>

        <div className="mt-7 w-full space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/8 p-4">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold">Account status: Unverified</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-foreground/65">
                Browse products and set up your profile now.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/8 p-4">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold">Verification unlocks funding</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-foreground/65">
                Complete identity verification to add money, invest and withdraw.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="mt-9 block w-full rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-gold-foreground transition active:scale-[0.99]"
        >
          Continue to Kipit
        </Link>
      </div>
    </AuthShell>
  );
}
