/**
 * Admin console authentication fixtures (ADM-001 – ADM-003).
 * Prototype only: session state lives in localStorage, no backend calls.
 */

export const ADMIN_EMAIL = "seyi.adeleke@kipit.com";
export const ADMIN_PASSWORD = "Kipit1234!";
export const ADMIN_OTP = "123456";
/** ADM-003 — short PIN used to re-enter a locked session on a trusted device. */
export const ADMIN_PIN = "2468";

const KEY = "kipit.admin.session";

export type AdminSession = {
  email: string;
  name: string;
  role: string;
  signedInAt: number;
  locked: boolean;
};

const DEFAULT_OPERATOR = { name: "Seyi Adeleke", role: "Global Admin" };

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function write(session: AdminSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
  else window.localStorage.removeItem(KEY);
}

export function getAdminSession() {
  return read();
}

export function isAdminSignedIn() {
  const s = read();
  return Boolean(s && !s.locked);
}

export function startAdminSession(email: string) {
  write({
    email,
    name: DEFAULT_OPERATOR.name,
    role: DEFAULT_OPERATOR.role,
    signedInAt: Date.now(),
    locked: false,
  });
}

export function lockAdminSession() {
  const s = read();
  if (s) write({ ...s, locked: true });
}

export function unlockAdminSession() {
  const s = read();
  if (s) write({ ...s, locked: false, signedInAt: Date.now() });
}

export function endAdminSession() {
  write(null);
}

/** Minutes of inactivity before the console auto-locks (ADM-003). */
export const ADMIN_IDLE_MINUTES = 15;
