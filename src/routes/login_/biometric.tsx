import { createFileRoute, redirect } from "@tanstack/react-router";

/** Biometric login is not available on web — always use password. */
export const Route = createFileRoute("/login_/biometric")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
