import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  WebsiteV3Access,
  WEB_APP_URL,
  WEB_APP_LOGIN_URL,
  type AccessMode,
} from "@/components/kipit/WebsiteV3Access";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { AppleLogo, GooglePlayLogo } from "@/components/kipit/brand-icons";
import "@/components/kipit/website-v3.css";
import imgLagos from "@/assets/v3-lagos.jpg";
import imgLife3 from "@/assets/v3-lifestyle-3.jpg";
import {
  ABOUT_AUDIENCES,
  ABOUT_INTRO,
  ABOUT_MISSION,
  ABOUT_OFFERINGS,
  ABOUT_PHILOSOPHY,
  ABOUT_REGULATION,
  ABOUT_VALUES,
  ABOUT_VISION,
  BOARD,
  COMPANY_ADDRESS,
  COMPANY_WEBSITE,
  FOOTER_LEGAL,
  FOOTER_LEGAL_MOBILE,
  MANAGEMENT,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  WHATSAPP_URL,
  type AboutPerson,
} from "@/lib/website-marketing";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About Kipit Asset Management" },
      {
        name: "description",
        content:
          "Kipit Asset Management Limited (formerly Fortuna Capital Limited) is an SEC-licensed Fund/Portfolio Manager. Client funds are held with Rand Merchant Bank.",
      },
      { property: "og:title", content: "About Kipit Asset Management" },
      {
        property: "og:description",
        content:
          "SEC-licensed fund manager. Client funds held with Rand Merchant Bank. Board and management leadership.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kipit.online/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/about" }],
  }),
  component: WebsiteV3AboutPage,
});

function PersonCard({ person }: { person: AboutPerson }) {
  return (
    <article className="v3-about-person v3-reveal">
      <img src={person.image} alt={person.name} width={112} height={112} loading="lazy" />
      <div>
        <h3>{person.name}</h3>
        <p className="role">{person.role}</p>
        <p>{person.bio}</p>
      </div>
    </article>
  );
}

