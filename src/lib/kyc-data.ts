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

/** Demo BVN that matches; any other 11-digit value fails. */
export const DEMO_BVN = "22123456789";
export const DEMO_NIN_LENGTH = 11;

export const BVN_MATCH = {
  name: "Adaeze Chidinma Okonkwo",
  dob: "14 March 1993",
  phone: "0803 214 8890",
};

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
