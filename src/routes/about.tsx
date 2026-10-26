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
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe,
  Landmark,
  Layers3,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { AppleLogo, GooglePlayLogo } from "@/components/kipit/brand-icons";
import "@/components/kipit/website-v3.css";
import imgLagos from "@/assets/v3-lagos.jpg";
import imgLife2 from "@/assets/v3-lifestyle-2.jpg";
import imgLife3 from "@/assets/v3-lifestyle-3.jpg";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About Kipit — our mission and approach" },
      {
        name: "description",
        content:
          "Kipit helps Nigerians access regulated investment products with transparent, defined returns. Learn what we do, how we invest, and why we started.",
      },
      { property: "og:title", content: "About Kipit — our mission and approach" },
      {
        property: "og:description",
        content:
          "Structured investment plans with defined tenors and transparent rates — built for every Nigerian.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kipit.online/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kipit.online/about" }],
  }),
  component: WebsiteV3AboutPage,
});


const STATS = [
  { value: "₦4.2bn+", label: "Funds under management" },
  { value: "38k+", label: "Savers & investors" },
  { value: "19.2%", label: "Top fixed rate p.a." },
  { value: "T+0", label: "Wallet settlement" },
];

const PILLARS = [
  {
    icon: TrendingUp,
    num: "01 / THE GAP",
    title: "Bridging the investment gap",
    body: "Most savings accounts in Nigeria pay less than inflation. Kipit packages institutional-style opportunities — defined tenors, competitive rates up to 19.2% p.a. and clear payout timing — into a format everyday investors can understand and access.",
  },
  {
    icon: Landmark,
    num: "02 / THE PRODUCTS",
    title: "Regulated, structured products only",
    body: "A daily-interest Call Account, fixed plans from 30 to 365 days, and a curated Explore shelf of treasury bills, bonds and partner funds. No speculative assets, no complex derivatives. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.",
  },
  {
    icon: Layers3,
    num: "03 / THE APPROACH",
    title: "Discipline over speculation",
    body: "Fixed-income instruments with transparent pricing, rates shown before you pay, and capital preservation as the goal — not trading. Every plan shows its tenor, rate and payout date upfront.",
  },
];

const WHY = [
  "Rates shown upfront — no hidden variables",
  "Start with as little as ₦1,000",
  "Interest accrues daily, visible in the app",
  "Same-day settlement to your wallet at maturity",
  "Support on WhatsApp when you need a human",
];

