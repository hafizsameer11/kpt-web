import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  FileSearch,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, Stat, StatusPill, TierPill } from "@/components/kipit/AdminBits";
import { ADMIN_USERS, portfolioValue } from "@/lib/admin-users-data";
import { naira } from "@/lib/admin-data";

export const Route = createFileRoute("/admin_/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance & KYC — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Review Kipit verification queues, AML screening hits and regulatory reporting from one compliance workspace.",
      },
      { property: "og:title", content: "Compliance & KYC — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Verification queue, AML alerts and reporting for Kipit compliance officers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Compliance,
});

/** ADM-030 – ADM-035 sections. Inner screens land in later passes. */
const SECTIONS = [
  {
    id: "ADM-030",
    label: "Verification queue",
    icon: ClipboardList,
    blurb: "Tier 1 and Tier 2 submissions awaiting a reviewer decision.",
    count: "18 waiting",
  },
  {
    id: "ADM-031",
    label: "Submission review",
    icon: FileSearch,
    blurb: "Side-by-side documents, selfie match and BVN/NIN check results.",
    count: "6 in progress",
  },
  {
    id: "ADM-032",
    label: "Decision & escalation",
    icon: UserCheck,
    blurb: "Approve, reject with reason codes or escalate to the MLRO.",
    count: "2 escalated",
  },
  {
    id: "ADM-033",
    label: "AML screening",
    icon: AlertTriangle,
    blurb: "Sanctions, PEP and adverse-media hits raised on customer records.",
    count: "3 open hits",
  },
  {
    id: "ADM-034",
    label: "Ongoing monitoring",
    icon: Clock,
    blurb: "Re-verification due dates, expiring documents and dormancy reviews.",
    count: "41 due in 30 days",
  },
  {
    id: "ADM-035",
    label: "Regulatory reporting",
    icon: ShieldCheck,
    blurb: "CBN / NFIU submission packs and audit-ready evidence exports.",
    count: "Next pack: 30 Sep",
  },
];

function Compliance() {
  const pending = ADMIN_USERS.filter((u) => u.status === "pending").slice(0, 6);

  return (
    <AdminShell
      title="Compliance & KYC"
      subtitle="Verification queues, AML screening and regulatory reporting"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting review" value="18" helper="Tier 1 and Tier 2 combined" tone="brand" icon={ClipboardList} />
        <Stat label="Median decision time" value="3h 42m" helper="Target under 6 hours" icon={Clock} />
        <Stat label="Open AML hits" value="3" helper="1 sanctions · 2 adverse media" tone="gold" icon={AlertTriangle} />
        <Stat label="Approval rate" value="87%" helper="Rolling 30 days" icon={UserCheck} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title="Compliance workspace" eyebrow="ADM-030 – ADM-035" icon={ShieldCheck}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-border/80 bg-muted/25 p-4 transition hover:border-brand/25"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/8 text-brand">
                      <Icon className="size-4" strokeWidth={2.1} />
                    </span>
                    <p className="truncate text-[13.5px] font-bold">{s.label}</p>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.id}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">{s.blurb}</p>
                  <p className="mt-3 inline-flex rounded-md bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
                    {s.count}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Latest submissions" icon={ClipboardList}>
          <ul className="divide-y divide-border/70">
            {pending.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-extrabold text-brand">
                  {u.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0">
                  <Link
                    to="/admin/users/$userId/kyc"
                    params={{ userId: u.id }}
                    className="block truncate text-[13.5px] font-bold hover:text-brand"
                  >
                    {u.name}
                  </Link>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {naira(portfolioValue(u))} portfolio
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <TierPill tier={u.tier} />
                  <StatusPill status={u.status} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-[12.5px] text-muted-foreground">
            Full review, decision and AML screens are built next.
          </p>
        </Panel>
      </div>
    </AdminShell>
  );
}
