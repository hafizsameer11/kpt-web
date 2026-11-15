import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Field, FieldCard, SettingsPage } from "@/components/kipit/SettingsPage";
import {
  ApiError,
  fetchProfile,
  patchAddress,
  patchProfile,
  type ApiProfile,
} from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/kyc-data";

export const Route = createFileRoute("/settings_/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Kipit Settings" },
      {
        name: "description",
        content:
          "View and update your Kipit profile — personal details, residential address and next of kin. KYC-verified fields are locked.",
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
const MARITAL_OPTIONS = ["Single", "Married", "Others"] as const;
const NOK_RELATIONSHIPS = ["Spouse", "Parent", "Brother", "Sister", "Child", "Other"] as const;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-[13.5px] font-semibold outline-none focus:border-brand";

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

function toDobInput(value: string | null) {
  if (!value) return "";
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function tierLabel(tier: string | undefined) {
  if (tier === "TIER_2") return "Tier 2";
  if (tier === "TIER_1") return "Tier 1";
  return "Unverified (Tier 0)";
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim() && value.trim() !== "—");
}

type EditableForm = {
  maritalStatus: "" | (typeof MARITAL_OPTIONS)[number];
  spouseFullName: string;
  mothersMaidenName: string;
  maidenName: string;
  maidenNameNa: boolean;
  nationality: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  hometown: string;
  hometownLga: string;
  street: string;
  city: string;
  state: string;
  lga: string;
  nextOfKinName: string;
  nextOfKinRelationship: "" | (typeof NOK_RELATIONSHIPS)[number];
  nextOfKinPhone: string;
  nextOfKinAddress: string;
};

const emptyForm = (): EditableForm => ({
  maritalStatus: "",
  spouseFullName: "",
  mothersMaidenName: "",
  maidenName: "",
  maidenNameNa: false,
  nationality: "Nigerian",
  stateOfOrigin: "",
  lgaOfOrigin: "",
  hometown: "",
  hometownLga: "",
  street: "",
  city: "",
  state: "",
  lga: "",
  nextOfKinName: "",
  nextOfKinRelationship: "",
  nextOfKinPhone: "",
  nextOfKinAddress: "",
});

function formFromProfile(p: ApiProfile): EditableForm {
  const marital = MARITAL_OPTIONS.includes(p.maritalStatus as (typeof MARITAL_OPTIONS)[number])
    ? (p.maritalStatus as (typeof MARITAL_OPTIONS)[number])
    : "";
  const rel = NOK_RELATIONSHIPS.includes(
    p.nextOfKin?.relationship as (typeof NOK_RELATIONSHIPS)[number],
  )
    ? (p.nextOfKin.relationship as (typeof NOK_RELATIONSHIPS)[number])
    : "";
  return {
    maritalStatus: marital,
    spouseFullName: p.spouseFullName || "",
    mothersMaidenName: p.mothersMaidenName || "",
    maidenName: p.maidenName || "",
    maidenNameNa: Boolean(p.maidenNameNa),
    nationality: p.nationality || "Nigerian",
    stateOfOrigin: p.stateOfOrigin || "",
    lgaOfOrigin: p.lgaOfOrigin || "",
    hometown: p.hometown || "",
    hometownLga: p.hometownLga || "",
    street: p.address?.street || "",
    city: p.address?.city || "",
    state: p.address?.state || "",
    lga: p.address?.lga || "",
    nextOfKinName: p.nextOfKin?.name || "",
    nextOfKinRelationship: rel,
    nextOfKinPhone: p.nextOfKin?.phone || "",
    nextOfKinAddress: p.nextOfKin?.address || "",
  };
}

function ProfileScreen() {
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    dobRaw: "",
    gender: null as string | null,
    email: "",
    phone: null as string | null,
    kycTier: "TIER_0",
    tier: "Unverified",
    profileComplete: false,
    addressPending: false,
  });
  const [form, setForm] = useState<EditableForm>(emptyForm);
  const [phoneEdit, setPhoneEdit] = useState("");
  const [genderDraft, setGenderDraft] = useState("");
  const [dobDraft, setDobDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const canSetGender = !hasText(profile.gender);
  const canSetPhone = !hasText(profile.phone);
  const canSetDob = !hasText(profile.dobRaw);
  const lockedIdentity = profile.kycTier !== "TIER_0";

  const applyProfile = (p: ApiProfile) => {
    const tier =
      p.kycTier === "TIER_2" ? "Tier 2" : p.kycTier === "TIER_1" ? "Tier 1" : "Unverified";
    setProfile({
      firstName: p.firstName || "",
      middleName: p.middleName || "",
      lastName: p.surname || "",
      dob: formatDob(p.dateOfBirth),
      dobRaw: toDobInput(p.dateOfBirth),
      gender: p.gender,
      email: p.email || "",
      phone: p.phone,
      kycTier: p.kycTier || "TIER_0",
      tier,
      profileComplete: Boolean(p.profileComplete),
      addressPending: Boolean(p.address?.pending),
    });
    setForm(formFromProfile(p));
    setPhoneEdit(p.phone || "");
    setGenderDraft(p.gender?.trim() || "");
    setDobDraft(toDobInput(p.dateOfBirth));
  };

  useEffect(() => {
    void fetchProfile()
      .then(applyProfile)
      .catch(() => undefined);
  }, []);

  const setField = <K extends keyof EditableForm>(key: K, value: EditableForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    if (busy) return;
    if (!form.maritalStatus) {
      toast.error("Select marital status.");
      return;
    }
    if (form.maritalStatus === "Married" && !form.spouseFullName.trim()) {
      toast.error("Spouse’s full name is required when married.");
      return;
    }
    if (!form.mothersMaidenName.trim()) {
      toast.error("Mother’s maiden name is required.");
      return;
    }
    if (!form.maidenNameNa && !form.maidenName.trim()) {
      toast.error("Enter your maiden name, or tick Not applicable.");
      return;
    }
    if (!form.nationality.trim()) {
      toast.error("Nationality is required.");
      return;
    }
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.lga.trim()) {
      toast.error("Complete your residential address.");
      return;
    }
    if (
      !form.nextOfKinName.trim() ||
      !form.nextOfKinRelationship ||
      !form.nextOfKinPhone.trim() ||
      !form.nextOfKinAddress.trim()
    ) {
      toast.error("Complete next-of-kin details.");
      return;
    }
    if (canSetGender && !genderDraft.trim()) {
      toast.error("Choose your gender to continue.");
      return;
    }
    if (canSetPhone && phoneEdit.trim().length < 7) {
      toast.error("Enter a valid mobile number.");
      return;
    }
    if (canSetDob && !dobDraft.trim()) {
      toast.error("Enter your date of birth.");
      return;
    }

    setBusy(true);
    try {
      const patch: Parameters<typeof patchProfile>[0] = {
        maritalStatus: form.maritalStatus,
        spouseFullName: form.maritalStatus === "Married" ? form.spouseFullName.trim() : null,
        mothersMaidenName: form.mothersMaidenName.trim(),
        maidenName: form.maidenNameNa ? null : form.maidenName.trim(),
        maidenNameNa: form.maidenNameNa,
        nationality: form.nationality.trim(),
        stateOfOrigin: form.stateOfOrigin.trim() || null,
        lgaOfOrigin: form.lgaOfOrigin.trim() || null,
        hometown: form.hometown.trim() || null,
        hometownLga: form.hometownLga.trim() || null,
        nextOfKinName: form.nextOfKinName.trim(),
        nextOfKinRelationship: form.nextOfKinRelationship,
        nextOfKinPhone: form.nextOfKinPhone.trim(),
        nextOfKinAddress: form.nextOfKinAddress.trim(),
      };
      if (canSetGender) patch.gender = genderDraft.trim();
      if (canSetPhone) patch.phone = phoneEdit.trim();
      if (canSetDob) patch.dateOfBirth = dobDraft.trim();

      await patchProfile(patch);
      await patchAddress({
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        lga: form.lga.trim(),
      });
      const p = await fetchProfile();
      applyProfile(p);
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
      subtitle="Personal details, residential address and next of kin — editable anytime. KYC-verified identity fields stay locked."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:gap-5">
        <div className="space-y-4">
          <FieldCard label="Identity">
            <Field label="First name" value={profile.firstName || "—"} locked={lockedIdentity} />
            <Field label="Middle name" value={profile.middleName || "—"} />
            <Field label="Last name" value={profile.lastName || "—"} locked={lockedIdentity} />
            <Field
              label="Date of birth"
              value={canSetDob ? "Not set yet — add below" : profile.dob || "—"}
              locked={!canSetDob}
            />
            <Field
              label="Gender"
              value={canSetGender ? "Not set yet — add below" : profile.gender || "—"}
              locked={!canSetGender}
            />
            <Field label="Verification tier" value={tierLabel(profile.kycTier)} locked />
          </FieldCard>

          <FieldCard label="Contact">
            <Field label="Email address" value={profile.email || "—"} hint="Used for statements and alerts" />
            <Field
              label="Phone number"
              value={canSetPhone ? "Not set yet — add below" : profile.phone || "—"}
              hint={canSetPhone ? "Add it below" : "Used for OTP verification"}
            />
            <div className="grid gap-2 px-4 py-3">
              <Link
                to="/settings/help"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-[12.5px] font-extrabold text-primary-foreground shadow-float press"
              >
                Contact support to change email
              </Link>
              {!canSetPhone ? (
                <Link
                  to="/settings/help"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold text-foreground press"
                >
                  Contact support to change phone
                </Link>
              ) : null}
            </div>
          </FieldCard>

          {(canSetGender || canSetPhone || canSetDob) && (
            <section className="card-surface space-y-4 p-4">
              <p className="text-center text-[13px] font-extrabold text-foreground">
                Complete locked-once fields
              </p>
              {canSetDob ? (
                <label className="block">
                  <span className="mb-1.5 block text-center text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={dobDraft}
                    onChange={(e) => setDobDraft(e.target.value)}
                    className={`${inputClass} text-center`}
                  />
                </label>
              ) : null}
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
                    className={`${inputClass} text-center`}
                    placeholder="0803 000 0000"
                  />
                </label>
              ) : null}
              <p className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
                Gender, phone and date of birth can only be set once here — then support must change
                them.
              </p>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <FieldCard label="Personal details">
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Marital status
              </span>
              <select
                value={form.maritalStatus}
                onChange={(e) =>
                  setField("maritalStatus", e.target.value as EditableForm["maritalStatus"])
                }
                className={inputClass}
              >
                <option value="">Select</option>
                {MARITAL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            {form.maritalStatus === "Married" ? (
              <label className="block px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Spouse’s full name
                </span>
                <input
                  value={form.spouseFullName}
                  onChange={(e) => setField("spouseFullName", e.target.value)}
                  className={inputClass}
                />
              </label>
            ) : null}
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Mother’s maiden name
              </span>
              <input
                value={form.mothersMaidenName}
                onChange={(e) => setField("mothersMaidenName", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Your maiden name
              </span>
              <input
                value={form.maidenName}
                disabled={form.maidenNameNa}
                onChange={(e) => setField("maidenName", e.target.value)}
                className={`${inputClass} disabled:opacity-50`}
              />
              <label className="mt-2 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.maidenNameNa}
                  onChange={(e) => {
                    setField("maidenNameNa", e.target.checked);
                    if (e.target.checked) setField("maidenName", "");
                  }}
                />
                Not applicable
              </label>
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Nationality
              </span>
              <input
                value={form.nationality}
                onChange={(e) => setField("nationality", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                State of origin
              </span>
              <select
                value={form.stateOfOrigin}
                onChange={(e) => setField("stateOfOrigin", e.target.value)}
                className={inputClass}
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                LGA of origin
              </span>
              <input
                value={form.lgaOfOrigin}
                onChange={(e) => setField("lgaOfOrigin", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Hometown
              </span>
              <input
                value={form.hometown}
                onChange={(e) => setField("hometown", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Hometown LGA
              </span>
              <input
                value={form.hometownLga}
                onChange={(e) => setField("hometownLga", e.target.value)}
                className={inputClass}
              />
            </label>
          </FieldCard>

          <FieldCard label="Residential address">
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                House number and street
              </span>
              <input
                value={form.street}
                onChange={(e) => setField("street", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Town or city
              </span>
              <input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                State
              </span>
              <select
                value={form.state}
                onChange={(e) => setField("state", e.target.value)}
                className={inputClass}
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                LGA
              </span>
              <input
                value={form.lga}
                onChange={(e) => setField("lga", e.target.value)}
                className={inputClass}
              />
            </label>
            {profile.addressPending ? (
              <p className="px-4 pb-3 text-[11.5px] text-amber-700">
                Address update pending verification.
              </p>
            ) : null}
          </FieldCard>

          <FieldCard label="Next of kin">
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Full name
              </span>
              <input
                value={form.nextOfKinName}
                onChange={(e) => setField("nextOfKinName", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Relationship
              </span>
              <select
                value={form.nextOfKinRelationship}
                onChange={(e) =>
                  setField(
                    "nextOfKinRelationship",
                    e.target.value as EditableForm["nextOfKinRelationship"],
                  )
                }
                className={inputClass}
              >
                <option value="">Select</option>
                {NOK_RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Phone number
              </span>
              <input
                value={form.nextOfKinPhone}
                onChange={(e) => setField("nextOfKinPhone", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Residential address
              </span>
              <textarea
                value={form.nextOfKinAddress}
                onChange={(e) => setField("nextOfKinAddress", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </label>
          </FieldCard>

          <button
            type="button"
            disabled={busy}
            onClick={() => void saveAll()}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>

          <section className="card-surface flex items-start gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <Lock className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Legal name and verified KYC fields stay locked. Personal, address and next-of-kin
              details can be updated anytime from this page.
            </p>
          </section>
        </div>

        <aside className="card-surface space-y-4 p-5 lg:sticky lg:top-6">
          <p className="flex items-center gap-2 text-[13px] font-extrabold">
            <ShieldCheck className="size-4 text-brand" /> Verification
          </p>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Current status: <span className="font-bold text-foreground">{profile.tier}</span>
          </p>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Profile:{" "}
            <span className="font-bold text-foreground">
              {profile.profileComplete ? "Complete" : "Incomplete"}
            </span>
          </p>
          <Link
            to="/verification"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-[12.5px] font-bold press hover:bg-secondary"
          >
            Review verification
          </Link>
          <Link
            to="/settings/address"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-[12.5px] font-bold press hover:bg-secondary"
          >
            Occupation & source of funds
          </Link>
        </aside>
      </div>
    </SettingsPage>
  );
}