function WebsiteV3AboutPage() {
  const [chooser, setChooser] = useState<AccessMode>(null);


  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".kipit-website-v3 .v3-card, .kipit-website-v3 .v3-heading, .kipit-website-v3 .v3-reveal",
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
      {/* Nav */}
      <WebsiteV3Nav current="about" onOpenAccess={() => setChooser("access")} />

      {/* Hero */}
      <header className="v3-section v3-glow v3-glow-gold-tr !pt-[130px]">
        <div className="v3-container grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="v3-reveal">
            <span className="v3-eyebrow">About Kipit</span>
            <h1 className="v3-title mt-6">
              Investing in Nigeria, <span className="v3-serif v3-gold-text">made clear.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-lg text-muted-foreground">
              Kipit helps Nigerians grow wealth intentionally — structured investment plans with
              defined tenors, transparent rates and interest you can watch accrue every day.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" className="v3-btn v3-btn-primary" onClick={() => setChooser("access")}>Open account <ArrowRight className="size-4" /></button>
              <a href="/#how" className="v3-btn v3-btn-outline">See how it works</a>
            </div>
          </div>
          <div className="v3-reveal v3-promise-art">
            <img src={imgLagos} alt="Lagos skyline at golden hour" width={1600} height={912} className="v3-promise-img" />
            <div className="v3-promise-badge">
              <span className="v3-eyebrow !text-gold">Made for Nigeria</span>
              <p className="mt-2 text-lg font-bold leading-snug">Every plan is in naira, with rates shown before you pay.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="v3-container grid grid-cols-2 gap-8 py-16 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="v3-reveal border-l border-border pl-6">
            <p className="text-4xl font-bold tracking-tight lg:text-5xl">{s.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* What Kipit does */}
      <section className="v3-section v3-glow v3-glow-mint-tr !pt-6">
        <div className="v3-container">
          <div className="max-w-[640px]">
            <span className="v3-eyebrow">What Kipit does</span>
            <h2 className="v3-heading mt-4">Investment access designed to make growth <span className="v3-serif">visible.</span></h2>
            <p className="mt-5 text-muted-foreground">
              Instead of letting money sit in products that offer no meaningful return, Kipit gives
              you access to structured investment options with defined timelines and competitive returns.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.num} className="v3-card v3-reveal flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="v3-icon"><p.icon className="size-5" /></span>
                  <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">{p.num}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="v3-section !pt-0">
        <div className="v3-container">
          <div className="v3-reveal relative overflow-hidden rounded-[28px] bg-brand-gradient px-8 py-14 text-primary-foreground shadow-float lg:px-16 lg:py-20">
            <span aria-hidden className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]" />
            <div className="relative max-w-[720px]">
              <span className="v3-eyebrow !text-gold">Our mission</span>
              <h2 className="v3-heading mt-4 !text-primary-foreground">
                To democratize investment access for <span className="v3-serif text-gold">every Nigerian.</span>
              </h2>
              <p className="mt-5 max-w-[560px] text-primary-foreground/75">
                Wealth-building should be easier, fairer and more accessible. We combine disciplined
                product design, transparent information and a simpler digital experience to get there.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
                {[["₦1,000", "Minimum to start"], ["19.2%", "Top fixed rate p.a."], ["T+0", "Wallet settlement"]].map(([v, l]) => (
                  <div key={l}>
                    <p className="font-display text-2xl font-extrabold text-gold lg:text-3xl">{v}</p>
                    <p className="mt-1 text-xs text-primary-foreground/60">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why people choose Kipit */}
      <section className="v3-section v3-glow v3-glow-navy-tr !pt-0">
        <div className="v3-container grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="v3-reveal v3-promise-art order-last lg:order-first">
            <img src={imgLife2} alt="A Kipit saver reviewing her plans" loading="lazy" className="v3-promise-img" />
            <div className="v3-promise-badge">
              <span className="v3-eyebrow !text-gold">Protection at every step</span>
              <p className="mt-2 text-lg font-bold leading-snug">Encryption, PIN and verified identity on every account.</p>
            </div>
          </div>
          <div className="v3-reveal">
            <span className="v3-eyebrow">Why Kipit</span>
            <h2 className="v3-heading mt-4">Why people choose <span className="v3-serif v3-gold-text">Kipit.</span></h2>
            <p className="mt-5 max-w-[460px] text-muted-foreground">
              Everything is designed around clarity, consistency and easier access to wealth-building products.
            </p>
            <ul className="mt-8 grid auto-rows-fr gap-3 sm:grid-cols-2">
              {WHY.map((w, i) => (
                <li
                  key={w}
                  className={`flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 ${
                    i === WHY.length - 1 ? "sm:col-span-2 sm:items-center" : ""
                  }`}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-brand">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium leading-snug">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
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

      {/* Footer */}
      <footer className="v3-footer">
        <div className="v3-container">
          {/* Desktop footer */}
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
            <p>© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC.</p>
            <div className="flex gap-6"><Link to="/privacy">Legal documents & risk disclosure</Link><Link to="/terms">Terms & conditions</Link><Link to="/delete-account">Delete account</Link></div>
          </div>
          <p className="hidden pb-6 text-xs text-muted-foreground md:block">Investments carry risk; rates shown are illustrative and subject to change.</p>

          {/* Mobile footer */}
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
            <p className="v3-mfoot-legal">© 2026 Kipit. Investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC. Investments carry risk; rates shown are illustrative and subject to change.</p>
            <p className="v3-mfoot-mark" aria-hidden>Kipit.</p>
          </div>
        </div>
      </footer>

      <WebsiteV3Access mode={chooser} onChange={setChooser} />
    </div>
  );
}
