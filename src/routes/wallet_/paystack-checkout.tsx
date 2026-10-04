import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { naira } from "@/lib/home-data";
import {
  clearPaystackCheckout,
  isPaystackCancelUrl,
  isPaystackReturnUrl,
  readPaystackCheckout,
} from "@/lib/paystack-checkout";

export const Route = createFileRoute("/wallet_/paystack-checkout")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    ref: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Secure Card Checkout | Kipit" },
      {
        name: "description",
        content: "Complete your Kipit wallet top-up securely — stay in Kipit.",
      },
    ],
  }),
  component: PaystackCheckoutScreen,
});

/** In-app Paystack Checkout — mirrors mobile WebView (stay in Kipit). */
function PaystackCheckoutScreen() {
  const navigate = useNavigate();
  const { amount: amountSearch, ref: refSearch } = Route.useSearch();
  const [session, setSession] = useState(() =>
    typeof window !== "undefined" ? readPaystackCheckout() : null,
  );
  const authorizationUrl = session?.authorizationUrl ?? "";
  const reference = session?.reference || refSearch || "";
  const amount = session?.amount || amountSearch || 0;

  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(typeof window !== "undefined");
  const doneRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setSession(readPaystackCheckout());
    setReady(true);
  }, []);

  const finishSuccess = useCallback(
    (url?: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      clearPaystackCheckout();
      if (url) {
        try {
          const parsed = new URL(url, window.location.origin);
          const ref =
            parsed.searchParams.get("reference") ||
            parsed.searchParams.get("trxref") ||
            parsed.searchParams.get("ref") ||
            reference;
          void navigate({
            to: "/wallet/processing",
            search: {
              amount,
              method: "card",
              ref: ref || reference,
            },
            replace: true,
          });
          return;
        } catch {
          /* fall through */
        }
      }
      void navigate({
        to: "/wallet/processing",
        search: { amount, method: "card", ref: reference },
        replace: true,
      });
    },
    [amount, navigate, reference],
  );

  const finishCancel = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearPaystackCheckout();
    void navigate({
      to: "/wallet/failed",
      search: { amount, reason: "auth" },
      replace: true,
    });
  }, [amount, navigate]);

  /** When Paystack redirects the iframe back to Kipit (same origin), promote to top. */
  const inspectFrame = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const href = frame.contentWindow?.location?.href ?? "";
      if (!href || href === "about:blank") return;
      if (isPaystackCancelUrl(href)) {
        finishCancel();
        return;
      }
      if (isPaystackReturnUrl(href, reference)) {
        finishSuccess(href);
      }
    } catch {
      // Still on Paystack (cross-origin) — expected until callback.
    }
  }, [finishCancel, finishSuccess, reference]);

  useEffect(() => {
    if (!ready) return;
    if (!authorizationUrl) {
      void navigate({ to: "/wallet/card", search: { amount }, replace: true });
      return;
    }

    const poll = window.setInterval(inspectFrame, 600);
    return () => window.clearInterval(poll);
  }, [ready, authorizationUrl, amount, navigate, inspectFrame]);

  if (!ready || !authorizationUrl) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-brand">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand">
      <header className="shrink-0 px-4 pb-3.5 pt-[max(0.75rem,env(safe-area-inset-top))] text-primary-foreground">
        <button
          type="button"
          onClick={finishCancel}
          aria-label="Close checkout"
          className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-semibold"
        >
          <X className="size-3.5" strokeWidth={2.6} /> Close
        </button>
        <h1 className="mt-3.5 font-display text-[18px] font-extrabold tracking-[-0.02em]">
          Secure card checkout
        </h1>
        <p className="mt-1 text-[12px] text-primary-foreground/70">
          Secure checkout · stay in Kipit
          {amount > 0 ? ` · ${naira(amount)}` : ""}
        </p>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[1.5rem] bg-white">
        {loading && !blocked ? (
          <div className="absolute inset-0 z-10 grid place-items-center gap-2.5 bg-white">
            <Loader2 className="size-8 animate-spin text-brand" />
            <p className="text-[13px] font-medium text-muted-foreground">Loading secure checkout…</p>
          </div>
        ) : null}

        {blocked ? (
          <div className="grid h-full place-items-center gap-4 px-6 text-center">
            <p className="max-w-sm text-[14px] text-muted-foreground">
              Secure checkout couldn&apos;t load inside Kipit. Continue on the secure page — you&apos;ll
              return here when done.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign(authorizationUrl)}
              className="press rounded-xl bg-brand-gradient px-5 py-3 text-[13.5px] font-extrabold text-primary-foreground"
            >
              Continue to secure checkout
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="Secure card checkout"
            src={authorizationUrl}
            className="h-full w-full border-0 bg-white"
            allow="payment *"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation"
            onLoad={() => {
              setLoading(false);
              inspectFrame();
              // Blank frame after load usually means X-Frame-Options blocked embedding.
              window.setTimeout(() => {
                try {
                  const doc = iframeRef.current?.contentDocument;
                  if (doc && !doc.body?.innerHTML?.trim()) setBlocked(true);
                } catch {
                  /* cross-origin Paystack content — OK */
                }
              }, 1200);
            }}
            onError={() => {
              setLoading(false);
              setBlocked(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
