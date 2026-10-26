import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WebsiteV3Access, WEB_APP_URL, WEB_APP_LOGIN_URL, WEB_APP_SIGNUP_URL, type AccessMode } from "@/components/kipit/WebsiteV3Access";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  ChevronDown,
  Gift,
  Landmark,
  Layers3,
  Lock,
  MessageCircle,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import { WebsiteV3Nav } from "@/components/kipit/WebsiteV3Nav";
import { WebsiteV3Calculator } from "@/components/kipit/WebsiteV3Calculator";
import { WebsiteAppPreview } from "@/components/kipit/WebsiteAppPreview";
import "@/components/kipit/website-v3.css";
import { ARTICLES } from "@/lib/articles";
import imgLife1 from "@/assets/v3-lifestyle-1.jpg";
import imgLife2 from "@/assets/v3-lifestyle-2.jpg";
import imgLife3 from "@/assets/v3-lifestyle-3.jpg";
import imgLagos from "@/assets/v3-lagos.jpg";
import imgStepSignup from "@/assets/v3-step-signup.jpg";
import imgStepFund from "@/assets/v3-step-fund.jpg";
import imgStepGrow from "@/assets/v3-step-grow.jpg";
import investScreen from "@/assets/v3-invest-screen.png";
import { GraduationCap, Globe, Home as HomeIcon, HeartHandshake, Plane } from "lucide-react";
import { AppleLogo, GooglePlayLogo } from "@/components/kipit/brand-icons";

const GOALS = [
  { icon: HomeIcon, value: "₦2.4m", label: "Rent goal" },
  { icon: GraduationCap, value: "₦850k", label: "School fees" },
  { icon: HeartHandshake, value: "₦1.2m", label: "Wedding" },
  { icon: Plane, value: "₦600k", label: "December trip" },
];

