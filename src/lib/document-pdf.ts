/**
 * Client-side Kipit-branded statement / document export (browser view + real PDF download).
 * Aligned to Appendix C — logo/stamp, client meta, WHT, investments, transactions, RMB disclaimer.
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
  /** Appendix C — client identity strip. */
  clientMeta?: { label: string; value: string }[];
  /** Appendix C — interest / WHT table rows. */
  whtSection?: { label: string; gross: string; wht: string; net: string }[];
  portfolioSummary?: { label: string; value: string }[];
  investments?: {
    plan: string;
    principal: string;
    rate: string;
    maturity: string;
    gross: string;
    wht: string;
    net: string;
    valueAtMaturity: string;
  }[];
  transactions?: {
    date: string;
    description: string;
    reference: string;
    credit: string;
    debit: string;
  }[];
  filename?: string;
};

const RMB_DISCLAIMER =
  "Disclaimer: Investments shown are managed by Kipit Asset Management Limited (formerly Fortuna Capital Limited), a Fund/Portfolio Manager licensed by the Securities and Exchange Commission (SEC), Nigeria. All client funds, including wallet and Call Account balances, are held and administered by Rand Merchant Bank, our custodian. This statement is confidential and intended solely for the named client. If you notice any error, please contact us within 14 days of the statement date.";

const AUTO_NOTE =
  "This is an automatically generated statement. It was produced by the Kipit platform from your account records on the date and time shown above. Please verify any figures with us if you have questions.";

const INTEREST_NOTE =
  "Accrued interest is the interest earned on your plans so far, calculated daily from the start date. Expected interest is the full interest payable if each plan is held to maturity. Withholding tax of 10% is deducted from all interest earned and remitted to the tax authority; value at maturity is your principal plus net interest. Kipit Lock plans cannot be broken before maturity. A Kipit Flex plan broken after 30 days attracts the loss of 50% of the interest accrued, in line with the terms you accepted.";

const FOOTER_CONTACT =
  "Authorised by Kipit Asset Management Limited · Kipit Asset Management Limited | RC 8735505 | 7/9 Molade Okoya-Thomas Street, Victoria Island, Lagos | support@mykipit.com | +234 707 198 5171";

const th =
  "text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;font-family:system-ui,sans-serif;font-weight:700";
