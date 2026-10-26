import imgCall from "@/assets/learn-call-account.jpg";
import imgLadder from "@/assets/learn-building-a-ladder.jpg";
import imgTenor from "@/assets/learn-tenor-and-yield.jpg";

export interface Article {
  id: string;
  tag: string;
  title: string;
  img: string;
  mins: number;
  excerpt: string;
  sections: { h: string; p: string[] }[];
}

export const ARTICLES: Article[] = [
  {
    id: "call-account-explained",
    tag: "Education",
    title: "How the Call Account pays you daily",
    img: imgCall,
    mins: 4,
    excerpt: "Daily interest, explained with real numbers — how your balance earns while you sleep.",
    sections: [
      { h: "What daily interest means", p: ["The Call Account earns interest every day on the balance you keep in it. Each day, the app calculates interest on your closing balance and adds it to the account. Because the interest itself earns interest from the next day, your balance grows slightly faster than a simple annual calculation suggests.", "There is no fixed tenor and no notice period. Money stays available: you can move it to your wallet at any time and withdraw to your bank the same day."] },
      { h: "An example, with real numbers", p: ["Say you keep ₦100,000 in the Call Account at an illustrative 14.5% per annum. One day's interest is ₦100,000 × 14.5% ÷ 365 — about ₦39. Over a month that is roughly ₦1,200, without doing anything.", "The rate changes from time to time, and the app always shows the current rate before you commit money. These figures are illustrative, not a promise of what you will earn."] },
      { h: "When the Call Account makes sense", p: ["The Call Account is for money you may need soon but does not need to sit idle: an emergency fund, savings for a rent deadline, or cash waiting for the right fixed plan.", "For money you can lock away for a known period, a fixed plan usually pays more, because you are rewarding the fund with certainty. Many people use both: a Call Account for flexibility, fixed plans for higher rates."] },
      { h: "How to start", p: ["Open an account, fund your wallet, and move money into the Call Account. Interest starts accruing the same day and shows up on your balance daily. Start with as little as ₦1,000."] },
    ],
  },
  {
    id: "tenor-and-yield",
    tag: "Education",
    title: "Understanding tenor and effective yield",
    img: imgTenor,
    mins: 5,
    excerpt: "Why a 90-day plan can out-earn a year of saving — the maths behind tenor.",
    sections: [
      { h: "What tenor means", p: ["Tenor is simply how long your money stays locked in a fixed plan — 30, 90, 180 or 365 days. In exchange for that certainty, the plan pays a higher rate than an everyday account.", "A longer tenor is not automatically better. The right tenor is the one that matches when you will actually need the money."] },
      { h: "Rate vs effective yield", p: ["The headline rate (say 18.2% p.a.) is annualised. For a shorter plan, you earn that rate only for the days your money is invested. On a 90-day plan, ₦100,000 at an illustrative 18.2% earns about ₦4,488 — ₦100,000 × 18.2% × 90/365.", "Effective yield asks a different question: if you keep reinvesting the proceeds at the same rate all year, what do you actually end up with? Rolling over a matured plan keeps your money compounding instead of sitting idle between plans."] },
      { h: "Why a shorter plan can out-earn a longer one", p: ["Rates change. If you lock a 365-day plan and rates rise in the meantime, you miss the better rate. A 90-day plan matures sooner and lets you reinvest at the new, higher rate.", "The reverse is also true: if rates fall, a long plan keeps your old, better rate for the full tenor. That is the trade-off tenor buys you — certainty versus flexibility."] },
      { h: "What this means in practice", p: ["Before subscribing, ask when you need the money. If the answer is 'not for a year', a 365-day plan locks today's rate. If it is 'maybe in three months', keep the money flexible in the Call Account or use a shorter plan."] },
    ],
  },
  {
    id: "building-a-ladder",
    tag: "Education",
    title: "Building a maturity ladder",
    img: imgLadder,
    mins: 6,
    excerpt: "Stagger your plans so money matures every month, not once a year.",
    sections: [
      { h: "What a maturity ladder is", p: ["Instead of locking all your savings into one plan that matures on one date, you split the money across several plans with different tenors. When each rung matures, that money becomes available — and you can spend it or reinvest it for a new term.", "The result is that money comes back to you regularly instead of all at once, while every naira still earns a fixed-plan rate."] },
      { h: "A simple example", p: ["Suppose you have ₦300,000 you will not need for a year. Rather than one 365-day plan, you could split it:", "• ₦100,000 in a 30-day plan\n• ₦100,000 in a 90-day plan\n• ₦100,000 in a 180-day plan", "When the first plan matures, you decide: withdraw, or start a new plan from that rung. Each maturity gives you a fresh decision point — and keeps the rest of the ladder earning."] },
      { h: "Why stagger instead of one big plan", p: ["A ladder protects you from guessing wrong about rates and about your own calendar. If an emergency comes up, a rung is maturing soon. If rates rise, you can move a matured rung to the better rate instead of waiting a full year.", "It also builds the habit: each maturity is a natural moment to review your plan and top up."] },
      { h: "Getting started", p: ["Start with the amount you can genuinely set aside, choose tenors that match real dates in your life (rent, school fees, a project), and stagger them across the year. Roll over at maturity, and the ladder keeps running on its own."] },
    ],
  },
];

export function getArticle(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