function WebsiteV3AboutPage() {
  const [chooser, setChooser] = useState<AccessMode>(null);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".kipit-website-v3 .v3-card, .kipit-website-v3 .v3-heading, .kipit-website-v3 .v3-reveal, .kipit-website-v3 .v3-about-person",
    );
    els.forEach((el) => el.classList.add("v3-anim"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("v3-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="kipit-website-v3 min-h-screen">
      <WebsiteV3Nav current="about" onOpenAccess={() => setChooser("access")} />

      <header className="v3-section v3-glow v3-glow-gold-tr !pt-[130px]">
        <div className="v3-container grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="v3-reveal">
            <span className="v3-eyebrow">About Kipit</span>
            <h1 className="v3-title mt-6">
              Kipit Asset Management <span className="v3-serif v3-gold-text">Limited.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-lg text-muted-foreground">{ABOUT_INTRO}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" className="v3-btn v3-btn-primary" onClick={() => setChooser("access")}>
                Open account <ArrowRight className="size-4" />
              </button>
              <a href="/#how" className="v3-btn v3-btn-outline">See how it works</a>
            </div>
          </div>
          <div className="v3-reveal v3-promise-art">
            <img src={imgLagos} alt="Lagos skyline at golden hour" width={1600} height={912} className="v3-promise-img" />
            <div className="v3-promise-badge">
              <span className="v3-eyebrow !text-gold">Formerly Fortuna Capital Limited</span>
              <p className="mt-2 text-lg font-bold leading-snug">SEC-licensed Fund/Portfolio Manager. Funds held with Rand Merchant Bank.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="v3-section !pt-0">
        <div className="v3-container grid gap-5 md:grid-cols-3">
          {[
            { label: "Our vision", body: ABOUT_VISION },
            { label: "Our mission", body: ABOUT_MISSION },
            { label: "Our philosophy", body: ABOUT_PHILOSOPHY },
          ].map((item) => (
            <div key={item.label} className="v3-card v3-reveal">
              <span className="v3-eyebrow">{item.label}</span>
              <p className="mt-4 text-lg font-semibold leading-snug">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="v3-section v3-glow v3-glow-mint-tr !pt-0">
        <div className="v3-container">
          <span className="v3-eyebrow">Our core values</span>
          <h2 className="v3-heading mt-4">What <span className="v3-serif">KIPIT</span> stands for.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ABOUT_VALUES.map((v) => (
              <div key={v.title} className="v3-card v3-reveal !p-6">
                <p className="font-display text-3xl font-extrabold text-gold">{v.letter}</p>
                <p className="mt-3 font-semibold">{v.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="v3-section !pt-0">
        <div className="v3-container grid gap-12 lg:grid-cols-2">
          <div>
            <span className="v3-eyebrow">What we offer</span>
            <h2 className="v3-heading mt-4">Professionally managed <span className="v3-serif">solutions.</span></h2>
            <div className="mt-8 grid gap-4">
              {ABOUT_OFFERINGS.map((o) => (
                <div key={o.title} className="v3-reveal border-l border-border pl-5">
                  <p className="font-semibold">{o.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="v3-eyebrow">Who we serve</span>
            <h2 className="v3-heading mt-4">Partners across <span className="v3-serif">Nigeria.</span></h2>
            <div className="mt-8 grid gap-4">
              {ABOUT_AUDIENCES.map((a) => (
                <div key={a.title} className="v3-reveal border-l border-border pl-5">
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="v3-section v3-glow v3-glow-navy-tr !pt-0">
        <div className="v3-container max-w-[760px]">
          <span className="v3-eyebrow">Regulation and custody</span>
          <h2 className="v3-heading mt-4">Licensed. Segregated. <span className="v3-serif">Held safely.</span></h2>
          <dl className="v3-reg-table mt-8 v3-reveal">
            {ABOUT_REGULATION.map((row) => (
              <div key={row.label} className="v3-reg-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="v3-section !pt-0">
        <div className="v3-container">
          <span className="v3-eyebrow">Board of Directors</span>
          <h2 className="v3-heading mt-4">Governance and <span className="v3-serif">oversight.</span></h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {BOARD.map((person) => (
              <PersonCard key={`${person.name}-${person.role}`} person={person} />
            ))}
          </div>
        </div>
      </section>

      <section className="v3-section v3-glow v3-glow-gold-tr !pt-0">
        <div className="v3-container">
          <span className="v3-eyebrow">Management Team</span>
          <h2 className="v3-heading mt-4">The people who run <span className="v3-serif">Kipit.</span></h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {MANAGEMENT.map((person) => (
              <PersonCard key={`${person.name}-${person.role}`} person={person} />
            ))}
          </div>
        </div>
      </section>

      <section className="v3-section !pt-0">
        <div className="v3-container">
          <div className="v3-card v3-reveal !p-8 lg:!p-12">
            <span className="v3-eyebrow">Contact us</span>
            <h2 className="v3-heading mt-4">Talk to the <span className="v3-serif">Kipit</span> team.</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              <li className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                    {SUPPORT_PHONE}
                  </a>
                  <span className="mt-1 block text-muted-foreground">Phone and WhatsApp</span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold hover:underline">{SUPPORT_EMAIL}</a>
                  <span className="mt-1 block text-muted-foreground">Email</span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Globe className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold">{COMPANY_WEBSITE}</span>
                  <span className="mt-1 block text-muted-foreground">Website</span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold">{COMPANY_ADDRESS}</span>
                  <span className="mt-1 block text-muted-foreground">Address</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-container">
          <div className="v3-cta v3-reveal grid gap-10 p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-16">
            <div>
              <span className="v3-eyebrow !text-gold">Get Kipit</span>
              <h2 className="v3-heading mt-4">Open your <span className="v3-serif text-gold">Kipit</span> account.</h2>
              <p className="mt-4 max-w-[480px] opacity-75">Download the app or open the web app. Start with as little as ₦1,000.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="ghost" className="v3-store !h-auto" aria-label="Download on the App Store" onClick={() => setChooser("soon")}>
                  <AppleLogo className="size-7" />
                  <span><small>Download on the</small>App Store</span>
                </Button>
                <Button variant="ghost" className="v3-store !h-auto" aria-label="Get it on Google Play" onClick={() => setChooser("soon")}>
                  <GooglePlayLogo className="size-6" />
                  <span><small>Get it on</small>Google Play</span>
                </Button>
                <a href={WEB_APP_URL} className="v3-store" aria-label="Open the web app">
                  <Globe className="size-6 text-gold" />
                  <span><small>Use it in your browser</small>Web app</span>
                </a>
              </div>
            </div>
            <div className="relative hidden h-[300px] lg:block">
              <img src={imgLife3} alt="Kipit user checking his plans" loading="lazy" className="v3-cta-photo" />
              <div className="v3-float-card v3-float bottom-6 -left-6 w-[200px] !text-foreground">
                <p className="text-xs text-muted-foreground">Rated by savers</p>
                <p className="mt-1 flex items-center gap-1 text-xl font-bold">4.8 <Star className="size-4 fill-gold text-gold" /></p>
                <p className="text-xs text-muted-foreground">App Store & Google Play</p>
              </div>
            </div>
            <div className="v3-cta-photo-m">
              <img src={imgLife3} alt="Kipit saver reviewing his plans" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <footer className="v3-footer">
        <div className="v3-container">
          <div className="hidden gap-12 py-14 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
            <div>
              <Logo className="font-display text-2xl" />
              <p className="mt-4 max-w-[280px] text-sm text-muted-foreground">Your wallet, Call Account and fixed plans in one place.</p>
            </div>
            {[
              { h: "Products", l: [["Call Account", "/#call-account"], ["Fixed Plans", "/#fixed-plans"], ["Explore", "/#explore"], ["Calculator", "/#calculator"]] },
              { h: "Company", l: [["About", "/about"], ["How it works", "/#how"], ["Learn", "/#learn"], ["FAQs", "/#faqs"]] },
              { h: "Account", l: [["Open account", "chooser"], ["Log in", WEB_APP_LOGIN_URL], ["Web app", WEB_APP_URL]] },
            ].map((c) => (
              <div key={c.h}>
                <p className="v3-footer-h">{c.h}</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {c.l.map(([label, href]) => (
                    <li key={label}>
                      {href === "chooser" ? (
                        <Button variant="link" className="v3-footer-link-btn !h-auto !justify-start" onClick={() => setChooser("access")}>{label}</Button>
                      ) : (
                        <a href={href}>{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="v3-footer-h">Talk to us</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link to="/contact">Contact us</Link></li>
                <li><Link to="/contact">Help & support</Link></li>
                <li><a href="/#faqs">Common questions</a></li>
              </ul>
            </div>
          </div>

          <div className="v3-footer-bottom hidden md:flex">
            <p>{FOOTER_LEGAL}</p>
            <div className="flex gap-6"><Link to="/privacy">Legal documents & risk disclosure</Link><Link to="/terms">Terms & conditions</Link><Link to="/delete-account">Delete account</Link></div>
          </div>
          <p className="hidden pb-6 text-xs text-muted-foreground md:block">Investments carry risk; rates shown are illustrative and subject to change.</p>

          <div className="v3-mfoot md:hidden">
            <div className="v3-mfoot-card">
              <Logo className="font-display text-2xl" />
              <p className="v3-mfoot-tag">Your wallet, Call Account and fixed plans in one place.</p>
              <div className="v3-mfoot-actions">
                <button type="button" className="v3-btn v3-btn-gold" onClick={() => setChooser("access")}>Open account<ArrowRight className="size-4" /></button>
                <a href={WEB_APP_LOGIN_URL} className="v3-btn v3-btn-outline">Log in</a>
              </div>
            </div>
            {[
              { h: "Products", l: [["Call Account", "/#call-account"], ["Fixed Plans", "/#fixed-plans"], ["Explore", "/#explore"], ["Calculator", "/#calculator"]] },
              { h: "Company", l: [["About", "/about"], ["How it works", "/#how"], ["Learn", "/#learn"], ["FAQs", "/#faqs"]] },
              { h: "Account", l: [["Open account", "chooser"], ["Log in", WEB_APP_LOGIN_URL], ["Web app", WEB_APP_URL]] },
              { h: "Talk to us", l: [["Help & support", "/contact"], ["Common questions", "/#faqs"], ["Privacy policy", "/privacy"], ["Terms & conditions", "/terms"], ["Delete account", "/delete-account"]] },
            ].map((c) => (
              <details key={c.h} className="v3-mfoot-col">
                <summary>
                  {c.h}
                  <ChevronDown className="size-4" />
                </summary>
                <ul>
                  {c.l.map(([label, href]) => (
                    <li key={label}>
                      {href === "chooser" ? (
                        <button type="button" onClick={() => setChooser("access")}>{label}</button>
                      ) : (
                        <a href={href}>{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <p className="v3-mfoot-legal">{FOOTER_LEGAL_MOBILE}</p>
            <p className="v3-mfoot-mark" aria-hidden>Kipit.</p>
          </div>
        </div>
      </footer>

      <WebsiteV3Access mode={chooser} onChange={setChooser} />
    </div>
  );
}
