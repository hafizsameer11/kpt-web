import { useEffect, useState } from "react";
import {
  fetchProfile,
  getStoredUser,
  isAuthenticated,
  tierNumber,
  type ApiUser,
} from "@/lib/api";

export type DisplayProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  tier: string;
  memberSince: string;
  initials: string;
  occupation: string;
  employment: string;
  sourceOfFunds: string;
  street: string;
  city: string;
  state: string;
  lga: string;
  lockedFields: string[];
};

const emptyProfile = (): DisplayProfile => ({
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  tier: "Tier 0",
  memberSince: "",
  initials: "",
  occupation: "",
  employment: "",
  sourceOfFunds: "",
  street: "",
  city: "",
  state: "",
  lga: "",
  lockedFields: [],
});

function initialsFrom(user: { firstName?: string; surname?: string; lastName?: string }) {
  const a = user.firstName?.charAt(0) ?? "";
  const b = (user.surname ?? user.lastName)?.charAt(0) ?? "";
  return `${a}${b}`.toUpperCase();
}

function formatDob(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function tierLabel(tier: ApiUser["kycTier"] | undefined) {
  return `Tier ${tierNumber(tier)}`;
}

function fromStored(user: ApiUser | null): DisplayProfile {
  if (!user) return emptyProfile();
  return {
    ...emptyProfile(),
    firstName: user.firstName ?? "",
    lastName: user.surname ?? "",
    email: user.email ?? "",
    tier: tierLabel(user.kycTier),
    initials: initialsFrom({ firstName: user.firstName, surname: user.surname }),
  };
}

function fromApi(
  p: Awaited<ReturnType<typeof fetchProfile>>,
  createdAt?: string | null,
): DisplayProfile {
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })
    : "";
  return {
    firstName: p.firstName ?? "",
    middleName: p.middleName ?? "",
    lastName: p.surname ?? "",
    dob: formatDob(p.dateOfBirth),
    gender: p.gender ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    tier: tierLabel(p.kycTier),
    memberSince,
    initials: initialsFrom({ firstName: p.firstName, surname: p.surname }),
    occupation: p.occupation ?? "",
    employment: p.employmentStatus ?? "",
    sourceOfFunds: p.sourceOfFunds ?? "",
    street: p.address?.street ?? "",
    city: p.address?.city ?? "",
    state: p.address?.state ?? "",
    lga: p.address?.lga ?? "",
    lockedFields: p.lockedFields ?? [],
  };
}

export function isFieldLocked(profile: DisplayProfile, field: string) {
  return profile.lockedFields.includes(field);
}

/** Profile fields for settings screens — API with stored-user fallback. */
export function useDisplayProfile() {
  const [profile, setProfile] = useState<DisplayProfile>(() => fromStored(getStoredUser()));

  useEffect(() => {
    if (!isAuthenticated()) {
      setProfile(fromStored(getStoredUser()));
      return;
    }
    void fetchProfile()
      .then((p) =>
        setProfile(
          fromApi(p, (p as { createdAt?: string }).createdAt),
        ),
      )
      .catch(() => setProfile(fromStored(getStoredUser())));
  }, []);

  return profile;
}
