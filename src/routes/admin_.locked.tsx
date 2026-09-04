import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useRef, useState } from "react";
import {
  AdminAuthShell,
  AdminField,
  AdminPrimaryButton,
} from "@/components/kipit/AdminAuthShell";
import { ADMIN_PIN } from "@/lib/admin-auth-flow";
import {
  ADMIN_IDLE_MINUTES,
  endAdminSession,
  getAdminSession,
  unlockAdminSession,
} from "@/lib/admin-auth";

export const Route = createFileRoute("/admin_/locked")({
  head: () => ({
    meta: [
      { title: "Session locked — Kipit console" },
      { name: "description", content: "Your Kipit admin session locked after inactivity. Enter your quick PIN to continue." },
      { property: "og:title", content: "Session locked — Kipit console" },
      { property: "og:description", content: "Enter your quick PIN to resume the admin session." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLocked,
});

const LENGTH = 4;

function AdminLocked() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const session = typeof window === "undefined" ? null : getAdminSession();
  const pin = digits.join("");

  const setDigit = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "").slice(-1);
    setError(null);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
    if (v && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const unlock = () => {
    if (busy || pin.length < LENGTH) return;
    setBusy(true);
    setError(null);
    setTimeout(() => {
      setBusy(false);
      if (pin === ADMIN_PIN) {
        unlockAdminSession();
        navigate({ to: "/admin" });
        return;
      }
      setDigits(Array(LENGTH).fill(""));
      refs.current[0]?.focus();
      setError("Incorrect PIN. Try again or sign out completely.");
    }, 450);
  };


  return (
    <AdminAuthShell
      title="Session locked"
      subtitle={`The console locks automatically after ${ADMIN_IDLE_MINUTES} minutes of inactivity.`}
      footer={
        <button
          type="button"
          onClick={() => {
            endAdminSession();
            navigate({ to: "/admin/login" });
          }}
          className="mx-auto block text-[12px] font-semibold text-brand-foreground/60 hover:text-brand-foreground"
        >
          Sign out completely
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/12 bg-white/5 p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-[12px] font-extrabold text-gold-foreground">
          {(session?.name ?? "SA")
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold">{session?.name ?? "Seyi Adeleke"}</p>
          <p className="truncate text-[11px] text-brand-foreground/60">
            {session?.email ?? "seyi.adeleke@kipit.com"}
          </p>
        </div>
        <LockKeyhole className="ml-auto size-4 text-gold" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          unlock();
        }}
      >
        <AdminField label="Password" error={error}>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${adminInputClass} pr-12`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 flex items-center text-brand-foreground/60"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </AdminField>
        <AdminPrimaryButton type="submit" disabled={password.length < 4 || busy}>
          {busy ? "Unlocking…" : "Unlock console"}
        </AdminPrimaryButton>
      </form>
    </AdminAuthShell>
  );
}
