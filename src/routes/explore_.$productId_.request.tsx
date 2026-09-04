import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, MessageCircle, Phone, UserRound } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/request")({
  head: () => ({
    meta: [
      { title: "Large Ticket Request | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Request adviser engagement for a large ticket investment on the Kipit marketplace.",
      },
      { property: "og:title", content: "Large Ticket Request | Kipit Marketplace" },
      {
        property: "og:description",
        content: "Tell Kipit your intended amount and a licensed adviser will reach out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: LargeTicketRequestScreen,
});

const CONTACT_METHODS = [
  { id: "call", label: "Phone call", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
] as const;

function LargeTicketRequestScreen() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();

  const [name, setName] = useState("Adeola Bankole");
  const [amount, setAmount] = useState(product.minimum);
  const [amountText, setAmountText] = useState(
    product.minimum.toLocaleString("en-NG"),
  );
  const [contact, setContact] = useState<(typeof CONTACT_METHODS)[number]["id"]>(
    "call",
  );
  const [note, setNote] = useState("");

  const belowMin = amount < product.minimum;
  const valid = name.trim().length > 1 && !belowMin;

  const handleAmount = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const numeric = digits ? Number(digits) : 0;
    setAmount(numeric);
    setAmountText(digits ? numeric.toLocaleString("en-NG") : "");
  };

  const submit = () => {
    if (!valid) return;
    void navigate({
      to: "/explore/$productId/request-submitted",
      params: { productId: product.id },
      search: { amount, contact },
    });
  };

  return (
    <AppShell title="Speak to an adviser" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/18 blur-[64px]"
          />
          <div className="relative">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold">
              Large ticket
            </p>
            <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              Request adviser engagement
            </h1>
            <p className="mt-2 max-w-md text-[12.5px] font-medium text-primary-foreground/70">
              {product.name} is arranged directly with a licensed adviser. Share your
              details and Kipit will contact you within one business day.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-gold">
                {product.rate}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-primary-foreground/80">
                {product.tenor}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-primary-foreground/80">
                Min {naira(product.minimum)}
              </span>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-5">
            <div className="min-w-0">
          <Rise>
            <section className="card-surface p-4 md:p-5">
              <label
                htmlFor="lt-name"
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Full name
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <input
                  id="lt-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-[14px] font-bold text-foreground outline-none"
                />
              </div>

              <label
                htmlFor="lt-amount"
                className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Intended investment amount
              </label>
              <div className="mt-2 flex items-baseline gap-1.5 rounded-lg border border-border bg-background px-3 py-3">
                <span className="font-display text-[22px] font-extrabold text-muted-foreground">
                  ₦
                </span>
                <input
                  id="lt-amount"
                  inputMode="numeric"
                  value={amountText}
                  onChange={(e) => handleAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent font-display text-[26px] font-extrabold tracking-[-0.02em] text-foreground outline-none"
                />
              </div>
              {belowMin ? (
                <p className="mt-1.5 text-[11px] font-semibold text-destructive">
                  Minimum for this product is {naira(product.minimum)}.
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Indicative only — the adviser confirms final terms.
                </p>
              )}

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Preferred contact method
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CONTACT_METHODS.map((m) => {
                  const active = contact === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setContact(m.id)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11.5px] font-bold press ${
                        active
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <m.icon
                        className={`size-4 ${active ? "text-gold-strong" : ""}`}
                        strokeWidth={2.4}
                      />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <label
                htmlFor="lt-note"
                className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Note <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="lt-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Anything the adviser should know — timing, source of funds, questions."
                className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </section>
          </Rise>

          <DisclosureStrip variant="marketplace" />
            </div>

            {/* Desktop rail — product recap + submit */}
            <aside className="min-w-0 md:sticky md:top-6 md:space-y-4">
              <section className="card-surface hidden p-6 md:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your request
                </p>
                <dl className="mt-3 divide-y divide-border text-[13.5px]">
                  <RailRow label="Product">{product.name}</RailRow>
                  <RailRow label="Rate">{product.rate}</RailRow>
                  <RailRow label="Tenor">{product.tenor}</RailRow>
                  <RailRow label="Amount">
                    <span className={belowMin ? "text-destructive" : ""}>
                      {amount > 0 ? naira(amount) : "—"}
                    </span>
                  </RailRow>
                  <RailRow label="Contact via">
                    {CONTACT_METHODS.find((m) => m.id === contact)?.label}
                  </RailRow>
                </dl>
              </section>

              <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] z-30 mt-5 md:static md:bottom-auto md:mt-0">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!valid}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press ${
                    valid ? "" : "pointer-events-none opacity-40 shadow-none"
                  }`}
                >
                  Submit request <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground md:text-left">
                  A licensed adviser responds within one business day.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold text-foreground">{children}</dd>
    </div>
  );
}
