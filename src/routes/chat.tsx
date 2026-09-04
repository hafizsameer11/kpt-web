import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Landmark,
  LifeBuoy,
  Lock,
  MessageCircle,
  PieChart,
  Send,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/kipit/AppShell";
import {
  ALL_PRODUCTS,
  CHAT_STATUSES,
  DEFAULT_AMOUNT,
  FUNDING_ACCOUNT,
  MATURITY,
  PORTFOLIO_SNAPSHOT,
  SUGGESTED_PROMPTS,
  assistantReply,
  estimatedReturn,
  naira,
  nextId,
  parseAmount,
  type ChatBlock,
  type ChatMessage,
  type ChatProduct,
} from "@/lib/chat-data";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask AI — Kipit" },
      {
        name: "description",
        content:
          "Ask Kipit about your balance, maturities and transactions, get product matches, then authorize every investment in the secure flow.",
      },
      { property: "og:title", content: "Ask AI — Kipit" },
      {
        property: "og:description",
        content:
          "A guided Kipit assistant for balances, product matching and transaction tracking — money moves only through secure authorization.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatScreen,
});

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  screen: "CHAT-001",
  blocks: [
    { kind: "text", text: "Hi Adaeze, how can I help you today?" },
  ],
};

function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const amountRef = useRef<number | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (raw: string, display?: string) => {
    const value = raw.trim();
    if (!value || thinking) return;
    const parsed = parseAmount(value);
    if (parsed) amountRef.current = parsed;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: display ?? value },
    ]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, assistantReply(value, amountRef.current)]);
      setThinking(false);
      inputRef.current?.focus();
    }, 550);
  };

  const showPrompts = messages.length === 1;

  const promptIcons = [PieChart, Wallet, CalendarClock, LifeBuoy, BookOpen, Landmark];

  const transcript = (
    <>
      {messages.map((message, mi) =>
        message.role === "user" ? (
          <div key={message.id} className="k-rise flex justify-end">
            <p className="max-w-[80%] rounded-[1.25rem] rounded-br-md bg-brand-gradient px-4 py-2.5 text-[13.5px] font-medium text-brand-foreground shadow-card">
              {message.text}
            </p>
          </div>
        ) : (
          <div key={message.id} className="k-rise flex gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-primary-foreground ring-1 ring-gold/40">
              <MessageCircle className="size-3.5 text-gold" />
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              {message.blocks?.map((block, index) => (
                <div
                  key={index}
                  className="k-rise"
                  style={{ "--d": `${index * 70}ms` } as React.CSSProperties}
                >
                  <BlockView block={block} onSend={send} />
                </div>
              ))}
            </div>
            <span className="sr-only">{mi}</span>
          </div>
        ),
      )}

      {thinking && (
        <div className="flex gap-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-primary-foreground ring-1 ring-gold/40">
            <MessageCircle className="size-3.5 text-gold" />
          </span>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 shadow-card">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-1.5 animate-bounce rounded-full bg-brand/60"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {showPrompts && (
        <div className="pl-10">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Try one of these
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => {
              const Icon = promptIcons[i % promptIcons.length] ?? PieChart;
              return (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  style={{ "--d": `${120 + i * 60}ms` } as React.CSSProperties}
                  className="k-rise group flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 text-left text-[12.5px] font-semibold shadow-card press hover:border-brand/40"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand/8 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">{prompt}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </>
  );

  const composer = (
    <>
      <div className="flex items-end gap-2 rounded-[1.75rem] border border-border bg-background px-3 py-1.5 transition-colors focus-within:border-brand/50">
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about balances, products or a transaction…"
          className="min-w-0 flex-1 bg-transparent px-1.5 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!input.trim() || thinking}
          className="mb-1 grid size-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-brand-foreground press transition-opacity disabled:opacity-40"
        >
          <Send className="size-4 text-gold" />
        </button>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-muted-foreground">
        <Lock className="size-3 text-gold" /> Kipit never moves money in chat — you confirm with your
        PIN.
      </p>
    </>
  );

  return (
    <>
      {/* Mobile: full-screen native-style chat (no tab bar, fixed composer) */}
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background md:hidden">
        <header className="relative shrink-0 overflow-hidden bg-brand-gradient px-3 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-gold/20 blur-3xl" />
          <span className="pointer-events-none absolute -left-24 top-6 size-48 rounded-full border border-primary-foreground/10" />
          <div className="relative flex items-center gap-3">
            <Link
              to="/"
              aria-label="Back"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 press"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="grid size-9 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
              <MessageCircle className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-tight">Ask AI</p>
              <p className="flex items-center gap-1.5 text-[11px] text-primary-foreground/70">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Online · guided help
              </p>
            </div>
            <span className="ml-auto grid size-9 place-items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10">
              <ShieldCheck className="size-4 text-gold" />
            </span>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
          {transcript}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="shrink-0 border-t border-border bg-surface px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5"
        >
          {composer}
        </form>
      </div>


      {/* Desktop */}
      <div className="hidden md:block">
        <AppShell title="Ask AI">
          <div className="md:grid md:grid-cols-[minmax(0,1fr)_20rem] md:gap-6">
            <section className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface">
              <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-6 py-4">
                <span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-primary-foreground">
                  <MessageCircle className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold leading-tight">Kipit Assistant</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    Guided help · money moves only in secure screens
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-gold" /> Controlled
                </span>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{transcript}</div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(input);
                }}
                className="shrink-0 rounded-b-2xl border-t border-border bg-surface px-6 py-3"
              >
                {composer}
              </form>
            </section>

            {/* Desktop context rail */}
            <aside className="hidden md:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Your position
                  </p>
                  <p className="mt-1.5 text-[22px] font-bold text-num">
                    {naira(PORTFOLIO_SNAPSHOT.total)}
                  </p>
                  <dl className="mt-3 space-y-2 text-[12.5px]">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Wallet</dt>
                      <dd className="font-semibold text-num">{naira(PORTFOLIO_SNAPSHOT.wallet)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Invested</dt>
                      <dd className="font-semibold text-num">
                        {naira(PORTFOLIO_SNAPSHOT.invested)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    to="/portfolio"
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-border py-2 text-[12.5px] font-bold press hover:bg-secondary"
                  >
                    View portfolio <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    What I can do
                  </p>
                  <ul className="mt-3 space-y-2.5 text-[12.5px] text-muted-foreground">
                    {[
                      "Read balances, maturities and transaction status",
                      "Match you to products by tenor and access",
                      "Explain rate, tenor and minimum before you commit",
                      "Hand you to the secure screen to authorize",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-brand-gradient p-5 text-primary-foreground">
                  <Lock className="size-4 text-gold" />
                  <p className="mt-2 text-[13px] font-bold">Chat can't move money</p>
                  <p className="mt-1 text-[12px] text-primary-foreground/75">
                    Every investment, funding and withdrawal is completed in Kipit's standard
                    authorized flow with your transaction PIN.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </AppShell>
      </div>
    </>
  );
}


function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-secondary px-3.5 py-2.5 text-[13.5px] leading-relaxed">
      {children}
    </div>
  );
}

function BlockView({
  block,
  onSend,
}: {
  block: ChatBlock;
  onSend: (raw: string, display?: string) => void;
}) {
  switch (block.kind) {
    case "text":
      return <Bubble>{block.text}</Bubble>;

    case "chips":
      return (
        <div className="space-y-2">
          {block.label && <Bubble>{block.label}</Bubble>}
          <div className="flex flex-wrap gap-2">
            {block.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onSend(option.send, option.label)}
                className="rounded-full border border-brand/30 bg-brand/5 px-3.5 py-2 text-[12.5px] font-semibold text-brand press hover:bg-brand hover:text-brand-foreground"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );

    /* CHAT-002 */
    case "balance":
      return (
        <div className="space-y-2.5">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCard icon={Wallet} label="Wallet" value={naira(PORTFOLIO_SNAPSHOT.wallet)} />
            <StatCard
              icon={PieChart}
              label="Investments"
              value={naira(PORTFOLIO_SNAPSHOT.invested)}
              hint={`${PORTFOLIO_SNAPSHOT.holdings} active holdings`}
            />
            <StatCard
              icon={Landmark}
              label="Portfolio"
              value={naira(PORTFOLIO_SNAPSHOT.total)}
              accent
            />
          </div>
          <CtaLink to="/portfolio" label="View Portfolio" />
        </div>
      );

    /* CHAT-004 */
    case "products":
      return (
        <div className="space-y-2.5">
          {block.intro && <Bubble>{block.intro}</Bubble>}
          <div className="space-y-2.5">
            {block.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                amount={block.amount ?? DEFAULT_AMOUNT}
                onSend={onSend}
              />
            ))}
          </div>
        </div>
      );

    /* CHAT-005 */
    case "explain":
      return (
        <div className="space-y-2.5">
          <Bubble>
            <span className="font-bold">{block.product.name}</span> pays {block.product.rate} over{" "}
            {block.product.tenor}, from a minimum of {naira(block.product.minimum)}.{" "}
            {block.product.blurb} Interest is calculated on your principal and credited per the plan
            terms. Early exit terms, where they apply, are shown on the product page.
          </Bubble>
          <div className="flex flex-wrap gap-2">
            <CtaLink
              to={block.product.learnMoreTo ?? block.product.to}
              label="View Full Product"
            />
            <button
              type="button"
              onClick={() => onSend(`continue:${block.product.id}`, "I'd like to continue")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-[12.5px] font-bold text-gold-foreground press"
            >
              Continue <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      );

    /* CHAT-006 */
    case "handoff":
      return (
        <div className="max-w-[92%] rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold" /> Secure authorization required
          </div>
          <p className="mt-2 text-[13.5px] font-bold">{block.product.name}</p>
          <p className="text-[12.5px] text-muted-foreground">
            {block.product.rate} · {block.product.tenor} · min {naira(block.product.minimum)}
          </p>
          <Link
            to={block.product.to}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-[12.5px] font-bold text-brand-foreground press"
          >
            Continue Securely <ArrowRight className="size-3.5" />
          </Link>
        </div>
      );

    /* CHAT-007 */
    case "maturity":
      return (
        <div className="space-y-2.5">
          <div className="max-w-[92%] rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-brand" />
              <p className="text-[13.5px] font-bold">{MATURITY.name}</p>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <Cell label="Amount" value={naira(MATURITY.amount)} />
              <Cell label="Matures" value={MATURITY.date} />
              <Cell label="Days left" value={`${MATURITY.daysLeft}`} />
            </dl>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Expected payout {naira(MATURITY.expectedPayout)} at {MATURITY.rate}.
            </p>
          </div>
          <CtaLink to="/portfolio/maturities" label="View Investment" />
        </div>
      );

    /* CHAT-008 */
    case "status":
      return (
        <div className="space-y-2.5">
          <div className="max-w-[92%] space-y-2">
            {CHAT_STATUSES.map((item) => (
              <StatusCard key={item.label} item={item} />
            ))}
          </div>
          <CtaLink to="/portfolio/transactions" label="View Transaction" />
        </div>
      );

    /* CHAT-009 */
    case "funding":
      return (
        <div className="space-y-2.5">
          <div className="max-w-[92%] rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-bold">
              <Building2 className="size-4 text-brand" /> Bank transfer
            </div>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Account name" value={FUNDING_ACCOUNT.name} />
              <Row label="Account number" value={FUNDING_ACCOUNT.number} copy />
              <Row label="Bank" value={FUNDING_ACCOUNT.bank} />
            </dl>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Transfers usually reflect within minutes. Card payments post instantly.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CtaLink to="/wallet/add-money" label="Add Money" />
              <Link
                to="/wallet/card"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12.5px] font-bold press hover:bg-secondary"
              >
                <CreditCard className="size-3.5" /> Pay by card
              </Link>
            </div>
          </div>
        </div>
      );

    /* CHAT-010 */
    case "unsupported":
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSend("What products are available?")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12.5px] font-semibold press hover:bg-secondary"
          >
            <BookOpen className="size-3.5 text-brand" /> Investments
          </button>
          <button
            type="button"
            onClick={() => onSend("What's my balance?")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12.5px] font-semibold press hover:bg-secondary"
          >
            <Wallet className="size-3.5 text-brand" /> Balance
          </button>
          <Link
            to="/settings/help"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12.5px] font-semibold press hover:bg-secondary"
          >
            <LifeBuoy className="size-3.5 text-brand" /> Support
          </Link>
        </div>
      );

    default:
      return null;
  }
}

