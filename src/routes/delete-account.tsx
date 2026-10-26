import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Landmark, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { WebsiteV3Access, WEB_APP_LOGIN_URL, type AccessMode } from "@/components/kipit/WebsiteV3Access";
import "@/components/kipit/website-v3.css";
import "@/components/kipit/website-v3-contact.css";
import "@/components/kipit/website-v3-legal.css";

export const Route = createFileRoute("/delete-account")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Delete your Kipit account — Kipit" },
      { name: "description", content: "How to delete your Kipit account, what happens to your balances and investments, and what we keep for regulatory reasons." },
      { property: "og:title", content: "Delete your Kipit account — Kipit" },
      { property: "og:description", content: "Step-by-step instructions to delete your Kipit account, plus what happens to your money and data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/delete-account" }],
  }),
  component: DeleteAccountPage,
});

const STEPS = [
  { t: "Withdraw your balances", d: "Move any wallet balance to your bank account, and let any fixed plans or investments reach maturity. Investments that are still running must mature before the account can be closed — they cannot be cancelled." },
  { t: "Open your settings", d: "Sign in to the web app, then go to Settings and choose Account." },
  { t: "Choose Delete account", d: "Tap Delete account and confirm with your PIN. We will show you exactly what will happen to your balances and data before you confirm." },
  { t: "Final confirmation", d: "Once you confirm, your account is scheduled for deletion and you are signed out. You will receive a confirmation email." },
];

const FAQS = [
  { q: "Can I delete my account while I have an active investment?", a: "No. The investment has to mature first. When it pays out to your wallet, withdraw the balance, then delete your account." },
  { q: "What happens to my money when I delete the account?", a: "Nothing is lost. You must withdraw your wallet balance before closing — if a balance remains, we will contact you to nominate a bank account before completing the deletion." },
  { q: "Can I reopen the account later?", a: "Yes. You can sign up again with the same details at any time. You will need to complete identity verification again, and your previous investment history is not restored." },
  { q: "What data do you keep after deletion?", a: "We keep the records the law requires us to keep, such as transaction records and identity verification details, for the period set by regulation. They stay locked and are not used for marketing." },
  { q: "Can I ask you to delete it for me?", a: "Yes. Email support@mykipit.com from the address on your account, or call +234 707 198 5171, and our team will handle it after confirming your identity." },
];

function DeleteAccountPage() {
  const [access, setAccess] = useState<AccessMode>(null);

  return (
    <div className="kipit-website-v3 v3-legal-page min-h-screen">
      {/* Nav */}
      <WebsiteV3Nav forceScrolled onOpenAccess={() => setAccess("access")} />

      <main>
        <header className="v3-legal-hero">
          <div className="v3-container">
            <span className="v3-eyebrow">Account</span>
            <h1 className="v3-legal-title mt-4">Delete your <span className="v3-gold-text">account.</span></h1>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-muted-foreground">You can delete your Kipit account at any time. Here is how it works, what happens to your money, and what we keep for regulatory reasons.</p>
          </div>
        </header>

        <div className="v3-container v3-legal-layout">
          <aside className="v3-legal-toc" aria-label="On this page">
            <p>On this page</p>
            <a href="#steps">How to delete your account</a>
            <a href="#faqs">Questions</a>
            <a href="#contact">Contact us</a>
          </aside>

          <article>
            <div className="v3-legal-summary">
              <div><span className="v3-legal-icon"><Landmark className="size-5" /></span><h3>Your money first</h3><p>Withdraw your balances and let investments mature before closing.</p></div>
              <div><span className="v3-legal-icon"><Lock className="size-5" /></span><h3>Confirmed by you</h3><p>Deletion is confirmed with your PIN, and we email you a receipt.</p></div>
              <div><span className="v3-legal-icon"><Mail className="size-5" /></span><h3>Or ask us</h3><p>Prefer a person? Email or call us and we will delete it for you.</p></div>
            </div>

            <section id="steps" className="v3-legal-section">
              <h2><span>01</span>How to delete your account</h2>
              <ol className="v3-dacct-steps">
                {STEPS.map((s, i) => (
                  <li key={s.t}>
                    <span className="v3-dacct-num">{String(i + 1).padStart(2, "0")}</span>
                    <div><h3>{s.t}</h3><p>{s.d}</p></div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="faqs" className="v3-legal-section">
              <h2><span>02</span>Questions</h2>
              <dl className="v3-dacct-faqs">
                {FAQS.map((f) => (
                  <div key={f.q}>
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="contact" className="v3-legal-section">
              <h2><span>03</span>Contact us</h2>
              <p>To request deletion by email, write to <a href="mailto:support@mykipit.com">support@mykipit.com</a> from the address on your account, call <a href="tel:+2347071985171">+234 707 198 5171</a>, or use our <Link to="/contact">contact page</Link>.</p>
            </section>
          </article>
        </div>
      </main>

      <footer className="v3-footer">
        <div className="v3-container">
          <div className="v3-contact-footer"><div><Logo className="text-2xl" /><p className="mt-3 text-sm text-muted-foreground">Your wallet, Call Account and fixed plans in one place.</p></div><nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/delete-account" aria-current="page">Delete account</Link><a href={WEB_APP_LOGIN_URL}>Log in</a><Button variant="link" className="v3-footer-link-btn" onClick={() => setAccess("access")}>Open account <ArrowRight className="size-4" /></Button></nav></div>
          <div className="border-t border-border py-6 text-xs leading-relaxed text-muted-foreground"><p>© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p><p className="mt-2">Investments carry risk; rates are subject to change.</p></div>
        </div>
      </footer>
      <WebsiteV3Access mode={access} onChange={setAccess} />
    </div>
  );
}
