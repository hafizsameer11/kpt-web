import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Compass,
  FileText,
  Eye,
  EyeOff,
  Home,
  Lightbulb,
  Lock,
  PieChart,
  PlusCircle,
  Settings,
  ShieldCheck,
  Target,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/kipit/DashboardSidebar";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";

export const Route = createFileRoute("/home-v5")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Savings Concept" },
      {
        name: "description",
        content:
          "A Piggyvest-inspired savings home for Kipit: total balance, savings products, todos and recent activity.",
      },
      { property: "og:title", content: "Kipit Home — Savings Concept" },
      {
        property: "og:description",
        content:
          "Save, lock and grow your money with Kipit savings products.",
      },
    ],
  }),
  component: HomeV5,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

type Tab = { label: string; to: string; icon: LucideIcon };
const TABS: Tab[] = [
  { label: "Home", to: "/home-v5", icon: Home },
  { label: "Savings", to: "/portfolio", icon: PieChart },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Account", to: "/settings", icon: Settings },
];

type Product = {
  name: string;
  balance: number;
  blurb: string;
  icon: LucideIcon;
  card: string;
};

const PRODUCTS: Product[] = [
  {
    name: "Kipit Vault",
    balance: 1250000,
    blurb: "Automated savings, up to 12% p.a.",
    icon: ShieldCheck,
    card: "bg-primary text-primary-foreground",
  },
  {
    name: "Kipit Lock",
    balance: 500000,
    blurb: "Lock funds, earn up to 18% p.a.",
    icon: Lock,
    card: "bg-violet text-violet-foreground",
  },
  {
    name: "Target Savings",
    balance: 340000,
    blurb: "Reach goals alone or in groups.",
    icon: Target,
    card: "bg-teal text-teal-foreground",
  },
  {
    name: "Flex Wallet",
    balance: 86500,
    blurb: "Flexible spending wallet.",
    icon: Wallet,
    card: "bg-gold text-gold-foreground",
  },
];

const TODOS = [
  { label: "Verify your BVN", done: false },
  { label: "Set up auto-save on Kipit Vault", done: false },
  { label: "Add your debit card", done: true },
];

const ACTIVITY = [
  {
    label: "Auto-save · Kipit Vault",
    time: "Today, 6:00 AM",
    amount: 25000,
    credit: true,
  },
  {
    label: "Interest payout · Kipit Lock",
    time: "Yesterday",
    amount: 7410,
    credit: true,
  },
  {
    label: "Withdrawal to GTBank ****4821",
    time: "Aug 28",
    amount: 50000,
    credit: false,
  },
];

function Greeting() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">
          AO
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Good morning,</p>
          <h1 className="text-base font-bold text-foreground">Adaeze O.</h1>
        </div>
      </div>
      <Link
        to="/notifications"
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-full bg-card shadow-card"
      >
        <Bell className="size-5 text-brand" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
      </Link>
    </div>
  );
}