const thRight = th.replace("text-align:left", "text-align:right");
const td = "padding:7px 6px;border-bottom:1px solid #e2e8f0;font-size:11px;font-family:system-ui,sans-serif;vertical-align:top";
const tdRight = `${td};text-align:right`;
const h2 =
  "margin:22px 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-family:system-ui,sans-serif";

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

  const clientMeta = input.clientMeta ?? [];
  const clientMetaHtml = clientMeta.length
    ? `<table style="width:100%;border-collapse:collapse;margin:16px 0 4px"><tbody><tr>${clientMeta
        .map(
          (c) =>
            `<td style="padding:6px 8px 6px 0;vertical-align:top;width:${Math.floor(100 / clientMeta.length)}%">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-family:system-ui,sans-serif">${escapeHtml(c.label)}</div>
              <div style="margin-top:3px;font-size:12px;font-weight:600;font-family:system-ui,sans-serif;color:#0f172a">${escapeHtml(c.value)}</div>
            </td>`,
        )
        .join("")}</tr></tbody></table>`
    : "";

  const portfolioHtml = (input.portfolioSummary ?? [])
    .map((r, i, arr) => {
      const bold = i === arr.length - 2 || /total portfolio/i.test(r.label);
      return `<tr>
          <td style="${td};color:#475569;${bold ? "font-weight:700;color:#0b1f44" : ""}">${escapeHtml(r.label)}</td>
          <td style="${tdRight};font-weight:${bold ? "700" : "600"};${bold ? "color:#0b1f44" : ""}">${escapeHtml(r.value)}</td>
        </tr>`;
    })
    .join("");

  const whtHtml = (input.whtSection ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="${td}">${escapeHtml(r.label)}</td>
          <td style="${tdRight}">${escapeHtml(r.gross)}</td>
          <td style="${tdRight}">${escapeHtml(r.wht)}</td>
          <td style="${tdRight};font-weight:600">${escapeHtml(r.net)}</td>
        </tr>`,
    )
    .join("");

  const investments = input.investments ?? [];
  let invBody = investments
    .map(
      (r) =>
        `<tr>
          <td style="${td}">${escapeHtml(r.plan)}</td>
          <td style="${tdRight}">${escapeHtml(r.principal)}</td>
          <td style="${tdRight}">${escapeHtml(r.rate)}</td>
          <td style="${tdRight}">${escapeHtml(r.maturity)}</td>
          <td style="${tdRight}">${escapeHtml(r.gross)}</td>
          <td style="${tdRight}">${escapeHtml(r.wht)}</td>
          <td style="${tdRight}">${escapeHtml(r.net)}</td>
          <td style="${tdRight};font-weight:600">${escapeHtml(r.valueAtMaturity)}</td>
        </tr>`,
    )
    .join("");
  if (investments.length) {
    const sumMoney = (key: keyof (typeof investments)[0]) => {
      // Display-only total row uses last numeric parse of ₦ amounts when possible; otherwise blank.
      const nums = investments.map((r) => {
        const raw = String(r[key]).replace(/[^\d.-]/g, "");
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
      });
      if (key === "rate" || key === "maturity" || key === "plan") return "";
      const total = nums.reduce((a, b) => a + b, 0);
      return `₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    invBody += `<tr>
      <td style="${td};font-weight:700">TOTAL</td>
      <td style="${tdRight};font-weight:700">${sumMoney("principal")}</td>
      <td style="${tdRight}"></td>
      <td style="${tdRight}"></td>
      <td style="${tdRight};font-weight:700">${sumMoney("gross")}</td>
      <td style="${tdRight};font-weight:700">${sumMoney("wht")}</td>
      <td style="${tdRight};font-weight:700">${sumMoney("net")}</td>
      <td style="${tdRight};font-weight:700">${sumMoney("valueAtMaturity")}</td>
    </tr>`;
  }

  const txnHtml = (input.transactions ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="${td};white-space:nowrap">${escapeHtml(r.date)}</td>
          <td style="${td}">${escapeHtml(r.description)}</td>
          <td style="${td};font-size:10px;color:#64748b">${escapeHtml(r.reference)}</td>
          <td style="${tdRight}">${escapeHtml(r.credit)}</td>
          <td style="${tdRight}">${escapeHtml(r.debit)}</td>
        </tr>`,
    )
    .join("");

  const rowsHtml = (input.rows ?? [])
    .map(
      (r) =>
        `<tr>
          <td style="${td};color:#64748b;width:55%">${escapeHtml(r.label)}</td>
          <td style="${tdRight};font-weight:600">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join("");

  const hasCore =
    Boolean(portfolioHtml) ||
    Boolean(whtHtml) ||
    investments.length > 0 ||
    Boolean(txnHtml) ||
    Boolean(rowsHtml);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(input.title)}</title></head>
