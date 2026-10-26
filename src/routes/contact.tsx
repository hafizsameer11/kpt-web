import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { WebsiteV3Access, WEB_APP_LOGIN_URL, type AccessMode } from "@/components/kipit/WebsiteV3Access";
import "@/components/kipit/website-v3.css";
import "@/components/kipit/website-v3-contact.css";
import lagos from "@/assets/v3-lagos.jpg";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact Kipit — account and investment support" },
      { name: "description", content: "Contact Kipit for help with your account or investments. Email support@mykipit.com, call +234 707 198 5171, or find our Victoria Island office." },
      { property: "og:title", content: "Contact Kipit — account and investment support" },
      { property: "og:description", content: "Get in touch with the Kipit support team by email or phone. Find our contact details and Victoria Island office address." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [access, setAccess] = useState<AccessMode>(null);
  const [draftOpened, setDraftOpened] = useState(false);

  function composeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Kipit enquiry: ${String(data.get("topic"))}`);
    const body = encodeURIComponent(`Name: ${String(data.get("name"))}\nEmail: ${String(data.get("email"))}\n\n${String(data.get("message"))}`);
    window.location.href = `mailto:support@mykipit.com?subject=${subject}&body=${body}`;
    setDraftOpened(true);
  }

  return (
    <div className="kipit-website-v3 v3-contact-page min-h-screen">
      {/* Nav */}
      <WebsiteV3Nav forceScrolled current="contact" onOpenAccess={() => setAccess("access")} />

      <main>
        <div className="v3-container v3-contact-layout">
          <div className="v3-contact-details">
            <header className="v3-contact-intro">
              <span className="v3-eyebrow">Talk to us</span>
              <h1 className="v3-contact-title mt-4">Contact <span className="v3-gold-text">Kipit.</span></h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">A question about your account, a plan, or a payment? Get in touch with our team.</p>
            </header>
            <div className="v3-contact-method">
              <span className="v3-contact-icon"><Mail className="size-5" /></span>
              <div><h2>Email us</h2><a href="mailto:support@mykipit.com">support@mykipit.com <ArrowUpRight className="inline size-4" /></a><p className="mt-2 text-sm text-muted-foreground">For account help and general enquiries.</p></div>
            </div>
            <div className="v3-contact-method">
              <span className="v3-contact-icon"><Phone className="size-5" /></span>
              <div><h2>Call us</h2><a href="tel:+2347071985171">+234 707 198 5171 <ArrowUpRight className="inline size-4" /></a><p className="mt-2 text-sm text-muted-foreground">Speak with the Kipit support team.</p></div>
            </div>
            <div className="v3-contact-method">
              <span className="v3-contact-icon"><MapPin className="size-5" /></span>
              <div><h2>Our office</h2><p className="max-w-[320px] text-base font-medium leading-relaxed">First Floor, 7/9 Molade Okoya Thomas Street, Victoria Island, Lagos</p><a className="mt-3 inline-flex items-center gap-2 !text-sm" href="https://www.google.com/maps/search/?api=1&query=7%2F9%20Molade%20Okoya%20Thomas%20Street%2C%20Victoria%20Island%2C%20Lagos" target="_blank" rel="noopener noreferrer">View on map <ArrowUpRight className="size-4" /></a></div>
            </div>
          </div>

          <form className="v3-contact-form" onSubmit={composeEmail}>
            <h2 className="text-2xl font-semibold">What can we help with?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Include the email linked to your Kipit account so we can find your details.</p>
            <div className="v3-contact-fields">
              <label className="v3-contact-field">Your name<input name="name" autoComplete="name" required maxLength={120} placeholder="Full name" /></label>
              <label className="v3-contact-field">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
              <label className="v3-contact-field v3-contact-field-wide">What is this about?<select name="topic" defaultValue="" required><option value="" disabled>Select a topic</option><option>Account and onboarding</option><option>Investments and plans</option><option>Payments and withdrawals</option><option>General enquiry</option></select></label>
              <label className="v3-contact-field v3-contact-field-wide">Your message<textarea name="message" required maxLength={5000} placeholder="Tell us what happened or what you would like to know." /></label>
            </div>
            <p className="v3-contact-note mt-4">This opens an email draft in your email app. Review it and send it to our support team.</p>
            <Button type="submit" className="v3-btn v3-btn-primary v3-contact-submit">Compose email <ArrowUpRight className="size-4" /></Button>
            {draftOpened && <p className="v3-contact-status" role="status">Your email app has been requested. Your message has not been sent yet. If it didn’t open, email <a className="underline" href="mailto:support@mykipit.com">support@mykipit.com</a> directly.</p>}
          </form>
        </div>

        <section className="v3-container v3-contact-location" aria-label="Kipit in Lagos">
          <img src={lagos} alt="Lagos waterfront skyline" loading="lazy" />
          <div className="v3-contact-location-content"><span className="v3-eyebrow !text-gold">Based in Lagos</span><h2>Here when you need us.</h2><p className="text-sm leading-relaxed">Support for your account, your investments, and the questions that come along the way.</p></div>
        </section>
      </main>

      <footer className="v3-footer">
        <div className="v3-container">
          <div className="v3-contact-footer"><div><Logo className="text-2xl" /><p className="mt-3 text-sm text-muted-foreground">Your wallet, Call Account and fixed plans in one place.</p></div><nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact" aria-current="page">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/delete-account">Delete account</Link><a href={WEB_APP_LOGIN_URL}>Log in</a><Button variant="link" className="v3-footer-link-btn" onClick={() => setAccess("access")}>Open account <ArrowRight className="size-4" /></Button></nav></div>
          <div className="border-t border-border py-6 text-xs leading-relaxed text-muted-foreground"><p>© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p><p className="mt-2">Investments carry risk; rates are subject to change.</p></div>
        </div>
      </footer>
      <WebsiteV3Access mode={access} onChange={setAccess} />
    </div>
  );
}