function ProductCard({
  product,
  amount,
  onSend,
}: {
  product: ChatProduct;
  amount: number;
  onSend: (raw: string, display?: string) => void;
}) {
  const est = useMemo(() => estimatedReturn(product, amount), [product, amount]);
  return (
    <div className="max-w-[92%] rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold">{product.name}</p>
          <p className="text-[12px] text-muted-foreground">{product.blurb}</p>
        </div>
        <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11.5px] font-bold text-num text-brand">
          {product.rate}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
        <Cell label="Tenor" value={product.tenor} />
        <Cell label="Minimum" value={naira(product.minimum)} />
        <Cell label="Est. return" value={naira(est)} />
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSend(`explain:${product.id}`, `Tell me about ${product.name}`)}
          className="rounded-full border border-border px-3.5 py-2 text-[12.5px] font-bold press hover:bg-secondary"
        >
          Learn More
        </button>
        <button
          type="button"
          onClick={() => onSend(`continue:${product.id}`, `Continue with ${product.name}`)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12.5px] font-bold text-brand-foreground press"
        >
          Continue <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatusCard({ item }: { item: (typeof CHAT_STATUSES)[number] }) {
  const map = {
    processing: { icon: Clock3, cls: "text-brand bg-brand/10", label: "Processing" },
    successful: { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-500/10", label: "Successful" },
    declined: { icon: XCircle, cls: "text-destructive bg-destructive/10", label: "Declined" },
    pending: { icon: Clock3, cls: "text-gold-foreground bg-gold/20", label: "Pending" },
  } as const;
  const tone = map[item.tone];
  const Icon = tone.icon;
  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 press hover:bg-secondary"
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tone.cls}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{item.label}</p>
        <p className="truncate text-[11.5px] text-muted-foreground">{item.detail}</p>
      </div>
      <div className="text-right">
        <p className="text-[12.5px] font-bold text-num">{naira(item.amount)}</p>
        <p className="text-[11px] text-muted-foreground">{tone.label}</p>
      </div>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3.5 ${
        accent
          ? "border-transparent bg-brand-gradient text-primary-foreground"
          : "border-border bg-surface"
      }`}
    >
      <Icon className={`size-4 ${accent ? "text-gold" : "text-brand"}`} />
      <p
        className={`mt-2 text-[11px] font-bold uppercase tracking-wide ${
          accent ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p className="text-[15px] font-bold text-num">{value}</p>
      {hint && (
        <p
          className={`text-[11px] ${
            accent ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary px-2.5 py-2">
      <dt className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[12.5px] font-bold text-num">{value}</dd>
    </div>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 font-semibold">
        {value}
        {copy && (
          <button
            type="button"
            aria-label="Copy account number"
            onClick={() => {
              void navigator.clipboard?.writeText(value);
              toast.success("Account number copied");
            }}
            className="grid size-7 place-items-center rounded-full border border-border press hover:bg-secondary"
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </dd>
    </div>
  );
}

/** Small helper so every CTA looks identical across response cards. */
function CtaLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12.5px] font-bold text-brand-foreground press"
    >
      {label} <ArrowRight className="size-3.5" />
    </Link>
  );
}

export { ALL_PRODUCTS };