<body style="font-family:Georgia,'Times New Roman',serif;padding:28px;color:#0f172a;max-width:860px;margin:0 auto;background:#fff">
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

  <h1 style="margin:20px 0 4px;font-size:22px;font-family:system-ui,sans-serif;color:#0b1f44;text-transform:uppercase;letter-spacing:0.04em">${escapeHtml(input.title)}</h1>
  ${input.subtitle ? `<p style="margin:0 0 8px;color:#64748b;font-size:13px;font-family:system-ui,sans-serif">${escapeHtml(input.subtitle)}</p>` : ""}
  ${clientMetaHtml}

  ${
    portfolioHtml
      ? `<h2 style="${h2}">Portfolio summary</h2>
         <table style="width:100%;border-collapse:collapse"><tbody>${portfolioHtml}</tbody></table>`
      : ""
  }

  ${
    whtHtml
      ? `<h2 style="${h2}">Interest and withholding tax</h2>
         <table style="width:100%;border-collapse:collapse">
           <thead>
             <tr>
               <th style="${th}">Line</th>
               <th style="${thRight}">Gross interest</th>
               <th style="${thRight}">Less WHT (10%)</th>
               <th style="${thRight}">Net interest</th>
             </tr>
           </thead>
           <tbody>${whtHtml}</tbody>
         </table>`
      : ""
  }

  ${
    investments.length
      ? `<h2 style="${h2}">Active investments</h2>
         <table style="width:100%;border-collapse:collapse">
           <thead>
             <tr>
               <th style="${th}">Plan</th>
               <th style="${thRight}">Principal</th>
               <th style="${thRight}">Rate p.a. net (gross)</th>
               <th style="${thRight}">Maturity</th>
               <th style="${thRight}">Gross interest</th>
               <th style="${thRight}">WHT (10%)</th>
               <th style="${thRight}">Net interest</th>
               <th style="${thRight}">Value at maturity</th>
             </tr>
           </thead>
           <tbody>${invBody}</tbody>
         </table>`
      : ""
  }

  ${
    txnHtml
      ? `<h2 style="${h2}">Transactions in this period</h2>
         <table style="width:100%;border-collapse:collapse">
           <thead>
             <tr>
               <th style="${th}">Date</th>
               <th style="${th}">Description</th>
               <th style="${th}">Reference</th>
               <th style="${thRight}">Credit</th>
               <th style="${thRight}">Debit</th>
             </tr>
           </thead>
           <tbody>${txnHtml}</tbody>
         </table>`
      : ""
  }

  ${
    rowsHtml && !portfolioHtml
      ? `<h2 style="${h2}">Details</h2>
         <table style="width:100%;border-collapse:collapse"><tbody>${rowsHtml}</tbody></table>`
      : rowsHtml && portfolioHtml
        ? `<h2 style="${h2}">Period movement</h2>
           <table style="width:100%;border-collapse:collapse"><tbody>${rowsHtml}</tbody></table>`
        : !hasCore
          ? `<p style="margin-top:24px;color:#64748b;font-size:13px">No rows to display for this period.</p>`
          : ""
  }
  ${input.body ? `<p style="margin-top:20px;line-height:1.5;font-size:12px;color:#334155;font-family:system-ui,sans-serif">${escapeHtml(input.body)}</p>` : ""}

  <div style="margin-top:32px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px">
    <div style="flex:1;font-family:system-ui,sans-serif;font-size:10.5px;color:#64748b;line-height:1.55">
      <p style="margin:0 0 10px">${escapeHtml(AUTO_NOTE)}</p>
      <p style="margin:0 0 10px">${escapeHtml(INTEREST_NOTE)}</p>
      <p style="margin:0 0 10px"><strong style="color:#0b1f44">${escapeHtml(RMB_DISCLAIMER)}</strong></p>
      <p style="margin:0">${escapeHtml(FOOTER_CONTACT)}</p>
    </div>
    <img src="${escapeHtml(stamp)}" alt="Kipit company stamp" style="width:120px;height:120px;object-fit:contain;flex-shrink:0" />
  </div>
</body></html>`;
}

function defaultFilename(input: DocumentPdfInput, ext: "pdf" | "html") {
  const base = (input.filename ?? `${input.title.replace(/\s+/g, "-").toLowerCase()}`).replace(
    /\.(html|pdf)$/i,
    "",
  );
  return `${base}.${ext}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function waitForImages(root: ParentNode) {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

/** Render HTML into a hidden host and return a multi-page PDF blob (Appendix C layout). */
export async function documentPdfBlob(input: DocumentPdfInput): Promise<Blob> {
  const html = buildHtml(input);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-12000px;top:0;width:820px;padding:28px;box-sizing:border-box;background:#ffffff;z-index:-1;pointer-events:none;opacity:0;color:#0f172a;font-family:Georgia,'Times New Roman',serif;";
  host.innerHTML = bodyMatch ? bodyMatch[1]! : html;
  document.body.appendChild(host);

  try {
    await waitForImages(host);
    // Allow layout/fonts a tick.
    await new Promise((r) => window.setTimeout(r, 50));

    const [{ jsPDF }, html2canvasMod] = await Promise.all([import("jspdf"), import("html2canvas")]);
    const html2canvas = html2canvasMod.default;

    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 820,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 2) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    return pdf.output("blob");
  } finally {
    host.remove();
  }
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

/** HTML string for a Kipit-branded document (also used for in-app preview). */
export function documentHtml(input: DocumentPdfInput) {
  return buildHtml(input);
}

/** Download a real PDF (falls back to HTML if canvas/PDF generation fails). */
export async function downloadDocumentPdf(input: DocumentPdfInput) {
  const pdfName = defaultFilename(input, "pdf");
  try {
    const blob = await documentPdfBlob(input);
    triggerDownload(blob, pdfName);
  } catch {
    const html = buildHtml(input);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerDownload(blob, defaultFilename(input, "html"));
    throw new Error("PDF export failed — HTML copy downloaded instead.");
  }
}

/** Build PDF attachment bytes for email. */
export async function documentPdfBase64(input: DocumentPdfInput): Promise<{
  filename: string;
  contentType: "application/pdf";
  contentBase64: string;
}> {
  const blob = await documentPdfBlob(input);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return {
    filename: defaultFilename(input, "pdf"),
    contentType: "application/pdf",
    contentBase64: btoa(binary),
  };
}
