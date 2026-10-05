/**
 * Kind-specific statement payloads for settings statements (parity with KipitApp buildPdfPayload).
 */
import {
  fetchCallAccount,
  fetchHome,
  fetchPlacements,
  fetchPortfolioTransactions,
  fetchProfile,
} from "@/lib/api";
import { mapApiPortfolioTransaction, naira, type Transaction } from "@/lib/portfolio-data";
import { getWalletBalance } from "@/lib/wallet-balance";
import type { StatementKind } from "@/lib/settings-data";

export type StatementDoc = {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
  body: string;
  reference: string;
};

function fmt(d: string) {
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

/** Compare calendar days in UTC so local timezone does not drop same-day rows. */
function dayKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function inPeriod(iso: string, start: string, end: string) {
  const day = dayKey(iso);
  if (!day || !start || !end) return false;
  return day >= start && day <= end;
}

function isWalletFlowTxn(t: Transaction) {
  if (t.type === "Deposit" || t.type === "Withdrawal") return true;
  const hay = `${t.label} ${t.source} ${t.destination}`.toLowerCase();
  return hay.includes("wallet") || hay.includes("transfer") || hay.includes("card");
}

function txnRows(txns: Transaction[]) {
  return txns.flatMap((t) => [
    {
      label: `${t.date}${t.time ? ` ${t.time}` : ""} · ${t.type}`,
      value: `${t.direction === "in" ? "+" : "−"}${naira(t.amount)}`,
    },
    {
      label: t.label,
      value: `${t.status} · ${t.reference}`,
    },
  ]);
}

export async function buildStatementPayload(input: {
  kind: StatementKind | string;
  start: string;
  end: string;
}): Promise<StatementDoc> {
  const { kind, start, end } = input;
  const reference = `KPT-STM-${start.replace(/-/g, "").slice(2)}`;
  const generated = new Date().toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [profile, home, txnsRaw, placements, call] = await Promise.all([
    fetchProfile().catch(() => null),
    fetchHome().catch(() => null),
    fetchPortfolioTransactions().catch(() => []),
    fetchPlacements().catch(() => []),
    fetchCallAccount().catch(() => ({ balance: 0, ratePct: 0 })),
  ]);

  const holder =
    [profile?.firstName, profile?.surname].filter(Boolean).join(" ") ||
    home?.greetingName ||
    "—";
  const email = profile?.email || home?.user?.email || "—";

  const all = (txnsRaw ?? [])
    .filter((t) => inPeriod(t.createdAt, start, end))
    .map(mapApiPortfolioTransaction)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const header = [
    { label: "Account holder", value: holder },
    { label: "Email", value: email },
    { label: "Statement type", value: kind },
    { label: "Period", value: `${fmt(start)} — ${fmt(end)}` },
    { label: "Reference", value: reference },
    { label: "Generated", value: generated },
  ];

  if (kind === "Portfolio statement") {
    const holdings = (placements ?? []).filter((p) => String(p.status).toUpperCase() === "ACTIVE");
    const invested = holdings.reduce((s, p) => s + (p.principal || 0), 0);
    const expectedInterest = holdings.reduce((s, p) => {
      const days = p.tenorDays || 0;
      return s + Math.round((p.principal || 0) * ((p.ratePct || 0) / 100) * (days / 365));
    }, 0);
    const interestPaid = all
      .filter((t) => t.type === "Interest" && t.direction === "in")
      .reduce((s, t) => s + t.amount, 0);
    return {
      title: kind,
      subtitle: `${fmt(start)} — ${fmt(end)}`,
      reference,
      rows: [
        ...header,
        { label: "Active holdings", value: String(holdings.length) },
        { label: "Principal invested", value: naira(invested) },
        { label: "Expected interest (open plans)", value: naira(expectedInterest) },
        { label: "Interest credited in period", value: naira(interestPaid) },
        ...holdings.flatMap((h) => [
          {
            label: h.name,
            value: `${naira(h.principal)} · ${h.ratePct}% p.a.`,
          },
          {
            label: "  Maturity",
            value: h.maturityDate ? fmt(h.maturityDate) : "—",
          },
        ]),
        ...(all.length
          ? [{ label: "Period activity", value: `${all.length} transaction(s)` }, ...txnRows(all.slice(0, 60))]
          : []),
      ],
      body: holdings.length
        ? "Kipit portfolio statement — active holdings, expected payouts and interest for the selected period."
        : "No active holdings. Interest and investment activity in the period (if any) still appear above when available.",
    };
  }

  if (kind === "Transaction statement") {
    return {
      title: kind,
      subtitle: `${fmt(start)} — ${fmt(end)}`,
      reference,
      rows: [
        ...header,
        { label: "Transactions", value: String(all.length) },
        ...(all.length
          ? txnRows(all.slice(0, 80))
          : [{ label: "Transactions in period", value: "None" }]),
      ],
      body: all.length
        ? "Kipit transaction statement — every movement with type, amount, status and reference for the selected period."
        : "No transactions fell in this period. Try a wider date range.",
    };
  }

  // Account statement — balances + every movement in the period (dates & amounts).
  const walletTxns = all.filter(isWalletFlowTxn);
  const inflows = walletTxns.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const outflows = walletTxns.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const wallet = home?.wallet?.balance ?? getWalletBalance();
  const callBal = call.balance ?? 0;
  const net = inflows - outflows;
  const listed = all.length ? all : walletTxns;

  return {
    title: kind,
    subtitle: `${fmt(start)} — ${fmt(end)}`,
    reference,
    rows: [
      ...header,
      { label: "Wallet balance (current)", value: naira(wallet) },
      { label: "Call Account balance (current)", value: naira(callBal) },
      { label: "Period inflows", value: `+${naira(inflows)}` },
      { label: "Period outflows", value: `−${naira(outflows)}` },
      {
        label: "Net movement",
        value: `${net >= 0 ? "+" : "−"}${naira(Math.abs(net))}`,
      },
      { label: "Transactions listed", value: String(listed.length) },
      ...(listed.length
        ? txnRows(listed.slice(0, 80))
        : [{ label: "Transactions in period", value: "None — widen the date range" }]),
    ],
    body: listed.length
      ? "Kipit account statement — wallet and Call balances with transaction dates and amounts for the selected period."
      : "Kipit account statement — no transactions in this period. Balances above are current.",
  };
}
