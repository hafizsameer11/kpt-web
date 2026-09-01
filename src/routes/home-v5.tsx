import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Compass,
  Eye,
  EyeOff,
  Home,
  Lock,
  PieChart,
  PlusCircle,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/kipit/DashboardSidebar";

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
      <button
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-full bg-card shadow-card"
      >
        <Bell className="size-5 text-brand" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
      </button>
    </div>
  );
}

function BalanceCard() {
  const [visible, setVisible] = useState(true);
  return (
    <section className="rounded-3xl bg-brand-gradient p-6 text-primary-foreground shadow-float">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
          Total savings
          <button
            aria-label="Toggle balance visibility"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
          </button>
        </p>
        <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold">
          +₦32,410 this week
        </span>
      </div>
      <p className="mt-2 text-4xl font-extrabold tracking-tight">
        {visible ? naira(2176500) : "₦ • • • • • •"}
      </p>
      <div className="mt-5 flex gap-3">
        <Link
          to="/invest"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 text-sm font-bold text-gold-foreground"
        >
          <PlusCircle className="size-4" /> Add money
        </Link>
        <Link
          to="/portfolio"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-3 text-sm font-bold text-primary-foreground"
        >
          Withdraw
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
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
        {naira(product.balance)}
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
              {item.credit ? "+" : "−"}
              {naira(item.amount)}
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
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar activeTo="/home-v5" />
      <div className="md:pl-64">
        <DashboardTopBar title="Savings" />
        <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-28 pt-5 md:max-w-none md:px-8 md:pb-16">
          <div className="md:hidden">
            <Greeting />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <BalanceCard />
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
          </div>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
