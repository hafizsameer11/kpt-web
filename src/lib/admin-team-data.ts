/** Admin team, roles & audit-log fixtures (ADM-120 / 121 / 122 / 130). */

export type AdminStatus = "active" | "invited" | "suspended";

export type AdminRoleId =
  | "global-admin"
  | "operations"
  | "compliance"
  | "finance"
  | "support"
  | "read-only";

export type Permission = {
  id: string;
  label: string;
  description: string;
};

export type PermissionGroup = {
  id: string;
  label: string;
  permissions: Permission[];
};

export type AdminRole = {
  id: AdminRoleId;
  name: string;
  summary: string;
  members: number;
  system: boolean;
  /** Permission ids granted to the role. */
  grants: string[];
};

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRoleId;
  status: AdminStatus;
  department: string;
  createdAt: string;
  lastActive: string;
  twoFactor: boolean;
  makerChecker: boolean;
  actions30d: number;
  createdBy: string;
};

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  active: "Active",
  invited: "Invite sent",
  suspended: "Suspended",
};

export const ADMIN_STATUS_TONE: Record<AdminStatus, string> = {
  active: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  invited: "bg-gold/20 text-gold-foreground ring-gold/40",
  suspended: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "users",
    label: "Users & accounts",
    permissions: [
      { id: "users.view", label: "View users", description: "Open customer profiles and balances" },
      { id: "users.freeze", label: "Freeze / unfreeze", description: "Restrict account activity" },
      { id: "users.sessions", label: "Revoke sessions", description: "Sign a customer out of devices" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance & KYC",
    permissions: [
      { id: "kyc.review", label: "Review submissions", description: "Open verification cases" },
      { id: "kyc.decide", label: "Approve / reject KYC", description: "Set a customer tier" },
      { id: "aml.investigate", label: "Investigate AML alerts", description: "Work and close alerts" },
      { id: "aml.report", label: "File regulatory reports", description: "Generate and submit packs" },
    ],
  },
  {
    id: "money",
    label: "Money movement",
    permissions: [
      { id: "txn.view", label: "View transactions", description: "Search the full ledger" },
      { id: "withdrawal.process", label: "Process withdrawals", description: "Release payouts to banks" },
      { id: "withdrawal.decline", label: "Decline withdrawals", description: "Reject with a reason" },
      { id: "recon.resolve", label: "Resolve reconciliation", description: "Clear variances" },
      { id: "adjustment.request", label: "Request adjustments", description: "Raise plan adjustments" },
      { id: "adjustment.approve", label: "Approve adjustments", description: "Second-pair approval" },
    ],
  },
  {
    id: "products",
    label: "Products & rates",
    permissions: [
      { id: "product.manage", label: "Manage products", description: "Create, edit and publish products" },
      { id: "rate.propose", label: "Propose rate changes", description: "Raise a rate proposal" },
      { id: "rate.approve", label: "Approve rate changes", description: "Publish approved rates" },
    ],
  },
  {
    id: "growth",
    label: "Growth & care",
    permissions: [
      { id: "marketing.manage", label: "Manage campaigns", description: "Send campaigns and feed cards" },
      { id: "support.reply", label: "Reply to tickets", description: "Respond in the support desk" },
    ],
  },
  {
    id: "console",
    label: "Console administration",
    permissions: [
      { id: "admin.manage", label: "Manage admin users", description: "Invite, edit and suspend admins" },
      { id: "role.manage", label: "Manage roles", description: "Change role permissions" },
      { id: "audit.view", label: "View audit log", description: "Read the global audit trail" },
    ],
  },
];

export const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.id),
);

export function permissionLabel(id: string) {
  for (const group of PERMISSION_GROUPS) {
    const hit = group.permissions.find((p) => p.id === id);
    if (hit) return hit.label;
  }
  return id;
}

