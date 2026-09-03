import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/kipit/AuthShell";

export const Route = createFileRoute("/forgot-password_/success")({
  head: () => ({
    meta: [
      { title: "Password reset — Kipit" },
      { name: "description", content: "Your Kipit password has been reset. Log in with your new password." },
      { property: "og:title", content: "Password reset — Kipit" },
      { property: "og:description", content: "Your password has been updated successfully." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetSuccess,
});

function ResetSuccess() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-gold text-gold-foreground">
          <Check className="size-10" strokeWidth={3} />
        </span>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">Password reset</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-foreground/70">
          Your password has been updated. For your security, all other active sessions have been
          signed out.
        </p>
        <Link
          to="/login"
          className="mt-9 block w-full rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-gold-foreground transition active:scale-[0.99]"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
