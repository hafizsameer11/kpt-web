import type { ApiUser } from "@/lib/api";

export type OnboardingPath =
  | "/signup/set-password"
  | "/signup/pin"
  | "/signup/confirm-pin"
  | "/signup/biometrics"
  | "/signup/success"
  | "/home";

/** True when the user still owes password and/or transaction PIN. */
export function needsAuthOnboarding(
  user: Pick<Partial<ApiUser>, "hasPassword" | "hasPin"> | null | undefined,
) {
  if (!user) return false;
  return user.hasPassword !== true || user.hasPin !== true;
}

/** After Google (or other social) auth: password -> PIN -> home. */
export function nextPathAfterSocialAuth(
  user: Pick<Partial<ApiUser>, "hasPassword" | "hasPin">,
): "/signup/set-password" | "/signup/pin" | "/home" {
  if (user.hasPassword !== true) return "/signup/set-password";
  if (user.hasPin !== true) return "/signup/pin";
  return "/home";
}

export function isAuthOnboardingPath(pathname: string) {
  return (
    pathname === "/signup/set-password" ||
    pathname.startsWith("/signup/set-password/") ||
    pathname === "/signup/pin" ||
    pathname.startsWith("/signup/pin/") ||
    pathname === "/signup/confirm-pin" ||
    pathname.startsWith("/signup/confirm-pin/") ||
    pathname === "/signup/biometrics" ||
    pathname.startsWith("/signup/biometrics/") ||
    pathname === "/signup/success" ||
    pathname.startsWith("/signup/success/")
  );
}
