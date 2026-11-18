/**
 * Client-side Kipit-branded statement / document export (browser view + real PDF).
 * Visual layout matched to Kipit Statement_template.pdf (Appendix C).
 * Typography uses TeX Gyre Pagella — the same family as Statement_template.pdf.
 */

import kamLogoUrl from "@/assets/brand/kipit-asset-management-logo.png";
import kamStampUrl from "@/assets/brand/kipit-company-stamp.png";
import pagellaBoldUrl from "@/assets/fonts/texgyrepagella-bold.otf";
import pagellaItalicUrl from "@/assets/fonts/texgyrepagella-italic.otf";
import pagellaRegularUrl from "@/assets/fonts/texgyrepagella-regular.otf";

/** Brand tokens from Statement_template.pdf / Kipit Asset Management logo. */
const NAVY = "#001657";
const NAVY_SOFT = "#1a2f6b";
const GOLD = "#F5B400";
const GOLD_SOFT = "#FFF4CC";
const INK = "#0f172a";
const MUTED = "#5b6b8c";
const LINE = "#d7deeb";
const ROW_ALT = "#f5f7fb";
const PAGE_BG = "#ffffff";

/** Matches Statement_template.pdf (TeXGyrePagella). */
const FONT =
  "'TeXGyrePagella','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif";
const FONT_STACK = `font-family:${FONT}`;

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
  clientMeta?: { label: string; value: string }[];
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

const AUTO_NOTE =
  "This is an automatically generated statement. It was produced by the Kipit platform from your account records on the date and time shown above. Please verify any figures with us if you have questions.";

const INTEREST_NOTE =
  "Accrued interest is the interest earned on your plans so far, calculated daily from the start date. Expected interest is the full interest payable if each plan is held to maturity. Withholding tax of 10% is deducted from all interest earned and remitted to the tax authority; value at maturity is your principal plus net interest. Kipit Lock plans cannot be broken before maturity. A Kipit Flex plan broken after 30 days attracts the loss of 50% of the interest accrued, in line with the terms you accepted.";

const RMB_DISCLAIMER =
  "Disclaimer: Investments shown are managed by Kipit Asset Management Limited (formerly Fortuna Capital Limited), a Fund/Portfolio Manager licensed by the Securities and Exchange Commission (SEC), Nigeria. All client funds, including wallet and Call Account balances, are held and administered by Rand Merchant Bank, our custodian. This statement is confidential and intended solely for the named client. If you notice any error, please contact us within 14 days of the statement date.";

const FOOTER_CONTACT =
  "Kipit Asset Management Limited | RC 8735505 | 7/9 Molade Okoya-Thomas Street, Victoria Island, Lagos | support@mykipit.com | +234 707 198 5171";

const sectionTitle = `margin:22px 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${NAVY};${FONT_STACK};font-weight:700`;
const th = `padding:9px 8px;background:${NAVY};color:#fff;font-size:9px;text-transform:uppercase;letter-spacing:0.05em;${FONT_STACK};font-weight:700;text-align:left;border:none`;
const thRight = th.replace("text-align:left", "text-align:right");
const td = `padding:8px;border-bottom:1px solid ${LINE};font-size:11px;${FONT_STACK};color:${INK};vertical-align:top`;
const tdRight = `${td};text-align:right;font-variant-numeric:tabular-nums`;

function fontFaceCss() {
  const regular = assetHref(pagellaRegularUrl);
  const bold = assetHref(pagellaBoldUrl);
  const italic = assetHref(pagellaItalicUrl);
  return `
@font-face{font-family:'TeXGyrePagella';src:url('${regular}') format('opentype');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'TeXGyrePagella';src:url('${bold}') format('opentype');font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:'TeXGyrePagella';src:url('${bold}') format('opentype');font-weight:800;font-style:normal;font-display:swap}
@font-face{font-family:'TeXGyrePagella';src:url('${italic}') format('opentype');font-weight:400;font-style:italic;font-display:swap}
*{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
body{margin:0;background:${PAGE_BG};color:${INK};${FONT_STACK}}
`;
}

function parsePeriodSubtitle(subtitle?: string) {
  if (!subtitle) return { period: "", ref: "" };
  const refMatch = subtitle.match(/Ref:\s*(.+)$/i);
  const period = subtitle.replace(/\s*·\s*Ref:.*/i, "").replace(/^Statement period:\s*/i, "").trim();
  return { period, ref: refMatch?.[1]?.trim() || "" };
}

function planParts(plan: string) {
  const [main, started] = plan.split(/\s·\sStarted\s/i);
  return {
    main: (main || plan).trim(),
    started: started ? `Started ${started.trim()}` : "",
  };
}

