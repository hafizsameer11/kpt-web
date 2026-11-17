/**
 * Kind-specific statement payloads for settings statements (Appendix C / B21–B22).
 */
import {
  fetchCallAccount,
  fetchHome,
  fetchPlacements,
  fetchPortfolioTransactions,
  fetchProfile,
  type ApiPlacement,
} from "@/lib/api";
import { mapApiPortfolioTransaction, naira, type Transaction } from "@/lib/portfolio-data";
import { getWalletBalance } from "@/lib/wallet-balance";
import type { StatementKind } from "@/lib/settings-data";
import { NET_FROM_GROSS } from "@/lib/wht";

export type StatementInvestmentRow = {
  plan: string;
  principal: string;
  rate: string;
  maturity: string;
  gross: string;
  wht: string;
  net: string;
  valueAtMaturity: string;
};

export type StatementTxnRow = {
  date: string;
  description: string;
  reference: string;
  credit: string;
  debit: string;
};

export type StatementDoc = {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
  body: string;
  reference: string;
  portfolioSummary?: { label: string; value: string }[];
  whtSection?: { label: string; gross: string; wht: string; net: string }[];
  clientMeta?: { label: string; value: string }[];
  investments?: StatementInvestmentRow[];
  transactions?: StatementTxnRow[];
};

