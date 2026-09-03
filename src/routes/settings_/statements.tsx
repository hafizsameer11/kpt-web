import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, FileText } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { STATEMENT_KINDS, type StatementKind } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/statements")({
  head: () => ({
    meta: [
      { title: "Statements | Kipit Settings" },
      {
        name: "description",
        content:
          "Generate an account, transaction or portfolio statement for any date range and download it as a PDF.",
      },
      { property: "og:title", content: "Statements | Kipit Settings" },
      { property: "og:description", content: "Generate Kipit statements for any period." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatementsScreen,
});

function StatementsScreen() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<StatementKind>("Account statement");
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-09-03");

  return (
    <SettingsPage
      title="Statements"
      eyebrow="MOB-143"
      subtitle="Official statements you can share with a bank, employer or adviser."
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface overflow-hidden">
          <p className="border-b border-border/60 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Statement type
          </p>
          <ul className="divide-y divide-border/60">
            {STATEMENT_KINDS.map((s) => {
              const active = s.kind === kind;
              return (
                <li key={s.kind}>
                  <button
                    type="button"
                    onClick={() => setKind(s.kind)}
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left press transition-colors hover:bg-secondary/50"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${
                        active
                          ? "bg-brand text-gold ring-gold/25"
                          : "bg-secondary text-muted-foreground ring-border"
                      }`}
                    >
                      <FileText className="size-[18px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold">{s.kind}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</p>
                    </div>
                    {active ? (
                      <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="card-surface p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Period
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground">Start date</span>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground">End date</span>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-brand"
                />
              </label>
            </div>
          </section>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/settings/statements/generated",
                search: { kind, start, end },
              })
            }
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
          >
            Generate statement
          </button>

          <p className="px-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Statements are stamped and include a verification reference. Generating one does not
            change your holdings.
          </p>
        </div>
      </div>
    </SettingsPage>
  );
}
