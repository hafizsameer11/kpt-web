/**
 * Administration console — compliance & KYC demo data (ADM-030–035).
 * Prototype-only records modelled on the UX specification.
 */

export type CaseTier = 1 | 2;
export type CaseStatus = "pending" | "in-review" | "escalated" | "approved" | "rejected";
export type CasePriority = "standard" | "high" | "urgent";

export type CheckResult = "pass" | "warn" | "fail" | "pending";

export type ComplianceCheck = {
  label: string;
  result: CheckResult;
  detail: string;
};

export type CaseDocument = {
  label: string;
  kind: "bvn" | "nin" | "selfie" | "address" | "occupation";
  captured: string;
  note: string;
};

export type CaseEvent = {
  at: string;
  actor: string;
  action: string;
  note?: string;
};

export type ComplianceCase = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  tier: CaseTier;
  status: CaseStatus;
  priority: CasePriority;
  submitted: string;
  waiting: string;
  slaHours: number;
  ageHours: number;
  assignee: string;
  trigger: string;
  riskScore: number;
  checks: ComplianceCheck[];
  documents: CaseDocument[];
  timeline: CaseEvent[];
};

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  pending: "Pending",
  "in-review": "In review",
  escalated: "Escalated",
  approved: "Approved",
  rejected: "Rejected",
};

export const REJECTION_REASONS = [
  "Document illegible or cropped",
  "Selfie does not match ID photo",
  "BVN name mismatch",
  "NIN could not be verified",
  "Address proof older than 3 months",
  "Suspected document tampering",
];

export const ESCALATION_REASONS = [
  "Possible sanctions match",
  "PEP relationship declared",
  "Adverse media hit",
  "Source of funds unclear",
  "Multiple accounts, same BVN",
];

