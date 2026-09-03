import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, X } from "lucide-react";
import { useState } from "react";
import { AuthShell, GhostButton } from "@/components/kipit/AuthShell";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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

type DocKey = "terms" | "privacy" | null;

const DOCS: Record<Exclude<DocKey, null>, { title: string; version: string; updated: string; body: string[] }> = {
  terms: {
    title: "Terms & Conditions",
    version: "v3.2",
    updated: "Last updated 12 Jan 2025",
    body: [
      "These Terms & Conditions govern your use of the Kipit app, website and services. By creating an account, you agree to be bound by them.",
      "Kipit provides savings, fixed-return plans and curated investment products. All returns are subject to the specific terms of each product and are not guaranteed unless expressly stated.",
      "You must be at least 18 years old and provide accurate, complete information. You are responsible for keeping your login credentials and PIN secure.",
      "We may suspend or terminate your account if we suspect fraud, illegal activity or a breach of these terms.",
      "These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be resolved through arbitration or the courts of Lagos State.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    version: "v2.4",
    updated: "Last updated 12 Jan 2025",
    body: [
      "Kipit collects personal information necessary to verify your identity, comply with regulations and provide our services.",
      "We use your data to process transactions, calculate returns, communicate with you, improve our products and prevent fraud.",
      "Your information is stored securely and only shared with trusted partners such as fund managers, payment processors and regulators where required by law.",
      "You have the right to access, correct and request deletion of your personal data, subject to legal and regulatory retention requirements.",
      "We use cookies and similar technologies to enhance your experience. You can manage cookie preferences in your device or browser settings.",
    ],
  },
};

function SignupMethod() {
  const navigate = useNavigate();
  const [openDoc, setOpenDoc] = useState<DocKey>(null);
  const activeDoc = openDoc ? DOCS[openDoc] : null;

  return (
    <>
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
            onClick={() => navigate({ to: "/signup/email" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-gold-foreground transition active:scale-[0.99]"
          >
            <Mail className="size-4" />
            Continue with email
          </button>

          <GhostButton onClick={() => navigate({ to: "/signup/details" })}>
            <span className="flex items-center justify-center gap-3">
              <GoogleMark />
              Continue with Google
            </span>
          </GhostButton>

          <GhostButton onClick={() => navigate({ to: "/signup/details" })}>
            <span className="flex items-center justify-center gap-3">
              <AppleMark />
              Continue with Apple
            </span>
          </GhostButton>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-brand-foreground/55">
          By continuing you agree to Kipit's{" "}
          <button
            type="button"
            onClick={() => setOpenDoc("terms")}
            className="font-semibold text-gold underline underline-offset-2"
          >
            Terms &amp; Conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => setOpenDoc("privacy")}
            className="font-semibold text-gold underline underline-offset-2"
          >
            Privacy Policy
          </button>
          .
        </p>
      </AuthShell>

      <Drawer open={!!activeDoc} onOpenChange={(open) => !open && setOpenDoc(null)}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl border border-border/60 bg-card px-0 pb-8 pt-2">
          <DrawerHeader className="relative px-5 pb-2 pt-1 text-left">
            <button
              type="button"
              onClick={() => setOpenDoc(null)}
              className="absolute right-4 top-3.5 grid size-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <DrawerTitle className="pr-10 text-[1.05rem] font-bold">
              {activeDoc?.title}
            </DrawerTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeDoc?.version} · {activeDoc?.updated}
            </p>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-4">
            <div className="space-y-4">
              {activeDoc?.body.map((paragraph, i) => (
                <p key={i} className="text-[13px] leading-relaxed text-foreground/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
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

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.06 1.87-2.54 6.98.22 8.13-.57 1.5-1.31 2.99-2.27 4.08zm-5.85-15.1c.07-2.04 1.76-3.79 3.74-4.04.29 2.32-1.97 4.48-3.74 4.04z"
      />
    </svg>
  );
}
