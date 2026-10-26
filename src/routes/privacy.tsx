import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Database, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { WebsiteV3Access, WEB_APP_LOGIN_URL, type AccessMode } from "@/components/kipit/WebsiteV3Access";
import "@/components/kipit/website-v3.css";
import "@/components/kipit/website-v3-contact.css";
import "@/components/kipit/website-v3-legal.css";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kipit" },
      { name: "description", content: "How Kipit collects, uses and protects your personal and financial information, and the choices you have." },
      { property: "og:title", content: "Privacy Policy — Kipit" },
      { property: "og:description", content: "What information Kipit collects, why we use it, who we share it with and how we keep it safe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/privacy" }],
  }),
  component: PrivacyPage,
});

const SECTIONS: { id: string; title: string; body: string[]; list?: string[] }[] = [
  { id: "introduction", title: "Introduction", body: ["We collect and store the personal and financial information you give us so you can access investment products and so we can meet our identity (KYC) and anti-money-laundering (AML) obligations.", "Your investments are held by Kipit Investment Ltd, which is licensed by the SEC as an asset manager. We look after your data in line with the Nigeria Data Protection Act and other applicable laws."] },
  { id: "collect", title: "Information we collect", body: [], list: ["Personal details: name, phone number, email address and bank details.", "Identity details needed for verification, such as BVN and NIN.", "Transaction history: deposits, investments and withdrawals.", "Device and browser data, used for security and to improve the app.", "Messages you send to our support team."] },
  { id: "use", title: "How we use your information", body: [], list: ["To verify your identity and run your account.", "To process your transactions securely.", "To protect your account and improve your experience.", "To send you important updates about your account and investments.", "To meet our legal and regulatory requirements."] },
  { id: "protect", title: "How we protect your information", body: ["We use encryption, secure servers and restricted access controls. Only staff who need your information to do their job can see it, and access is logged."] },
  { id: "sharing", title: "Sharing with third parties", body: ["We do not sell your data. We share information only where needed to run your account: with Kipit Investment Ltd, which holds your investments; with payment and banking partners that process your transactions; and with regulators or authorities when the law requires it."] },
  { id: "cookies", title: "Cookies", body: ["We use cookies to keep you signed in and to understand how the website is used. You can manage cookies in your browser settings."] },
  { id: "retention", title: "How long we keep data", body: ["We keep your data for as long as needed to provide the service and meet regulatory and security requirements. Some records must be kept after you close your account."] },
  { id: "rights", title: "Your rights", body: [], list: ["Ask for a copy of your personal data.", "Correct or update your details.", "Opt out of promotional messages at any time.", "Ask us to delete your data, where the law allows."] },
  { id: "changes", title: "Changes to this policy", body: ["We may update this policy from time to time. If we make significant changes, we will tell you in the app or by email."] },
];

function PrivacyPage() {
  const [access, setAccess] = useState<AccessMode>(null);

  return (
    <div className="kipit-website-v3 v3-legal-page min-h-screen">
      {/* Nav */}
      <WebsiteV3Nav forceScrolled onOpenAccess={() => setAccess("access")} />

      <main>
        <header className="v3-legal-hero">
          <div className="v3-container">
            <span className="v3-eyebrow">Legal</span>
            <h1 className="v3-legal-title mt-4">Privacy <span className="v3-gold-text">Policy.</span></h1>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-muted-foreground">What information Kipit collects, why we use it, and how we keep it safe.</p>
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
              <div><span className="v3-legal-icon"><Database className="size-5" /></span><h3>Only what we need</h3><p>We collect the details needed to open your account and meet regulatory rules.</p></div>
              <div><span className="v3-legal-icon"><Lock className="size-5" /></span><h3>Kept secure</h3><p>Encryption and restricted access protect your personal information.</p></div>
              <div><span className="v3-legal-icon"><UserCheck className="size-5" /></span><h3>Your control</h3><p>You can see, correct or ask us to delete your information.</p></div>
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
              <p>For questions about your data, email <a href="mailto:support@mykipit.com">support@mykipit.com</a>, call <a href="tel:+2347071985171">+234 707 198 5171</a>, or visit our <Link to="/contact">contact page</Link>.</p>
            </section>
          </article>
        </div>
      </main>

      <footer className="v3-footer">
        <div className="v3-container">
          <div className="v3-contact-footer"><div><Logo className="text-2xl" /><p className="mt-3 text-sm text-muted-foreground">Your wallet, Call Account and fixed plans in one place.</p></div><nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy" aria-current="page">Privacy</Link><Link to="/terms">Terms</Link><Link to="/delete-account">Delete account</Link><a href={WEB_APP_LOGIN_URL}>Log in</a><Button variant="link" className="v3-footer-link-btn" onClick={() => setAccess("access")}>Open account <ArrowRight className="size-4" /></Button></nav></div>
          <div className="border-t border-border py-6 text-xs leading-relaxed text-muted-foreground"><p>© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p><p className="mt-2">Investments carry risk; rates are subject to change.</p></div>
        </div>
      </footer>
      <WebsiteV3Access mode={access} onChange={setAccess} />
    </div>
  );
}
