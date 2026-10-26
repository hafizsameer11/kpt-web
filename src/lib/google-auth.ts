/**
 * Google Identity Services (GIS) — load once, request an ID token for Kipit API.
 *
 * Uses the Sign in with Google *button* flow with FedCM (not One Tap prompt
 * moment listeners, which Google is deprecating).
 *
 * Client ID: Vite `VITE_GOOGLE_CLIENT_ID` or runtime GET /v1/app/config.
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
    use_fedcm_for_button?: boolean;
    itp_support?: boolean;
  }) => void;
  prompt: (momentListener?: (notification: {
    isDismissedMoment: () => boolean;
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

function removeHost(host: HTMLElement | null) {
  try {
    host?.remove();
  } catch {
    /* ignore */
  }
}

/**
 * Show a short-lived overlay with the official Google button.
 * FedCM requires a real button gesture; we auto-click when possible,
 * and leave the overlay if the browser blocks the programmatic click.
 */
function presentGoogleButton(onCancel: () => void): {
  host: HTMLElement;
  clickOfficial: () => boolean;
} {
  const host = document.createElement("div");
  host.setAttribute("data-kipit-google-host", "1");
  host.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483000",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(8,16,40,0.55)",
    "padding:24px",
  ].join(";");

  const panel = document.createElement("div");
  panel.style.cssText = [
    "width:min(360px,100%)",
    "border-radius:16px",
    "background:#0b1c3f",
    "border:1px solid rgba(255,255,255,0.14)",
    "padding:20px",
    "box-shadow:0 18px 50px rgba(0,0,0,0.35)",
    "text-align:center",
  ].join(";");

  const title = document.createElement("p");
  title.textContent = "Continue with Google";
  title.style.cssText =
    "margin:0 0 6px;font:600 16px/1.3 system-ui,sans-serif;color:#fff";

  const hint = document.createElement("p");
  hint.textContent = "Choose your Google account to continue.";
  hint.style.cssText =
    "margin:0 0 16px;font:400 13px/1.4 system-ui,sans-serif;color:rgba(255,255,255,0.7)";

  const buttonMount = document.createElement("div");
  buttonMount.style.cssText = "display:flex;justify-content:center;min-height:44px";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.style.cssText = [
    "margin-top:14px",
    "border:0",
    "background:transparent",
    "color:rgba(255,255,255,0.65)",
    "font:600 13px/1 system-ui,sans-serif",
    "cursor:pointer",
  ].join(";");
  cancel.addEventListener("click", () => {
    removeHost(host);
    onCancel();
  });

  panel.append(title, hint, buttonMount, cancel);
  host.append(panel);
  document.body.appendChild(host);

  window.google!.accounts.id.renderButton(buttonMount, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    width: 280,
    logo_alignment: "left",
  });

  const clickOfficial = () => {
    const btn = buttonMount.querySelector("div[role=button]") as HTMLElement | null;
    if (!btn) return false;
    btn.click();
    return true;
  };

  return { host, clickOfficial };
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

  // Drop any leftover overlay from a prior attempt.
  document.querySelectorAll("[data-kipit-google-host]").forEach((el) => el.remove());

  return new Promise((resolve, reject) => {
    let settled = false;
    let host: HTMLElement | null = null;
    const timeout = window.setTimeout(() => {
      finish(
        new Error(
          "Google sign-in timed out. If your browser blocked third-party sign-in, enable it for this site and try again.",
        ),
      );
    }, 120_000);

    const finish = (err?: Error, token?: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      removeHost(host);
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
      // FedCM button UX on Chrome (avoids deprecated One Tap prompt listeners).
      use_fedcm_for_button: true,
      itp_support: true,
    });

    try {
      const ui = presentGoogleButton(() =>
        finish(new Error("Google sign-in was cancelled.")),
      );
      host = ui.host;
      // Same user gesture as "Continue with Google" — try to open the picker immediately.
      window.requestAnimationFrame(() => {
        ui.clickOfficial();
      });
    } catch {
      finish(
        new Error(
          "Google sign-in could not open. Allow third-party sign-in for this site and try again.",
        ),
      );
    }
  });
}

export function isGoogleSignInConfigured() {
  return Boolean(getGoogleClientId());
}
