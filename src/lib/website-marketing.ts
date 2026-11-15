/**
 * Shared marketing copy for the public website (Section A feedback).
 * Static rates — not live API rates.
 */

import kamLogo from "@/assets/brand/kipit-asset-management-logo.png";
import fredAnigbogu from "@/assets/about/fred-anigbogu.jpg";
import abrahamAwe from "@/assets/about/abraham-awe.jpg";
import lotannaIkeokwu from "@/assets/about/lotanna-ikeokwu.jpg";
import mohammedBajini from "@/assets/about/mohammed-bajini.jpg";
import mahmudGazara from "@/assets/about/mahmud-gazara.jpg";
import aaLegalLogo from "@/assets/about/aa-legal-logo.jpg";
import lukeOfojebe from "@/assets/about/luke-ofojebe.jpg";
import emmanuelEze from "@/assets/about/emmanuel-eze.jpg";
import stellaEziuka from "@/assets/about/stella-eziuka.jpg";
import taiwoRaji from "@/assets/about/taiwo-raji.jpg";
import munachisoChinedumEzor from "@/assets/about/munachiso-chinedum-ezor.jpg";
import ucheAnosike from "@/assets/about/uche-anosike.jpg";

export const TOP_FIXED_RATE = "22%";
export const TOP_FIXED_RATE_NUMBER = 22;
export const CALL_ACCOUNT_MARKETING = "up to 13%";
export const WHATSAPP_URL = "https://wa.me/2347071985171";
export const SUPPORT_PHONE = "+234 707 198 5171";
export const SUPPORT_EMAIL = "support@mykipit.com";
export const COMPANY_ADDRESS = "7/9 Molade Okoya-Thomas Street, Victoria Island, Lagos";
export const COMPANY_WEBSITE = "www.mykipit.com";

export const KAM_LOGO = kamLogo;

export const TRUST_STRIP = [
  "Held by our custodian, Rand Merchant Bank",
  "Interest accrues daily",
  "Same-day wallet settlement",
  "Bank-grade encryption",
  "BVN & NIN verified",
  "WhatsApp support",
  "Web & mobile",
] as const;

export const TRUST_STATEMENT =
  "Your funds are held by Rand Merchant Bank, our independent custodian, and managed by Kipit Asset Management. Both are licensed by the Securities and Exchange Commission (SEC).";

export const SECURITY_INTRO =
  "Your funds are held by Rand Merchant Bank, our independent custodian, and managed by Kipit Asset Management. Both are licensed by the Securities and Exchange Commission (SEC). Your account is protected by PIN, biometrics and verified identity.";

export const FOOTER_LEGAL =
  "© 2026 Kipit Asset Management. Client funds are held by Rand Merchant Bank as custodian and managed by Kipit Asset Management. Both are licensed by the Securities and Exchange Commission (SEC).";

export const FOOTER_LEGAL_MOBILE = `${FOOTER_LEGAL} Investments carry risk; rates shown are illustrative and subject to change.`;

export const FIXED_PLANS_DESCRIPTION =
  "Choose Kipit Lock for our highest rates, locked till maturity, with your interest paid upfront or at maturity. Or choose Kipit Flex for a fixed rate with a way out after 30 days. When your plan ends, your money is paid straight into your wallet.";

export const FIXED_PLANS_TAGS = [
  "Kipit Lock",
  "Kipit Flex",
  "Interest upfront or at maturity",
  "Same-day settlement",
] as const;

export const PROMISE_BODY =
  "Too many Nigerians work hard for their money, only to watch it lose value in savings accounts that pay less than inflation. Investing has often felt out of reach, with high minimums, unclear terms and too much paperwork. We started Kipit to change that. We give everyone access to professionally managed, SEC-regulated investments, with rates you can see upfront and plans you can start with just ₦1,000.";

export const PROMISE_ROWS = [
  { title: "Day one", body: "Interest starts the moment you invest" },
  { title: "Same day", body: "Matured plans land in your wallet" },
  { title: "₦1,000", body: "All it takes to get started" },
  { title: "Safe custody", body: "Your funds are held by Rand Merchant Bank" },
] as const;

