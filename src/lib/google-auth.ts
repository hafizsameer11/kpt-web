/**
 * Google Identity Services (GIS) — load once, request an ID token for Kipit API.
 *
 * Client ID can come from Vite build env OR runtime GET /v1/app/config
 * (API GOOGLE_CLIENT_ID). Prefer runtime so production works without baking
 * VITE_GOOGLE_CLIENT_ID into every deploy.
 */

const GOOGLE_CLIENT_ID_ENV =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_GOOGLE_CLIENT_ID?: string } }).env
      ?.VITE_GOOGLE_CLIENT_ID) ||
  "";

let runtimeGoogleClientId = "";

export function setRuntimeGoogleClientId(id: string | undefined | null) {
  if (typeof id === "string" && id.trim()) {
    runtimeGoogleClientId = id.trim();
  }
}

export function getGoogleClientId() {
  return (GOOGLE_CLIENT_ID_ENV.trim() || runtimeGoogleClientId).trim();
}

/** Resolve client ID from env or public app config. */
export async function resolveGoogleClientId() {
  const existing = getGoogleClientId();
  if (existing) return existing;
  try {
    const { fetchAppConfig } = await import("@/lib/api");
    await fetchAppConfig();
  } catch {
    /* ignore */
  }
  return getGoogleClientId();
}

/** @deprecated Prefer getGoogleClientId() — kept as alias for older imports. */
export const GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID_ENV;

type CredentialResponse = { credential?: string; select_by?: string };

type GoogleAccountsId = {
  initialize: (cfg: {
    client_id: string;
    callback: (res: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (momentListener?: (notification: {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    isDismissedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
    getDismissedReason?: () => string;
  }) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number | boolean>,
  ) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGisScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Could not load Google sign-in.")),
      );
      if (window.google?.accounts?.id) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Returns a Google ID token, or throws a user-facing Error. */
export async function requestGoogleIdToken(): Promise<string> {
  const clientId = await resolveGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured yet.");
  }
  await loadGisScript();
  if (!window.google?.accounts?.id) {
    throw new Error("Google sign-in is unavailable. Refresh and try again.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error, token?: string) => {
      if (settled) return;
      settled = true;
      try {
        window.google?.accounts.id.cancel();
      } catch {
        /* ignore */
      }
      if (err) reject(err);
      else resolve(token!);
    };

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        if (res.credential) finish(undefined, res.credential);
        else finish(new Error("Google did not return a credential. Try again."));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const host = document.createElement("div");
        host.style.position = "fixed";
        host.style.left = "-9999px";
        host.style.top = "0";
        document.body.appendChild(host);
        try {
          window.google!.accounts.id.renderButton(host, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 280,
          });
          const btn = host.querySelector("div[role=button]") as HTMLElement | null;
          if (btn) {
            btn.click();
            window.setTimeout(() => host.remove(), 4000);
          } else {
            host.remove();
            finish(
              new Error(
                "Google sign-in could not open. Allow popups for this site and try again.",
              ),
            );
          }
        } catch {
          host.remove();
          finish(new Error("Google sign-in could not open. Try again."));
        }
      } else if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason?.() || "";
        if (reason === "credential_returned") return;
        finish(new Error("Google sign-in was cancelled."));
      }
    });
  });
}

export function isGoogleSignInConfigured() {
  return Boolean(getGoogleClientId());
}
