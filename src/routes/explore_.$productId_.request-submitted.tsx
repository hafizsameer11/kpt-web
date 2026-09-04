import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { naira } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/request-submitted")({
  head: () => ({
    meta: [
      { title: "Request Submitted | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Your large ticket request has been sent to a Kipit adviser — expect contact within one business day.",
      },
      { property: "og:title", content: "Request Submitted | Kipit Marketplace" },
      {
        property: "og:description",
        content: "A licensed Kipit adviser will reach out about your investment request.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search['amount']) || 0,
    contact:
      search['contact'] === "whatsapp" || search['contact'] === "email"
        ? (search['contact'] as "whatsapp" | "email")
        : ("call" as const),
  }),
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: RequestSubmittedScreen,
});

const CONTACT_META = {
  call: { label: "Phone call", icon: Phone },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  email: { label: "Email", icon: Mail },
} as const;

function RequestSubmittedScreen() {
  const { product } = Route.useLoaderData();
  const { amount, contact } = Route.useSearch();
  const ContactIcon = CONTACT_META[contact].icon;
  const reference = `KPT-REQ-${String(Math.abs(amount) % 100000).padStart(5, "0")}`;

  return (
    <AppShell title="Request Submitted" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-16 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold"
              />
              <span className="k-success-pop grid size-16 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="k-success-check"
                  />
                </svg>
              </span>
            </span>
            <p className="k-success-fade mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Request submitted
            </p>
            <h1 className="k-success-fade mt-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              An adviser will contact you
            </h1>
            <p className="k-success-fade mt-2 text-[12.5px] font-medium text-primary-foreground/70">
              {product.name} &middot; {naira(amount)}
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-5">
            <div className="min-w-0">
              <section className="card-surface p-4 md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Request details
                </p>
                <dl className="mt-3 divide-y divide-border text-[13px] md:text-[14px]">
                  <Row label="Reference">{reference}</Row>
                  <Row label="Product">{product.name}</Row>
                  <Row label="Issuer">{product.issuer}</Row>
                  <Row label="Intended amount">{naira(amount)}</Row>
                  <Row label="Contact via">
                    <span className="inline-flex items-center gap-1.5">
                      <ContactIcon className="size-3.5 text-gold" />
                      {CONTACT_META[contact].label}
                    </span>
                  </Row>
                  <Row label="Status">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-extrabold text-gold-strong">
                      Awaiting adviser
                    </span>
                  </Row>
                </dl>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="mt-0.5 size-3.5 shrink-0" />
                  Expect a response within one business day. No funds have been debited.
                </p>
              </section>

              <DisclosureStrip variant="marketplace" />
            </div>

            {/* Rail — next steps (desktop) + actions */}
            <aside className="min-w-0 space-y-4 md:sticky md:top-6">
              <section className="card-surface hidden p-6 md:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  What happens next
                </p>
                <ol className="mt-3 space-y-3">
                  {[
                    "A licensed adviser reviews your request",
                    `You get a ${CONTACT_META[contact].label.toLowerCase()} within one business day`,
                    "Terms are confirmed and your allocation is booked",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-extrabold text-gold-strong">
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] font-medium text-foreground/80">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="mt-5 flex flex-col gap-2.5 md:mt-0">
                <Link
                  to="/explore"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
                >
                  Back to Explore <ArrowRight className="size-4" strokeWidth={2.6} />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press"
                >
                  View portfolio
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold text-foreground">{children}</dd>
    </div>
  );
}
