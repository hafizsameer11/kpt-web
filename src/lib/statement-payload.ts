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
import { formatMoneyNaira, NET_FROM_GROSS } from "@/lib/wht";

export type StatementDoc = {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
  body: string;
  reference: string;
  portfolioSummary?: { label: string; value: string }[];
  whtSection?: { label: string; gross: string; wht: string; net: string }[];
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
    .filter((t): t is Transaction => t != null)
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
      (s, p) =>
        s +
        (p.expectedNet ??
          p.expectedInterest ??
          Math.round((p.principal || 0) * ((p.ratePct || 0) / 100) * ((p.tenorDays || 0) / 365))),
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
    const maturityValue = holdings.reduce(
      (s, p) => s + (p.valueAtMaturity ?? p.principal + (p.expectedNet ?? p.expectedInterest ?? 0)),
      0,
    );
    const interestPaid = all
      .filter((t) => t.type === "Interest" && t.direction === "in")
      .reduce((s, t) => s + t.amount, 0);
    const wallet = home?.wallet?.balance ?? getWalletBalance();
    const callBal = call.balance ?? 0;
    return {
      title: kind,
      subtitle: `${fmt(start)} — ${fmt(end)}`,
      reference,
      portfolioSummary: [
        { label: "Wallet balance", value: naira(wallet) },
        { label: "Call Account balance", value: naira(callBal) },
        { label: "Fixed plans (principal)", value: naira(invested) },
        { label: "Net interest accrued to date", value: naira(Math.round(accruedNet)) },
        {
          label: "Total portfolio value today",
          value: naira(Math.round(wallet + callBal + invested + accruedNet)),
        },
        { label: "Fixed plans value at maturity", value: naira(Math.round(maturityValue)) },
      ],
      whtSection: [
        {
          label: "Fixed plans: interest accrued to date",
          gross: formatMoneyNaira(accruedGross),
          wht: formatMoneyNaira(accruedWht),
          net: formatMoneyNaira(accruedNet),
        },
        {
          label: "Fixed plans: interest expected at maturity",
          gross: formatMoneyNaira(expectedGross),
          wht: formatMoneyNaira(expectedWht),
          net: formatMoneyNaira(expectedNet),
        },
      ],
      rows: [
        ...header,
        { label: "Active holdings", value: String(holdings.length) },
        { label: "Interest credited in period", value: naira(interestPaid) },
        ...holdings.flatMap((h) => [
          {
            label: h.name,
            value: `${naira(h.principal)} · ${h.ratePct}% net p.a.${h.grossRatePct != null ? ` (${h.grossRatePct}% gross)` : ""}`,
          },
          {
            label: "  Maturity / accrued net",
            value: `${h.maturityDate ? fmt(h.maturityDate) : "—"} · ${naira(h.accruedNet ?? h.accrued ?? 0)}`,
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

  const activePlans = (placements ?? []).filter((p) => String(p.status).toUpperCase() === "ACTIVE");
  const fixedPrincipal = activePlans.reduce((s, p) => s + (p.principal || 0), 0);
  const accruedNet = activePlans.reduce((s, p) => s + (p.accruedNet ?? p.accrued ?? 0), 0);
  const accruedGross = activePlans.reduce(
    (s, p) => s + (p.accruedGross ?? (p.accruedNet ?? p.accrued ?? 0) / NET_FROM_GROSS),
    0,
  );
  const accruedWht = Math.max(0, accruedGross - accruedNet);

  return {
    title: kind,
    subtitle: `${fmt(start)} — ${fmt(end)}`,
    reference,
    portfolioSummary: [
      { label: "Wallet balance", value: naira(wallet) },
      { label: "Call Account balance", value: naira(callBal) },
      { label: "Fixed plans (principal)", value: naira(fixedPrincipal) },
      { label: "Net interest accrued to date", value: naira(Math.round(accruedNet)) },
      {
        label: "Total portfolio value today",
        value: naira(Math.round(wallet + callBal + fixedPrincipal + accruedNet)),
      },
    ],
    ...(accruedNet > 0
      ? {
          whtSection: [
            {
              label: "Fixed plans: interest accrued to date",
              gross: formatMoneyNaira(accruedGross),
              wht: formatMoneyNaira(accruedWht),
              net: formatMoneyNaira(accruedNet),
            },
          ],
        }
      : {}),
    rows: [
      ...header,
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