function BalanceCard() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  return (
    <section className="rounded-3xl bg-brand-gradient p-6 text-primary-foreground shadow-float">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
          Total portfolio value
          <button
            aria-label={hidden ? "Show balances" : "Hide balances"}
            onClick={toggle}
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </p>
        <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold">
          +₦32,410 · +1.51% this week
        </span>
      </div>
      <p className="mt-2 text-4xl font-extrabold tracking-tight">{mask(2176500)}</p>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { label: "Add money", icon: ArrowDownToLine, gold: true },
          { label: "Withdraw", icon: ArrowUpFromLine, gold: false },
          { label: "New plan", icon: PlusCircle, gold: false },
          { label: "Statements", icon: FileText, gold: false },
        ].map(({ label, icon: Icon, gold }) => (
          <button
            key={label}
            type="button"
            className={`flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-[11px] font-bold transition-transform active:scale-95 ${
              gold
                ? "bg-gold text-gold-foreground"
                : "bg-primary-foreground/15 text-primary-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function WalletEarningsMaturity() {
  const { mask } = useBalanceVisibility();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-3xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Wallet className="size-4" /> Wallet balance
        </div>
        <p className="mt-2 text-xl font-extrabold tracking-tight">{mask(86500)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Available funds: {mask(86500)}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Funds in your wallet are available for investment or withdrawal. Wallet funds do not
          earn investment returns.
        </p>
      </article>

      <article className="rounded-3xl bg-card p-5 shadow-card">
        <p className="text-xs font-bold text-muted-foreground">Weekly earnings</p>
        <p className="mt-2 text-xl font-extrabold tracking-tight text-success">{mask(32410)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Interest earned this week</p>
        <div className="mt-4 flex h-12 items-end gap-1.5">
          {[42, 55, 40, 68, 60, 82, 74].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t-md bg-gold-gradient" />
          ))}
        </div>
      </article>

      <article className="rounded-3xl bg-card p-5 shadow-card">
        <p className="text-xs font-bold text-muted-foreground">Next maturity</p>
        <p className="mt-2 text-sm font-bold">Kipit Lock · 180 days</p>
        <p className="mt-1 text-xl font-extrabold tracking-tight">{mask(500000)}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Matures 14 Oct 2026</span>
          <span className="rounded-full bg-accent px-2 py-1 font-bold text-accent-foreground">
            23 days left
          </span>
        </div>
      </article>
    </div>
  );
}

function Recommendation() {
  return (
    <section className="rounded-3xl border border-gold/40 bg-accent p-5 md:flex md:items-center md:justify-between md:gap-6">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
          <Lightbulb className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-accent-foreground">
            Your ₦86,500 Flex Wallet balance isn&apos;t currently invested.
          </p>
          <p className="mt-1 text-xs text-accent-foreground/80">
            Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
          </p>
        </div>
      </div>
      <Link
        to="/explore"
        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground md:mt-0 md:w-auto"
      >
        Explore Investments <ChevronRight className="size-4" />
      </Link>
    </section>
  );
}

const FEED = [
  {
    tag: "Product update",
    title: "Kipit Lock now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
  },
  {
    tag: "Education",
    title: "Understanding tenor and effective yield",
    body: "A 3-minute read on how rate and tenor shape your real return.",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
  },
];

function ContentFeed() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-foreground">For you</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {FEED.map((item, i) => (
          <article key={item.title} className="rounded-3xl bg-card p-5 shadow-card">
              <FeedThumb index={i} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.tag}
            </span>
            <h3 className="mt-2 text-sm font-bold leading-snug">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  const { mask } = useBalanceVisibility();
  return (
    <button
      className={`flex flex-col items-start gap-3 rounded-3xl p-5 text-left shadow-card transition-transform hover:-translate-y-0.5 ${product.card}`}
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-white/15">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-bold">{product.name}</span>
        <span className="mt-0.5 block text-xs opacity-80">
          {product.blurb}
        </span>
      </span>
      <span className="mt-auto text-lg font-extrabold">
        {mask(product.balance)}
      </span>
    </button>
  );
}

function Todos() {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <h2 className="text-sm font-bold text-foreground">To-do list</h2>
      <ul className="mt-3 space-y-3">
        {TODOS.map((todo) => (
          <li key={todo.label} className="flex items-center gap-3">
            <span
              className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${
                todo.done
                  ? "bg-success text-primary-foreground"
                  : "border-2 border-gold text-transparent"
              }`}
            >
              ✓
            </span>
            <span
              className={`text-sm ${
                todo.done
                  ? "text-muted-foreground line-through"
                  : "font-semibold text-foreground"
              }`}
            >
              {todo.label}
            </span>
            {!todo.done && (
              <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityFeed() {
  const { hidden, naira } = useBalanceVisibility();
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Recent activity</h2>
        <Link to="/portfolio" className="text-xs font-bold text-brand">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border rounded-3xl bg-card shadow-card">
        {ACTIVITY.map((item) => (
          <li key={item.label} className="flex items-center gap-3 px-5 py-4">
            <span
              className={`grid size-10 place-items-center rounded-full ${
                item.credit ? "bg-accent" : "bg-muted"
              }`}
            >
              {item.credit ? (
                <ArrowDownLeft className="size-4 text-brand" />
              ) : (
                <ArrowUpRight className="size-4 text-muted-foreground" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </span>
            <span
              className={`text-sm font-bold ${
                item.credit ? "text-success" : "text-foreground"
              }`}
            >
              {hidden ? "₦••••••" : `${item.credit ? "+" : "−"}${naira(item.amount)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                  active ? "text-brand" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.4 : 1.8}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.12 : 0}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeV5() {
  const isNewUser = useIsNewUser();
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar activePath="/home-v5" />
      <div className="md:pl-64">
        <DashboardTopBar title="Savings" />
        <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-28 pt-5 md:max-w-none md:px-8 md:pb-16">
          <div className="md:hidden">
            <Greeting />
          </div>
          {isNewUser ? (
            <NewUserEmptyState />
          ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <BalanceCard />
              <WalletEarningsMaturity />
              <Recommendation />
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">
                    My savings
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground">
                    4 products
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCTS.map((p) => (
                    <ProductCard key={p.name} product={p} />
                  ))}
                </div>
              </section>
            </div>
            <div className="space-y-5">
              <Todos />
              <ActivityFeed />
            </div>
            <div className="lg:col-span-3">
              <ContentFeed />
            </div>
          </div>
          )}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
