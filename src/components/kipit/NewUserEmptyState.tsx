import { Link } from "@tanstack/react-router";
import { ArrowDownToLine } from "lucide-react";
import { EMPTY_STATE_ART } from "@/components/kipit/art";

/**
 * MOB-020 — Empty State (new user).
 */
export function NewUserEmptyState() {
  return (
    <section className="overflow-hidden rounded-2xl border border-dashed border-gold/60 bg-surface text-center shadow-card">
      <img
        src={EMPTY_STATE_ART}
        alt="Abstract navy and gold shapes representing a growing portfolio"
        width={1024}
        height={640}
        className="h-40 w-full object-cover sm:h-52"
      />
      <div className="p-8 pt-6">
      <h2 className="text-xl font-extrabold tracking-tight">

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
      </div>

    </section>
  );
}
