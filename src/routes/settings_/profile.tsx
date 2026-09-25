import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Lock, Phone, ShieldCheck } from "lucide-react";
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

function formatDob(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function ProfileScreen() {
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    tier: "Unverified",
  });
  const [phoneEdit, setPhoneEdit] = useState("");
  const [busy, setBusy] = useState(false);

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
          gender: p.gender || "—",
          email: p.email || "",
          phone: p.phone || "—",
          tier,
        });
        setPhoneEdit(p.phone || "");
      })
      .catch(() => undefined);
  }, []);

  const savePhone = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await patchProfile({ phone: phoneEdit.trim() });
      setProfile((p) => ({ ...p, phone: phoneEdit.trim() || "—" }));
      toast.success("Phone updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update phone.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsPage
      title="Profile"
      eyebrow="MOB-141"
      subtitle="Your identity on Kipit. Fields confirmed during verification are locked and can only be changed by support."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:gap-5">
        <FieldCard label="Identity">
          <Field label="First name" value={profile.firstName || "—"} locked />
          <Field label="Middle name" value={profile.middleName || "—"} />
          <Field label="Last name" value={profile.lastName || "—"} locked />
          <Field label="Date of birth" value={profile.dob || "—"} locked />
          <Field label="Gender" value={profile.gender || "—"} locked />
        </FieldCard>

        <div className="space-y-4">
          <FieldCard label="Contact">
            <Field label="Email address" value={profile.email || "—"} hint="Used for statements and alerts" />
            <Field label="Phone number" value={profile.phone || "—"} hint="Used for OTP verification" />
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

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Phone number
              </span>
              <input
                value={phoneEdit}
                onChange={(e) => setPhoneEdit(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-[13.5px] font-semibold outline-none focus:border-brand"
                placeholder="080…"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void savePhone()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press disabled:opacity-40"
            >
              <Phone className="size-4" strokeWidth={2.4} /> {busy ? "Saving…" : "Save phone"}
            </button>
          </div>
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