export const COMPLIANCE_CASES: ComplianceCase[] = [
  {
    id: "kyc-4417",
    userId: "u-10241",
    name: "Chinaza Eze",
    email: "chinaza.eze@gmail.com",
    phone: "+234 802 118 7741",
    tier: 2,
    status: "pending",
    priority: "urgent",
    submitted: "4 Sep 2026, 06:12",
    waiting: "2h 43m",
    slaHours: 6,
    ageHours: 2.7,
    assignee: "Unassigned",
    trigger: "First withdrawal attempt — ₦2,400,000",
    riskScore: 72,
    checks: [
      { label: "BVN verification", result: "pass", detail: "Name and date of birth match" },
      { label: "NIN verification", result: "pass", detail: "NIMC record returned" },
      { label: "Liveness / selfie match", result: "warn", detail: "Similarity 71% — below 80% threshold" },
      { label: "Address proof", result: "pass", detail: "Utility bill dated 18 Aug 2026" },
      { label: "Sanctions & PEP screen", result: "pass", detail: "No hits on OFAC, UN, EU lists" },
    ],
    documents: [
      { label: "BVN record", kind: "bvn", captured: "3 Sep 2026", note: "2214 4471 88" },
      { label: "NIN slip", kind: "nin", captured: "4 Sep 2026", note: "Front and back captured" },
      { label: "Liveness selfie", kind: "selfie", captured: "4 Sep 2026", note: "3 frames, good lighting" },
      { label: "Proof of address", kind: "address", captured: "4 Sep 2026", note: "IKEDC bill, Lekki Phase 1" },
      { label: "Occupation & funds", kind: "occupation", captured: "4 Sep 2026", note: "Salary — tech, ₦1.2m/mo" },
    ],
    timeline: [
      { at: "4 Sep, 06:12", actor: "Customer", action: "Submitted Tier 2 upgrade" },
      { at: "4 Sep, 06:13", actor: "System", action: "BVN and NIN checks passed" },
      { at: "4 Sep, 06:14", actor: "System", action: "Selfie match flagged", note: "71% similarity" },
    ],
  },
  {
    id: "kyc-4412",
    userId: "u-10318",
    name: "Ibrahim Sule",
    email: "ibrahim.sule@yahoo.com",
    phone: "+234 706 552 3390",
    tier: 1,
    status: "in-review",
    priority: "high",
    submitted: "4 Sep 2026, 05:02",
    waiting: "3h 51m",
    slaHours: 6,
    ageHours: 3.9,
    assignee: "Femi Adeleke",
    trigger: "First funding attempt — ₦500,000",
    riskScore: 38,
    checks: [
      { label: "Phone OTP", result: "pass", detail: "Verified 4 Sep, 04:58" },
      { label: "BVN verification", result: "warn", detail: "Middle name differs from profile" },
      { label: "Sanctions & PEP screen", result: "pass", detail: "No hits" },
      { label: "Device & IP risk", result: "pass", detail: "Lagos, known device" },
    ],
    documents: [
      { label: "BVN record", kind: "bvn", captured: "4 Sep 2026", note: "2210 8834 02" },
    ],
    timeline: [
      { at: "4 Sep, 05:02", actor: "Customer", action: "Submitted BVN for Tier 1" },
      { at: "4 Sep, 05:20", actor: "Femi Adeleke", action: "Picked up case" },
    ],
  },
  {
    id: "kyc-4408",
    userId: "u-10402",
    name: "Grace Adeyemi",
    email: "grace.adeyemi@gmail.com",
    phone: "+234 811 664 2019",
    tier: 2,
    status: "escalated",
    priority: "urgent",
    submitted: "3 Sep 2026, 19:44",
    waiting: "13h 09m",
    slaHours: 12,
    ageHours: 13.2,
    assignee: "MLRO — Ngozi Umeh",
    trigger: "Payout bank added — first-party check failed",
    riskScore: 88,
    checks: [
      { label: "BVN verification", result: "pass", detail: "Match" },
      { label: "NIN verification", result: "pass", detail: "Match" },
      { label: "Liveness / selfie match", result: "pass", detail: "94% similarity" },
      { label: "Bank account name match", result: "fail", detail: "Account belongs to third party" },
      { label: "Sanctions & PEP screen", result: "warn", detail: "Adverse media article, 2024" },
    ],
    documents: [
      { label: "NIN slip", kind: "nin", captured: "3 Sep 2026", note: "Clear scan" },
      { label: "Liveness selfie", kind: "selfie", captured: "3 Sep 2026", note: "Passed liveness" },
      { label: "Proof of address", kind: "address", captured: "3 Sep 2026", note: "Bank statement, Aug 2026" },
    ],
    timeline: [
      { at: "3 Sep, 19:44", actor: "Customer", action: "Added payout account" },
      { at: "3 Sep, 19:45", actor: "System", action: "Name match failed" },
      { at: "3 Sep, 21:10", actor: "Femi Adeleke", action: "Escalated to MLRO", note: "Third-party account" },
    ],
  },
  {
    id: "kyc-4399",
    userId: "u-10477",
    name: "Samuel Okoro",
    email: "samuel.okoro@gmail.com",
    phone: "+234 703 889 1140",
    tier: 1,
    status: "pending",
    priority: "standard",
    submitted: "4 Sep 2026, 07:30",
    waiting: "1h 25m",
    slaHours: 6,
    ageHours: 1.4,
    assignee: "Unassigned",
    trigger: "First investment attempt — Call Account",
    riskScore: 21,
    checks: [
      { label: "Phone OTP", result: "pass", detail: "Verified 4 Sep, 07:28" },
      { label: "BVN verification", result: "pending", detail: "Awaiting provider response" },
      { label: "Sanctions & PEP screen", result: "pass", detail: "No hits" },
    ],
    documents: [{ label: "BVN record", kind: "bvn", captured: "4 Sep 2026", note: "Submitted" }],
    timeline: [{ at: "4 Sep, 07:30", actor: "Customer", action: "Submitted BVN for Tier 1" }],
  },
  {
    id: "kyc-4390",
    userId: "u-10512",
    name: "Halima Yusuf",
    email: "halima.yusuf@outlook.com",
    phone: "+234 809 224 7712",
    tier: 2,
    status: "approved",
    priority: "standard",
    submitted: "3 Sep 2026, 11:02",
    waiting: "—",
    slaHours: 12,
    ageHours: 4.1,
    assignee: "Chiamaka Nwosu",
    trigger: "First withdrawal attempt — ₦180,000",
    riskScore: 14,
    checks: [
      { label: "BVN verification", result: "pass", detail: "Match" },
      { label: "NIN verification", result: "pass", detail: "Match" },
      { label: "Liveness / selfie match", result: "pass", detail: "96% similarity" },
      { label: "Address proof", result: "pass", detail: "Utility bill, Aug 2026" },
    ],
    documents: [
      { label: "NIN slip", kind: "nin", captured: "3 Sep 2026", note: "Clear scan" },
      { label: "Liveness selfie", kind: "selfie", captured: "3 Sep 2026", note: "Passed" },
    ],
    timeline: [
      { at: "3 Sep, 11:02", actor: "Customer", action: "Submitted Tier 2 upgrade" },
      { at: "3 Sep, 15:07", actor: "Chiamaka Nwosu", action: "Approved Tier 2" },
    ],
  },
  {
    id: "kyc-4382",
    userId: "u-10588",
    name: "Kelechi Obi",
    email: "kelechi.obi@gmail.com",
    phone: "+234 815 330 6621",
    tier: 2,
    status: "rejected",
    priority: "standard",
    submitted: "2 Sep 2026, 16:40",
    waiting: "—",
    slaHours: 12,
    ageHours: 6.5,
    assignee: "Femi Adeleke",
    trigger: "First withdrawal attempt — ₦95,000",
    riskScore: 46,
    checks: [
      { label: "BVN verification", result: "pass", detail: "Match" },
      { label: "NIN verification", result: "fail", detail: "NIMC returned no record" },
      { label: "Liveness / selfie match", result: "warn", detail: "62% similarity" },
    ],
    documents: [{ label: "NIN slip", kind: "nin", captured: "2 Sep 2026", note: "Blurred edges" }],
    timeline: [
      { at: "2 Sep, 16:40", actor: "Customer", action: "Submitted Tier 2 upgrade" },
      { at: "2 Sep, 23:12", actor: "Femi Adeleke", action: "Rejected", note: "NIN could not be verified" },
    ],
  },
];

