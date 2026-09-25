/** In-memory + sessionStorage draft for Tier 2 KYC on web. */

export type Tier2Draft = {
  nin: string;
  selfieUrl: string;
  selfiePreview: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressLga: string;
  proofUrl: string;
  proofName: string;
  proofType: string;
  occupation: string;
  employmentStatus: string;
  sourceOfFunds: string;
};

const KEY = "kipit:tier2Draft";

const EMPTY: Tier2Draft = {
  nin: "",
  selfieUrl: "",
  selfiePreview: "",
  addressStreet: "",
  addressCity: "",
  addressState: "",
  addressLga: "",
  proofUrl: "",
  proofName: "",
  proofType: "",
  occupation: "",
  employmentStatus: "",
  sourceOfFunds: "",
};

function read(): Tier2Draft {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

let draft: Tier2Draft = typeof window !== "undefined" ? read() : { ...EMPTY };

export function getTier2Draft() {
  return draft;
}

export function patchTier2Draft(patch: Partial<Tier2Draft>) {
  draft = { ...draft, ...patch };
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      /* ignore quota */
    }
  }
}

export function clearTier2Draft() {
  draft = { ...EMPTY };
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(KEY);
  }
}
