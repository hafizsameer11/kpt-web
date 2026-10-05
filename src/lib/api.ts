/**
 * Thin client for kipit-api. Keeps tokens in localStorage; UI components stay unchanged.
 */

const TOKEN_KEY = "kipit:accessToken";
const REFRESH_KEY = "kipit:refreshToken";
const USER_KEY = "kipit:user";
const LOGGED_OUT_KEY = "kipit:explicit-logout";

export const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "https://kipit-backend.amctraders.online";

export type ApiUser = {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  kycTier: "TIER_0" | "TIER_1" | "TIER_2";
  hasPin?: boolean;
};

export type ApiSession = {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    if (code !== undefined) this.code = code;
  }
}

const isBrowser = () => typeof window !== "undefined";
const authListeners = new Set<() => void>();
let refreshInFlight: Promise<boolean> | null = null;

export function subscribeAuth(listener: () => void) {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function emitAuth() {
  authListeners.forEach((l) => l());
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  } catch {
    return null;
  }
}

export function setSession(input: {
  accessToken: string;
  refreshToken?: string;
  user?: ApiUser;
}) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, input.accessToken);
  if (input.refreshToken) window.localStorage.setItem(REFRESH_KEY, input.refreshToken);
  if (input.user) window.localStorage.setItem(USER_KEY, JSON.stringify(input.user));
  window.localStorage.removeItem(LOGGED_OUT_KEY);
  emitAuth();
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  emitAuth();
}

export function isAuthenticated() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function wasExplicitLogout() {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(LOGGED_OUT_KEY) === "1";
}

async function refreshAccessToken(): Promise<boolean> {
  if (!isBrowser()) return false;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { accessToken: string; refreshToken?: string; user?: ApiUser };
      };
      if (!res.ok || !json.data?.accessToken) {
        clearSession();
        return false;
      }
      setSession({
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        user: json.data.user,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Cold-start restore: refresh if access expired. */
export async function restoreSession(): Promise<boolean> {
  if (!isBrowser() || wasExplicitLogout()) return false;
  if (!getAccessToken() && !getRefreshToken()) return false;
  try {
    await api<{ user: ApiUser }>("/v1/auth/me");
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const ok = await refreshAccessToken();
      if (!ok) {
        clearSession();
        return false;
      }
      try {
        await api<{ user: ApiUser }>("/v1/auth/me");
        return true;
      } catch {
        clearSession();
        return false;
      }
    }
    return Boolean(getAccessToken() || getRefreshToken());
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { auth?: boolean; _retried?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init.auth !== false) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && init.auth !== false && !init._retried && path !== "/v1/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return api<T>(path, { ...init, _retried: true });
    }
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: { message?: string; code?: string };
  };

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.error?.message ?? `Request failed (${res.status})`,
      json.error?.code,
    );
  }

  return (json.data ?? json) as T;
}

export async function loginWithPassword(email: string, password: string) {
  const data = await api<{
    accessToken: string;
    refreshToken?: string;
    user: ApiUser;
  }>("/v1/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setSession(data);
  return data;
}

export async function fetchMe() {
  return api<{ user: ApiUser; wallet: { balance: number } }>("/v1/auth/me");
}

export async function logout() {
  try {
    if (getAccessToken()) {
      await api<void>("/v1/auth/logout", { method: "POST" });
    }
  } catch {
    /* still clear local session */
  }
  if (isBrowser()) window.localStorage.setItem(LOGGED_OUT_KEY, "1");
  clearSession();
}

export async function fetchSessions() {
  return api<{ currentSessionId: string; sessions: ApiSession[] }>("/v1/auth/sessions");
}

export async function revokeSession(sessionId: string) {
  await api<void>(`/v1/auth/sessions/${sessionId}`, { method: "DELETE" });
}

export async function logoutOtherSessions() {
  const data = await fetchSessions();
  await Promise.all(
    data.sessions
      .filter((s) => s.id !== data.currentSessionId)
      .map((s) => revokeSession(s.id).catch(() => undefined)),
  );
  return fetchSessions();
}

export async function registerAccount(input: {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  surname: string;
  referralCode?: string;
  dateOfBirth?: string;
  phone?: string;
  biometricsLogin?: boolean;
  biometricsTxn?: boolean;
}) {
  return api<{ user: ApiUser; otp?: { debugCode?: string } }>("/v1/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  });
}

/** Fire-and-forget signup funnel step for admin drop-off analytics. */
export async function logSignupFunnel(input: {
  step: string;
  email?: string;
  phone?: string;
  deviceId?: string;
  completed?: boolean;
}) {
  try {
    await api<{ id: string | null; ok: boolean }>("/v1/auth/funnel", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input),
    });
  } catch {
    /* never block signup UX */
  }
}

