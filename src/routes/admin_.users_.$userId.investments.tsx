import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Panel } from "@/components/kipit/AdminBits";
import { naira } from "@/lib/admin-data";
import { investmentsFor, type AdminInvestment } from "@/lib/admin-users-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin_/users_/$userId/investments")({
  component: Investments,
});

const SECTIONS: { key: AdminInvestment["state"]; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "matured", label: "Matured" },
  { key: "adjusted", label: "Adjusted" },
];

function Investments() {
  const { userId } = Route.useParams();
  const rows = investmentsFor(userId);
  const [open, setOpen] = useState<AdminInvestment | null>(null);

  return (
    <div className="space-y-5">
      {SECTIONS.map((section) => {
        const list = rows.filter((r) => r.state === section.key);
        return (
          <Panel
            key={section.key}
            title={`${section.label} investments`}
            action={
              <span className="text-[12px] font-bold text-muted-foreground">
                {list.length} {list.length === 1 ? "holding" : "holdings"}
              </span>
            }
          >
            {list.length === 0 ? (
              <p className="py-4 text-[13px] text-muted-foreground">Nothing in this section.</p>
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-left">
                  <thead>
                    <tr className="border-y border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      <th className="px-5 py-2.5">Product</th>
                      <th className="px-5 py-2.5 text-right">Principal</th>
                      <th className="px-5 py-2.5">Rate</th>
                      <th className="px-5 py-2.5">Start</th>
                      <th className="px-5 py-2.5">Maturity</th>
                      <th className="px-5 py-2.5 text-right">Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setOpen(r)}
                        className="cursor-pointer border-b border-border/60 transition hover:bg-muted/40"
                      >
                        <td className="px-5 py-3 text-[13.5px] font-bold">{r.product}</td>
                        <td className="px-5 py-3 text-right text-[13px]">{naira(r.principal)}</td>
                        <td className="px-5 py-3 text-[13px] font-bold text-brand">{r.rate}</td>
                        <td className="px-5 py-3 text-[13px] text-muted-foreground">{r.start}</td>
                        <td className="px-5 py-3 text-[13px] text-muted-foreground">{r.maturity}</td>
                        <td className="px-5 py-3 text-right text-[13px] font-bold">
                          {naira(r.expected)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        );
      })}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle>{open?.product}</DialogTitle>
            <DialogDescription>Investment detail (prototype record).</DialogDescription>
          </DialogHeader>
          {open ? (
            <ul className="divide-y divide-border/70 text-[13px]">
              {[
                ["Principal", naira(open.principal)],
                ["Rate", open.rate],
                ["Start date", open.start],
                ["Maturity date", open.maturity],
                ["Expected payout", naira(open.expected)],
                ["State", open.state],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 py-2.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-bold capitalize">{v}</span>
                </li>
              ))}
              {open.note ? (
                <li className="pt-3 text-[12.5px] text-muted-foreground">{open.note}</li>
              ) : null}
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
