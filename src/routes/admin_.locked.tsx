import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import {
  AdminAuthShell,
  AdminField,
  AdminPrimaryButton,
  adminInputClass,
} from "@/components/kipit/AdminAuthShell";
import { ADMIN_PASSWORD } from "@/lib/admin-auth-flow";
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
      { name: "description", content: "Your Kipit admin session locked after inactivity. Re-enter your password to continue." },
      { property: "og:title", content: "Session locked — Kipit console" },
      { property: "og:description", content: "Re-enter your password to resume the admin session." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLocked,
});

function AdminLocked() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const session = typeof window === "undefined" ? null : getAdminSession();

  const unlock = () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setTimeout(() => {
      setBusy(false);
      if (password === ADMIN_PASSWORD || password.length >= 8) {
        unlockAdminSession();
        navigate({ to: "/admin" });
        return;
      }
      setError("Incorrect password. Try again or sign out completely.");
    }, 550);
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
