import { Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  GATE_COPY,
  PENDING_COPY,
  useBvnPendingReview,
  useHydrated,
  useKycTier,
} from "@/lib/kyc-state";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

/**
 * Just-in-time KYC gate (Product Paper §7.2).
 * Wrap a money-moving screen: the page still renders behind, but an
 * un-dismissable-by-default prompt asks the user to verify first.
 */
export function KycGuard({
  required,
  children,
}: {
  required: 1 | 2;
  children: ReactNode;
}) {
  const tier = useKycTier();
  const pending = useBvnPendingReview();
  const hydrated = useHydrated();
  const isMobile = useIsMobile();
  const router = useRouter();
  const open = hydrated && tier < required;
  const copy = required === 1 && pending ? PENDING_COPY : GATE_COPY[required];

  const dismiss = () => router.history.back();

  const body = (
    <div className="px-5 pb-8 pt-2 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <Lock className="size-6" strokeWidth={2.3} />
      </span>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-gold-foreground [color:var(--color-gold)]">
        <ShieldCheck className="size-3.5" strokeWidth={2.6} /> {copy.badge}
      </span>
      <h2 className="mt-3 font-display text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
        {copy.title}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
        {copy.body}
      </p>

      <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left">
        {copy.unlocks.map((u) => (
          <li
            key={u}
            className="flex items-center gap-2.5 rounded-xl bg-secondary/70 px-3 py-2.5 text-[12.5px] font-semibold text-foreground"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {u}
          </li>
        ))}
      </ul>

      <Link
        to={copy.to}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press"
      >
        {copy.cta} <ArrowRight className="size-4" />
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 w-full rounded-xl border border-border px-5 py-3 text-[13px] font-bold text-muted-foreground press"
      >
        Not now
      </button>
    </div>
  );

  return (
    <>
      {children}
      {isMobile ? (
        <Drawer open={open} onOpenChange={(o) => !o && dismiss()}>
          <DrawerContent className="rounded-t-3xl border border-border/60 bg-card pb-2">
            {body}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
          <DialogContent className="max-w-md rounded-2xl p-0">{body}</DialogContent>
        </Dialog>
      )}
    </>
  );
}
