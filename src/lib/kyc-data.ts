/**
 * KYC / Verification fixtures (MOB-040 – MOB-057).
 * Static prototype data — no backend calls.
 */

export type TierId = "tier1" | "tier2";

export type TierInfo = {
  id: TierId;
  name: string;
  status: "Verified" | "In review" | "Not started";
  blurb: string;
  requirements: string[];
  limits: { label: string; value: string }[];
};

export const TIERS: TierInfo[] = [
  {
    id: "tier1",
    name: "Tier 1",
    status: "Not started",
    blurb: "Verify your BVN to fund your wallet and start investing.",
    requirements: ["Bank Verification Number (BVN)", "Phone number linked to your BVN"],
    limits: [
      { label: "Single deposit", value: "₦1,000,000" },
      { label: "Daily deposit", value: "₦2,000,000" },
      { label: "Withdrawals", value: "Locked" },
    ],
  },
  {
    id: "tier2",
    name: "Tier 2",
    status: "Not started",
    blurb: "Add your NIN, a live selfie and your address to unlock withdrawals.",
    requirements: [
      "National Identity Number (NIN)",
      "Live selfie check",
      "Residential address & proof of address",
      "Occupation and source of funds",
    ],
    limits: [
      { label: "Single deposit", value: "Unlimited" },
      { label: "Daily withdrawal", value: "₦10,000,000" },
      { label: "Withdrawals", value: "Unlocked" },
    ],
  },
];

/** BVN match details come from the API response after submitBvn. */
export const DEMO_BVN = "";
export const DEMO_NIN_LENGTH = 11;

export type BvnMatchInfo = {
  name: string;
  dob: string;
  phone: string;
};

const BVN_MATCH_KEY = "kipit:bvn-match";

export let BVN_MATCH: BvnMatchInfo = {
  name: "",
  dob: "",
  phone: "",
};

export function setLastBvnMatch(match: BvnMatchInfo | null) {
  BVN_MATCH = match ?? { name: "", dob: "", phone: "" };
  if (typeof window === "undefined") return;
  if (match?.name) {
    window.sessionStorage.setItem(BVN_MATCH_KEY, JSON.stringify(BVN_MATCH));
  } else {
    window.sessionStorage.removeItem(BVN_MATCH_KEY);
  }
}

export function getLastBvnMatch(): BvnMatchInfo {
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(BVN_MATCH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BvnMatchInfo;
        if (parsed?.name) {
          BVN_MATCH = {
            name: parsed.name,
            dob: parsed.dob || "",
            phone: parsed.phone || "",
          };
        }
      }
    } catch {
      /* ignore */
    }
  }
  return BVN_MATCH;
}

export const NIGERIAN_STATES = [
  "Abia", "Abuja (FCT)", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const PROOF_TYPES = [
  { id: "utility", label: "Utility bill", hint: "Not older than 3 months" },
  { id: "bank", label: "Bank statement", hint: "Showing your address" },
  { id: "tenancy", label: "Tenancy agreement", hint: "Current residence" },
];

export const EMPLOYMENT_STATUS = [
  "Employed (full-time)",
  "Self-employed / business owner",
  "Student",
  "Retired",
  "Unemployed",
];

export const SOURCE_OF_FUNDS = [
  "Salary",
  "Business income",
  "Investment returns",
  "Gift or inheritance",
  "Savings",
];

export const INCOME_BANDS = [
  "Below ₦500,000",
  "₦500,000 – ₦2,000,000",
  "₦2,000,000 – ₦10,000,000",
  "Above ₦10,000,000",
];

export const REJECTION_REASONS = [
  {
    field: "Proof of address",
    detail: "The document uploaded was older than 3 months and could not be accepted.",
  },
  {
    field: "Selfie check",
    detail: "The photo was too dark for us to match it against your ID.",
  },
];

export const kycReference = "KYC-4F19-0837";
