import { formatMoneyNaira, type InterestBreakdown as Breakdown } from "@/lib/wht";

type Props = {
  data: Breakdown;
  /** Compact = rates + net only; full shows gross / WHT / net / maturity. */
  variant?: "full" | "compact";
  className?: string;
};

/**
 * B28 — always show gross interest, less WHT (10%), net interest, value at maturity.
 */
export function InterestBreakdown({ data, variant = "full", className }: Props) {
  if (variant === "compact") {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          {data.netRatePct.toFixed(2)}% net ({data.grossRatePct.toFixed(2)}% gross)
        </p>
        <p className="text-base font-semibold text-foreground">
          Net interest {formatMoneyNaira(data.netInterest)}
        </p>
      </div>
    );
  }

  return (
    <dl className={`grid gap-2 text-sm ${className ?? ""}`}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Gross interest</dt>
        <dd className="font-medium text-num text-foreground">
          {formatMoneyNaira(data.grossInterest)}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Less WHT ({data.whtRatePct.toFixed(0)}%)</dt>
        <dd className="font-medium text-num text-foreground">
          −{formatMoneyNaira(data.withholdingTax)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-border pt-2">
        <dt className="font-medium text-foreground">Net interest</dt>
        <dd className="font-semibold text-num text-foreground">
          {formatMoneyNaira(data.netInterest)}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Value at maturity</dt>
        <dd className="font-semibold text-num text-foreground">
          {formatMoneyNaira(data.valueAtMaturity)}
        </dd>
      </div>
      <p className="pt-1 text-xs text-muted-foreground">
        Rates shown net of withholding tax. Gross {data.grossRatePct.toFixed(2)}% · net{" "}
        {data.netRatePct.toFixed(2)}%.
      </p>
    </dl>
  );
}

/** Tap-target summary that expands to full B28 lines. */
export function InterestBreakdownSummary({
  net,
  gross,
  wht,
  label = "Interest",
}: {
  net: number;
  gross?: number;
  wht?: number;
  label?: string;
}) {
  const g = gross ?? net / 0.9;
  const w = wht ?? g - net;
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
        {label} {formatMoneyNaira(net)}{" "}
        <span className="font-normal text-muted-foreground">(tap for tax)</span>
      </summary>
      <dl className="mt-2 grid gap-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Gross</dt>
          <dd className="text-num">{formatMoneyNaira(g)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Less WHT (10%)</dt>
          <dd className="text-num">−{formatMoneyNaira(w)}</dd>
        </div>
        <div className="flex justify-between gap-4 font-semibold">
          <dt>Net</dt>
          <dd className="text-num">{formatMoneyNaira(net)}</dd>
        </div>
      </dl>
    </details>
  );
}
