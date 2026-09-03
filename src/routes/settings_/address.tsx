import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Field, FieldCard, SettingsPage } from "@/components/kipit/SettingsPage";
import { ADDRESS } from "@/lib/settings-data";

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
      { property: "og:description", content: "Residence and personal details on your Kipit account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddressScreen,
});

function AddressScreen() {
  return (
    <SettingsPage
      title="Address & personal details"
      eyebrow="MOB-142"
      subtitle="We are required to keep these details current for regulatory reporting."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <FieldCard label="Residential address">
          <Field label="Street" value={ADDRESS.street} />
          <Field label="City" value={ADDRESS.city} />
          <Field label="State" value={ADDRESS.state} />
          <Field label="LGA" value={ADDRESS.lga} />
        </FieldCard>

        <div className="space-y-4">
          <FieldCard label="Personal details">
            <Field label="Occupation" value={ADDRESS.occupation} />
            <Field label="Employment status" value={ADDRESS.employment} />
            <Field label="Source of funds" value={ADDRESS.sourceOfFunds} />
          </FieldCard>

          <section className="card-surface flex items-start gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <MapPin className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              A proof of address may be requested when you update your residence or move to a higher
              verification tier.
            </p>
          </section>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
          >
            Save changes
          </button>
        </div>
      </div>
    </SettingsPage>
  );
}
