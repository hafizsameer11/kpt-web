import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, Mail, Phone, ShieldCheck } from "lucide-react";
import { Field, FieldCard, SettingsPage } from "@/components/kipit/SettingsPage";
import { PROFILE } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Kipit Settings" },
      {
        name: "description",
        content:
          "View and update your Kipit profile — name, date of birth, gender, email and phone. KYC-verified fields are locked.",
      },
      { property: "og:title", content: "Profile | Kipit Settings" },
      { property: "og:description", content: "Your Kipit identity and contact details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  return (
    <SettingsPage
      title="Profile"
      eyebrow="MOB-141"
      subtitle="Your identity on Kipit. Fields confirmed during verification are locked and can only be changed by support."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <FieldCard label="Identity">
          <Field label="First name" value={PROFILE.firstName} locked />
          <Field label="Middle name" value={PROFILE.middleName} />
          <Field label="Last name" value={PROFILE.lastName} locked />
          <Field label="Date of birth" value={PROFILE.dob} locked />
          <Field label="Gender" value={PROFILE.gender} locked />
        </FieldCard>

        <div className="space-y-4">
          <FieldCard label="Contact">
            <Field label="Email address" value={PROFILE.email} hint="Used for statements and alerts" />
            <Field label="Phone number" value={PROFILE.phone} hint="Used for OTP verification" />
          </FieldCard>

          <section className="card-surface flex items-start gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <Lock className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Your legal name, date of birth and gender were verified through KYC. To correct them,
              raise a support ticket with a valid government-issued ID.
            </p>
          </section>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                toast.info("Verification code sent", {
                  description: "Enter the code we sent to your current email to change it.",
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press sm:w-auto sm:px-8"
            >
              <Mail className="size-4" strokeWidth={2.6} /> Change email
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info("Verification code sent", {
                  description: "Enter the code we sent by SMS to change your phone number.",
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press sm:w-auto sm:px-8"
            >
              <Phone className="size-4" strokeWidth={2.4} /> Change phone
            </button>
          </div>

          <Link
            to="/settings/security"
            className="inline-flex items-center gap-2 px-1 text-[12.5px] font-bold text-brand"
          >
            <ShieldCheck className="size-4" /> Manage security settings
          </Link>
        </div>
      </div>
    </SettingsPage>
  );
}
