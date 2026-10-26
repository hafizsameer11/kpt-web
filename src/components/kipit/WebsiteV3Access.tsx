import { Link } from "@tanstack/react-router";
import { Globe, Smartphone, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppleLogo, GooglePlayLogo } from "@/components/kipit/brand-icons";

/** Same-origin app routes (landing + app share one domain). */
export const WEB_APP_URL = "/home";
export const WEB_APP_LOGIN_URL = "/login";
export const WEB_APP_SIGNUP_URL = "/signup";
export type AccessMode = "access" | "soon" | null;

export function WebsiteV3Access({ mode, onChange }: { mode: AccessMode; onChange: (mode: AccessMode) => void }) {
  const mobile = useIsMobile();
  const title = mode === "soon" ? "New mobile app coming soon" : "How would you like to access Kipit?";
  const description = mode === "soon"
    ? "Our new iOS and Android apps are on the way. You can use Kipit on the web in the meantime."
    : "Choose the web app, or check availability for iOS and Android.";
  const options = <>
    {mode === "soon" && <Smartphone className="size-10 text-brand" />}
    <div className="grid gap-3">
      <Button asChild variant="ghost" className="v3-chooser-option !h-auto !whitespace-normal !justify-start" data-featured="true">
        <Link to="/signup" onClick={() => onChange(null)}>
          <span className="v3-chooser-icon"><Globe /></span>
          <span className="flex-1 text-left">Open the web app</span>
          <ArrowRight />
        </Link>
      </Button>
      {mode === "access" && <>
        <Button variant="ghost" className="v3-chooser-option !h-auto !whitespace-normal !justify-start" onClick={() => onChange("soon")}><span className="v3-chooser-icon"><AppleLogo /></span><span className="flex-1 text-left">App Store</span><span className="text-xs text-muted-foreground">Coming soon</span></Button>
        <Button variant="ghost" className="v3-chooser-option !h-auto !whitespace-normal !justify-start" onClick={() => onChange("soon")}><span className="v3-chooser-icon"><GooglePlayLogo /></span><span className="flex-1 text-left">Google Play</span><span className="text-xs text-muted-foreground">Coming soon</span></Button>
      </>}
    </div>
  </>;
  if (mobile) return <Drawer open={mode !== null} onOpenChange={open => { if (!open) onChange(null); }} shouldScaleBackground={false}>
    <DrawerContent className="kipit-website-v3 v3-access-sheet">
      <Button variant="ghost" size="icon" aria-label="Close" className="absolute right-3 top-3" onClick={() => onChange(null)}><X /></Button>
      <div className="grid gap-5 p-6 pb-10"><DrawerTitle className="pr-4 text-2xl leading-tight">{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription>{options}</div>
    </DrawerContent>
  </Drawer>;
  return <Dialog open={mode !== null} onOpenChange={open => { if (!open) onChange(null); }}>
    <DialogContent className="kipit-website-v3 v3-access-popup"><DialogTitle className="pr-6 text-2xl leading-tight">{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{options}</DialogContent>
  </Dialog>;
}