function sumMoneyColumn(rows: { [k: string]: string }[], key: string) {
  const total = rows.reduce((s, r) => {
    const n = Number(String(r[key] ?? "").replace(/[^\d.-]/g, ""));
    return s + (Number.isFinite(n) ? n : 0);
  }, 0);
  return `₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildHtml(input: DocumentPdfInput) {
  const logo = assetHref(kamLogoUrl);
  const stamp = assetHref(kamStampUrl);
  const { period, ref } = parsePeriodSubtitle(input.subtitle);
  const reference = input.reference || ref;

  const clientMeta = (input.clientMeta ?? []).slice(0, 4);
  const clientMetaHtml = clientMeta.length
    ? `<div style="display:grid;grid-template-columns:repeat(${clientMeta.length},minmax(0,1fr));gap:12px;background:${GOLD};padding:12px 14px;margin:0 0 18px">
        ${clientMeta
          .map(
            (c) => `<div>
              <div style="font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:${NAVY};${FONT_STACK};font-weight:700">${escapeHtml(c.label)}</div>
              <div style="margin-top:4px;font-size:13px;font-weight:700;color:${INK};${FONT_STACK}">${escapeHtml(c.value)}</div>
            </div>`,
          )
          .join("")}
      </div>`
    : "";

  const portfolio = input.portfolioSummary ?? [];
  const portfolioHtml = portfolio.length
    ? `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
        ${portfolio
          .map((r) => {
            const emphasize = /total portfolio value today/i.test(r.label);
            const bg = emphasize ? NAVY : "#fff";
            const border = emphasize ? NAVY : LINE;
            const labelColor = emphasize ? "rgba(255,255,255,0.78)" : NAVY;
            const valueColor = emphasize ? "#fff" : INK;
            return `<div style="border:1px solid ${border};background:${bg};padding:12px 12px 14px;min-height:78px">
              <div style="font-size:10px;line-height:1.35;color:${labelColor};${FONT_STACK};font-weight:600">${escapeHtml(r.label)}</div>
              <div style="margin-top:10px;font-size:18px;line-height:1.15;font-weight:700;color:${valueColor};${FONT_STACK};font-variant-numeric:tabular-nums">${escapeHtml(r.value)}</div>
            </div>`;
          })
          .join("")}
      </div>`
    : "";

  const whtHtml = (input.whtSection ?? [])
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 ? ROW_ALT : "#fff"}">
          <td style="${td}">${escapeHtml(r.label)}</td>
          <td style="${tdRight}">${escapeHtml(r.gross)}</td>
          <td style="${tdRight}">${escapeHtml(r.wht)}</td>
          <td style="${tdRight};font-weight:700">${escapeHtml(r.net)}</td>
        </tr>`,
    )
    .join("");

  const investments = input.investments ?? [];
  let invBody = investments
    .map((r, i) => {
      const { main, started } = planParts(r.plan);
      return `<tr style="background:${i % 2 ? ROW_ALT : "#fff"}">
          <td style="${td}">
            <div style="font-weight:700">${escapeHtml(main)}</div>
            ${started ? `<div style="margin-top:2px;font-size:10px;color:${MUTED}">${escapeHtml(started)}</div>` : ""}
          </td>
          <td style="${tdRight}">${escapeHtml(r.principal)}</td>
          <td style="${tdRight}">${escapeHtml(r.rate)}</td>
          <td style="${tdRight}">${escapeHtml(r.maturity)}</td>
          <td style="${tdRight}">${escapeHtml(r.gross)}</td>
          <td style="${tdRight}">${escapeHtml(r.wht)}</td>
          <td style="${tdRight}">${escapeHtml(r.net)}</td>
          <td style="${tdRight};font-weight:700">${escapeHtml(r.valueAtMaturity)}</td>
        </tr>`;
    })
    .join("");
  if (investments.length) {
    invBody += `<tr style="background:${NAVY};color:#fff">
      <td style="${td};border:none;color:#fff;font-weight:800">TOTAL</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:800">${sumMoneyColumn(investments, "principal")}</td>
      <td style="${tdRight};border:none;color:#fff"></td>
      <td style="${tdRight};border:none;color:#fff"></td>
      <td style="${tdRight};border:none;color:#fff;font-weight:800">${sumMoneyColumn(investments, "gross")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:800">${sumMoneyColumn(investments, "wht")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:800">${sumMoneyColumn(investments, "net")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:800">${sumMoneyColumn(investments, "valueAtMaturity")}</td>
    </tr>`;
  }

  const txnHtml = (input.transactions ?? [])
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 ? ROW_ALT : "#fff"}">
          <td style="${td};white-space:nowrap">${escapeHtml(r.date)}</td>
          <td style="${td}">${escapeHtml(r.description)}</td>
          <td style="${td};font-size:10px;color:${MUTED}">${escapeHtml(r.reference)}</td>
          <td style="${tdRight}">${escapeHtml(r.credit)}</td>
          <td style="${tdRight}">${escapeHtml(r.debit)}</td>
        </tr>`,
    )
    .join("");

  const rowsHtml = (input.rows ?? [])
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 ? ROW_ALT : "#fff"}">
          <td style="${td};color:${MUTED};width:55%">${escapeHtml(r.label)}</td>
          <td style="${tdRight};font-weight:700">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join("");

  const periodLine = period
    ? `Statement period: ${period}`
    : input.subtitle
      ? input.subtitle
      : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(input.title)}</title><style>${fontFaceCss()}</style></head>
<body>
  <div style="${FONT_STACK};padding:28px 28px 24px;max-width:900px;margin:0 auto;background:${PAGE_BG}">
    <header style="display:flex;align-items:stretch;justify-content:space-between;gap:18px;margin-bottom:14px">
      <div style="display:flex;align-items:center;min-width:0;flex:1">
        <img src="${escapeHtml(logo)}" alt="Kipit Asset Management" style="height:58px;width:auto;max-width:280px;object-fit:contain" />
      </div>
      <div style="background:${NAVY};color:#fff;min-width:280px;max-width:360px;padding:16px 18px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:16px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.2">${escapeHtml(input.title)}</div>
        ${periodLine ? `<div style="margin-top:8px;font-size:11px;line-height:1.45;color:rgba(255,255,255,0.88)">${escapeHtml(periodLine)}</div>` : ""}
        ${reference ? `<div style="margin-top:4px;font-size:11px;color:rgba(255,255,255,0.88)">Ref: ${escapeHtml(reference)}</div>` : ""}
      </div>
    </header>

    ${clientMetaHtml}

    ${
      portfolioHtml
        ? `<h2 style="${sectionTitle}">Portfolio summary</h2>${portfolioHtml}`
        : ""
    }

    ${
      whtHtml
        ? `<h2 style="${sectionTitle}">Interest and withholding tax</h2>
           <table style="width:100%;border-collapse:collapse">
             <thead>
               <tr>
                 <th style="${th}">Source</th>
                 <th style="${thRight}">Gross interest</th>
                 <th style="${thRight}">Less withholding tax (10%)</th>
                 <th style="${thRight}">Net interest</th>
               </tr>
             </thead>
             <tbody>${whtHtml}</tbody>
           </table>`
        : ""
    }

    ${
      investments.length
        ? `<h2 style="${sectionTitle}">Active investments</h2>
           <table style="width:100%;border-collapse:collapse">
             <thead>
               <tr>
                 <th style="${th}">Plan</th>
                 <th style="${thRight}">Principal</th>
                 <th style="${thRight}">Rate p.a. net (gross)</th>
                 <th style="${thRight}">Maturity date</th>
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
        ? `<h2 style="${sectionTitle}">Transactions in this period</h2>
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
        ? `<h2 style="${sectionTitle}">Details</h2>
           <table style="width:100%;border-collapse:collapse"><tbody>${rowsHtml}</tbody></table>`
        : rowsHtml && portfolioHtml
          ? `<h2 style="${sectionTitle}">Period movement</h2>
             <table style="width:100%;border-collapse:collapse">
               <thead>
                 <tr>
                   <th style="${th}">Detail</th>
                   <th style="${thRight}">Value</th>
                 </tr>
               </thead>
               <tbody>${rowsHtml}</tbody>
             </table>`
          : ""
    }

    <div style="margin-top:22px;background:${GOLD_SOFT};border:1px solid ${GOLD};padding:12px 14px;font-size:11px;line-height:1.55;color:${NAVY_SOFT}">
      ${escapeHtml(AUTO_NOTE)}
    </div>

    <div style="margin-top:16px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px">
      <div style="flex:1;font-size:10px;line-height:1.55;color:${MUTED}">
        <p style="margin:0 0 10px;color:${INK}">${escapeHtml(INTEREST_NOTE)}</p>
        <p style="margin:0;color:${INK}"><strong style="color:${NAVY}">${escapeHtml(RMB_DISCLAIMER)}</strong></p>
      </div>
      <div style="text-align:center;flex-shrink:0;width:140px">
        <img src="${escapeHtml(stamp)}" alt="Kipit company stamp" style="width:118px;height:118px;object-fit:contain;display:block;margin:0 auto" />
        <div style="margin-top:6px;font-size:9px;line-height:1.35;color:${NAVY};font-weight:700">Authorised by Kipit Asset Management Limited</div>
      </div>
    </div>

    <div style="margin-top:18px;border-top:1px solid ${LINE};padding-top:10px;font-size:9.5px;color:${MUTED};letter-spacing:0.01em">
      ${escapeHtml(FOOTER_CONTACT)}
    </div>
    ${input.body ? `<p style="display:none">${escapeHtml(input.body)}</p>` : ""}
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

/** Browser canvas dimension ceiling (Chrome ~16384); stay under it with room for scale. */
const MAX_CANVAS_EDGE = 8192;

async function waitForStatementFonts() {
  try {
    const faces = [
      new FontFace("TeXGyrePagella", `url(${assetHref(pagellaRegularUrl)})`, {
        weight: "400",
        style: "normal",
      }),
      new FontFace("TeXGyrePagella", `url(${assetHref(pagellaBoldUrl)})`, {
        weight: "700",
        style: "normal",
      }),
      new FontFace("TeXGyrePagella", `url(${assetHref(pagellaItalicUrl)})`, {
        weight: "400",
        style: "italic",
      }),
    ];
    const loaded = await Promise.all(faces.map((f) => f.load()));
    for (const face of loaded) document.fonts.add(face);
    await document.fonts.ready;
  } catch {
    /* system Palatino / Georgia fallback still applied via CSS stack */
  }
}

/**
 * Render HTML into an off-screen host and return a multi-page PDF blob.
 * Uses the same markup + TeXGyrePagella as the HTML view so fonts match.
 */
export async function documentPdfBlob(input: DocumentPdfInput): Promise<Blob> {
  const html = buildHtml(input);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  // Must stay "visible" to html2canvas — opacity:0 / display:none cause blank or throw.
  host.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "width:794px",
    "background:#ffffff",
    `color:${INK}`,
    FONT_STACK,
    "z-index:-1",
    "pointer-events:none",
    "opacity:0.02",
    "overflow:visible",
    "transform:translateX(-110%)",
  ].join(";");
  // Keep <style> from the HTML document so PDF capture uses the same fonts as View HTML.
  host.innerHTML = `<style>${fontFaceCss()}</style>${bodyMatch ? bodyMatch[1]! : html}`;
  document.body.appendChild(host);

  try {
    await waitForStatementFonts();
    await waitForImages(host);
    await new Promise((r) => window.setTimeout(r, 120));

    const [{ jsPDF }, html2canvasMod] = await Promise.all([import("jspdf"), import("html2canvas")]);
    const html2canvas = html2canvasMod.default;

    const contentWidth = Math.max(host.scrollWidth, 794);
    const contentHeight = Math.max(host.scrollHeight, 1);
    const scale = Math.min(2.5, MAX_CANVAS_EDGE / contentWidth, MAX_CANVAS_EDGE / contentHeight);

    const canvas = await html2canvas(host, {
      scale: Math.max(1.5, scale),
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      letterRendering: true,
      width: contentWidth,
      windowWidth: contentWidth,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15_000,
      onclone: (_doc, cloned) => {
        cloned.style.transform = "none";
        cloned.style.opacity = "1";
        cloned.style.left = "0";
        cloned.style.top = "0";
        cloned.style.position = "static";
        cloned.style.fontFamily = FONT.replace(/'/g, "");
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Statement canvas was empty");
    }

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Slice into page strips as PNG so text stays as sharp as the HTML view.
    const pxPerMm = canvas.width / usableWidth;
    const pageSlicePx = Math.max(1, Math.floor(usableHeight * pxPerMm));
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    const sliceCtx = sliceCanvas.getContext("2d");
    if (!sliceCtx) throw new Error("Could not create PDF canvas context");

    let y = 0;
    let pageIndex = 0;
    while (y < canvas.height) {
      const sliceH = Math.min(pageSlicePx, canvas.height - y);
      sliceCanvas.height = sliceH;
      sliceCtx.fillStyle = "#ffffff";
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceH);
      sliceCtx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

      const imgData = sliceCanvas.toDataURL("image/png");
      const sliceHeightMm = sliceH / pxPerMm;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin, usableWidth, sliceHeightMm);

      y += sliceH;
      pageIndex += 1;
      if (pageIndex > 40) break;
    }

    return pdf.output("blob");
  } finally {
    host.remove();
  }
}

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

export function documentHtml(input: DocumentPdfInput) {
  return buildHtml(input);
}

export async function downloadDocumentPdf(input: DocumentPdfInput) {
  const pdfName = defaultFilename(input, "pdf");
  try {
    const blob = await documentPdfBlob(input);
    if (!blob || blob.size < 64) {
      throw new Error("Generated PDF was empty");
    }
    triggerDownload(blob, pdfName);
  } catch (err) {
    const html = buildHtml(input);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerDownload(blob, defaultFilename(input, "html"));
    const detail = err instanceof Error && err.message ? ` (${err.message})` : "";
    throw new Error(`PDF export failed — HTML copy downloaded instead.${detail}`);
  }
}

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
