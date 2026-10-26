import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onAccess: () => void };
const format = (value: number) => Math.round(value).toLocaleString("en-NG");

export function WebsiteV3Calculator({ onAccess }: Props) {
  const [amount, setAmount] = useState(500_000);
  const [days, setDays] = useState(180);
  const [rate, setRate] = useState(15.5);
  const interest = amount * rate * days / 36500;

  return (
    <div className="v3-container v3-desktop-calculator">
      <div className="v3-calculator-copy">
        <span className="v3-eyebrow">Calculator</span>
        <h2 className="v3-heading mt-4">Work out what you’d <span className="v3-serif">earn.</span></h2>
        <p className="mt-5 max-w-[480px] text-muted-foreground">See how an amount, a rate and a little time work together — then choose a plan on your terms.</p>
        <div className="v3-calculator-result" aria-live="polite">
          <p className="text-sm text-muted-foreground">Illustrative total at maturity</p>
          <p className="v3-calculator-total">₦{format(amount + interest)}</p>
          <p className="mt-4 text-sm text-muted-foreground">Includes <strong className="text-foreground">₦{format(interest)}</strong> estimated interest</p>
        </div>
        <p className="mt-10 max-w-[420px] text-xs leading-relaxed text-muted-foreground">Simple-interest illustration. Not a live offer; excludes tax and fees. Actual rates are confirmed when you subscribe.</p>
      </div>
      <div className="v3-calculator-controls">
        <label htmlFor="v3-calculator-amount" className="text-sm text-muted-foreground">Amount to invest</label>
        <div className="v3-calculator-amount-row">
          <span aria-hidden="true" className="text-muted-foreground">₦</span>
          <input id="v3-calculator-amount" inputMode="numeric" autoComplete="off" value={amount ? format(amount) : ""} placeholder="0" onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
            setAmount(Number(digits));
          }} />
        </div>
        <fieldset className="mt-8">
          <legend className="text-sm text-muted-foreground">Investment period</legend>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[30, 90, 180, 365].map((period) => <Button key={period} variant="outline" className="v3-seg" data-active={days === period} aria-pressed={days === period} onClick={() => setDays(period)}>{period}d</Button>)}
          </div>
        </fieldset>
        <div className="mt-10 flex items-center justify-between gap-4">
          <label htmlFor="v3-calculator-rate" className="text-sm text-muted-foreground">Illustrative annual rate</label>
          <output htmlFor="v3-calculator-rate" className="text-xl font-bold text-brand">{rate.toFixed(1)}%</output>
        </div>
        <input id="v3-calculator-rate" type="range" min="0" max="19.2" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} className="v3-range mt-5" />
        <Button className="v3-btn v3-btn-primary mt-10 w-full justify-center" onClick={onAccess}>Make your next move <ArrowRight className="size-4" /></Button>
      </div>
    </div>
  );
}