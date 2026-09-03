import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, Phone } from "lucide-react";
import { AuthShell, GhostButton } from "@/components/kipit/AuthShell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Kipit account" },
      {
        name: "description",
        content: "Sign up with your phone number, Google or Apple to open a Kipit account.",
      },
      { property: "og:title", content: "Create your Kipit account" },
      { property: "og:description", content: "Open a Kipit account in a few minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupMethod,
});

function SignupMethod() {
  const navigate = useNavigate();
  return (
    <AuthShell
      back="/welcome"
      step={1}
      steps={7}
      title="Create your account"
      subtitle="Choose how you'd like to get started. You can add the other methods later."
      footer={
        <p className="text-center text-sm text-brand-foreground/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gold">
            Log in
          </Link>
        </p>
      }
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/signup/phone" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-gold-foreground transition active:scale-[0.99]"
        >
          <Phone className="size-4" />
          Continue with phone
        </button>

        <GhostButton onClick={() => navigate({ to: "/signup/details" })}>
          <span className="flex items-center justify-center gap-3">
            <GoogleMark />
            Continue with Google
          </span>
        </GhostButton>

        <GhostButton onClick={() => navigate({ to: "/signup/details" })}>
          <span className="flex items-center justify-center gap-3">
            <Apple className="size-4" />
            Continue with Apple
          </span>
        </GhostButton>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-brand-foreground/55">
        By continuing you agree to Kipit's Terms &amp; Conditions and Privacy Policy.
      </p>
    </AuthShell>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12z"
      />
    </svg>
  );
}
