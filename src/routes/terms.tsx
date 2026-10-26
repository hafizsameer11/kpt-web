import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, FileText, Landmark, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { WebsiteV3Access, WEB_APP_LOGIN_URL, type AccessMode } from "@/components/kipit/WebsiteV3Access";
import "@/components/kipit/website-v3.css";
import "@/components/kipit/website-v3-contact.css";
import "@/components/kipit/website-v3-legal.css";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Kipit" },
      { name: "description", content: "The terms that apply when you open and use a Kipit account: deposits, the Call Account, fixed plans, withdrawals and account security." },
      { property: "og:title", content: "Terms & Conditions — Kipit" },
      { property: "og:description", content: "The terms that apply when you open and use a Kipit account, including product terms, withdrawals and risk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/terms" }],
  }),
  component: TermsPage,
});

const SECTIONS: { id: string; title: string; body: string[]; list?: string[] }[] = [
  { id: "agreement", title: "Agreement to these terms", body: ["These terms apply when you open a Kipit account and use any of our services: your wallet, the Call Account, fixed plans and curated investments. By creating an account you agree to them.", "If you do not agree with these terms, please do not open or use an account. Your investments are held by Kipit Investment Ltd, which is licensed by the SEC as an asset manager."] },
  { id: "eligibility", title: "Opening an account", body: [], list: ["You must be at least 18 years old and resident in Nigeria.", "You must give accurate personal details and complete identity verification (BVN, NIN) when asked.", "You are responsible for keeping your login details and PIN confidential.", "We may decline or close an account where verification fails or the law requires it."] },
  { id: "wallet", title: "Your wallet", body: ["The wallet holds money you have deposited but not yet invested. Money in your wallet does not earn interest. You can move money from your wallet into any available product, or withdraw it to your bank account.", "Deposits are confirmed once we receive the funds from your bank or payment provider. Withdrawals are processed to the bank account you nominate; we may take additional time for security checks."] },
  { id: "call-account", title: "Call Account terms", body: ["The Call Account earns interest daily on the balance you keep in it. Interest accrues each day and is paid into your Call Account balance.", "There is no fixed tenor: you can move money out to your wallet at any time. The rate can change from time to time, and we will show the current rate in the app before you commit funds."] },
  { id: "fixed-plans", title: "Fixed plan terms", body: ["A fixed plan locks an amount for a chosen tenor of 30 to 365 days at a rate agreed when you subscribe. At maturity, the principal and the agreed interest are paid to your wallet.", "Fixed plans are not flexible savings: the rate applies for the full tenor and early termination is not available unless we state otherwise for a specific plan. Where a plan matures and you take no action, we will ask how you want the payout handled."] },
  { id: "curated", title: "Curated investments", body: ["Curated investments give access to third-party instruments such as treasury bills, bonds and partner funds. Each product is described in the app with its own rate, minimum amount and tenor before you commit.", "These products are offered by their issuers or managers, not by Kipit. Kipit presents them, processes your subscription and holds records of your investment; it does not guarantee their performance."] },
  { id: "returns", title: "Interest, returns and rates", body: ["Rates shown in the app, on this website and in the calculator are illustrative unless confirmed at the time you invest. Rates may change between the time you view a product and the time you subscribe.", "Interest and returns are not guaranteed. Fixed plans pay the rate agreed at subscription; wallet and Call Account balances follow the prevailing rate."] },
  { id: "risk", title: "Risk disclosure", body: ["All investments carry risk, including the possible loss of principal. Past performance does not indicate future results. You should only invest money you can commit for the chosen period.", "Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC. Kipit does not provide personalised financial advice; the app, articles and calculators are general information."] },
  { id: "security", title: "Account security", body: ["Your account is protected by your password, PIN and device. Do not share your PIN, passwords or verification codes with anyone, including people claiming to be Kipit staff.", "Tell us immediately if you suspect unauthorised activity. We may suspend an account or delay transactions where we detect unusual activity or a security concern."] },
  { id: "closing", title: "Closing your account", body: ["You can close your account once all investments have matured and balances have been withdrawn. We may keep records for the period required by law after your account is closed.", "We may restrict, suspend or close an account, and report to the relevant authorities, where we reasonably suspect fraud, money laundering or a breach of these terms."] },
  { id: "changes", title: "Changes to these terms", body: ["We may update these terms from time to time. When we make significant changes, we will tell you in the app or by email before they take effect. Continuing to use your account after a change means you accept the updated terms."] },
  { id: "law", title: "Governing law", body: ["These terms are governed by the laws of the Federal Republic of Nigeria, and any dispute will be resolved in the Nigerian courts."] },
];

function TermsPage() {
  const [access, setAccess] = useState<AccessMode>(null);

  return (
    <div className="kipit-website-v3 v3-legal-page min-h-screen">
      {/* Nav */}
      <WebsiteV3Nav forceScrolled onOpenAccess={() => setAccess("access")} />

      <main>
        <header className="v3-legal-hero">
          <div className="v3-container">
            <span className="v3-eyebrow">Legal</span>
            <h1 className="v3-legal-title mt-4">Terms <span className="v3-gold-text">&amp; Conditions.</span></h1>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-muted-foreground">The terms that apply when you open a Kipit account and use your wallet, Call Account, fixed plans and curated investments.</p>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: October 2026</p>
          </div>
        </header>

        <div className="v3-container v3-legal-layout">
          <aside className="v3-legal-toc" aria-label="On this page">
            <p>On this page</p>
            {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
            <a href="#contact">Contact us</a>
          </aside>

          <article>
            <div className="v3-legal-summary">
              <div><span className="v3-legal-icon"><FileText className="size-5" /></span><h3>Your agreement</h3><p>These terms apply from the moment you open a Kipit account.</p></div>
              <div><span className="v3-legal-icon"><Landmark className="size-5" /></span><h3>Who holds your money</h3><p>Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p></div>
              <div><span className="v3-legal-icon"><ShieldAlert className="size-5" /></span><h3>Risk matters</h3><p>Investments carry risk, and returns are not guaranteed. Only commit what you can set aside.</p></div>
            </div>

            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="v3-legal-section">
                <h2><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                {s.body.map((p) => <p key={p}>{p}</p>)}
                {s.list && <ul>{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
              </section>
            ))}
            <section id="contact" className="v3-legal-section">
              <h2><span>{String(SECTIONS.length + 1).padStart(2, "0")}</span>Contact us</h2>
              <p>For questions about these terms, email <a href="mailto:support@mykipit.com">support@mykipit.com</a>, call <a href="tel:+2347071985171">+234 707 198 5171</a>, or visit our <Link to="/contact">contact page</Link>.</p>
            </section>
          </article>
        </div>
      </main>

      <footer className="v3-footer">
        <div className="v3-container">
          <div className="v3-contact-footer"><div><Logo className="text-2xl" /><p className="mt-3 text-sm text-muted-foreground">Your wallet, Call Account and fixed plans in one place.</p></div><nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms" aria-current="page">Terms</Link><Link to="/delete-account">Delete account</Link><a href={WEB_APP_LOGIN_URL}>Log in</a><Button variant="link" className="v3-footer-link-btn" onClick={() => setAccess("access")}>Open account <ArrowRight className="size-4" /></Button></nav></div>
          <div className="border-t border-border py-6 text-xs leading-relaxed text-muted-foreground"><p>© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p><p className="mt-2">Investments carry risk; rates are subject to change.</p></div>
        </div>
      </footer>
      <WebsiteV3Access mode={access} onChange={setAccess} />
    </div>
  );
}
