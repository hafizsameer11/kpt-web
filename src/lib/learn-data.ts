/**
 * Learn / "For you" editorial content.
 *
 * The home feed and the Learn screens both read from this list so a card on
 * home always resolves to a real article page.
 */

export type LearnCategory = "Product update" | "Education" | "Announcement";

export type LearnArticle = {
  id: string;
  tag: LearnCategory;
  title: string;
  body: string;
  readMinutes: number;
  date: string;
  author: string;
  /** Short standfirst shown under the headline on the article page. */
  standfirst: string;
  sections: { heading: string; paragraphs: string[] }[];
  /** Optional in-app destination the article points to. */
  cta?: { label: string; to: string };
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    id: "same-day-settlement",
    tag: "Product update",
    title: "Kipit Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
    readMinutes: 2,
    date: "28 Aug 2026",
    author: "Kipit Product Team",
    standfirst:
      "Matured fixed plans now credit your wallet within minutes instead of the next business day.",
    sections: [
      {
        heading: "What changed",
        paragraphs: [
          "Previously, a fixed plan that matured on a business day was settled in the next end-of-day cycle. Payouts now run continuously, so principal and interest land in your Kipit wallet within minutes of the plan reaching maturity.",
          "Nothing changes about how your interest is calculated. Your rate is locked at the time you create a plan and accrues daily for the full tenor.",
        ],
      },
      {
        heading: "What it means for you",
        paragraphs: [
          "You can reinvest the same day a plan matures, which removes the idle gap that used to cost you a day of interest.",
          "If you set your plan to auto-rollover, the new plan now starts on the maturity date itself at the prevailing rate.",
        ],
      },
      {
        heading: "Nothing to do",
        paragraphs: [
          "Same-day settlement is on for every existing and new fixed plan. You will see the credit in your wallet activity with the plan reference attached.",
        ],
      },
    ],
    cta: { label: "View your maturities", to: "/portfolio/maturities" },
  },
  {
    id: "tenor-and-yield",
    tag: "Education",
    title: "Understanding tenor and effective yield",
    body: "A 3-minute read on how rate and tenor shape your real return.",
    readMinutes: 3,
    date: "21 Aug 2026",
    author: "Kipit Research",
    standfirst:
      "A higher headline rate does not always mean more money. Here is how tenor changes the maths.",
    sections: [
      {
        heading: "Rates are quoted per annum",
        paragraphs: [
          "Every rate on Kipit is quoted per annum (p.a.). A 90-day plan at 18% p.a. does not pay 18% of your money — it pays roughly a quarter of that, because you only hold it for a quarter of a year.",
          "The quick maths: principal × rate × (days ÷ 365). ₦500,000 at 18% p.a. for 90 days earns about ₦22,192 before tax.",
        ],
      },
      {
        heading: "Why longer tenors pay more",
        paragraphs: [
          "You are being paid for two things: lending your money, and giving up access to it. The longer you lock funds, the more certainty the issuer has, so the rate rises with tenor.",
          "That extra rate is only worth it if you genuinely will not need the money. Breaking a fixed plan early usually costs part of the accrued interest.",
        ],
      },
      {
        heading: "Effective yield and compounding",
        paragraphs: [
          "Effective yield is what you actually earn once reinvestment is included. Rolling a 90-day plan four times at 18% p.a. earns slightly more than one 365-day plan at 18% p.a., because each rollover reinvests the interest.",
          "The trade-off is rate risk: your rollover happens at whatever rate is available then, while a one-year plan locks today's rate for the full period.",
        ],
      },
      {
        heading: "A simple rule",
        paragraphs: [
          "Keep money you may need within 30 days in the Call Account, where interest accrues daily and you can withdraw anytime. Lock the rest into the longest tenor you are genuinely comfortable with.",
        ],
      },
    ],
    cta: { label: "Try the investment calculator", to: "/calculator" },
  },
  {
    id: "instant-tier-2",
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
    readMinutes: 2,
    date: "12 Aug 2026",
    author: "Kipit Compliance",
    standfirst:
      "NIN checks and liveness now complete in seconds, so withdrawals can be enabled the moment you finish.",
    sections: [
      {
        heading: "Instant checks",
        paragraphs: [
          "Tier 2 verification used to take up to 24 hours for manual review. NIN matching and the liveness check are now automated, so the vast majority of upgrades complete in under a minute.",
          "Address documents are still reviewed by a person, but they no longer block your withdrawal limit from being raised.",
        ],
      },
      {
        heading: "What Tier 2 unlocks",
        paragraphs: [
          "Withdrawals to your own Nigerian bank account, higher daily transaction limits, and access to partner products that require full KYC.",
          "You only need Tier 1 (email and BVN) to fund your wallet, use the Call Account and create fixed plans.",
        ],
      },
      {
        heading: "What you need ready",
        paragraphs: [
          "Your NIN, a well-lit space for the selfie check, and a recent utility bill or bank statement showing your address.",
        ],
      },
    ],
    cta: { label: "Open Verification Centre", to: "/verification" },
  },
  {
    id: "call-account-explained",
    tag: "Education",
    title: "How the Call Account pays you daily",
    body: "Interest accrues every day and compounds monthly — with no lock-up.",
    readMinutes: 3,
    date: "05 Aug 2026",
    author: "Kipit Research",
    standfirst:
      "The Call Account is the flexible layer of your portfolio. Here is exactly how the interest works.",
    sections: [
      {
        heading: "Daily accrual",
        paragraphs: [
          "Your balance earns interest for every calendar day it sits in the Call Account, including weekends and public holidays. Accrual is calculated on the closing balance each day.",
          "Money added today starts earning tomorrow; money withdrawn today keeps the interest already accrued.",
        ],
      },
      {
        heading: "Monthly credit",
        paragraphs: [
          "Accrued interest is credited to your Call Account balance on the first day of each month, after which it earns interest itself. That is what makes the effective return slightly higher than the quoted rate.",
        ],
      },
      {
        heading: "When to use it",
        paragraphs: [
          "Emergency funds, money waiting for a fixed plan to open, and short-term savings goals. Anything you might need at short notice belongs here rather than in a locked plan.",
        ],
      },
    ],
    cta: { label: "Open Call Account", to: "/call-account" },
  },
  {
    id: "building-a-ladder",
    tag: "Education",
    title: "Build a maturity ladder in four steps",
    body: "Stagger your tenors so cash frees up regularly without giving up rate.",
    readMinutes: 4,
    date: "29 Jul 2026",
    author: "Kipit Research",
    standfirst:
      "Laddering gives you long-tenor rates with short-tenor access. It takes about ten minutes to set up.",
    sections: [
      {
        heading: "Step 1 — Decide the total",
        paragraphs: [
          "Pick the amount you are comfortable locking, keeping at least three months of expenses in the Call Account first.",
        ],
      },
      {
        heading: "Step 2 — Split into four",
        paragraphs: [
          "Divide the total into four equal parts and place them into 90, 180, 270 and 365-day plans on the same day.",
        ],
      },
      {
        heading: "Step 3 — Roll each maturity into a 365",
        paragraphs: [
          "As each plan matures, reinvest it into a new 365-day plan. After a year, every rung is a one-year plan and one matures roughly every quarter.",
        ],
      },
      {
        heading: "Step 4 — Review annually",
        paragraphs: [
          "Once a year, check whether the ladder still matches your goals and top up rungs with new savings rather than starting a separate plan.",
        ],
      },
    ],
    cta: { label: "Create a fixed plan", to: "/fixed-plans" },
  },
  {
    id: "gifting-investments",
    tag: "Product update",
    title: "Gift an investment, not a transfer",
    body: "Send a funded fixed plan to family — they claim it with a phone number.",
    readMinutes: 2,
    date: "18 Jul 2026",
    author: "Kipit Product Team",
    standfirst:
      "Gifted plans arrive as a real investment with a rate and maturity date attached, not just cash.",
    sections: [
      {
        heading: "How it works",
        paragraphs: [
          "When creating a fixed plan, switch on 'Send as a gift' and enter the recipient's name and phone number. The plan is funded from your wallet and held in the recipient's name.",
          "They receive a claim link. Once they open a Kipit account and verify to Tier 1, the plan appears in their portfolio.",
        ],
      },
      {
        heading: "If it is not claimed",
        paragraphs: [
          "Unclaimed gifts expire after 30 days and the full amount is returned to your wallet. You can track every gift and its status in the Gifts screen.",
        ],
      },
    ],
    cta: { label: "See your gifts", to: "/gifts" },
  },
];

export const LEARN_CATEGORIES: LearnCategory[] = [
  "Product update",
  "Education",
  "Announcement",
];

export function getLearnArticle(id: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.id === id);
}
