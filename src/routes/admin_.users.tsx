import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Download, Search, SlidersHorizontal, Users2, X } from "lucide-react";

import { AdminShell } from "@/components/kipit/AdminShell";
import { Panel, StatusPill, Stat, TierPill } from "@/components/kipit/AdminBits";
import {
  ADMIN_USERS,
  portfolioValue,
  type Tier,
  type UserStatus,
} from "@/lib/admin-users-data";
import { naira, compactNaira } from "@/lib/admin-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_/users")({
  head: () => ({
    meta: [
      { title: "User Management — Kipit Admin Console" },
      {
        name: "description",
        content:
          "Search, filter and open Kipit customer records: KYC tier, account status, portfolio value and date joined.",
      },
      { property: "og:title", content: "User Management — Kipit Admin Console" },
      {
        property: "og:description",
        content: "Customer directory with tier, status and portfolio value for Kipit administrators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUserList,
});

type TierFilter = "all" | Tier;
type StatusFilter = "all" | UserStatus;

const TIER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "All tiers" },
  { value: 0, label: "Tier 0" },
  { value: 1, label: "Tier 1" },
  { value: 2, label: "Tier 2" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending KYC" },
  { value: "frozen", label: "Frozen" },
  { value: "dormant", label: "Dormant" },
];

function AdminUserList() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADMIN_USERS.filter((u) => {
      if (tier !== "all" && u.tier !== tier) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return [u.name, u.email, u.phone, u.id].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, tier, status]);

  const totals = useMemo(
    () => ({
      users: ADMIN_USERS.length,
      verified: ADMIN_USERS.filter((u) => u.tier === 2).length,
      pending: ADMIN_USERS.filter((u) => u.status === "pending").length,
      aum: ADMIN_USERS.reduce((s, u) => s + portfolioValue(u), 0),
    }),
    [],
  );

  const filtered = tier !== "all" || status !== "all" || query.trim().length > 0;

  return (
    <AdminShell title="Users" subtitle="ADM-020 · Customer directory">
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total users"
            value={totals.users.toLocaleString("en-NG")}
            helper="Registered accounts"
            tone="brand"
          />
          <Stat label="Tier 2 verified" value={`${totals.verified}`} helper="Full withdrawal access" />
          <Stat label="Awaiting KYC" value={`${totals.pending}`} helper="Tier 0 · no funding yet" tone="gold" />
          <Stat label="Customer AUM" value={compactNaira(totals.aum)} helper="Wallet + call + invested" />
        </section>

        <Panel className="overflow-hidden">
          <div className="-m-5">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-5 py-4">
              <label className="flex min-w-[16rem] flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, phone or user ID"
                  className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                    <X className="size-4 text-muted-foreground" />
                  </button>
                ) : null}
              </label>

              <select
                value={String(tier)}
                onChange={(e) =>
                  setTier(e.target.value === "all" ? "all" : (Number(e.target.value) as Tier))
                }
                className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-semibold outline-none"
              >
                {TIER_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-semibold outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="grid size-10 place-items-center rounded-lg bg-brand text-primary-foreground transition hover:opacity-90"
                aria-label="More filters"
              >
                <SlidersHorizontal className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => toast.success("Export queued", { description: "CSV will be emailed to you." })}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-semibold transition hover:bg-muted"
              >
                <Download className="size-4" />
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Portfolio value</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id} className="border-b border-border/60 transition hover:bg-muted/40">
                      <td className="px-5 py-3.5">
                        <Link
                          to="/admin/users/$userId"
                          params={{ userId: u.id }}
                          className="flex items-center gap-3"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-[12px] font-extrabold text-brand">
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-bold">{u.name}</span>
                            <span className="block text-[11.5px] text-muted-foreground">{u.id}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{u.phone}</td>
                      <td className="px-5 py-3.5">
                        <TierPill tier={u.tier} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={u.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13.5px] font-bold">
                        {naira(portfolioValue(u))}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{u.joined}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/admin/users/$userId"
                          params={{ userId: u.id }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-bold transition hover:bg-muted"
                        >
                          Open
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length === 0 ? (
                <div className="grid place-items-center gap-2 px-5 py-16 text-center">
                  <Users2 className="size-8 text-muted-foreground" />
                  <p className="text-[14px] font-bold">No users match these filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setTier("all");
                      setStatus("all");
                    }}
                    className="text-[13px] font-bold text-brand underline-offset-4 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-[12px] text-muted-foreground">
              <span>
                Showing {rows.length} of {ADMIN_USERS.length} users
                {filtered ? " (filtered)" : ""}
              </span>
              <span>Prototype data</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Full filter dialog */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Filter users</DialogTitle>
            <DialogDescription>Narrow the directory by verification tier and account status.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                KYC tier
              </p>
              <div className="flex flex-wrap gap-2">
                {TIER_OPTIONS.map((o) => (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => setTier(o.value)}
                    className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                      tier === o.value
                        ? "bg-brand text-primary-foreground"
                        : "border border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Account status
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setStatus(o.value)}
                    className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                      status === o.value
                        ? "bg-brand text-primary-foreground"
                        : "border border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  setTier("all");
                  setStatus("all");
                  setQuery("");
                }}
                className="text-[13px] font-bold text-muted-foreground underline-offset-4 hover:underline"
              >
                Reset all
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-primary-foreground"
              >
                Show {rows.length} users
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
