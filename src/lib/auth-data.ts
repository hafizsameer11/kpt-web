/**
 * Onboarding & authentication draft (MOB-001 – MOB-017).
 * In-memory draft carries values between steps. OTP verifies via API only.
 */

export const COUNTRIES = [
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria", digits: 10 },
  { code: "GH", dial: "+233", flag: "🇬🇭", name: "Ghana", digits: 9 },
  { code: "KE", dial: "+254", flag: "🇰🇪", name: "Kenya", digits: 9 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom", digits: 10 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States", digits: 10 },
] as const;

export type SignupDraft = {
  email: string;
  dial: string;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  referral: string;
  password: string;
  otp: string;
  pin: string;
  biometrics: boolean;
  deviceId: string;
};

function newDeviceId() {
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const signupDraft: SignupDraft = {
  email: "",
  dial: "+234",
  phone: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  referral: "",
  password: "",
  otp: "",
  pin: "",
  biometrics: false,
  deviceId: newDeviceId(),
};

export function resetSignupDraft() {
  signupDraft.email = "";
  signupDraft.dial = "+234";
  signupDraft.phone = "";
  signupDraft.firstName = "";
  signupDraft.middleName = "";
  signupDraft.lastName = "";
  signupDraft.dateOfBirth = "";
  signupDraft.referral = "";
  signupDraft.password = "";
  signupDraft.otp = "";
  signupDraft.pin = "";
  signupDraft.biometrics = false;
  signupDraft.deviceId = newDeviceId();
}

/** Rejects sequential runs, repeated digits and common combinations. */
export function weakPin(pin: string) {
  if (/^(\d)\1{3}$/.test(pin)) return "Avoid a PIN with four repeated digits.";
  const n = pin.split("").map(Number);
  const ascending = n.every((d, i) => i === 0 || d === (n[i - 1] as number) + 1);
  const descending = n.every((d, i) => i === 0 || d === (n[i - 1] as number) - 1);
  if (ascending || descending) return "Avoid a PIN with sequential digits.";
  if (["1234", "0000", "1111", "2580", "1122"].includes(pin))
    return "That PIN is too easy to guess. Choose another.";
  return null;
}

export type PasswordCheck = { label: string; ok: boolean };

export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", ok: value.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(value) },
    { label: "One number", ok: /\d/.test(value) },
    { label: "One symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
}

export function passwordStrength(value: string) {
  const score = passwordChecks(value).filter((c) => c.ok).length;
  if (score <= 1) return { score, label: "Weak", tone: "bg-destructive" };
  if (score === 2) return { score, label: "Fair", tone: "bg-gold" };
  if (score === 3) return { score, label: "Good", tone: "bg-gold" };
  return { score, label: "Strong", tone: "bg-emerald-500" };
}
