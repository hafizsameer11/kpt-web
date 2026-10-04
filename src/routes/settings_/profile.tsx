import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Field, FieldCard, SettingsPage } from "@/components/kipit/SettingsPage";
import { ApiError, fetchProfile, patchProfile } from "@/lib/api";

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

const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"] as const;

/** Calendar DOB only — avoid timezone day-shift across devices. */
function formatDob(value: string | null) {
  if (!value) return "—";
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function tierLabel(tier: string | undefined) {
  if (tier === "TIER_2") return "Tier 2";
  if (tier === "TIER_1") return "Tier 1";
  return "Unverified (Tier 0)";
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim() && value.trim() !== "—");
}

function ProfileScreen() {
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: null as string | null,
    email: "",
    phone: null as string | null,
    kycTier: "TIER_0",
    tier: "Unverified",
  });
  const [phoneEdit, setPhoneEdit] = useState("");
  const [genderDraft, setGenderDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const canSetGender = !hasText(profile.gender);
  const canSetPhone = !hasText(profile.phone);
  const canEditMissing = canSetGender || canSetPhone;

  useEffect(() => {
    void fetchProfile()
      .then((p) => {
        const tier =
          p.kycTier === "TIER_2" ? "Tier 2" : p.kycTier === "TIER_1" ? "Tier 1" : "Unverified";
        setProfile({
          firstName: p.firstName || "",
          middleName: p.middleName || "",
          lastName: p.surname || "",
          dob: formatDob(p.dateOfBirth),
          gender: p.gender,
          email: p.email || "",
          phone: p.phone,
          kycTier: p.kycTier || "TIER_0",
          tier,
        });
        setPhoneEdit(p.phone || "");
        setGenderDraft(p.gender?.trim() || "");
      })
      .catch(() => undefined);
  }, []);

  const saveMissing = async () => {
    if (busy || !canEditMissing) return;
    const patch: { phone?: string; gender?: string } = {};
    if (canSetGender) {
      const gender = genderDraft.trim();
      if (!gender) {
        toast.error("Choose your gender to continue.");
        return;
      }
      patch.gender = gender;
    }
    if (canSetPhone) {
      const phone = phoneEdit.trim();
      if (phone.length < 7) {
        toast.error("Enter a valid mobile number.");
        return;
      }
      patch.phone = phone;
    }
    if (!Object.keys(patch).length) return;
    setBusy(true);
    try {
      await patchProfile(patch);
      const p = await fetchProfile();
      setProfile({
        firstName: p.firstName || "",
        middleName: p.middleName || "",
        lastName: p.surname || "",
        dob: formatDob(p.dateOfBirth),
        gender: p.gender,
        email: p.email || "",
        phone: p.phone,
        kycTier: p.kycTier || "TIER_0",
        tier:
          p.kycTier === "TIER_2" ? "Tier 2" : p.kycTier === "TIER_1" ? "Tier 1" : "Unverified",
      });
      setGenderDraft(p.gender?.trim() || "");
      setPhoneEdit(p.phone || "");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsPage
      title="Profile"
      eyebrow="MOB-141"
      subtitle="Your identity on Kipit. Missing gender or phone can be added once; verified fields stay locked."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:gap-5">
        <FieldCard label="Identity">
          <Field label="First name" value={profile.firstName || "—"} locked />
          <Field label="Middle name" value={profile.middleName || "—"} />
          <Field label="Last name" value={profile.lastName || "—"} locked />
          <Field label="Date of birth" value={profile.dob || "—"} locked />
          <Field
            label="Gender"
            value={canSetGender ? "Not set yet — add below" : profile.gender || "—"}
            locked={!canSetGender}
          />
          <Field label="Verification tier" value={tierLabel(profile.kycTier)} locked />
        </FieldCard>

        <div className="space-y-4">
          <FieldCard label="Contact">
            <Field label="Email address" value={profile.email || "—"} hint="Used for statements and alerts" />
            <Field
              label="Phone number"
              value={canSetPhone ? "Not set yet — add below" : profile.phone || "—"}
              hint={canSetPhone ? "Add it below" : "Used for OTP verification"}
            />
            <div className="mt-3 grid gap-2">
              <Link
                to="/settings/help"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-[12.5px] font-extrabold text-primary-foreground shadow-float press"
              >
                Contact support to change email
              </Link>
              <Link
                to="/settings/help"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold text-foreground press"
              >
                Contact support to change phone
              </Link>
            </div>
          </FieldCard>

          {canEditMissing ? (
            <section className="card-surface space-y-4 p-4">
              <p className="text-center text-[13px] font-extrabold text-foreground">
                Complete your profile
              </p>
              {canSetGender ? (
                <div>
                  <p className="text-center text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    Gender
                  </p>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                    {GENDER_OPTIONS.map((option) => {
                      const active = genderDraft === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setGenderDraft(option)}
                          className={`min-h-11 rounded-full border px-4 py-2.5 text-center text-[13.5px] font-bold press ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-secondary text-foreground"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {canSetPhone ? (
                <label className="block">
                  <span className="mb-1.5 block text-center text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    Mobile phone
                  </span>
                  <input
                    value={phoneEdit}
                    onChange={(e) => setPhoneEdit(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-center text-[14px] font-semibold text-foreground outline-none focus:border-brand"
                    placeholder="0803 000 0000"
                  />
                </label>
              ) : null}
              <p className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
                Add missing details once. After saving, gender and phone can only be changed by
                support.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveMissing()}
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save details"}
              </button>
            </section>
          ) : (
            <section className="card-surface flex items-start gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                <Lock className="size-[18px]" strokeWidth={2} />
              </span>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                Your legal name, date of birth and gender were verified through KYC. To correct them,
                raise a support ticket with a valid government-issued ID.
              </p>
            </section>
          )}
        </div>

        <aside className="card-surface space-y-4 p-5 lg:sticky lg:top-6">
          <p className="flex items-center gap-2 text-[13px] font-extrabold">
            <ShieldCheck className="size-4 text-brand" /> Verification
          </p>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Current status: <span className="font-bold text-foreground">{profile.tier}</span>
          </p>
          <Link
            to="/verification"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-[12.5px] font-bold press hover:bg-secondary"
          >
            Review verification
          </Link>
        </aside>
      </div>
    </SettingsPage>
  );
}
