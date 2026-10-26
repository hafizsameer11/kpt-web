import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/kipit/Logo";

const ITEMS: { label: string; anchor?: string; to?: string }[] = [
  { label: "Products", anchor: "products" },
  { label: "How it works", anchor: "how" },
  { label: "Calculator", anchor: "calculator" },
  { label: "Learn", anchor: "learn" },
  { label: "FAQs", anchor: "faqs" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/**
 * Shared Website 3 header. Renders the same menu on every page.
 * - `home` renders plain hash anchors for in-page scrolling on the homepage.
 * - `current` marks the active page ("about" | "contact").
 * - `forceScrolled` keeps the solid nav style on pages without a tall hero.
 */
export function WebsiteV3Nav({
  home = false,
  current,
  forceScrolled = false,
  onOpenAccess,
}: {
  home?: boolean;
  current?: "about" | "contact";
  forceScrolled?: boolean;
  onOpenAccess: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (forceScrolled) return;
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [forceScrolled]);

  return (
    <nav className="v3-nav" data-scrolled={forceScrolled || scrolled} aria-label="Main navigation">
      <div className="v3-container flex h-[72px] items-center justify-between">
        <Link to="/" aria-label="Kipit home" className="font-display text-xl">
          <Logo />
        </Link>
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {ITEMS.map((item) => {
            const active = item.to?.endsWith(`/${current}`) && current;
            const cls = `v3-nav-link${active ? " font-semibold text-brand" : ""}`;
            if (item.anchor) {
              return home ? (
                <a key={item.label} href={`#${item.anchor}`} className={cls}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to="/" hash={item.anchor} className={cls}>
                  {item.label}
                </Link>
              );
            }
            return (
              <Link key={item.label} to={item.to!} className={cls} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="hidden items-center gap-5 lg:flex">
          <Link to="/login" search={{}} className="v3-nav-link font-semibold">
            Log in
          </Link>
          <Button className="v3-btn v3-btn-primary !h-11 !px-5 !text-sm" onClick={onOpenAccess}>
            Open account <ArrowRight className="size-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </Button>
      </div>
      {menu && (
        <div className="v3-container flex flex-col gap-4 pb-6 lg:hidden">
          {ITEMS.map((item) => {
            const active = item.to?.endsWith(`/${current}`) && current;
            const cls = `v3-nav-link text-base${active ? " font-semibold text-brand" : ""}`;
            return item.anchor ? (
              home ? (
                <a key={item.label} href={`#${item.anchor}`} className={cls} onClick={() => setMenu(false)}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to="/" hash={item.anchor} className={cls} onClick={() => setMenu(false)}>
                  {item.label}
                </Link>
              )
            ) : (
              <Link key={item.label} to={item.to!} className={cls} onClick={() => setMenu(false)} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
          <Link to="/login" search={{}} className="v3-nav-link text-base font-semibold" onClick={() => setMenu(false)}>
            Log in
          </Link>
          <Button className="v3-btn v3-btn-primary justify-center" onClick={() => { setMenu(false); onOpenAccess(); }}>
            Open account <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}