export const SECURITY_POINTS = [
  {
    number: "01 / ACCOUNT SECURITY",
    title: "Bank-grade encryption",
    body: "Your data is encrypted in transit and at rest, and every sign-in is protected by your PIN and biometrics.",
    tags: ["Encrypted data", "PIN protection", "Biometric sign-in"],
  },
  {
    number: "02 / FUND MANAGEMENT",
    title: "SEC-licensed fund manager",
    body: "Your investments are managed by Kipit Asset Management, a fund manager licensed and regulated by the Securities and Exchange Commission (SEC).",
    tags: ["Kipit Asset Management", "SEC-licensed", "Professional fund management"],
  },
  {
    number: "03 / INVESTMENT CUSTODY",
    title: "Independent custodian",
    body: "Your funds are held with Rand Merchant Bank, our SEC-licensed custodian, in segregated accounts kept separate from Kipit's own money.",
    tags: ["Rand Merchant Bank", "SEC-licensed custodian", "Segregated custody"],
  },
] as const;

/** Appendix B — website FAQs */
export const MARKETING_FAQS: { q: string; a: string }[] = [
  {
    q: "What is Kipit?",
    a: "Kipit is the digital investment platform of Kipit Asset Management Limited (formerly Fortuna Capital Limited), a Fund/Portfolio Manager licensed by the Securities and Exchange Commission (SEC), Nigeria. On Kipit you can keep money in your wallet, earn daily interest in a Call Account, invest in fixed plans, and access Treasury Bills, Commercial Papers, Mutual Funds and Bonds.",
  },
  {
    q: "Is my money safe with Kipit?",
    a: "Yes. Your funds are held by Rand Merchant Bank, our independent custodian, and managed by Kipit Asset Management. Both are licensed and regulated by the Securities and Exchange Commission (SEC). Your account is also protected by encryption, PIN, biometrics and verified identity.",
  },
  {
    q: "Who holds my money?",
    a: "All client funds, including your wallet and Call Account balances, are held and administered by Rand Merchant Bank, our custodian. Kipit Asset Management manages your investments but your money is kept in segregated accounts, separate from Kipit's own funds.",
  },
  {
    q: "How do I open an account?",
    a: "Download the Kipit app on iOS or Android, or use our web app. You will need your BVN, a selfie and a debit card. It takes about 2 minutes and there is no branch visit.",
  },
  {
    q: "What is the minimum amount to start?",
    a: "You can start with just ₦1,000. This applies to the Call Account and all fixed plans. Offerings on Explore show their own minimum amount before you invest.",
  },
  {
    q: "What are account tiers?",
    a: "Each tier gives you higher limits. To move to Tier 1, complete your profile with your date of birth, marital status, next of kin, state of origin, LGA and residential address. Tier 2 requires further verification.",
  },
  {
    q: "How do I add money to my wallet?",
    a: "Go to Add Money and fund your wallet by bank transfer to your dedicated Kipit account or with your debit card. The money lands in your wallet, ready to invest.",
  },
  {
    q: "Are there charges for adding money?",
    a: "No. All deposits are free, whether you pay by bank transfer or debit card.",
  },
  {
    q: "How do I withdraw?",
    a: "You can withdraw from your wallet to your saved bank account at any time. Money in Kipit Lock becomes available at maturity. Money in Kipit Flex becomes available at maturity, or within 3 business days if you break the plan after 30 days.",
  },
  {
    q: "What is the Call Account?",
    a: "The Call Account lets you earn interest, calculated daily, on money you may need at any time. You can move money between your Call Account and wallet whenever you like.",
  },
  {
    q: "What are Kipit Lock and Kipit Flex?",
    a: "They are our two fixed plans. Kipit Lock gives you our highest rates for 30, 60, 90, 180 or 365 days, or a custom period of 31 days or more, and cannot be broken before maturity. Kipit Flex gives you a fixed rate for 60, 90, 180 or 365 days, or a custom period of 31 days or more, and can be broken after 30 days if you need your money. You see your rate and expected returns before you invest.",
  },
  {
    q: "How is my interest paid?",
    a: "On Kipit Lock, you choose to receive your interest upfront (paid into your wallet on day one) or at maturity (paid with your principal at the end). Upfront rates are slightly lower because the interest is paid before it is earned. On Kipit Flex, interest is paid at maturity.",
  },
  {
    q: "Are your rates before or after tax?",
    a: "We show both. Withholding tax of 10% is deducted from the interest you earn, as required by law. The gross rate is before tax and the net rate is what you actually earn. On every investment and statement you can see your gross interest, the withholding tax deducted and your net interest.",
  },
  {
    q: "Can I break a fixed plan before maturity?",
    a: "A Kipit Lock plan cannot be broken; your money stays invested until maturity. A Kipit Flex plan can be broken after 30 days from the date you invest or your most recent top-up. Breaking it withdraws the full amount (partial withdrawals are not allowed), you lose 50% of the interest accrued up to that date, and the money is credited to your wallet within 3 business days. Your principal is not affected.",
  },
  {
    q: "Can I add money to an existing plan?",
    a: "Yes. You can top up an existing Kipit Lock or Kipit Flex plan. The top-up earns interest at the plan's rate from the day it is received until the plan matures. On Kipit Lock with upfront interest, the interest on your top-up is paid into your wallet straight away.",
  },
  {
    q: "What is the difference between accrued interest and total interest?",
    a: "Accrued interest is the interest you have earned so far, calculated every day from the day you invest. Total (expected) interest is the full interest you will receive if you keep your plan until maturity.",
  },
  {
    q: "What happens when my plan matures?",
    a: "Your money is handled automatically according to the maturity instruction you chose: paid into your wallet, rolled over into a new plan, or moved to your Call Account. You will receive an in-app notification and an email confirming what was done.",
  },
  {
    q: "What can I find on Explore?",
    a: "Explore lists Treasury Bills, Commercial Papers, Mutual Funds and Bonds offerings. Active offerings are open for investment. Past offerings are closed and shown for reference only.",
  },
  {
    q: "How is my account protected?",
    a: "Your data is encrypted, and every sign-in is protected by your PIN and biometrics. We also email you whenever your profile is updated.",
  },
  {
    q: "What if I notice an activity I did not initiate?",
    a: `Contact our support team immediately on WhatsApp at ${SUPPORT_PHONE} or at ${SUPPORT_EMAIL}.`,
  },
  {
    q: "Can I get a statement of my investments?",
    a: "Yes. Go to Statements in your profile to download your monthly, quarterly or annual statement at any time.",
  },
  {
    q: "Does Kipit AI give investment advice?",
    a: "No. Kipit AI provides general information and guidance only, such as how our products work or when your plan matures. It does not recommend investments.",
  },
  {
    q: "How do I contact Kipit?",
    a: `Chat with us on WhatsApp at ${SUPPORT_PHONE}, email ${SUPPORT_EMAIL}, or visit us at ${COMPANY_ADDRESS}.`,
  },
];

