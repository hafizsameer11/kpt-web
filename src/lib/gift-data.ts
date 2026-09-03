/**
 * Gift investments (MOB-127 / MOB-128).
 * Prototype data — one source of truth for the gift list and detail screens.
 */
export type GiftStatus = "Pending" | "Claimed" | "Expired";

export type Gift = {
  id: string;
  recipient: string;
  phone: string;
  product: string;
  tenor: string;
  rate: string;
  amount: number;
  message: string;
  sentDate: string;
  claimedDate?: string;
  expiresDate?: string;
  status: GiftStatus;
  maturityDate: string;
  expectedPayout: number;
};

export const GIFTS: Gift[] = [
  {
    id: "g1",
    recipient: "Chidera Okafor",
    phone: "+234 803 ••• 4412",
    product: "Kipit Fixed Income",
    tenor: "90 days",
    rate: "19.2% p.a.",
    amount: 250_000,
    message: "Congratulations on the new job — start building early.",
    sentDate: "28 Aug 2026",
    expiresDate: "11 Sep 2026",
    status: "Pending",
    maturityDate: "26 Nov 2026",
    expectedPayout: 261_840,
  },
  {
    id: "g2",
    recipient: "Ada Nwosu",
    phone: "+234 701 ••• 9087",
    product: "Kipit Target Savings",
    tenor: "180 days",
    rate: "16.0% p.a.",
    amount: 100_000,
    message: "Happy birthday! Let this one grow quietly.",
    sentDate: "12 Aug 2026",
    claimedDate: "12 Aug 2026",
    status: "Claimed",
    maturityDate: "08 Feb 2027",
    expectedPayout: 107_890,
  },
  {
    id: "g3",
    recipient: "Tunde Bakare",
    phone: "+234 812 ••• 3355",
    product: "Kipit Vault (365d)",
    tenor: "365 days",
    rate: "21.5% p.a.",
    amount: 500_000,
    message: "For the wedding fund. Don't touch it till next year.",
    sentDate: "02 Jul 2026",
    claimedDate: "03 Jul 2026",
    status: "Claimed",
    maturityDate: "03 Jul 2027",
    expectedPayout: 607_500,
  },
  {
    id: "g4",
    recipient: "Zainab Ibrahim",
    phone: "+234 906 ••• 7721",
    product: "Kipit Starter (30d)",
    tenor: "30 days",
    rate: "12.8% p.a.",
    amount: 50_000,
    message: "A small start — see how it works.",
    sentDate: "19 Jun 2026",
    expiresDate: "03 Jul 2026",
    status: "Expired",
    maturityDate: "19 Jul 2026",
    expectedPayout: 50_526,
  },
];

export const getGift = (id: string) => GIFTS.find((g) => g.id === id);

export const GIFT_TABS = ["Sent", "Pending", "Claimed"] as const;
export type GiftTab = (typeof GIFT_TABS)[number];

export const giftsForTab = (tab: GiftTab) =>
  tab === "Sent" ? GIFTS : GIFTS.filter((g) => g.status === tab);
