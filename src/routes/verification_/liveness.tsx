import { createFileRoute, redirect } from "@tanstack/react-router";

/** Liveness camera is mobile-oriented — web uses file selfie upload instead. */
export const Route = createFileRoute("/verification_/liveness")({
  beforeLoad: () => {
    throw redirect({ to: "/verification/selfie" });
  },
  component: () => null,
});
