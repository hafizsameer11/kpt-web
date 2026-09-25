import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift as GiftIcon, Download, LogIn, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import {
  claimGift,
  claimPendingGifts,
  isAuthenticated,
  previewGiftClaim,
} from "@/lib/api";
import { naira } from "@/lib/home-data";

export const Route = createFileRoute("/gifts_/claim_/$code")({
  head: ({ params }) => ({
    meta: [
      { title: "Claim your Kipit gift" },
      {
        name: "description",
        content:
          "Someone sent you a Kipit gift investment. Download or sign in to claim it into your portfolio.",
      },
      { property: "og:title", content: "Claim your Kipit gift" },
      {
        property: "og:description",
        content: `Gift claim ${params.code}`,
      },
    ],
  }),
  component: GiftClaimLanding,
});

const PENDING_GIFT_KEY = "kipit:pending-gift-claim";

type Preview = Awaited<ReturnType<typeof previewGiftClaim>>;

function GiftClaimLanding() {
  const { code } = Route.useParams();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimedPlacement, setClaimedPlacement] = useState<string | null>(null);
  const signedIn = typeof window !== "undefined" && isAuthenticated();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_GIFT_KEY, code);
    }
    void previewGiftClaim(code)
      .then(setPreview)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gift not found or expired."),
      );
  }, [code]);

  useEffect(() => {
    if (!signedIn || !code) return;
    let cancelled = false;
    setBusy(true);
    void (async () => {
      try {
        const result = await claimGift(code);
        if (!cancelled) {
          setClaimedPlacement(result.placementId);
          window.sessionStorage.removeItem(PENDING_GIFT_KEY);
        }
      } catch {
        try {
          await claimPendingGifts();
        } catch {
          /* keep pending for signup path */
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, code]);

  return (
    <AppShell title="Claim gift" navVariant="elevated">
      <div className="mx-auto w-full max-w-lg pb-10">
        <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-6 py-10 text-center text-primary-foreground shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-gold/20 blur-[56px]"
          />
          <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-gold/20 text-gold">
            <GiftIcon className="size-8" strokeWidth={2.2} />
          </span>
          <p className="relative mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
            Gift investment
          </p>
          {preview ? (
            <>
              <p className="relative mt-2 font-display text-[36px] font-extrabold leading-none tracking-[-0.035em] text-num">
                {naira(preview.amount)}
              </p>
              <p className="relative mt-3 text-[13px] text-primary-foreground/75">
                From {preview.senderFirstName}
                {preview.tenorDays ? ` · ${preview.tenorDays} days` : ""}
                {preview.ratePct ? ` · ${preview.ratePct}% p.a.` : ""}
              </p>
              {preview.message ? (
                <p className="relative mx-auto mt-4 max-w-sm text-[13px] italic text-primary-foreground/80">
                  “{preview.message}”
                </p>
              ) : null}
            </>
          ) : error ? (
            <p className="relative mt-4 text-[14px] font-semibold text-red-200">{error}</p>
          ) : (
            <p className="relative mt-4 text-[13px] text-primary-foreground/70">Loading gift…</p>
          )}
        </section>

        <section className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[14px] font-extrabold">How claiming works</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                You do not need a Kipit account to receive this gift. Sign up with the phone number
                this gift was sent to (or open the app after download), and the investment appears in
                your portfolio automatically.
              </p>
            </div>
          </div>

          {claimedPlacement ? (
            <Link
              to="/portfolio/$holdingId"
              params={{ holdingId: claimedPlacement }}
              className="press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float"
            >
              View investment in portfolio
            </Link>
          ) : signedIn ? (
            <p className="rounded-xl bg-secondary px-3 py-2.5 text-center text-[12.5px] font-semibold text-muted-foreground">
              {busy ? "Claiming your gift…" : "Signed in — claiming into your portfolio."}
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <a
                href={`/signup/email?gift=${encodeURIComponent(code)}`}
                className="press inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float"
              >
                <Download className="size-4" strokeWidth={2.4} /> Sign up to claim
              </a>
              <a
                href={`/login?gift=${encodeURIComponent(code)}`}
                className="press inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-[13px] font-bold"
              >
                <LogIn className="size-4" strokeWidth={2.4} /> I already have Kipit
              </a>
            </div>
          )}

          {preview?.claimCode ? (
            <p className="text-center text-[11.5px] text-muted-foreground">
              Claim code <span className="font-bold text-foreground">{preview.claimCode}</span>
              {preview.expiresDate ? ` · expires ${preview.expiresDate}` : ""}
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