export async function verifySignupOtp(email: string, code: string) {
  return api<{ verified: boolean }>("/v1/auth/otp/verify", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ target: email, purpose: "SIGNUP", code }),
  });
}

export async function setTransactionPin(pin: string, confirmPin: string) {
  return api<{ user: ApiUser }>("/v1/auth/pin", {
    method: "POST",
    body: JSON.stringify({ pin, confirmPin }),
  });
}

/** Register → login → set PIN. Mirrors mobile completeSignup. */
export async function completeSignup(input: {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  surname: string;
  referralCode?: string;
  pin: string;
  biometricsLogin?: boolean;
  biometricsTxn?: boolean;
  dateOfBirth?: string;
  phone?: string;
}) {
  try {
    await registerAccount({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      ...(input.middleName ? { middleName: input.middleName } : {}),
      surname: input.surname,
      ...(input.referralCode ? { referralCode: input.referralCode } : {}),
      ...(input.biometricsLogin != null ? { biometricsLogin: input.biometricsLogin } : {}),
      ...(input.biometricsTxn != null ? { biometricsTxn: input.biometricsTxn } : {}),
      ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
    });
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 409)) throw err;
  }
  await loginWithPassword(input.email, input.password);
  await setTransactionPin(input.pin, input.pin);
}

export async function fetchWallet() {
  return api<{ balance: number; balanceKobo: string; currency: string }>("/v1/wallet");
}

export async function sandboxDeposit(amount: number, idempotencyKey: string) {
  return api<{
    wallet: { balance: number; balanceKobo: string };
    entry: { reference: string };
  }>("/v1/wallet/sandbox/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, idempotencyKey, provider: "manual" }),
  });
}

export async function fetchVirtualAccount() {
  return api<{
    bank: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    provider: string;
  }>("/v1/wallet/virtual-account");
}

