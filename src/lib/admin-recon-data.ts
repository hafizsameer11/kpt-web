/**
 * Reconciliation fixtures (ADM-090 – ADM-092).
 * Prototype-only data comparing payment provider records with the internal ledger.
 */

export type ReconStatus = "matched" | "unmatched" | "variance" | "investigating" | "resolved";

export type ReconSource = "Paystack" | "Flutterwave" | "NIBSS transfer" | "Card acquirer";

export type ReconRecord = {
  id: string;
  providerRef: string;
  internalRef: string;
  source: ReconSource;
  customer: string;
  providerAmount: number;
  ledgerAmount: number;
  date: string;
  status: ReconStatus;
  channel: "Deposit" | "Withdrawal" | "Card" | "Transfer";
  note?: string;
  owner?: string;
  timeline: { label: string; at: string; by: string }[];
};

export const RECON_STATUS_LABEL: Record<ReconStatus, string> = {
  matched: "Matched",
  unmatched: "Unmatched",
  variance: "Variance",
  investigating: "Investigating",
  resolved: "Resolved",
};

export const RECON_STATUS_TONE: Record<ReconStatus, string> = {
  matched: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  unmatched: "bg-destructive/10 text-destructive ring-destructive/20",
  variance: "bg-gold/25 text-gold-foreground ring-gold/40",
  investigating: "bg-brand/10 text-brand ring-brand/20",
  resolved: "bg-muted text-muted-foreground ring-border",
};

export const RECON_RECORDS: ReconRecord[] = [
  {
    id: "rc-9001",
    providerRef: "PSK-8841203",
    internalRef: "KPT-DEP-441290",
    source: "Paystack",
    customer: "Amaka Obi",
    providerAmount: 250_000,
    ledgerAmount: 250_000,
    date: "2026-09-04 08:14",
    status: "matched",
    channel: "Deposit",
    timeline: [{ label: "Auto-matched on reference and amount", at: "2026-09-04 08:16", by: "System" }],
  },
  {
    id: "rc-9002",
    providerRef: "PSK-8841377",
    internalRef: "KPT-DEP-441312",
    source: "Paystack",
    customer: "Ibrahim Sule",
    providerAmount: 120_000,
    ledgerAmount: 118_500,
    date: "2026-09-04 09:02",
    status: "variance",
    channel: "Card",
    note: "Provider settled net of card fee; ledger booked gross.",
    owner: "Finance ops",
    timeline: [
      { label: "Variance detected — ₦1,500 difference", at: "2026-09-04 09:05", by: "System" },
      { label: "Assigned to finance ops", at: "2026-09-04 09:20", by: "Bola R." },
    ],
  },
  {
    id: "rc-9003",
    providerRef: "FLW-2210488",
    internalRef: "—",
    source: "Flutterwave",
    customer: "Chinedu Eze",
    providerAmount: 75_000,
    ledgerAmount: 0,
    date: "2026-09-04 09:41",
    status: "unmatched",
    channel: "Deposit",
    note: "Provider credit with no matching ledger entry. Possible webhook drop.",
    timeline: [{ label: "No ledger counterpart found", at: "2026-09-04 09:45", by: "System" }],
  },
  {
    id: "rc-9004",
    providerRef: "NIB-771120",
    internalRef: "KPT-WDR-118902",
    source: "NIBSS transfer",
    customer: "Funke Adeleye",
    providerAmount: 400_000,
    ledgerAmount: 400_000,
    date: "2026-09-03 16:22",
    status: "matched",
    channel: "Withdrawal",
    timeline: [{ label: "Auto-matched on reference and amount", at: "2026-09-03 16:25", by: "System" }],
  },
  {
    id: "rc-9005",
    providerRef: "NIB-771205",
    internalRef: "KPT-WDR-118944",
    source: "NIBSS transfer",
    customer: "Tobi Lawal",
    providerAmount: 0,
    ledgerAmount: 150_000,
    date: "2026-09-03 17:08",
    status: "investigating",
    channel: "Withdrawal",
    note: "Ledger debit posted but no provider settlement record. Payout may have been reversed.",
    owner: "Tunde A.",
    timeline: [
      { label: "Ledger entry without provider record", at: "2026-09-03 17:12", by: "System" },
      { label: "Investigation opened with provider", at: "2026-09-03 18:00", by: "Tunde A." },
    ],
  },
  {
    id: "rc-9006",
    providerRef: "PSK-8840912",
    internalRef: "KPT-DEP-441088",
    source: "Card acquirer",
    customer: "Zainab Bello",
    providerAmount: 60_000,
    ledgerAmount: 60_000,
    date: "2026-09-03 11:47",
    status: "resolved",
    channel: "Card",
    note: "Duplicate webhook reversed; balances agree.",
    owner: "Finance ops",
    timeline: [
      { label: "Duplicate credit flagged", at: "2026-09-03 11:50", by: "System" },
      { label: "Reversal posted, marked resolved", at: "2026-09-03 13:10", by: "Ify N." },
    ],
  },
  {
    id: "rc-9007",
    providerRef: "FLW-2210520",
    internalRef: "KPT-DEP-441401",
    source: "Flutterwave",
    customer: "Segun Ajayi",
    providerAmount: 1_000_000,
    ledgerAmount: 999_000,
    date: "2026-09-04 10:05",
    status: "variance",
    channel: "Transfer",
    note: "Transfer levy deducted at settlement.",
    owner: "Finance ops",
    timeline: [{ label: "Variance detected — ₦1,000 difference", at: "2026-09-04 10:08", by: "System" }],
  },
  {
    id: "rc-9008",
    providerRef: "PSK-8841444",
    internalRef: "KPT-DEP-441420",
    source: "Paystack",
    customer: "Grace Umeh",
    providerAmount: 35_000,
    ledgerAmount: 35_000,
    date: "2026-09-04 10:31",
    status: "matched",
    channel: "Deposit",
    timeline: [{ label: "Auto-matched on reference and amount", at: "2026-09-04 10:33", by: "System" }],
  },
];