export type AmlHitType = "sanctions" | "pep" | "adverse-media" | "transaction";
export type AmlStatus = "open" | "investigating" | "cleared" | "reported";

export type AmlAlert = {
  id: string;
  userId: string;
  name: string;
  type: AmlHitType;
  status: AmlStatus;
  raised: string;
  score: number;
  summary: string;
  matchedAgainst: string;
  analyst: string;
  notes: { at: string; actor: string; text: string }[];
};

export const AML_TYPE_LABEL: Record<AmlHitType, string> = {
  sanctions: "Sanctions",
  pep: "PEP",
  "adverse-media": "Adverse media",
  transaction: "Transaction pattern",
};

export const AML_STATUS_LABEL: Record<AmlStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  cleared: "Cleared",
  reported: "Reported to NFIU",
};

export const AML_ALERTS: AmlAlert[] = [
  {
    id: "aml-2201",
    userId: "u-10402",
    name: "Grace Adeyemi",
    type: "adverse-media",
    status: "investigating",
    raised: "3 Sep 2026",
    score: 78,
    summary: "News article naming a similar individual in a procurement inquiry.",
    matchedAgainst: "Adverse media — Nigerian press, Nov 2024",
    analyst: "Ngozi Umeh",
    notes: [
      { at: "3 Sep, 21:15", actor: "Femi Adeleke", text: "Escalated with Tier 2 case kyc-4408." },
      { at: "4 Sep, 07:02", actor: "Ngozi Umeh", text: "Requested date of birth confirmation." },
    ],
  },
  {
    id: "aml-2198",
    userId: "u-10633",
    name: "Musa Danjuma",
    type: "sanctions",
    status: "open",
    raised: "4 Sep 2026",
    score: 91,
    summary: "Fuzzy name match against a consolidated sanctions list entry.",
    matchedAgainst: "OFAC SDN — 84% name similarity",
    analyst: "Unassigned",
    notes: [{ at: "4 Sep, 05:40", actor: "System", text: "Automatic screen on Tier 1 upgrade." }],
  },
  {
    id: "aml-2190",
    userId: "u-10241",
    name: "Adaeze Okonkwo",
    type: "transaction",
    status: "open",
    raised: "2 Sep 2026",
    score: 64,
    summary: "Six deposits just below the ₦5m reporting threshold within 48 hours.",
    matchedAgainst: "Structuring rule — TR-014",
    analyst: "Unassigned",
    notes: [{ at: "2 Sep, 12:22", actor: "System", text: "Rule TR-014 triggered." }],
  },
  {
    id: "aml-2184",
    userId: "u-10318",
    name: "Tunde Bakare",
    type: "pep",
    status: "cleared",
    raised: "28 Aug 2026",
    score: 55,
    summary: "Declared relationship to a state commissioner; enhanced due diligence completed.",
    matchedAgainst: "PEP register — family member",
    analyst: "Chiamaka Nwosu",
    notes: [{ at: "29 Aug, 10:05", actor: "Chiamaka Nwosu", text: "EDD complete, source of funds verified." }],
  },
];