export const ADMIN_ROLES: AdminRole[] = [
  {
    id: "global-admin",
    name: "Global Admin",
    summary: "Full access across every console section, including role management.",
    members: 2,
    system: true,
    grants: ALL_PERMISSION_IDS,
  },
  {
    id: "operations",
    name: "Operations",
    summary: "Day-to-day money movement: withdrawals, reconciliation and adjustments.",
    members: 3,
    system: false,
    grants: [
      "users.view",
      "users.freeze",
      "txn.view",
      "withdrawal.process",
      "withdrawal.decline",
      "recon.resolve",
      "adjustment.request",
      "audit.view",
    ],
  },
  {
    id: "compliance",
    name: "Compliance",
    summary: "KYC decisions, AML investigations and regulatory reporting.",
    members: 2,
    system: false,
    grants: [
      "users.view",
      "users.freeze",
      "kyc.review",
      "kyc.decide",
      "aml.investigate",
      "aml.report",
      "txn.view",
      "audit.view",
    ],
  },
  {
    id: "finance",
    name: "Finance",
    summary: "Products, rates and second-pair approvals on financial changes.",
    members: 2,
    system: false,
    grants: [
      "txn.view",
      "recon.resolve",
      "product.manage",
      "rate.propose",
      "rate.approve",
      "adjustment.approve",
      "audit.view",
    ],
  },
  {
    id: "support",
    name: "Support",
    summary: "Customer care desk with read access to accounts and transactions.",
    members: 4,
    system: false,
    grants: ["users.view", "users.sessions", "txn.view", "support.reply", "marketing.manage"],
  },
  {
    id: "read-only",
    name: "Read only",
    summary: "View dashboards and records without any action rights.",
    members: 1,
    system: true,
    grants: ["users.view", "txn.view", "audit.view"],
  },
];

export function roleById(id: AdminRoleId) {
  return ADMIN_ROLES.find((r) => r.id === id);
}

export const ADMIN_MEMBERS: AdminMember[] = [
  {
    id: "adm-01",
    name: "Seyi Adeleke",
    email: "seyi@kipit.com",
    phone: "+234 803 111 2200",
    role: "global-admin",
    status: "active",
    department: "Executive",
    createdAt: "12 Jan 2026",
    lastActive: "Today, 12:31",
    twoFactor: true,
    makerChecker: true,
    actions30d: 412,
    createdBy: "System",
  },
  {
    id: "adm-02",
    name: "Ngozi Umeh",
    email: "ngozi@kipit.com",
    phone: "+234 802 445 7781",
    role: "compliance",
    status: "active",
    department: "Risk & Compliance",
    createdAt: "3 Feb 2026",
    lastActive: "Today, 11:58",
    twoFactor: true,
    makerChecker: true,
    actions30d: 268,
    createdBy: "Seyi Adeleke",
  },
  {
    id: "adm-03",
    name: "Tunde Bakare",
    email: "tunde@kipit.com",
    phone: "+234 806 220 4419",
    role: "operations",
    status: "active",
    department: "Operations",
    createdAt: "3 Feb 2026",
    lastActive: "Today, 10:04",
    twoFactor: true,
    makerChecker: false,
    actions30d: 531,
    createdBy: "Seyi Adeleke",
  },
  {
    id: "adm-04",
    name: "Amaka Obi",
    email: "amaka@kipit.com",
    phone: "+234 809 330 1188",
    role: "finance",
    status: "active",
    department: "Finance",
    createdAt: "22 Feb 2026",
    lastActive: "Yesterday, 17:40",
    twoFactor: true,
    makerChecker: true,
    actions30d: 149,
    createdBy: "Seyi Adeleke",
  },
  {
    id: "adm-05",
    name: "Ibrahim Sule",
    email: "ibrahim@kipit.com",
    phone: "+234 812 776 5540",
    role: "support",
    status: "active",
    department: "Customer care",
    createdAt: "9 Mar 2026",
    lastActive: "Today, 09:12",
    twoFactor: false,
    makerChecker: false,
    actions30d: 302,
    createdBy: "Ngozi Umeh",
  },
  {
    id: "adm-06",
    name: "Chioma Eze",
    email: "chioma@kipit.com",
    phone: "+234 815 908 2213",
    role: "support",
    status: "invited",
    department: "Customer care",
    createdAt: "28 Aug 2026",
    lastActive: "Invite pending",
    twoFactor: false,
    makerChecker: false,
    actions30d: 0,
    createdBy: "Ibrahim Sule",
  },
  {
    id: "adm-07",
    name: "Femi Adeyemi",
    email: "femi@kipit.com",
    phone: "+234 807 664 9903",
    role: "operations",
    status: "suspended",
    department: "Operations",
    createdAt: "17 Apr 2026",
    lastActive: "12 Aug 2026",
    twoFactor: true,
    makerChecker: false,
    actions30d: 18,
    createdBy: "Seyi Adeleke",
  },
  {
    id: "adm-08",
    name: "Grace Okon",
    email: "grace@kipit.com",
    phone: "+234 811 205 7788",
    role: "read-only",
    status: "active",
    department: "Internal audit",
    createdAt: "5 May 2026",
    lastActive: "Today, 08:20",
    twoFactor: true,
    makerChecker: false,
    actions30d: 64,
    createdBy: "Seyi Adeleke",
  },
];