function fmt(d: string) {
  const date = new Date(d.includes("T") ? d : `${d}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  return {
    date: d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
  };
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

function displayPlanName(name: string) {
  return name
    .replace(/\bKipit Starter\b/gi, "Kipit Lock")
    .replace(/\bT-?Bills?\b/gi, "Treasury Bill")
    .replace(/\bTB\b/g, "Treasury Bill");
}

function clientIdFrom(profileId?: string | null) {
  if (!profileId) return "KAM-000000";
  const tail = profileId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `KAM-${tail || "000000"}`;
}

function statementRef(start: string) {
  const ymd = start.replace(/-/g, "");
  return `KAM-STMT-${ymd.slice(2) || "000000"}-0001`;
}

function money(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function rateLabel(p: ApiPlacement) {
  const net = p.ratePct ?? 0;
  const gross = p.grossRatePct ?? net / NET_FROM_GROSS;
  if (p.rateLabel) return p.rateLabel.replace(/\s*p\.a\.?/i, "").trim();
  return `${net.toFixed(2)}% (${gross.toFixed(2)}%)`;
}

function investmentRows(holdings: ApiPlacement[]): StatementInvestmentRow[] {
  return holdings.map((h) => {
    const net = h.expectedNet ?? h.expectedInterest ?? 0;
    const gross = h.expectedGross ?? net / NET_FROM_GROSS;
    const wht = h.expectedWht ?? Math.max(0, gross - net);
    const vam =
      h.valueAtMaturity ??
      h.principal + (h.interestPayout === "UPFRONT" ? 0 : net);
    const tenor = h.tenorDays ? `, ${h.tenorDays} days` : "";
    const started = h.startDate ? ` · Started ${fmt(h.startDate)}` : "";
    return {
      plan: `${displayPlanName(h.name)}${tenor}${started}`,
      principal: money(h.principal),
      rate: rateLabel(h),
      maturity: h.maturityDate ? fmt(h.maturityDate) : "—",
      gross: money(gross),
      wht: money(wht),
      net: money(net),
      valueAtMaturity: money(vam),
    };
  });
}

function txnTableRows(txns: Transaction[]): StatementTxnRow[] {
  return txns.map((t) => {
    const { date, time } = fmtDateTime(t.createdAt || `${t.date}T12:00:00`);
    return {
      date: time ? `${date} ${time}` : date,
      description: displayPlanName(t.label || t.type),
      reference: t.reference || "—",
      credit: t.direction === "in" ? money(t.amount) : "",
      debit: t.direction === "out" ? money(t.amount) : "",
    };
  });
}

function sumHoldings(holdings: ApiPlacement[]) {
  const principal = holdings.reduce((s, p) => s + (p.principal || 0), 0);
  const accruedNet = holdings.reduce((s, p) => s + (p.accruedNet ?? p.accrued ?? 0), 0);
  const accruedGross = holdings.reduce(
    (s, p) => s + (p.accruedGross ?? (p.accruedNet ?? p.accrued ?? 0) / NET_FROM_GROSS),
    0,
  );
  const accruedWht = holdings.reduce(
    (s, p) =>
      s +
      (p.accruedWht ??
        (p.accruedGross ?? (p.accruedNet ?? p.accrued ?? 0) / NET_FROM_GROSS) -
          (p.accruedNet ?? p.accrued ?? 0)),
    0,
  );
  const expectedNet = holdings.reduce(
    (s, p) => s + (p.expectedNet ?? p.expectedInterest ?? 0),
    0,
  );
  const expectedGross = holdings.reduce(
    (s, p) => s + (p.expectedGross ?? (p.expectedNet ?? p.expectedInterest ?? 0) / NET_FROM_GROSS),
    0,
  );
  const expectedWht = holdings.reduce(
    (s, p) =>
      s +
      (p.expectedWht ??
        (p.expectedGross ?? (p.expectedNet ?? p.expectedInterest ?? 0) / NET_FROM_GROSS) -
          (p.expectedNet ?? p.expectedInterest ?? 0)),
    0,
  );
  const maturityValue = holdings.reduce((s, p) => {
    if (typeof p.valueAtMaturity === "number") return s + p.valueAtMaturity;
    if (p.interestPayout === "UPFRONT") return s + p.principal;
    return s + p.principal + (p.expectedNet ?? p.expectedInterest ?? 0);
  }, 0);
  return {
    principal,
    accruedNet,
    accruedGross,
    accruedWht,
    expectedNet,
    expectedGross,
    expectedWht,
    maturityValue,
  };
}

export async function buildStatementPayload(input: {
  kind: StatementKind | string;
  start: string;
  end: string;
}): Promise<StatementDoc> {
  const { kind, start, end } = input;
  const reference = statementRef(start);
  const generatedDate = new Date().toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
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
  const clientId = clientIdFrom(profile?.id || home?.user?.id);

  const all = (txnsRaw ?? [])
    .filter((t) => inPeriod(t.createdAt, start, end))
    .map(mapApiPortfolioTransaction)
    .filter((t): t is Transaction => t != null)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const clientMeta = [
    { label: "Client name", value: holder },
    { label: "Client ID", value: clientId },
    { label: "Email", value: email },
    { label: "Statement date", value: generatedDate },
    { label: "Time generated", value: generatedTime },
  ];

  const wallet = home?.wallet?.balance ?? getWalletBalance();
  const callBal = call.balance ?? 0;
  const active = (placements ?? []).filter((p) => String(p.status).toUpperCase() === "ACTIVE");
  const totals = sumHoldings(active);

  const callInterestNet = all
    .filter(
      (t) =>
        t.type === "Interest" &&
        t.direction === "in" &&
        /call account/i.test(`${t.label} ${t.source}`),
    )
    .reduce((s, t) => s + t.amount, 0);
  const callInterestGross = callInterestNet / NET_FROM_GROSS;
  const callInterestWht = Math.max(0, callInterestGross - callInterestNet);

  const portfolioSummary = [
    { label: "Wallet balance", value: money(wallet) },
    { label: "Call Account balance (incl. net interest)", value: money(callBal) },
    { label: "Fixed plans (principal)", value: money(totals.principal) },
    { label: "Net interest accrued to date", value: money(totals.accruedNet) },
    {
      label: "Total portfolio value today",
      value: money(wallet + callBal + totals.principal + totals.accruedNet),
    },
    { label: "Fixed plans value at maturity", value: money(totals.maturityValue) },
  ];

  const whtSection = [
    {
      label: "Fixed plans: interest accrued to date",
      gross: money(totals.accruedGross),
      wht: money(totals.accruedWht),
      net: money(totals.accruedNet),
    },
    {
      label: "Fixed plans: interest expected at maturity",
      gross: money(totals.expectedGross),
      wht: money(totals.expectedWht),
      net: money(totals.expectedNet),
    },
    {
      label: "Call Account: interest this period",
      gross: money(callInterestGross),
      wht: money(callInterestWht),
      net: money(callInterestNet),
    },
  ];

  const title =
    kind === "Transaction statement"
      ? "Transaction statement"
      : kind === "Portfolio statement"
        ? "Investment statement"
        : "Investment statement";

  const subtitle = `Statement period: ${fmt(start)} to ${fmt(end)} · Ref: ${reference}`;

  if (kind === "Transaction statement") {
    return {
      title,
      subtitle,
      reference,
      clientMeta,
      rows: [],
      transactions: txnTableRows(all.slice(0, 120)),
      body: all.length
        ? "Kipit transaction statement — every movement with type, amount, status and reference for the selected period."
        : "No transactions fell in this period. Try a wider date range.",
    };
  }

  if (kind === "Portfolio statement") {
    return {
      title,
      subtitle,
      reference,
      clientMeta,
      portfolioSummary,
      whtSection,
      investments: investmentRows(active),
      transactions: txnTableRows(all.slice(0, 80)),
      rows: [],
      body: active.length
        ? "Kipit portfolio statement — active holdings, expected payouts and interest for the selected period."
        : "No active holdings at statement date. Interest and activity in the period (if any) still appear above when available.",
    };
  }

  // Account / Investment statement — full Appendix C shape.
  const walletTxns = all.filter(isWalletFlowTxn);
  const inflows = walletTxns.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const outflows = walletTxns.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const listed = all.length ? all : walletTxns;

  return {
    title,
    subtitle,
    reference,
    clientMeta,
    portfolioSummary,
    whtSection,
    investments: investmentRows(active),
    transactions: txnTableRows(listed.slice(0, 120)),
    rows: [
      { label: "Period inflows", value: `+${naira(inflows)}` },
      { label: "Period outflows", value: `−${naira(outflows)}` },
      {
        label: "Net movement",
        value: `${inflows - outflows >= 0 ? "+" : "−"}${naira(Math.abs(inflows - outflows))}`,
      },
    ],
    body: listed.length
      ? "Kipit investment statement — portfolio summary, withholding tax and transactions for the selected period."
      : "Kipit investment statement — no transactions in this period. Balances above are current.",
  };
}
