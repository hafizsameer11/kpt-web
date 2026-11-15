/**
 * Client-side Kipit-branded statement / document export (browser view + download).
 * Aligned toward Appendix C — logo/stamp, WHT section, RMB custodian disclaimer.
 */

import kamLogoUrl from "@/assets/brand/kipit-asset-management-logo.png";
import kamStampUrl from "@/assets/brand/kipit-company-stamp.png";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function assetHref(path: string) {
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

export type DocumentPdfInput = {
  title: string;
  subtitle?: string;
  rows?: { label: string; value: string }[];
  body?: string;
  reference?: string;
  /** Appendix C — interest / WHT table rows. */
  whtSection?: { label: string; gross: string; wht: string; net: string }[];
  portfolioSummary?: { label: string; value: string }[];
  filename?: string;
};

const RMB_DISCLAIMER =
  "Disclaimer: Investments shown are managed by Kipit Asset Management Limited (formerly Fortuna Capital Limited), a Fund/Portfolio Manager licensed by the Securities and Exchange Commission (SEC), Nigeria. All client funds, including wallet and Call Account balances, are held and administered by Rand Merchant Bank, our custodian. This statement is confidential and intended solely for the named client. If you notice any error, please contact us within 14 days of the statement date.";

const AUTO_NOTE =
  "This is an automatically generated statement. It was produced by the Kipit platform from your account records on the date and time shown above. Please verify any figures with us if you have questions.";

const INTEREST_NOTE =
  "Accrued interest is the interest earned on your plans so far, calculated daily from the start date. Expected interest is the full interest payable if each plan is held to maturity. Withholding tax of 10% is deducted from all interest earned and remitted to the tax authority; value at maturity is your principal plus net interest.";

const FOOTER_CONTACT =
  "Authorised by Kipit Asset Management Limited · Kipit Asset Management Limited | RC 8735505 | 7/9 Molade Okoya-Thomas Street, Victoria Island, Lagos | support@mykipit.com | +234 707 198 5171";

function buildHtml(input: DocumentPdfInput) {
  const generatedAt = new Date().toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const logo = assetHref(kamLogoUrl);
  const stamp = assetHref(kamStampUrl);

  const rowsHtml = (input.rows ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;vertical-align:top;width:55%">${escapeHtml(r.label)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;vertical-align:top;font-family:system-ui,sans-serif">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join("");

  const portfolioHtml = (input.portfolioSummary ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#475569">${escapeHtml(r.label)}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;font-family:system-ui,sans-serif">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join("");

  const whtHtml = (input.whtSection ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px">${escapeHtml(r.label)}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:12px;font-family:system-ui,sans-serif">${escapeHtml(r.gross)}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:12px;font-family:system-ui,sans-serif">${escapeHtml(r.wht)}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:12px;font-family:system-ui,sans-serif">${escapeHtml(r.net)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(input.title)}</title></head>
<body style="font-family:Georgia,'Times New Roman',serif;padding:28px;color:#0f172a;max-width:760px;margin:0 auto;background:#fff">
  <header style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:2px solid #0b1f44;padding-bottom:16px">
    <div>
      <img src="${escapeHtml(logo)}" alt="Kipit Asset Management" style="height:52px;width:auto;max-width:260px;object-fit:contain" />
      <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;font-family:system-ui,sans-serif">SEC-licensed fund manager</p>
    </div>
    <div style="text-align:right;font-family:system-ui,sans-serif">
      <p style="margin:0;font-size:11px;color:#64748b">Generated</p>
      <p style="margin:4px 0 0;font-size:13px;font-weight:600">${escapeHtml(generatedAt)}</p>
      ${input.reference ? `<p style="margin:8px 0 0;font-size:11px;color:#64748b">Ref · ${escapeHtml(input.reference)}</p>` : ""}
    </div>
  </header>

  <h1 style="margin:20px 0 4px;font-size:22px;font-family:system-ui,sans-serif;color:#0b1f44">${escapeHtml(input.title)}</h1>
  ${input.subtitle ? `<p style="margin:0 0 20px;color:#64748b;font-size:13px;font-family:system-ui,sans-serif">${escapeHtml(input.subtitle)}</p>` : ""}

  ${
    portfolioHtml
      ? `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-family:system-ui,sans-serif">Portfolio summary</h2>
         <table style="width:100%;border-collapse:collapse"><tbody>${portfolioHtml}</tbody></table>`
      : ""
  }

  ${
    whtHtml
      ? `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-family:system-ui,sans-serif">Interest and withholding tax</h2>
         <table style="width:100%;border-collapse:collapse">
           <thead>
             <tr>
               <th style="text-align:left;padding:8px;border-bottom:2px solid #cbd5e1;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Line</th>
               <th style="text-align:right;padding:8px;border-bottom:2px solid #cbd5e1;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Gross</th>
               <th style="text-align:right;padding:8px;border-bottom:2px solid #cbd5e1;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Less WHT (10%)</th>
               <th style="text-align:right;padding:8px;border-bottom:2px solid #cbd5e1;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Net</th>
             </tr>
           </thead>
           <tbody>${whtHtml}</tbody>
         </table>`
      : ""
  }

  ${
    rowsHtml
      ? `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-family:system-ui,sans-serif">Details</h2>
         <table style="width:100%;border-collapse:collapse;margin-top:4px">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #cbd5e1;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Detail</th>
              <th style="text-align:right;padding:8px;border-bottom:2px solid #cbd5e1;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">Value</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>`
      : !portfolioHtml && !whtHtml
        ? `<p style="margin-top:24px;color:#64748b;font-size:13px">No rows to display for this period.</p>`
        : ""
  }
  ${input.body ? `<p style="margin-top:24px;line-height:1.5;font-size:13px;color:#334155">${escapeHtml(input.body)}</p>` : ""}

  <div style="margin-top:36px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px">
    <div style="flex:1;font-family:system-ui,sans-serif;font-size:11px;color:#64748b;line-height:1.55">
      <p style="margin:0 0 10px">${escapeHtml(AUTO_NOTE)}</p>
      <p style="margin:0 0 10px">${escapeHtml(INTEREST_NOTE)}</p>
      <p style="margin:0 0 10px"><strong style="color:#0b1f44">${escapeHtml(RMB_DISCLAIMER)}</strong></p>
      <p style="margin:0">${escapeHtml(FOOTER_CONTACT)}</p>
    </div>
    <img src="${escapeHtml(stamp)}" alt="Kipit company stamp" style="width:120px;height:120px;object-fit:contain;flex-shrink:0" />
  </div>
</body></html>`;
}

/** Open a Kipit-branded document in a new tab for viewing (no print dialog). */
export function openDocumentHtml(input: DocumentPdfInput): {
  opened: boolean;
  url: string;
  html: string;
} {
  const html = buildHtml(input);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (w) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { opened: true, url, html };
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { opened: false, url, html };
}

/** Open the system print dialog with a Kipit-branded document. */
export function printDocumentPdf(input: DocumentPdfInput) {
  const html = buildHtml(input);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) {
    URL.revokeObjectURL(url);
    throw new Error("Pop-up blocked — allow pop-ups to print this document.");
  }
  window.setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      /* user can print manually */
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, 400);
}

/** HTML string for a Kipit-branded document (also used for server email attach). */
export function documentHtml(input: DocumentPdfInput) {
  return buildHtml(input);
}

/** Download an HTML document the user can open or print to PDF. */
export function downloadDocumentPdf(input: DocumentPdfInput) {
  const html = buildHtml(input);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = input.filename ?? `${input.title.replace(/\s+/g, "-").toLowerCase()}.html`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