export function memberById(id: string) {
  return ADMIN_MEMBERS.find((m) => m.id === id);
}

export const ADMIN_TEAM_TOTALS = {
  total: ADMIN_MEMBERS.length,
  active: ADMIN_MEMBERS.filter((m) => m.status === "active").length,
  invited: ADMIN_MEMBERS.filter((m) => m.status === "invited").length,
  suspended: ADMIN_MEMBERS.filter((m) => m.status === "suspended").length,
  twoFactorGap: ADMIN_MEMBERS.filter((m) => !m.twoFactor).length,
};

/* ── ADM-130 global audit log ─────────────────────────────────── */

export type AuditSeverity = "info" | "notice" | "critical";

export type AuditArea =
  | "auth"
  | "users"
  | "compliance"
  | "withdrawals"
  | "products"
  | "rates"
  | "reconciliation"
  | "marketing"
  | "console";

export type AuditEntry = {
  id: string;
  at: string;
  date: string;
  actor: string;
  role: string;
  area: AuditArea;
  action: string;
  target: string;
  ip: string;
  device: string;
  severity: AuditSeverity;
  before?: string;
  after?: string;
};

export const AUDIT_AREA_LABEL: Record<AuditArea, string> = {
  auth: "Authentication",
  users: "Users",
  compliance: "Compliance",
  withdrawals: "Withdrawals",
  products: "Products",
  rates: "Rates",
  reconciliation: "Reconciliation",
  marketing: "Marketing",
  console: "Console admin",
};

