import { ShieldCheck } from "lucide-react";

type Variant = "marketplace" | "fixed";

const COPY: Record<Variant, string> = {
  marketplace:
    "Products are offered by third-party issuers. Rates are indicative and subject to availability.",
  fixed: "Rates are indicative and confirmed at investment. Funds locked for the tenor.",
};

export function DisclosureStrip({ variant = "fixed" }: { variant?: Variant }) {
  return (
    <div className="relative mt-5 flex items-start gap-3 overflow-hidden rounded-xl border border-border/60 bg-card/60 px-3.5 py-3 backdrop-blur-sm">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-gold-gradient"
      />
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
        <ShieldCheck className="size-4" />
      </span>
      <p className="line-clamp-2 text-[11.5px] leading-[1.55] text-muted-foreground">
        {COPY[variant]}
      </p>
    </div>
  );
}