export async function confirmTransferFunding(amount: number) {
  return api<{
    reference?: string;
    amount?: number;
    wallet?: { balance: number };
    pending?: boolean;
    alreadyProcessed?: boolean;
  }>("/v1/wallet/fund/transfer/confirm", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function initializeCardFunding(amount: number, opts?: { cardTokenId?: string; saveCard?: boolean }) {
  return api<{
    reference: string;
    amount: number;
    fee: number;
    total: number;
    authorizationUrl: string;
    publicKey?: string;
    accessCode?: string;
    mock?: boolean;
  }>("/v1/wallet/fund/card/initialize", {
    method: "POST",
    body: JSON.stringify({
      amount,
      cardTokenId: opts?.cardTokenId,
      saveCard: opts?.saveCard ?? true,
    }),
  });
}

export async function confirmCardFunding(reference: string) {
  return api<{
    reference: string;
    amount: number;
    wallet: { balance: number };
    alreadyProcessed?: boolean;
  }>("/v1/wallet/fund/card/confirm", {
    method: "POST",
    body: JSON.stringify({ reference }),
  });
}

export async function fetchSavedCards() {
  return api<{ id: string; brand: string; last4: string; bank: string }[]>("/v1/wallet/cards");
}

export async function fetchHome() {
  return api<{
    greetingName: string;
    interestThisWeek: number;
    interestToday?: number;
    /** Mon→Sun Call interest (Africa/Lagos), naira. */
    interestWeekSeries?: number[];
    wallet: { balance: number };
    invested: { balance: number };
    total: { balance: number };
    kycTier: ApiUser["kycTier"];
    nextMaturity: {
      id: string;
      name: string;
      amount: number;
      date: string;
      daysLeft: number;
      tenorDays?: number | null;
      ratePct?: number;
      startDate?: string;
      accrued?: number;
    } | null;
    holdings: {
      id: string;
      name: string;
      amount: number;
      ratePct: number;
      maturityDate: string | null;
    }[];
    feed: { id: string; tag?: string; title: string; body?: string }[];
    user: ApiUser;
  }>("/v1/me/home");
}

export async function fetchProfile() {
  return api<{
    id: string;
    email: string;
    phone: string | null;
    firstName: string;
    middleName: string | null;
    surname: string;
    kycTier: ApiUser["kycTier"];
    dateOfBirth: string | null;
    gender: string | null;
    occupation: string | null;
    employmentStatus: string | null;
    sourceOfFunds: string | null;
    address: {
      street: string | null;
      city: string | null;
      state: string | null;
      lga: string | null;
      pending: boolean;
    };
    lockedFields: string[];
  }>("/v1/settings/profile");
}

export async function fetchCallAccount() {
  return api<{ balance: number; ratePct: number }>("/v1/invest/call");
}

export async function fetchReferrals() {
  return api<{
    code: string;
    link: string;
    successfulReferrals: number;
    totalReferrals: number;
    rewardsEarned: number;
    people: {
      id: string;
      name: string;
      joined: string;
      status: "rewarded" | "pending" | string;
      note: string;
      reward: number;
    }[];
  }>("/v1/settings/referrals");
}

/** Name-check only — does not persist a payout bank (prefer before Confirm). */
export async function resolvePayoutAccount(input: {
  bankCode: string;
  accountNumber: string;
}) {
  return api<{
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    nameMatched: boolean;
    matchScore?: number;
  }>("/v1/withdraw/accounts/resolve", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createPayoutAccount(input: { bankCode: string; accountNumber: string }) {
  return api<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    nameMatched: boolean;
  }>("/v1/withdraw/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deletePayoutAccount(id: string) {
  return api<{ ok: boolean }>(`/v1/withdraw/accounts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createWithdrawal(input: {
  payoutBankId: string;
  amount: number;
  pin: string;
  idempotencyKey: string;
}) {
  return api<{ id: string; status: string; reference: string }>("/v1/withdraw", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchPayoutBanks() {
  return api<{ code: string; name: string }[]>("/v1/withdraw/banks");
}

export async function fetchPayoutAccounts() {
  return api<
    {
      id: string;
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }[]
  >("/v1/withdraw/accounts");
}

export async function fetchWithdrawals() {
  return api<
    {
      id: string;
      reference: string;
      status: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      declineReason: string | null;
      createdAt: string;
    }[]
  >("/v1/withdraw");
}

export async function fetchWithdrawal(id: string) {
  return api<{
    id: string;
    reference: string;
    status: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    declineReason: string | null;
    createdAt: string;
    processedAt: string | null;
  }>(`/v1/withdraw/${id}`);
}

export async function submitBvn(bvn: string) {
  return api<{
    match: "strong" | "partial" | "mismatch" | "pending";
    score: number;
    bvnName: string;
    profileId?: string;
    pending?: boolean;
  }>("/v1/kyc/bvn", {
    method: "POST",
    body: JSON.stringify({ bvn }),
  });
}

export async function confirmBvn() {
  return api<{ tier: ApiUser["kycTier"] }>("/v1/kyc/bvn/confirm", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchKyc() {
  return api<{
    tier: ApiUser["kycTier"];
    status: string;
    profile?: {
      bvn: string | null;
      bvnName: string | null;
      nin: string | null;
      ninName?: string | null;
      rejectionReason: string | null;
      livenessPassed?: boolean;
      hasSelfie?: boolean;
      hasAddressDoc?: boolean;
      ninProviderStatus?: string | null;
      bvnProviderStatus?: string | null;
    };
  }>("/v1/kyc");
}

export async function sendChatMessage(text: string, sessionId?: string) {
  return api<{
    sessionId: string;
    message: { role: string; text: string; blocks?: unknown[] };
  }>("/v1/chat/message", {
    method: "POST",
    body: JSON.stringify({ text, sessionId }),
  });
}

/** True when a session exists. Never auto-logs a demo user. */
export async function ensurePaymentSession() {
  return isAuthenticated();
}

export async function callDeposit(amount: number, pin: string, idempotencyKey: string) {
  return api<{ balance: number }>("/v1/invest/call/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, pin, idempotencyKey }),
  });
}

export async function callWithdraw(amount: number, pin: string, idempotencyKey: string) {
  return api<{ walletBalance: number }>("/v1/invest/call/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount, pin, idempotencyKey }),
  });
}

export function tierNumber(tier: ApiUser["kycTier"] | string | undefined): 0 | 1 | 2 {
  if (tier === "TIER_2") return 2;
  if (tier === "TIER_1") return 1;
  return 0;
}

export async function requestOtp(
  target: string,
  purpose: "SIGNUP" | "LOGIN" | "PASSWORD_RESET" | "PIN_RESET",
) {
  return api<{ debugCode?: string }>("/v1/auth/otp/request", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ target, purpose }),
  });
}

export async function verifyOtp(
  target: string,
  purpose: "SIGNUP" | "LOGIN" | "PASSWORD_RESET" | "PIN_RESET",
  code: string,
  options?: { peek?: boolean },
) {
  return api<{ verified: boolean }>("/v1/auth/otp/verify", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      target,
      purpose,
      code,
      ...(options?.peek ? { peek: true } : {}),
    }),
  });
}

/** True when no account exists for this email (safe to start signup). */
export async function checkEmailAvailable(email: string) {
  return api<{ available: boolean }>(
    `/v1/auth/email-available?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    { auth: false },
  );
}

export async function validateReferralCode(code: string) {
  return api<{ valid: boolean; code?: string; inviterFirstName?: string }>(
    `/v1/auth/referral/${encodeURIComponent(code.trim().toUpperCase())}`,
    { auth: false },
  );
}

export function isValidEmailFormat(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export type ApiExploreProduct = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  description?: string;
  ratePct: number;
  tenorDays: number;
  minimum: number;
  availability: string;
  issuer: string;
  largeTicket?: boolean;
  category: { slug: string; name: string };
  termsVersion?: string;
};

export type ApiExploreCategory = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

export async function fetchExploreProducts() {
  return api<ApiExploreProduct[]>("/v1/explore/products", { auth: false });
}

export async function fetchExploreCategories() {
  return api<ApiExploreCategory[]>("/v1/explore/categories", { auth: false });
}

export type ApiRateBand = {
  id: string;
  code: string;
  label: string;
  minDays: number;
  maxDays: number | null;
  rateBps: number;
  ratePct: number;
  /** Investment minimum in naira (from /v1/invest/rates). */
  minimum?: number;
};

export async function fetchInvestRates() {
  return api<ApiRateBand[]>("/v1/invest/rates", { auth: false });
}

export async function fetchHomeFeed() {
  return api<{ id: string; tag?: string | null; title: string; body?: string | null }[]>(
    "/v1/home/feed",
  );
}

export type ApiGift = {
  id: string;
  recipient: string;
  phone: string;
  product: string;
  tenor: string;
  rate: string;
  amount: number;
  message: string;
  sentDate: string;
  claimedDate?: string;
  expiresDate?: string;
  status: "Pending" | "Claimed" | "Expired";
  maturityDate: string;
  expectedPayout: number;
  claimCode?: string;
  direction?: string;
  claimLink?: string;
};

export async function fetchGifts() {
  return api<ApiGift[]>("/v1/gifts");
}

export async function fetchGift(id: string) {
  return api<ApiGift>(`/v1/gifts/${id}`);
}

export async function createGift(input: {
  amount: number;
  recipientPhone: string;
  recipientName?: string;
  message?: string;
  tenorDays?: number;
  pin: string;
}) {
  return api<{
    id: string;
    claimCode: string;
    claimLink: string;
    amount: number;
    status: string;
    tenorDays?: number;
  }>("/v1/gifts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function previewGiftClaim(code: string) {
  return api<{
    claimCode: string;
    amount: number;
    message: string;
    recipientName: string | null;
    senderFirstName: string;
    tenorDays: number;
    status: string;
    expiresDate: string | null;
    claimLink: string;
    expectedInterest?: number;
    ratePct?: number;
  }>(`/v1/gifts/claim/${encodeURIComponent(code)}`, { auth: false });
}

export async function claimGift(claimCode: string) {
  return api<{
    giftId: string;
    claimCode: string;
    placementId: string;
    amount: number;
    tenorDays: number;
    ratePct: number;
    maturityDate: string;
  }>("/v1/gifts/claim", {
    method: "POST",
    body: JSON.stringify({ claimCode }),
  });
}

export async function claimPendingGifts() {
  return api<{ claimed: number; gifts: unknown[] }>("/v1/gifts/claim-pending", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export type ApiAutoInvestRule = {
  id: string;
  label: string;
  amount: number;
  dayOfMonth: number;
  active: boolean;
  frequency?:
    | "Every 10 minutes"
    | "Every hour"
    | "Weekly"
    | "Every 2 weeks"
    | "Monthly";
  nextRun?: string | null;
};

export async function fetchAutoInvestRules() {
  return api<ApiAutoInvestRule[]>("/v1/invest/auto-invest");
}

export async function createAutoInvestRule(input: {
  label: string;
  amount: number;
  dayOfMonth: number;
  frequency?:
    | "Every 10 minutes"
    | "Every hour"
    | "Weekly"
    | "Every 2 weeks"
    | "Monthly";
}) {
  return api<{ id: string; frequency?: string; nextRun?: string | null }>(
    "/v1/invest/auto-invest",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function emailStatement(input: {
  kind: "Account statement" | "Transaction statement" | "Portfolio statement";
  from: string;
  to: string;
  filename?: string;
  contentBase64: string;
  contentType?: "text/html" | "application/pdf" | "application/octet-stream";
  summary?: string;
}) {
  return api<{ ok: boolean; messageId: string; provider: string }>(
    "/v1/settings/statements/email",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function patchAutoInvestRule(id: string, input: { active: boolean }) {
  return api<ApiAutoInvestRule>(`/v1/invest/auto-invest/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type ApiNotificationPrefs = {
  emailDeposits: boolean;
  emailWithdrawals: boolean;
  emailInvestments: boolean;
  emailMaturities: boolean;
  emailDigest: boolean;
  emailMarketing: boolean;
  pushDeposits: boolean;
  pushWithdrawals: boolean;
  pushInvestments: boolean;
  pushMaturities: boolean;
  pushProducts: boolean;
  pushSecurity: boolean;
  pushKyc: boolean;
};

export async function fetchNotificationPrefs() {
  return api<ApiNotificationPrefs>("/v1/settings/notification-prefs");
}

export async function patchNotificationPrefs(input: Partial<ApiNotificationPrefs>) {
  return api<ApiNotificationPrefs>("/v1/settings/notification-prefs", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createSupportTicket(input: {
  category: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
}) {
  return api<{
    id: string;
    status: string;
    category: string;
    subject: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    createdAt: string;
  }>("/v1/settings/help/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadSupportAttachment(input: {
  contentType: string;
  dataBase64: string;
  filename?: string;
}) {
  return api<{
    url: string;
    path: string;
    bytes: number;
    filename: string;
  }>("/v1/settings/help/attachments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type ApiSupportTicketMessage = {
  id: string;
  author: "USER" | "SUPPORT" | "SYSTEM" | string;
  body: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
};

export type ApiSupportTicket = {
  id: string;
  category: string;
  subject: string;
  body: string;
  status: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ApiSupportTicketMessage[];
};

export async function fetchSupportTickets() {
  return api<ApiSupportTicket[]>("/v1/settings/help/tickets");
}

export async function fetchSupportTicket(id: string) {
  return api<ApiSupportTicket>(`/v1/settings/help/tickets/${id}`);
}

export async function fetchPlacements() {
  return api<
    {
      id: string;
      kind: string;
      name: string;
      status: string;
      principal: number;
      ratePct: number;
      tenorDays: number;
      startDate?: string;
      maturityDate: string | null;
      accrued: number;
      expectedInterest?: number | null;
    }[]
  >("/v1/invest/placements");
}

export async function fetchNotifications() {
  return api<
    {
      id: string;
      title: string;
      body: string;
      href: string | null;
      read: boolean;
      createdAt: string;
    }[]
  >("/v1/settings/notifications");
}

export async function markNotificationRead(id: string) {
  return api<{ ok: boolean }>(`/v1/settings/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function fetchPortfolioTransactions() {
  return api<
    {
      id: string;
      reference: string;
      kind: string;
      description: string;
      amount: number;
      direction: "credit" | "debit";
      createdAt: string;
      accountType?: string | null;
    }[]
  >("/v1/portfolio/transactions");
}

export async function fetchRecentWalletCredits(afterIso: string) {
  const q = encodeURIComponent(afterIso);
  return api<{
    wallet: { balance: number };
    credits: {
      reference: string;
      amount: number;
      channel: string;
      completedAt: string | null;
    }[];
  }>(`/v1/wallet/fund/credits/recent?after=${q}`);
}

export async function deleteSavedCard(id: string) {
  return api<{ ok: boolean }>(`/v1/wallet/cards/${id}`, { method: "DELETE" });
}

export async function createFixedPlan(input: {
  amount: number;
  tenorDays: number;
  name: string;
  pin: string;
  maturityInstruction?: "WALLET" | "ROLLOVER" | "PAYOUT";
  idempotencyKey: string;
  isGift?: boolean;
}) {
  return api<{
    id: string;
    name: string;
    amount: number;
    ratePct: number;
    tenorDays: number;
    maturityDate: string;
    expectedInterest: number;
  }>("/v1/invest/fixed-plans", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function subscribeExploreProduct(input: {
  productId: string;
  amount: number;
  pin: string;
  idempotencyKey: string;
}) {
  return api<{
    id: string;
    productId: string;
    amount: number;
    maturityDate: string;
    expectedInterest: number;
  }>(`/v1/explore/products/${input.productId}/subscribe`, {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      pin: input.pin,
      idempotencyKey: input.idempotencyKey,
    }),
  });
}

export async function requestExploreAccess(productId: string, message?: string) {
  return api<{ id: string; status: string }>(`/v1/explore/products/${productId}/request-access`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function uploadKycDocument(input: {
  kind: "selfie" | "address";
  contentType: string;
  dataBase64: string;
}) {
  return api<{
    url: string;
    path: string;
    bytes: number;
    kind: "selfie" | "address";
  }>("/v1/kyc/documents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function submitTier2(input: {
  nin: string;
  occupation: string;
  employmentStatus: string;
  sourceOfFunds: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressLga: string;
  selfieUri: string;
  addressDocUri: string;
}) {
  return api<{
    tier: string;
    status: string;
    profile: {
      bvn: string | null;
      bvnName: string | null;
      nin: string | null;
      rejectionReason: string | null;
      livenessPassed?: boolean;
      hasSelfie?: boolean;
      hasAddressDoc?: boolean;
      ninProviderStatus?: string | null;
    };
  }>("/v1/kyc/tier2", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyTransactionPin(pin: string) {
  return api<{ ok: boolean }>("/v1/settings/pin/verify", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export async function changeTransactionPin(input: {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}) {
  return api<{ ok: boolean }>("/v1/settings/pin/change", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type AppPublicConfig = {
  support: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  featureFlags?: {
    askAi?: boolean;
    autoInvest?: boolean;
    giftInvest?: boolean;
    explore?: boolean;
  };
};

export async function fetchAppConfig() {
  const data = await api<AppPublicConfig>("/v1/app/config", { auth: false });
  const maintenance = data?.maintenance ?? { enabled: false, message: "" };
  return {
    ...data,
    support: {
      phone: String(data?.support?.phone || ""),
      whatsapp: String(data?.support?.whatsapp || "").replace(/\D/g, ""),
      email: String(data?.support?.email || ""),
    },
    maintenance: {
      enabled:
        maintenance.enabled === true ||
        (maintenance as { enabled?: unknown }).enabled === 1 ||
        String((maintenance as { enabled?: unknown }).enabled).toLowerCase() === "true",
      message: String(maintenance.message || ""),
    },
    featureFlags: {
      askAi: data?.featureFlags?.askAi !== false,
      autoInvest: data?.featureFlags?.autoInvest !== false,
      giftInvest: data?.featureFlags?.giftInvest !== false,
      explore: data?.featureFlags?.explore !== false,
    },
  };
}

/** Build a WhatsApp deep link from an admin-configured number (digits / + / spaces OK). */
export function buildWhatsAppSupportUrl(
  whatsapp: string,
  text = "Hi Kipit, I'd like some help with my account.",
) {
  const digits = String(whatsapp || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export async function requestPinReset(dateOfBirth: string) {
  return api<{
    sent: boolean;
    targetHint: string;
    expiresAt: string;
    debugCode?: string;
  }>("/v1/settings/pin/reset/request", {
    method: "POST",
    body: JSON.stringify({ dateOfBirth }),
  });
}

export async function resetTransactionPin(input: {
  code: string;
  newPin: string;
  confirmPin: string;
}) {
  return api<{ ok: boolean }>("/v1/settings/pin/reset", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(input: {
  target: string;
  code: string;
  password: string;
}) {
  return api<{ ok: boolean }>("/v1/auth/password/reset", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  });
}

export async function patchProfile(input: {
  phone?: string;
  occupation?: string;
  employmentStatus?: string;
  sourceOfFunds?: string;
  dateOfBirth?: string;
  gender?: string;
  firstName?: string;
  middleName?: string | null;
  surname?: string;
}) {
  return api<ApiUser>("/v1/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function patchAddress(input: {
  street: string;
  city: string;
  state: string;
  lga: string;
}) {
  return api<{
    street: string | null;
    city: string | null;
    state: string | null;
    lga: string | null;
    pending: boolean;
  }>("/v1/settings/address", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function fetchPortfolioHolding(id: string) {
  return api<{
    id: string;
    name: string;
    kind: string;
    status: string;
    principal: number;
    ratePct: number;
    tenorDays: number;
    startDate?: string;
    maturityDate: string | null;
    accrued: number;
    expectedInterest?: number | null;
    maturityInstruction?: string | null;
    documents?: { name: string; meta?: string; url?: string }[];
  }>(`/v1/portfolio/holdings/${id}`);
}

export async function patchHoldingMaturity(
  id: string,
  maturityInstruction: "WALLET" | "ROLLOVER" | "PAYOUT",
) {
  return api<{ ok: boolean }>(`/v1/portfolio/holdings/${id}/maturity`, {
    method: "PATCH",
    body: JSON.stringify({ maturityInstruction }),
  });
}

export async function replySupportTicket(
  id: string,
  body: string,
  attachment?: { attachmentUrl: string; attachmentName?: string },
) {
  return api<ApiSupportTicketMessage>(`/v1/settings/help/tickets/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      body,
      ...(attachment?.attachmentUrl
        ? {
            attachmentUrl: attachment.attachmentUrl,
            attachmentName: attachment.attachmentName,
          }
        : {}),
    }),
  });
}

/** Read a File as base64 (no data: prefix) for KYC upload. */
export function fileToBase64(file: File): Promise<{ contentType: string; dataBase64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const match = /^data:([^;]+);base64,(.+)$/i.exec(result);
      if (match) {
        resolve({ contentType: match[1] || file.type || "image/jpeg", dataBase64: match[2]! });
        return;
      }
      const raw = result.includes(",") ? result.split(",")[1]! : result;
      resolve({ contentType: file.type || "image/jpeg", dataBase64: raw });
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

