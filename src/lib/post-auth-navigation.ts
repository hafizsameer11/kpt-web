import type { ApiUser } from "@/lib/api";

/** After Google (or other social) auth: password → PIN → home. */
export function nextPathAfterSocialAuth(
  user: Pick<Partial<ApiUser>, "hasPassword" | "hasPin">,
): "/signup/set-password" | "/signup/pin" | "/home" {
  if (!user.hasPassword) return "/signup/set-password";
  if (!user.hasPin) return "/signup/pin";
  return "/home";
}