export const ABOUT_INTRO =
  "Kipit Asset Management Limited, formerly Fortuna Capital Limited, is a Fund/Portfolio Manager licensed and regulated by the Securities and Exchange Commission (SEC), Nigeria. We help individuals, families, businesses and institutions create, grow, preserve and protect their wealth through professionally managed investments, delivered on a digital-first platform. Our leadership brings over 125 years of combined experience in financial services, investment management and banking, and all client funds are held with our custodian, Rand Merchant Bank.";

export const ABOUT_VISION = "To make Kipit and trust mean the same thing.";
export const ABOUT_MISSION = "Build wealth, deliberately.";
export const ABOUT_PHILOSOPHY =
  "Trust is the product. Everything else is how we deliver it. We see the people we serve as partners, not clients, and we measure our success by their financial progress.";

export const ABOUT_VALUES = [
  { letter: "K", title: "Keep Our Word", body: "We honour our commitments and responsibly safeguard the resources entrusted to us." },
  { letter: "I", title: "Integrity", body: "We uphold the highest ethical standards of honesty, fairness and professionalism." },
  { letter: "P", title: "Partnership", body: "We build lasting relationships founded on collaboration, mutual trust and shared success." },
  { letter: "I", title: "Intentionality", body: "We make deliberate, disciplined and well-informed decisions focused on long-term wealth." },
  { letter: "T", title: "Transparency", body: "We communicate openly and clearly so our partners can make informed decisions." },
] as const;

export const ABOUT_OFFERINGS = [
  { title: "Portfolio Management", body: "Discretionary and non-discretionary portfolios built around your goals, risk tolerance and investment horizon." },
  { title: "Fixed Income Solutions", body: "Access to government securities, corporate bonds, commercial papers and other fixed income instruments." },
  { title: "Wealth Advisory and Financial Planning", body: "Structured plans for wealth accumulation, retirement and passing wealth to the next generation." },
  { title: "Corporate and Institutional Solutions", body: "Customised investment mandates for companies, cooperatives, associations and other institutions." },
  { title: "Tailored Fund Management", body: "Bespoke strategies for clients whose needs go beyond standard investment products." },
  { title: "Financial Education", body: "Resources, programmes and insights that make investing simple and help you invest with confidence." },
] as const;

