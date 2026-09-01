import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, Compass } from "lucide-react";

/**
 * MOB-020 — Empty State (new user).
 */
export function NewUserEmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-gold/60 bg-surface p-8 text-center shadow-card">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Compass className="size-6" />
      </span>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight">
        Start building your portfolio.
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Fund your Kipit wallet, then choose a plan that matches your goal and tenor.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-foreground"
        >
          <ArrowDownToLine className="size-4" /> Add Money
        </button>
        <Link
          to="/explore"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-bold text-foreground"
        >
          Explore Investments
        </Link>
      </div>
    </section>
  );
}