export const AUDIT_SEVERITY_TONE: Record<AuditSeverity, string> = {
  info: "bg-muted text-muted-foreground ring-border",
  notice: "bg-brand/10 text-brand ring-brand/20",
  critical: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: "aud-2201",
    at: "12:41",
    date: "4 Sep 2026",
    actor: "Tunde Bakare",
    role: "Operations",
    area: "withdrawals",
    action: "Processed withdrawal",
    target: "WDR-88213 · ₦1,250,000 · Adaeze Nwosu",
    ip: "102.89.34.19",
    device: "Chrome · macOS",
    severity: "critical",
    before: "Pending review",
    after: "Paid",
  },
  {
    id: "aud-2200",
    at: "12:18",
    date: "4 Sep 2026",
    actor: "Ngozi Umeh",
    role: "Compliance",
    area: "compliance",
    action: "Approved Tier 2 verification",
    target: "KYC-4412 · Bola Ajayi",
    ip: "102.89.34.44",
    device: "Chrome · Windows",
    severity: "notice",
    before: "Tier 1",
    after: "Tier 2",
  },
  {
    id: "aud-2199",
    at: "11:52",
    date: "4 Sep 2026",
    actor: "Amaka Obi",
    role: "Finance",
    area: "rates",
    action: "Approved rate change",
    target: "Kipit Fixed 90-day",
    ip: "197.210.70.8",
    device: "Safari · macOS",
    severity: "critical",
    before: "18.5% p.a.",
    after: "19.2% p.a.",
  },
  {
    id: "aud-2198",
    at: "11:20",
    date: "4 Sep 2026",
    actor: "Seyi Adeleke",
    role: "Global Admin",
    area: "console",
    action: "Invited admin user",
    target: "chioma@kipit.com · Support",
    ip: "102.89.34.2",
    device: "Chrome · macOS",
    severity: "notice",
  },
  {
    id: "aud-2197",
    at: "10:47",
    date: "4 Sep 2026",
    actor: "Ibrahim Sule",
    role: "Support",
    area: "users",
    action: "Revoked device session",
    target: "USR-2291 · Chidi Okafor",
    ip: "105.112.9.61",
    device: "Chrome · Windows",
    severity: "info",
  },
  {
    id: "aud-2196",
    at: "10:04",
    date: "4 Sep 2026",
    actor: "Tunde Bakare",
    role: "Operations",
    area: "reconciliation",
    action: "Resolved variance",
    target: "REC-3391 · ₦42,500 provider fee",
    ip: "102.89.34.19",
    device: "Chrome · macOS",
    severity: "notice",
  },
  {
    id: "aud-2195",
    at: "09:36",
    date: "4 Sep 2026",
    actor: "Ngozi Umeh",
    role: "Compliance",
    area: "users",
    action: "Froze customer account",
    target: "USR-1877 · Musa Danladi",
    ip: "102.89.34.44",
    device: "Chrome · Windows",
    severity: "critical",
    before: "Active",
    after: "Frozen",
  },
  {
    id: "aud-2194",
    at: "09:02",
    date: "4 Sep 2026",
    actor: "Seyi Adeleke",
    role: "Global Admin",
    area: "auth",
    action: "Signed in to console",
    target: "Admin console",
    ip: "102.89.34.2",
    device: "Chrome · macOS",
    severity: "info",
  },
  {
    id: "aud-2193",
    at: "17:44",
    date: "3 Sep 2026",
    actor: "Amaka Obi",
    role: "Finance",
    area: "products",
    action: "Published product",
    target: "Kipit Fixed 180-day",
    ip: "197.210.70.8",
    device: "Safari · macOS",
    severity: "notice",
    before: "Draft",
    after: "Live",
  },
  {
    id: "aud-2192",
    at: "16:30",
    date: "3 Sep 2026",
    actor: "Ibrahim Sule",
    role: "Support",
    area: "marketing",
    action: "Sent campaign",
    target: "September maturity reminder · 4,120 users",
    ip: "105.112.9.61",
    device: "Chrome · Windows",
    severity: "info",
  },
  {
    id: "aud-2191",
    at: "15:12",
    date: "3 Sep 2026",
    actor: "Femi Adeyemi",
    role: "Operations",
    area: "auth",
    action: "Failed sign-in (3 attempts)",
    target: "femi@kipit.com",
    ip: "41.203.78.15",
    device: "Unknown · Android",
    severity: "critical",
  },
  {
    id: "aud-2190",
    at: "14:05",
    date: "3 Sep 2026",
    actor: "Seyi Adeleke",
    role: "Global Admin",
    area: "console",
    action: "Updated role permissions",
    target: "Operations role · +Resolve reconciliation",
    ip: "102.89.34.2",
    device: "Chrome · macOS",
    severity: "critical",
  },
];

export const AUDIT_TOTALS = {
  today: AUDIT_LOG.filter((e) => e.date === "4 Sep 2026").length,
  critical: AUDIT_LOG.filter((e) => e.severity === "critical").length,
  actors: new Set(AUDIT_LOG.map((e) => e.actor)).size,
  retention: "7 years",
};