export const ABOUT_AUDIENCES = [
  { title: "Individual Investors", body: "From first-time savers to experienced investors growing and diversifying their portfolios." },
  { title: "Diaspora Investors", body: "Nigerians abroad who want a trusted partner to manage and grow their money at home." },
  { title: "Companies and Corporate Treasuries", body: "Businesses managing surplus cash while balancing risk, return and liquidity." },
  { title: "Cooperatives, Associations and Institutions", body: "Groups managing collective funds with transparency and professional oversight." },
  { title: "Clients Requiring Tailored Fund Management", body: "Individuals, families and institutions that need a customised investment strategy." },
] as const;

export const ABOUT_REGULATION = [
  { label: "Regulated by", value: "Securities and Exchange Commission (SEC), Nigeria" },
  { label: "Licence category", value: "Fund/Portfolio Manager" },
  { label: "Custodian", value: "Rand Merchant Bank" },
  { label: "Registration number", value: "RC 8735505" },
  { label: "Data protection", value: "Nigeria Data Protection Regulation (NDPR) and Nigeria Data Protection Act, 2023" },
] as const;

export type AboutPerson = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export const BOARD: AboutPerson[] = [
  {
    name: "Dr. Fred Ejike Anigbogu",
    role: "Chairman",
    image: fredAnigbogu,
    bio: "Dr. Fred Ejike Anigbogu is an investment and enterprise development professional with nearly four decades of experience in venture capital, investment appraisal, private-sector development and corporate leadership. He is the Managing Director of Unique Venture Capital Management Limited and previously served as Chief Investment Officer of Amalgamated Capital Fund Limited, with earlier leadership roles at National Risk Fund Plc. He holds a Ph.D. in Entrepreneurship from Babcock University and is a Fellow of the Institute of Chartered Accountants of Nigeria.",
  },
  {
    name: "Abraham Kayode Awe",
    role: "Managing Director",
    image: abrahamAwe,
    bio: "Abraham Kayode Awe is an asset management executive with more than two decades of experience in investment management, credit risk, portfolio strategy and governance. He has served as Managing Director of Fortuna Capital Limited (now Kipit Asset Management) and Redwood Asset Management Limited, and was Principal Asset Manager at Creditville Nigeria Limited. He holds a Master's degree in Managerial Psychology from the University of Ibadan, is a Member of the Chartered Institute of Bankers of Nigeria and a Fellow of the Institute of Credit Administration.",
  },
  {
    name: "Lotanna Ikeokwu",
    role: "Non-Executive Director",
    image: lotannaIkeokwu,
    bio: "Lotanna Ikeokwu is a corporate finance professional and entrepreneur with strong expertise in capital markets, transaction advisory, investment research and strategic business development. At Anchoria Advisory Services Limited, he worked on the structuring and execution of equity and debt transactions valued at over $500 million across banking, FMCG, microfinance and diversified financial services. He previously led the research function at Tulips Research Academy and holds a First Class B.Sc. in Economics from Alex Ekwueme Federal University.",
  },
  {
    name: "Mohammed Suleman Bajini",
    role: "Non-Executive Director",
    image: mohammedBajini,
    bio: "Mohammed Suleman Bajini is a seasoned banking executive with more than 35 years of experience in corporate banking, operations, regional leadership and strategic consultancy. He served as Regional Head, Abuja and North Central, at Keystone Bank and Bank PHB at Deputy General Manager level, after 16 years with Habib Nigeria Bank and an early career at First Bank of Nigeria. He holds an MBA from the Nigerian Defence Academy and brings deep expertise in business growth and banking operations.",
  },
  {
    name: "Mahmud Bako Gazara",
    role: "Non-Executive Director",
    image: mahmudGazara,
    bio: "Mahmud Bako Gazara is an accomplished executive with extensive experience in banking, investment management, corporate leadership and property development. He served as Managing Director and Chief Executive Officer of the Kaduna State Development and Property Company Limited, and held senior management roles at Bank PHB, Keystone Bank, FCMB, Mortgage Guaranty Savings and Loans and Access Bank. He holds an M.Sc. in Economics from the University of Jos and is a Fellow of the Institute of Chartered Economists of Nigeria.",
  },
  {
    name: "A&A Legal Practice",
    role: "Company Secretary",
    image: aaLegalLogo,
    bio: "A&A Legal Practice is a boutique corporate and commercial law firm with extensive experience in company secretarial services, corporate governance and regulatory compliance. Established in 2016, the firm supports businesses with board and executive advisory, statutory registers, board charters, governance frameworks, annual returns and post-incorporation filings. Its team combines strong legal expertise with practical knowledge of the financial services and technology sectors.",
  },
];

