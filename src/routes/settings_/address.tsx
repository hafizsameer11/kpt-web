import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldCard, SettingsPage } from "@/components/kipit/SettingsPage";
import { ApiError, fetchProfile, patchAddress, patchProfile } from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/kyc-data";
import { EMPLOYMENT_STATUS, SOURCE_OF_FUNDS } from "@/lib/kyc-data";

export const Route = createFileRoute("/settings_/address")({
  head: () => ({
    meta: [
      { title: "Address & Personal Details | Kipit Settings" },
      {
        name: "description",
        content:
          "Keep your residential address, occupation, employment status and source of funds up to date on Kipit.",
      },
      { property: "og:title", content: "Address & Personal Details | Kipit Settings" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddressScreen,
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-[13.5px] font-semibold outline-none focus:border-brand";

function AddressScreen() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employment, setEmployment] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchProfile()
      .then((p) => {
        setStreet(p.address?.street || "");
        setCity(p.address?.city || "");
        setState(p.address?.state || "");
        setLga(p.address?.lga || "");
        setOccupation(p.occupation || "");
        setEmployment(p.employmentStatus || "");
        setSourceOfFunds(p.sourceOfFunds || "");
      })
      .catch(() => undefined);
  }, []);

  const save = async () => {
    if (busy) return;
    if (!street.trim() || !city.trim() || !state.trim() || !lga.trim()) {
      toast.error("Complete your residential address.");
      return;
    }
    setBusy(true);
    try {
      await patchAddress({
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        lga: lga.trim(),
      });
      const profilePatch: {
        occupation?: string;
        employmentStatus?: string;
        sourceOfFunds?: string;
      } = {};
      if (occupation.trim()) profilePatch.occupation = occupation.trim();
      if (employment) profilePatch.employmentStatus = employment;
      if (sourceOfFunds) profilePatch.sourceOfFunds = sourceOfFunds;
      if (Object.keys(profilePatch).length) {
        await patchProfile(profilePatch);
      }
      toast.success("Details saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsPage
      title="Address & personal details"
      eyebrow="MOB-142"
      subtitle="We are required to keep these details current for regulatory reporting."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:gap-5">
        <FieldCard label="Residential address">
          <label className="block px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Street
            </span>
            <input value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
          </label>
          <label className="block px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              City
            </span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </label>
          <label className="block px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              State
            </span>
            <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
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
            <input value={lga} onChange={(e) => setLga(e.target.value)} className={inputClass} />
          </label>
        </FieldCard>

        <div className="space-y-4">
          <FieldCard label="Personal details">
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Occupation
              </span>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Employment status
              </span>
              <select
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                {EMPLOYMENT_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Source of funds
              </span>
              <select
                value={sourceOfFunds}
                onChange={(e) => setSourceOfFunds(e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                {SOURCE_OF_FUNDS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </FieldCard>

          <section className="card-surface flex items-start gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <MapPin className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Keep your residence and source of funds current to avoid withdrawal delays.
            </p>
          </section>

          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 md:w-auto md:px-10"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <section className="card-surface p-5">
              <p className="text-[12.5px] font-extrabold text-foreground">Why we ask</p>
              <ul className="mt-2 space-y-2">
                {[
                  "Regulatory reporting requires a current residential address.",
                  "Source of funds keeps large investments compliant.",
                  "Accurate details prevent withdrawal delays.",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </SettingsPage>
  );
}
