/** In-memory draft carrying the sign-in step to the two-factor step (ADM-001 → ADM-002). */
import { ADMIN_EMAIL } from "./admin-auth";

export { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_OTP, ADMIN_PIN } from "./admin-auth";

let pendingEmail = ADMIN_EMAIL;

export function setPendingAdminEmail(email: string) {
  pendingEmail = email;
}

export function getPendingAdminEmail() {
  return pendingEmail;
}