export const MANAGEMENT: AboutPerson[] = [
  {
    name: "Abraham Kayode Awe",
    role: "Managing Director",
    image: abrahamAwe,
    bio: "Abraham Kayode Awe is an asset management executive with more than two decades of experience in investment management, credit risk, portfolio strategy and governance. He has served as Managing Director of Fortuna Capital Limited (now Kipit Asset Management) and Redwood Asset Management Limited, and was Principal Asset Manager at Creditville Nigeria Limited. He holds a Master's degree in Managerial Psychology from the University of Ibadan, is a Member of the Chartered Institute of Bankers of Nigeria and a Fellow of the Institute of Credit Administration.",
  },
  {
    name: "Luke Ofojebe, CFA",
    role: "Chief Investment Officer",
    image: lukeOfojebe,
    bio: "Luke Ofojebe is an investment management professional with extensive experience in portfolio management, investment research, asset allocation and capital markets. Before joining Kipit, he served as Chief Investment Officer at Zedcrest Group, having earlier led its portfolio management function, and was Head of Research at Vetiva Capital Management Limited. He also held analyst roles at CardinalStone. Luke is a CFA charterholder and an Associate Chartered Stockbroker, and holds a B.Eng. in Mechanical Engineering from the University of Benin.",
  },
  {
    name: "Emmanuel Somtochukwu Eze",
    role: "Chief Operating Officer",
    image: emmanuelEze,
    bio: "Emmanuel Somtochukwu Eze is an operations, sales and relationship management professional with experience in client acquisition, business development and service delivery. As Chief Operating Officer, he leads the execution of operational priorities, client onboarding, performance monitoring and coordination across teams. He combines analytical ability with strong communication and stakeholder management skills, and holds a B.Sc. in Statistics from Alex Ekwueme Federal University, with professional certifications in project management and customer relationship management.",
  },
  {
    name: "Stella I. Eziuka",
    role: "Global Head, Wealth Advisory",
    image: stellaEziuka,
    bio: "Stella I. Eziuka is a growth, product and relationship management professional with more than 15 years of banking experience across SME finance, portfolio management and product development. She has held senior roles at Union Bank, Sterling Bank, Polaris Bank, Fidelity Bank and Diamond Bank, delivering measurable growth in deposits, risk assets and customer acquisition. She holds a Master's degree in International Affairs and Diplomacy and a Bachelor's degree in Banking and Finance, and is CBAP and SAFe Product Owner/Product Manager certified.",
  },
  {
    name: "Taiwo Olagunju Raji, ACA, ACTI",
    role: "Compliance",
    image: taiwoRaji,
    bio: "Taiwo Olagunju Raji is a chartered accountant, tax professional and financial services executive with more than three decades of experience in compliance, finance, administration and company secretarial services. He spent over two decades at Pilot Securities Limited, rising to General Manager, Finance and Administration, Chief Financial Officer, Company Secretary and Compliance Officer. He holds a B.Sc. in Accounting from the University of Lagos and is an Associate of the Institute of Chartered Accountants of Nigeria and the Chartered Institute of Taxation of Nigeria.",
  },
  {
    name: "Munachiso Chinedum-Ezor",
    role: "Corporate Services",
    image: munachisoChinedumEzor,
    bio: "Munachiso Chinedum-Ezor supports Kipit's corporate services function, coordinating administrative processes, internal documentation and day-to-day organisational requirements. Her work helps keep operations orderly and ensures that essential business support activities are handled efficiently across the organisation. She brings strong organisational ability, attention to detail, discretion and a collaborative approach to supporting colleagues. Munachiso holds a B.Sc. in Anatomy from Alex Ekwueme Federal University, Ndufu-Alike.",
  },
  {
    name: "Uche Anosike",
    role: "Fund Management",
    image: ucheAnosike,
    bio: "Uche Anosike contributes to Kipit's fund management function, supporting investment operations, documentation and portfolio-related coordination. He brings experience in administration, customer service and digital operations, with skills in records management, process coordination and data handling. He holds a B.Sc. in Physics with Electronics from Alex Ekwueme Federal University, Ndufu-Alike, and is proficient in Microsoft Office, QuickBooks and other digital productivity tools.",
  },
];

/** Marketing calculator default tenors (net illustrative rates aligned to Appendix D Lock at-maturity). */
export const MARKETING_TENORS = [
  { days: 30, rate: 10.0 },
  { days: 90, rate: 16.0 },
  { days: 180, rate: 19.0 },
  { days: 365, rate: 22.0 },
] as const;