export const RECON_SOURCES: { name: ReconSource; records: number; value: number; lastSync: string }[] = [
  { name: "Paystack", records: 1842, value: 412_300_000, lastSync: "2026-09-04 10:35" },
  { name: "Flutterwave", records: 964, value: 188_700_000, lastSync: "2026-09-04 10:30" },
  { name: "NIBSS transfer", records: 1216, value: 522_400_000, lastSync: "2026-09-04 10:20" },
  { name: "Card acquirer", records: 703, value: 96_100_000, lastSync: "2026-09-04 10:12" },
];

export const RECON_TREND = [
  { day: "29 Aug", matched: 612, exceptions: 9 },
  { day: "30 Aug", matched: 578, exceptions: 14 },
  { day: "31 Aug", matched: 640, exceptions: 7 },
  { day: "01 Sep", matched: 701, exceptions: 12 },
  { day: "02 Sep", matched: 688, exceptions: 6 },
  { day: "03 Sep", matched: 725, exceptions: 11 },
  { day: "04 Sep", matched: 469, exceptions: 8 },
];

const count = (s: ReconStatus) => RECON_RECORDS.filter((r) => r.status === s).length;

export const RECON_TOTALS = {
  matched: count("matched"),
  unmatched: count("unmatched"),
  variance: count("variance"),
  investigating: count("investigating"),
  resolved: count("resolved"),
  total: RECON_RECORDS.length,
  varianceValue: RECON_RECORDS.reduce(
    (s, r) => s + Math.abs(r.providerAmount - r.ledgerAmount),
    0,
  ),
  providerValue: RECON_SOURCES.reduce((s, r) => s + r.value, 0),
};

export function findReconRecord(id: string) {
  return RECON_RECORDS.find((r) => r.id === id);
}