export type MonitoringTask = {
  id: string;
  userId: string;
  name: string;
  kind: "Re-verification" | "Document expiry" | "Dormancy review" | "Risk refresh";
  due: string;
  daysLeft: number;
  tier: CaseTier;
  detail: string;
};

export const MONITORING_TASKS: MonitoringTask[] = [
  { id: "mon-01", userId: "u-10241", name: "Adaeze Okonkwo", kind: "Risk refresh", due: "12 Sep 2026", daysLeft: 8, tier: 2, detail: "High-value portfolio annual refresh" },
  { id: "mon-02", userId: "u-10318", name: "Tunde Bakare", kind: "Document expiry", due: "19 Sep 2026", daysLeft: 15, tier: 2, detail: "Driver's licence expires" },
  { id: "mon-03", userId: "u-10402", name: "Grace Adeyemi", kind: "Re-verification", due: "22 Sep 2026", daysLeft: 18, tier: 2, detail: "Address proof older than 12 months" },
  { id: "mon-04", userId: "u-10477", name: "Samuel Okoro", kind: "Dormancy review", due: "26 Sep 2026", daysLeft: 22, tier: 1, detail: "No activity for 180 days" },
  { id: "mon-05", userId: "u-10512", name: "Halima Yusuf", kind: "Risk refresh", due: "30 Sep 2026", daysLeft: 26, tier: 2, detail: "PEP-adjacent, half-yearly review" },
  { id: "mon-06", userId: "u-10588", name: "Kelechi Obi", kind: "Re-verification", due: "2 Oct 2026", daysLeft: 28, tier: 1, detail: "Failed Tier 2, retry window" },
];

export type ReportPack = {
  id: string;
  name: string;
  regulator: "CBN" | "NFIU" | "SEC" | "Internal";
  period: string;
  due: string;
  status: "draft" | "ready" | "submitted";
  records: number;
  owner: string;
};

export const REPORT_PACKS: ReportPack[] = [
  { id: "rep-091", name: "Monthly KYC statistics", regulator: "CBN", period: "August 2026", due: "30 Sep 2026", status: "ready", records: 1284, owner: "Ngozi Umeh" },
  { id: "rep-090", name: "Suspicious transaction report", regulator: "NFIU", period: "Sep 2026 (rolling)", due: "Within 24h of decision", status: "draft", records: 2, owner: "Ngozi Umeh" },
  { id: "rep-089", name: "Currency transaction report", regulator: "NFIU", period: "August 2026", due: "7 Sep 2026", status: "ready", records: 41, owner: "Chiamaka Nwosu" },
  { id: "rep-088", name: "Investor register", regulator: "SEC", period: "Q3 2026", due: "14 Oct 2026", status: "draft", records: 8642, owner: "Femi Adeleke" },
  { id: "rep-087", name: "AML programme review", regulator: "Internal", period: "H1 2026", due: "Submitted 12 Jul 2026", status: "submitted", records: 1, owner: "Ngozi Umeh" },
];

export const caseById = (id: string) => COMPLIANCE_CASES.find((c) => c.id === id);
export const amlById = (id: string) => AML_ALERTS.find((a) => a.id === id);