function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\D*)([\d.]+)(.*)$/);
  const [shown, setShown] = useState(m ? `${m[1]}0${m[3]}` : value);
  useEffect(() => {
    if (!m) return;
    const target = parseFloat(m[2]!);
    const decimals = (m[2]!.split(".")[1] ?? "").length;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(`${m[1]}${(target * eased).toFixed(decimals)}${m[3]}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown}</>;
}

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Kipit — Your money, working beautifully" },
      {
        name: "description",
        content:
          "Save, invest and plan with Kipit. A wallet, a daily-interest Call Account and fixed plans up to 19.2% p.a. — all in one bright, simple account.",
      },
      { property: "og:title", content: "Kipit — Your money, working beautifully" },
      {
        property: "og:description",
        content: "Wallet, Call Account and fixed plans up to 19.2% p.a. in one simple account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WebsiteV3Page,
});

const naira = (v: number) => `₦${Math.round(v).toLocaleString("en-NG")}`;


const STRIP = [
  "Held by Kipit Investment Ltd",
  "Interest accrues daily",
  "Same-day wallet settlement",
  "Bank-grade encryption",
  "BVN & NIN verified",
  "WhatsApp support",
  "Web & mobile",
];

const STATS = [
  { value: "₦4.2bn+", label: "Funds under management" },
  { value: "38k+", label: "Savers & investors" },
  { value: "19.2%", label: "Top fixed rate p.a." },
  { value: "T+0", label: "Wallet settlement" },
];

const STEPS = [
  { title: "Create your account", body: "Sign up with your email in under two minutes and verify with BVN or NIN.", img: imgStepSignup },
  { title: "Fund your wallet", body: "Bank transfer or card. Your wallet is the home base for every plan.", img: imgStepFund },
  { title: "Choose how to grow", body: "Earn daily in the Call Account or lock a fixed plan for a higher rate.", img: imgStepGrow },
];

const PRODUCTS = [
  { rate: "14.5%", name: "Call Account", body: "Earn daily on everyday money. Move to your wallet any time." },
  { rate: "19.2%", name: "Fixed Plans", body: "Lock 30–365 days, see a countdown to a guaranteed payout." },
  { rate: "Curated", name: "Explore", body: "Treasury bills, bonds and partner funds, vetted for you." },
];

const FEATURES = [
  { icon: CalendarClock, title: "Maturity countdowns", body: "Always know when your next payout lands." },
  { icon: Bell, title: "Smart nudges", body: "Salary-day reminders and rollover offers." },
  { icon: Gift, title: "Gift an investment", body: "Send a plan to someone you love." },
  { icon: MessageCircle, title: "Ask AI", body: "Instant answers about balances and plans." },
];

const TESTIMONIALS = [
  { quote: "I finally see all my money in one place. The maturity countdown is oddly satisfying.", name: "Adaeze O.", role: "Product designer, Lagos" },
  { quote: "Moved my emergency fund to the Call Account. It earns daily and I can still reach it.", name: "Tunde B.", role: "Engineer, Abuja" },
  { quote: "Clean, calm and clear. It feels like a private bank in my pocket.", name: "Halima S.", role: "Founder, Kano" },
];

const FAQS = [
  { q: "Is my money safe with Kipit?", a: "Your investments are held by Kipit Investment Ltd, an asset manager licensed by the SEC, and your account is protected with encryption, PIN and verified identity." },
  { q: "How quickly can I withdraw?", a: "Call Account funds move to your wallet instantly. Wallet withdrawals to your bank settle the same day." },
  { q: "What's the minimum to start?", a: "You can start with as little as ₦1,000 in the Call Account." },
  { q: "What happens when a fixed plan matures?", a: "Principal and interest settle to your wallet. You can roll over at the current rate or withdraw." },
];

const TENORS = [
  { days: 30, rate: 15.5 },
  { days: 90, rate: 17.0 },
  { days: 180, rate: 18.2 },
  { days: 365, rate: 19.2 },
];

function WebsiteV3Page() {
  const [amount, setAmount] = useState(500_000);
  const [tenor, setTenor] = useState<(typeof TENORS)[number]>(TENORS[1] ?? TENORS[0] ?? { days: 30, rate: 15.5 });
  const [faq, setFaq] = useState<number | null>(0);
  const [chooser, setChooser] = useState<AccessMode>(null);


  const interest = (amount * tenor.rate * tenor.days) / 36500;

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".kipit-website-v3 .v3-card, .kipit-website-v3 .v3-heading, .kipit-website-v3 .v3-article, .kipit-website-v3 .v3-reveal",
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
      <WebsiteV3Nav home onOpenAccess={() => setChooser("access")} />

      {/* Hero */}
      <header className="v3-hero">
        <div className="v3-hero-bg" />
        <div className="v3-container relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="v3-fade">
            <span className="v3-badge"><b>New</b> Fixed plans now settle same-day</span>
            <h1 className="v3-title mt-7">
              Earn up to 19.2%<br /> on your <span className="v3-serif v3-gold-text">naira.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-lg text-muted-foreground">
              A wallet, a daily-interest Call Account and fixed plans up to 19.2% p.a. — all in one account. Start with ₦1,000.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" className="v3-btn v3-btn-primary" onClick={() => setChooser("access")}>Start with ₦1,000 <ArrowRight className="size-4" /></button>
              <a href="#calculator" className="v3-btn v3-btn-outline">See what you could earn</a>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["AO", "TB", "HS", "KE"].map((i, idx) => (
                  <span key={i} className={`grid size-10 place-items-center rounded-full border-2 border-background text-xs font-bold ${idx % 2 ? "bg-brand text-brand-foreground" : "bg-gold text-gold-foreground"}`}>{i}</span>
                ))}
              </div>
              <div>
                <div className="flex text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <p className="text-sm text-muted-foreground">Loved by 38,000+ savers</p>
              </div>
            </div>
          </div>

          <div className="v3-hero-stage">
            <div className="v3-arch" />
            <WebsiteAppPreview />
            <div className="v3-float-card v3-float left-0 top-24 w-[210px] sm:left-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-secondary text-brand"><TrendingUp className="size-4" /></span>
                <p className="text-xs text-muted-foreground">Earned this week</p>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">+₦12,480</p>
              <div className="mt-2 flex h-8 items-end gap-1">
                {[40, 55, 50, 70, 65, 80, 72].map((h, i) => <span key={i} className="block flex-1 rounded-[3px] bg-gold" style={{ height: `${h}%` }} />)}
              </div>
            </div>
            <div className="v3-float-card v3-float-delay bottom-20 right-0 w-[220px] sm:right-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Fixed plan matured</p>
                <BadgeCheck className="size-4 text-brand" />
              </div>
              <p className="mt-1 text-lg font-bold">₦785,500</p>
              <p className="text-xs text-muted-foreground">Settled to wallet · today</p>
            </div>
          </div>
        </div>
      </header>

      {/* Strip */}
      <div className="v3-strip">
        <div className="v3-marquee">
          <div className="v3-marquee-track">
            {[...STRIP, ...STRIP].map((s, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap text-sm font-medium text-muted-foreground">
                <ShieldCheck className="size-4 text-gold" /> {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="v3-container grid grid-cols-2 gap-8 py-16 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="v3-reveal border-l border-border pl-6">
            <p className="text-4xl font-bold tracking-tight lg:text-5xl"><CountUp value={s.value} /></p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Products bento */}
      <section id="products" className="v3-section v3-glow v3-glow-mint-tr !pt-6">
        <div className="v3-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="v3-eyebrow">Products</span>
              <h2 className="v3-heading mt-4 max-w-[640px]">Pick how long you want to <span className="v3-serif">save.</span></h2>
            </div>
            <a href={WEB_APP_SIGNUP_URL} className="v3-btn v3-btn-outline">Compare plans <ArrowUpRight className="size-4" /></a>
          </div>

          <div className="v3-product-grid mt-12 grid gap-5 lg:grid-cols-3">
            <div id="fixed-plans" className="v3-card v3-card-navy lg:col-span-2 lg:row-span-2 flex flex-col justify-between min-h-[420px]">
              <div className="flex items-start justify-between">
                <span className="v3-icon"><Lock className="size-5" /></span>
                <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">Most popular</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fixed Plans · up to</p>
                <p className="v3-product-rate text-[88px] font-bold leading-none tracking-[-0.05em]">19.2<span className="text-4xl">% <span className="v3-product-rate-unit">p.a.</span></span></p>
                <p className="mt-4 max-w-[460px] text-muted-foreground">Lock 30 to 365 days and get a fixed payout date — principal plus interest, settled straight to your wallet.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["30–365 day tenors", "Auto-rollover", "Same-day settlement"].map((c) => (
                    <span key={c} className="rounded-full border border-white/20 px-3 py-1 text-xs">{c}</span>
                  ))}
                </div>
                <div className="v3-product-tenors hidden lg:grid">
                  {[30, 90, 180, 365].map((days) => <div key={days}><strong>{days}</strong><span>days</span></div>)}
                </div>
                <Button variant="ghost" className="v3-product-action hidden lg:flex" onClick={() => setChooser("access")}>Start a fixed plan <ArrowRight className="size-4" /></Button>
              </div>
            </div>
            <div id="call-account" className="v3-card v3-card-gold">
              <span className="v3-icon"><Wallet className="size-5" /></span>
              <p className="mt-6 text-sm text-muted-foreground">Call Account</p>
              <p className="text-5xl font-bold tracking-tight">14.5%</p>
              <p className="mt-3 text-sm text-muted-foreground">Daily interest on everyday money. Move to your wallet any time.</p>
              <Button variant="ghost" className="v3-product-action hidden lg:flex" onClick={() => setChooser("access")}>Open a Call Account <ArrowRight className="size-4" /></Button>
            </div>
            <div id="explore" className="v3-card v3-card-mint">
              <span className="v3-icon"><Layers3 className="size-5" /></span>
              <p className="mt-6 text-sm text-muted-foreground">Explore</p>
              <p className="text-5xl font-bold tracking-tight">Curated</p>
              <p className="mt-3 text-sm text-muted-foreground">T-bills, bonds and partner funds, vetted and explained.</p>
              <Button variant="ghost" className="v3-product-action hidden lg:flex" onClick={() => setChooser("access")}>Explore investments <ArrowRight className="size-4" /></Button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="v3-card !p-6">
                <span className="v3-icon !size-10"><f.icon className="size-4" /></span>
                <p className="mt-4 font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="v3-section v3-glow v3-glow-gold-bl border-y border-border">
        <div className="v3-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="v3-eyebrow">How it works</span>
              <h2 className="v3-heading mt-4 max-w-[560px]">Open an account in about <span className="v3-serif v3-gold-text">5 minutes.</span></h2>
              <p className="mt-5 max-w-[480px] text-muted-foreground">You need your BVN, a selfie and a debit card. No branch visit.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="v3-btn v3-btn-outline !h-12" onClick={() => setChooser("soon")}><Smartphone className="size-4" /> iOS & Android</Button>
              <a href={WEB_APP_URL} className="v3-btn v3-btn-outline !h-12"><Landmark className="size-4" /> Web app</a>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="v3-step-card v3-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="v3-step-media">
                  <img src={s.img} alt={s.title} loading="lazy" width={1024} height={768} />
                  <span className="v3-step-num-badge">0{i + 1}</span>
                </div>
                <div className="p-6 pt-5">
                  <p className="text-lg font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="v3-section v3-glow v3-glow-navy-tr">
        <WebsiteV3Calculator onAccess={() => setChooser("access")} />
        <div className="v3-container grid gap-10 lg:hidden">
          <div>
            <span className="v3-eyebrow">Calculator</span>
            <h2 className="v3-heading mt-4">Work out what you’d <span className="v3-serif">earn.</span></h2>
            <p className="mt-5 max-w-[440px] text-muted-foreground">Illustrative figures based on current fixed-plan rates. Actual rates are confirmed when you subscribe.</p>
            <div className="mt-10 hidden lg:block" aria-live="polite">
              <p className="text-sm text-muted-foreground">Total payout</p>
              <p className="mt-3 whitespace-nowrap text-5xl font-bold tabular-nums text-brand">{naira(amount + interest)}</p>
              <p className="mt-4 text-sm text-muted-foreground">Includes <span className="font-semibold text-foreground">{naira(interest)}</span> interest earned</p>
              <p className="mt-2 text-xs text-muted-foreground">at {tenor.rate}% p.a. over {tenor.days} days</p>
            </div>
            <ul className="mt-8 space-y-3 text-sm">
              {["No hidden fees", "Rate locked at subscription", "Payout settles to your wallet"].map((t) => (
                <li key={t} className="flex items-center gap-3"><BadgeCheck className="size-5 text-gold" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="v3-card !p-9 shadow-[var(--v3-shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{naira(amount)}</p>
            </div>
            <input aria-label="Investment amount" type="range" min={10_000} max={10_000_000} step={10_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="v3-range mt-4" />
            <p className="mt-8 text-sm text-muted-foreground">Tenor</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {TENORS.map((t) => (
                <button key={t.days} className="v3-seg" data-active={t.days === tenor.days} onClick={() => setTenor(t)}>{t.days}d</button>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-[var(--v3-cream)] p-5 sm:p-6 lg:hidden">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Interest earned</p>
                  <p className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums text-brand sm:text-2xl">+{naira(interest)}</p>
                </div>
                <div className="min-w-0 border-l border-border pl-3 sm:pl-4">
                  <p className="text-xs text-muted-foreground">Total payout</p>
                  <p className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums sm:text-2xl">{naira(amount + interest)}</p>
                </div>
              </div>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">at {tenor.rate}% p.a. over {tenor.days} days</p>
            </div>
            <Button type="button" className="v3-btn v3-btn-primary mt-6 w-full justify-center" onClick={() => setChooser("access")}>Start this plan <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      </section>

      {/* Lifestyle mosaic */}
      <section className="v3-section !pt-0">
        <div className="v3-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <span className="v3-eyebrow">Life, planned</span>
              <h2 className="v3-heading mt-4">What people save <span className="v3-serif v3-gold-text">for.</span></h2>
            </div>
            <p className="text-muted-foreground lg:max-w-[460px]">Rent next year, a wedding in December, school fees in September, or simply peace of mind — set a goal, pick a tenor, and let Kipit keep time.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { img: imgLife1, alt: "Woman checking her Kipit savings at home", tag: <>Emergency fund · <b>14.5% p.a.</b></> },
              { img: imgLife2, alt: "Couple planning their finances together", tag: <>Wedding plan · <b>180 days</b></> },
              { img: imgLife3, alt: "Professional reviewing his fixed plan", tag: <>Rent goal · <b>365 days</b></> },
            ].map((p, i) => (
              <figure key={p.alt} className="v3-photo v3-reveal h-[320px] sm:h-[380px]" style={{ transitionDelay: `${i * 100}ms` }}>
                <img src={p.img} alt={p.alt} loading="lazy" />
                <figcaption className="v3-photo-tag">{p.tag}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GOALS.map((g, i) => (
              <div key={g.label} className="v3-card v3-reveal !p-6 flex items-center gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="v3-icon !size-11 shrink-0"><g.icon className="size-4" /></span>
                <div>
                  <p className="text-xl font-bold leading-tight">{g.value}</p>
                  <p className="text-xs text-muted-foreground">{g.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="v3-section v3-glow v3-glow-gold-tr">
        <div className="v3-container">
          <span className="v3-eyebrow">Stories</span>
          <h2 className="v3-heading mt-4 max-w-[640px]">What customers <span className="v3-serif">say.</span></h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="v3-card flex flex-col justify-between">
                <div className="flex text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <blockquote className="mt-5 text-lg leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">{t.name[0]}</span>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="v3-security-desktop" aria-labelledby="v3-security-title">
        <div className="v3-container">
          <div className="v3-security-layout">
            <div>
              <div className="v3-security-header">
                <span className="v3-eyebrow">Built on trust</span>
                <h2 id="v3-security-title">How we keep<br /><span>your money safe.</span></h2>
                <p>Your investments are held by Kipit Investment Ltd, an SEC-licensed asset manager. Your account is protected by PIN and verified ID.</p>
              </div>
              <div className="v3-security-details">
              <div className="v3-security-item"><span className="v3-security-icon"><Lock size={23} /></span><div><span className="v3-security-number">01 / ACCOUNT SECURITY</span><h3>Bank-grade encryption</h3><p>Data encrypted in transit and at rest, with PIN and biometric sign-in.</p><div className="v3-security-tags"><span>Encrypted data</span><span>PIN protection</span><span>Biometric sign-in</span></div></div></div>
              <div className="v3-security-item"><span className="v3-security-icon"><Landmark size={23} /></span><div><span className="v3-security-number">02 / INVESTMENT CUSTODY</span><h3>SEC-licensed asset manager</h3><p>Your investments are held by Kipit Investment Ltd, licensed by the SEC as an asset manager, with funds kept in segregated custody.</p><div className="v3-security-tags"><span>Kipit Investment Ltd</span><span>SEC-licensed</span><span>Segregated custody</span></div></div></div>
            </div>
            </div>
            <div className="v3-security-art">
              <div className="website-device" aria-label="Kipit app invest screen preview">
                <span className="website-device-island" aria-hidden />
                <div className="website-device-screen">
                  <img src={investScreen} alt="The real Kipit Invest screen showing the Call Account balance and fixed plans" loading="lazy" />
                </div>
              </div>
              <div className="v3-security-caption"><ShieldCheck size={17} /><span>Protection at every step.</span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="v3-section v3-glow v3-glow-navy-tr lg:hidden">
        <div className="v3-container grid gap-5 lg:grid-cols-3">
          <div className="v3-card v3-card-navy lg:col-span-1">
            <span className="v3-icon"><ShieldCheck className="size-5" /></span>
            <h3 className="mt-6 text-3xl font-bold tracking-tight">How your money is kept safe.</h3>
            <p className="mt-3 text-muted-foreground">Your investments are held by Kipit Investment Ltd, an SEC-licensed asset manager. Your account is protected by PIN and verified ID.</p>
          </div>
          {[
            { icon: Lock, t: "Bank-grade encryption", b: "Data encrypted in transit and at rest, with PIN and biometric sign-in." },
            { icon: PiggyBank, t: "SEC-licensed asset manager", b: "Your investments are held by Kipit Investment Ltd, licensed by the SEC as an asset manager, with funds in segregated custody." },
          ].map((x) => (
            <div key={x.t} className="v3-card">
              <span className="v3-icon"><x.icon className="size-5" /></span>
              <h3 className="mt-6 text-xl font-semibold">{x.t}</h3>
              <p className="mt-2 text-muted-foreground">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn */}
      <section id="learn" className="v3-section v3-glow v3-glow-mint-bl">
        <div className="v3-container">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="v3-heading">Guides to saving and investing</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ARTICLES.map((a) => (
              <Link key={a.id} to="/learn/$articleId" params={{ articleId: a.id }} className="v3-article group">
                <div className="v3-article-img">
                  <img src={a.img} alt={a.title} loading="lazy" className="size-full object-cover" />
                  <span className="v3-article-chip absolute left-4 top-4">{a.tag}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-lg font-semibold leading-snug group-hover:text-brand">{a.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-brand">
                    {a.mins} min read <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="v3-section v3-glow v3-glow-cream">
        <div className="v3-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="v3-eyebrow">FAQs</span>
            <h2 className="v3-heading mt-4">Common <span className="v3-serif">questions</span></h2>
            <p className="mt-4 text-muted-foreground">Everything you need to know before you start.</p>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="v3-help-card mt-8">
              <span className="v3-help-icon"><Globe className="size-5" /></span>
              <span>
                <span className="block font-semibold">Still curious?</span>
                <span className="block text-sm text-muted-foreground">Chat with us on WhatsApp any time</span>
              </span>
            </a>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`v3-faq-card ${faq === i ? "is-open" : ""}`}>
                <button className="flex w-full items-center gap-5 p-6 text-left text-lg font-semibold" onClick={() => setFaq(faq === i ? null : i)}>
                  <span className="v3-faq-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{f.q}</span>
                  <span className="v3-faq-toggle"><ChevronDown className={`size-4 transition-transform ${faq === i ? "rotate-180" : ""}`} /></span>
                </button>
                {faq === i && <p className="-mt-2 pb-6 pl-[76px] pr-6 text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="v3-section v3-glow v3-glow-gold-tr">
        <div className="v3-container v3-promise-grid grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="v3-reveal">
            <span className="v3-eyebrow">Our promise</span>
            <h2 className="v3-heading mt-4">Why we started <span className="v3-serif v3-gold-text">Kipit.</span></h2>
            <p className="mt-5 max-w-[460px] text-muted-foreground">Most savings accounts in Nigeria pay less than inflation. We wanted rates that are clear upfront, plans you can start with ₦1,000, and interest you can check every day.</p>
            <ol className="mt-8 grid gap-3">
              {[["Day one", "Interest starts the moment you invest"], ["Same day", "Matured plans land in your wallet"], ["₦1,000", "All it takes to get started"]].map(([v, l], i) => (
                <li key={v} className="v3-promise-row">
                  <span className="v3-promise-num">0{i + 1}</span>
                  <div className="min-w-0 flex-1"><p className="text-lg font-bold text-brand">{v}</p><p className="text-sm text-muted-foreground">{l}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="v3-reveal v3-promise-art">
            <img src={imgLagos} alt="Lagos skyline at golden hour" loading="lazy" width={1600} height={912} className="v3-promise-img" />
            <div className="v3-promise-badge">
              <span className="v3-eyebrow !text-gold">Made for Nigeria</span>
              <p className="mt-2 text-lg font-bold leading-snug">Every plan is in naira, with rates shown before you pay.</p>
            </div>
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
              { h: "Products", l: [["Call Account", "#call-account"], ["Fixed Plans", "#fixed-plans"], ["Explore", "#explore"], ["Calculator", "#calculator"]] },
              { h: "Company", l: [["About", "/about"], ["How it works", "#how"], ["Learn", "/#learn"], ["FAQs", "#faqs"]] },
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
                <li><a href="#faqs">Common questions</a></li>
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
              { h: "Products", l: [["Call Account", "#call-account"], ["Fixed Plans", "#fixed-plans"], ["Explore", "#explore"], ["Calculator", "#calculator"]] },
              { h: "Company", l: [["About", "/about"], ["How it works", "#how"], ["Learn", "/#learn"], ["FAQs", "#faqs"]] },
              { h: "Account", l: [["Open account", "chooser"], ["Log in", WEB_APP_LOGIN_URL], ["Web app", WEB_APP_URL]] },
              { h: "Talk to us", l: [["Help & support", "/contact"], ["Common questions", "#faqs"], ["Privacy policy", "/privacy"], ["Terms & conditions", "/terms"], ["Delete account", "/delete-account"]] },
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
