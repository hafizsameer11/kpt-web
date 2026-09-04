/**
 * Marketing console fixtures (ADM-100 – ADM-105).
 * Prototype-only data: campaigns, audiences, home feed cards and digest settings.
 */

export type CampaignChannel = "push" | "email";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent";

export type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  reach: number;
  title: string;
  content: string;
  cta: string;
  deepLink: string;
  sentAt?: string;
  scheduledFor?: string;
  delivered?: number;
  opened?: number;
  clicked?: number;
  createdBy: string;
};

export type FeedCardStatus = "published" | "draft" | "unpublished";

export type FeedCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  destination: string;
  status: FeedCardStatus;
  position: number;
  impressions: number;
  taps: number;
  updatedBy: string;
  updatedAt: string;
};

export type Segment = {
  id: string;
  name: string;
  description: string;
  size: number;
  tier: string;
  investmentStatus: string;
};

export const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  push: "Push notification",
  email: "Email",
};

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
};

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground ring-border",
  scheduled: "bg-brand/10 text-brand ring-brand/20",
  sending: "bg-gold/25 text-gold-foreground ring-gold/40",
  sent: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
};

export const FEED_STATUS_LABEL: Record<FeedCardStatus, string> = {
  published: "Published",
  draft: "Draft",
  unpublished: "Unpublished",
};

export const FEED_STATUS_TONE: Record<FeedCardStatus, string> = {
  published: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  draft: "bg-muted text-muted-foreground ring-border",
  unpublished: "bg-gold/25 text-gold-foreground ring-gold/40",
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-401",
    name: "September rate refresh",
    channel: "push",
    status: "sent",
    audience: "Tier 2 · Active investors",
    reach: 18420,
    title: "New 90-day rate: 17.25%",
    content: "Rates moved up this week. Lock a 90-day plan before the next review.",
    cta: "View rates",
    deepLink: "/invest",
    sentAt: "2026-09-01 09:00",
    delivered: 18103,
    opened: 9740,
    clicked: 3122,
    createdBy: "Kelechi Nwosu · Growth",
  },
  {
    id: "cmp-402",
    name: "Idle cash nudge",
    channel: "push",
    status: "scheduled",
    audience: "Wallet balance above ₦100k, no active plan",
    reach: 5240,
    title: "Your cash could be earning 12.5%",
    content: "Move idle wallet cash into the Call Account and earn daily, withdraw anytime.",
    cta: "Move to Call Account",
    deepLink: "/call-account",
    scheduledFor: "2026-09-06 10:00",
    createdBy: "Kelechi Nwosu · Growth",
  },
  {
    id: "cmp-403",
    name: "Maturity rollover reminder",
    channel: "email",
    status: "sending",
    audience: "Maturing in 7 days",
    reach: 1180,
    title: "Your plan matures soon",
    content: "Choose to roll over, withdraw, or split your maturity proceeds.",
    cta: "Review maturity",
    deepLink: "/portfolio/maturities",
    createdBy: "Adaeze Ilo · Marketing",
  },
  {
    id: "cmp-404",
    name: "Tier 1 completion push",
    channel: "push",
    status: "draft",
    audience: "Tier 0 signups, 7+ days inactive",
    reach: 2960,
    title: "Two minutes to start investing",
    content: "Add your BVN to unlock funding and investing on Kipit.",
    cta: "Verify now",
    deepLink: "/verification",
    createdBy: "Adaeze Ilo · Marketing",
  },
  {
    id: "cmp-399",
    name: "Referral bonus weekend",
    channel: "email",
    status: "sent",
    audience: "All verified customers",
    reach: 24310,
    title: "Earn ₦5,000 per referral",
    content: "Invite a friend this weekend and both of you earn a bonus on first placement.",
    cta: "Share invite",
    deepLink: "/settings/referrals",
    sentAt: "2026-08-23 08:30",
    delivered: 24102,
    opened: 11208,
    clicked: 2841,
    createdBy: "Kelechi Nwosu · Growth",
  },
];

export const SEGMENTS: Segment[] = [
  {
    id: "seg-all",
    name: "All customers",
    description: "Everyone with a Kipit account",
    size: 31420,
    tier: "Any tier",
    investmentStatus: "Any",
  },
  {
    id: "seg-active",
    name: "Active investors",
    description: "At least one live plan",
    size: 18420,
    tier: "Tier 1 and Tier 2",
    investmentStatus: "Active plan",
  },
  {
    id: "seg-idle",
    name: "Idle cash holders",
    description: "Wallet above ₦100,000 with no active plan",
    size: 5240,
    tier: "Tier 1 and Tier 2",
    investmentStatus: "No active plan",
  },
  {
    id: "seg-tier0",
    name: "Unverified signups",
    description: "Tier 0 accounts that never funded",
    size: 2960,
    tier: "Tier 0",
    investmentStatus: "Never invested",
  },
  {
    id: "seg-maturing",
    name: "Maturing in 7 days",
    description: "Plans reaching maturity within a week",
    size: 1180,
    tier: "Tier 1 and Tier 2",
    investmentStatus: "Maturing soon",
  },
];

export const FEED_CARDS: FeedCard[] = [
  {
    id: "feed-01",
    title: "Rates just moved",
    description: "See the new tenor band rates for September placements.",
    image: "Rates hero · navy",
    cta: "View rates",
    destination: "/invest",
    status: "published",
    position: 1,
    impressions: 42180,
    taps: 6210,
    updatedBy: "Kelechi Nwosu",
    updatedAt: "2026-09-01 08:40",
  },
  {
    id: "feed-02",
    title: "Understanding fixed income",
    description: "A two-minute guide to how your interest is calculated.",
    image: "Learn cover · education",
    cta: "Read now",
    destination: "/learn/fixed-income-basics",
    status: "published",
    position: 2,
    impressions: 38940,
    taps: 4120,
    updatedBy: "Adaeze Ilo",
    updatedAt: "2026-08-27 15:12",
  },
  {
    id: "feed-03",
    title: "Invite friends, earn ₦5,000",
    description: "Both of you earn when your friend makes a first placement.",
    image: "Referral card · gold",
    cta: "Share invite",
    destination: "/settings/referrals",
    status: "unpublished",
    position: 3,
    impressions: 21100,
    taps: 1980,
    updatedBy: "Kelechi Nwosu",
    updatedAt: "2026-08-20 11:05",
  },
  {
    id: "feed-04",
    title: "Explore FGN bonds",
    description: "Government-backed instruments now available on Kipit.",
    image: "Explore cover · bonds",
    cta: "Explore now",
    destination: "/explore",
    status: "draft",
    position: 4,
    impressions: 0,
    taps: 0,
    updatedBy: "Adaeze Ilo",
    updatedAt: "2026-09-03 09:55",
  },
];

export const DIGEST_DEFAULTS = {
  enabled: true,
  sendTime: "07:30",
  audience: "seg-active",
  lastRun: "2026-09-04 07:30",
  deliveredYesterday: 17840,
  openRate: 46,
};

export function findCampaign(id: string) {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function findFeedCard(id: string) {
  return FEED_CARDS.find((c) => c.id === id);
}
