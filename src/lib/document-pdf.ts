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
const PAGE_BG = "#ffffff";
const META_LABEL_BG = "#e8ecf3";
const ROW_LINE = "#e5e9f0";

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

type BrandAssets = {
  logo: string;
  stamp: string;
  fontCss: string;
};

async function urlToDataUrl(path: string): Promise<string> {
  const href = assetHref(path);
  const res = await fetch(href);
  if (!res.ok) throw new Error(`Could not load asset (${res.status})`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Asset read failed"));
    reader.readAsDataURL(blob);
  });
}

function buildFontFaceCss(regular: string, bold: string, italic: string) {
  return `
@font-face{font-family:'TeXGyrePagella';src:url('${regular}') format('opentype');font-weight:400;font-style:normal;font-display:block}
@font-face{font-family:'TeXGyrePagella';src:url('${bold}') format('opentype');font-weight:700;font-style:normal;font-display:block}
@font-face{font-family:'TeXGyrePagella';src:url('${bold}') format('opentype');font-weight:800;font-style:normal;font-display:block}
@font-face{font-family:'TeXGyrePagella';src:url('${italic}') format('opentype');font-weight:400;font-style:italic;font-display:block}
*{box-sizing:border-box;font-family:${FONT} !important;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:geometricPrecision}
html,body{margin:0;padding:0;background:${PAGE_BG};color:${NAVY};${FONT_STACK}}
img{display:block;max-width:100%}
table{border-collapse:collapse}
@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;
}

let brandAssetsPromise: Promise<BrandAssets> | null = null;

/** Embed logo/stamp/fonts as data URLs so PDF capture never hits CORS / tainted canvas. */
async function getBrandAssets(): Promise<BrandAssets> {
  if (!brandAssetsPromise) {
    brandAssetsPromise = (async () => {
      const [logo, stamp, regular, bold, italic] = await Promise.all([
        urlToDataUrl(kamLogoUrl),
        urlToDataUrl(kamStampUrl),
        urlToDataUrl(pagellaRegularUrl),
        urlToDataUrl(pagellaBoldUrl),
        urlToDataUrl(pagellaItalicUrl),
      ]);
      return {
        logo,
        stamp,
        fontCss: buildFontFaceCss(regular, bold, italic),
      };
    })().catch((err) => {
      brandAssetsPromise = null;
      throw err;
    });
  }
  return brandAssetsPromise;
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

const sectionTitle = `margin:12px 0 6px;font-size:12.5px;letter-spacing:0.14em;text-transform:uppercase;color:${NAVY};${FONT_STACK};font-weight:700`;
const th = `padding:7px 8px;height:33px;background:${NAVY};color:#fff;font-size:10.5px;text-transform:none;letter-spacing:0.01em;${FONT_STACK};font-weight:700;text-align:left;border:none;vertical-align:middle`;
const thRight = th.replace("text-align:left", "text-align:right");
const td = `padding:5px 8px;height:28px;border-bottom:1px solid ${ROW_LINE};font-size:12px;${FONT_STACK};color:${NAVY};vertical-align:middle;background:#fff`;
const tdRight = `${td};text-align:right;font-variant-numeric:tabular-nums`;

function fontFaceCss(brand?: BrandAssets) {
  if (brand) return brand.fontCss;
  return buildFontFaceCss(
    assetHref(pagellaRegularUrl),
    assetHref(pagellaBoldUrl),
    assetHref(pagellaItalicUrl),
  );
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

function buildHtml(input: DocumentPdfInput, brand?: BrandAssets) {
  const logo = brand?.logo ?? assetHref(kamLogoUrl);
  const stamp = brand?.stamp ?? assetHref(kamStampUrl);
  const { period, ref } = parsePeriodSubtitle(input.subtitle);
  const reference = input.reference || ref;

  const clientMeta = (input.clientMeta ?? []).slice(0, 4);
  const metaCols = "1.35fr 1fr 1fr 1fr";
  // Template: gold strip flush under header; gray labels row + white values row.
  const clientMetaHtml = clientMeta.length
    ? `<div style="height:9px;background:${GOLD};margin:0;width:100%"></div>
       <div style="margin:0 0 10px">
         <div style="display:grid;grid-template-columns:${metaCols};background:${META_LABEL_BG}">
           ${clientMeta
             .map(
               (c) =>
                 `<div style="padding:5px 10px 4px;font-size:10.5px;color:#6b7280;${FONT_STACK};font-weight:400">${escapeHtml(c.label)}</div>`,
             )
             .join("")}
         </div>
         <div style="display:grid;grid-template-columns:${metaCols};background:#fff">
           ${clientMeta
             .map(
               (c) =>
                 `<div style="padding:6px 10px 8px;font-size:14.5px;font-weight:700;color:${NAVY};${FONT_STACK}">${escapeHtml(c.value)}</div>`,
             )
             .join("")}
         </div>
       </div>`
    : "";

  const portfolio = input.portfolioSummary ?? [];
  const portfolioHtml = portfolio.length
    ? `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px">
        ${portfolio
          .map((r) => {
            const emphasize = /total portfolio value today/i.test(r.label);
            const accent =
              /net interest accrued/i.test(r.label) || /value at maturity/i.test(r.label);
            const bg = emphasize ? NAVY : "#fff";
            const border = emphasize ? NAVY : LINE;
            const labelColor = emphasize ? "rgba(255,255,255,0.82)" : "#6b7280";
            const valueColor = emphasize ? "#fff" : NAVY;
            const accentBorder = accent && !emphasize ? `border-left:5px solid ${GOLD};` : "";
            return `<div style="border:1px solid ${border};${accentBorder}background:${bg};padding:7px 10px 8px;min-height:63px;height:63px;display:flex;flex-direction:column;justify-content:space-between">
              <div style="font-size:10.5px;line-height:1.25;color:${labelColor};${FONT_STACK};font-weight:400">${escapeHtml(r.label)}</div>
              <div style="margin-top:4px;font-size:18px;line-height:1.1;font-weight:700;color:${valueColor};${FONT_STACK};font-variant-numeric:tabular-nums">${escapeHtml(r.value)}</div>
            </div>`;
          })
          .join("")}
      </div>`
    : "";

  const whtHtml = (input.whtSection ?? [])
    .map(
      (r) =>
        `<tr style="background:#fff">
          <td style="${td}">${escapeHtml(r.label)}</td>
          <td style="${tdRight}">${escapeHtml(r.gross)}</td>
          <td style="${tdRight}">${escapeHtml(r.wht)}</td>
          <td style="${tdRight};font-weight:700">${escapeHtml(r.net)}</td>
        </tr>`,
    )
    .join("");

  const investments = input.investments ?? [];
  let invBody = investments
    .map((r) => {
      const { main, started } = planParts(r.plan);
      return `<tr style="background:#fff;page-break-inside:avoid">
          <td style="${td}">
            <div style="font-weight:700">${escapeHtml(main)}</div>
            ${started ? `<div style="margin-top:1px;font-size:10px;line-height:1.25;color:${MUTED}">${escapeHtml(started)}</div>` : ""}
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
      <td style="${td};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">TOTAL</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">${sumMoneyColumn(investments, "principal")}</td>
      <td style="${tdRight};border:none;color:#fff;height:auto;padding:6px 8px"></td>
      <td style="${tdRight};border:none;color:#fff;height:auto;padding:6px 8px"></td>
      <td style="${tdRight};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">${sumMoneyColumn(investments, "gross")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">${sumMoneyColumn(investments, "wht")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">${sumMoneyColumn(investments, "net")}</td>
      <td style="${tdRight};border:none;color:#fff;font-weight:700;height:auto;padding:6px 8px">${sumMoneyColumn(investments, "valueAtMaturity")}</td>
    </tr>`;
  }

  const txnHtml = (input.transactions ?? [])
    .map(
      (r) =>
        `<tr style="background:#fff">
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
      (r) =>
        `<tr style="background:#fff">
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

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(input.title)}</title><style>${fontFaceCss(brand)}
thead{display:table-header-group}tr{page-break-inside:avoid}
</style></head>
<body>
  <div id="kipit-statement" style="${FONT_STACK};padding:18px 22px 16px;width:750px;max-width:750px;margin:0 auto;background:${PAGE_BG};color:${NAVY}">
    <header style="display:flex;align-items:stretch;justify-content:space-between;gap:10px;margin:0;padding:0">
      <div style="display:flex;align-items:center;flex:0 1 38%;min-width:0;padding:2px 0 0">
        <img src="${escapeHtml(logo)}" alt="Kipit Asset Management" style="height:78px;width:auto;max-width:392px;object-fit:contain" />
      </div>
      <div style="background:${NAVY};color:#fff;flex:1 1 58%;min-width:0;padding:10px 16px;display:flex;flex-direction:column;justify-content:center;text-align:right">
        <div style="font-size:17px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.1">${escapeHtml(input.title)}</div>
        ${periodLine ? `<div style="margin-top:4px;font-size:12px;line-height:1.35;color:rgba(255,255,255,0.92);font-weight:400">${escapeHtml(periodLine)}</div>` : ""}
        ${reference ? `<div style="margin-top:3px;font-size:12px;color:rgba(255,255,255,0.92);font-weight:400">Ref: ${escapeHtml(reference)}</div>` : ""}
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

    <div style="margin-top:12px;background:${GOLD_SOFT};border:1px solid ${GOLD};padding:8px 10px;font-size:11px;line-height:1.45;color:${NAVY_SOFT}">
      ${escapeHtml(AUTO_NOTE)}
    </div>

    <div style="margin-top:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:14px">
      <div style="flex:1;font-size:10px;line-height:1.45;color:${MUTED}">
        <p style="margin:0 0 8px;color:${INK}">${escapeHtml(INTEREST_NOTE)}</p>
        <p style="margin:0;color:${INK}"><strong style="color:${NAVY}">${escapeHtml(RMB_DISCLAIMER)}</strong></p>
      </div>
      <div style="text-align:center;flex-shrink:0;width:110px">
        <img src="${escapeHtml(stamp)}" alt="Kipit company stamp" style="width:92px;height:92px;object-fit:contain;display:block;margin:0 auto" />
        <div style="margin-top:4px;font-size:9px;line-height:1.25;color:${NAVY};font-weight:700">Authorised by Kipit Asset Management Limited</div>
      </div>
    </div>

    <div style="margin-top:10px;border-top:1px solid ${LINE};padding-top:6px;font-size:9.5px;color:${MUTED};letter-spacing:0.01em">
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

/** Keep total canvas pixels under browser limits (tall statements used to OOM / taint). */
const MAX_CANVAS_PIXELS = 8_000_000;

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function waitForDocumentReady(doc: Document) {
  try {
    if (doc.fonts?.ready) await doc.fonts.ready;
  } catch {
    /* ignore */
  }
  await waitForImages(doc);
  await delay(180);
}

/**
 * Render the exact statement HTML (same as View / HTML download) into a PDF.
 * Uses an iframe + embedded data-URL assets so fonts/images match and export succeeds.
 */
export async function documentPdfBlob(input: DocumentPdfInput): Promise<Blob> {
  const brand = await getBrandAssets();
  const html = buildHtml(input, brand);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "statement-pdf-render");
  iframe.style.cssText =
    "position:fixed;left:-12000px;top:0;width:794px;height:1123px;border:0;opacity:1;pointer-events:none;background:#ffffff;";
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error("Could not open statement renderer");
    idoc.open();
    idoc.write(html);
    idoc.close();

    await waitForDocumentReady(idoc);

    const target =
      idoc.getElementById("kipit-statement") ?? idoc.body.firstElementChild ?? idoc.body;
    const contentWidth = 750;
    const contentHeight = Math.max(
      (target as HTMLElement).scrollHeight || 0,
      idoc.body.scrollHeight || 0,
      1,
    );
    iframe.style.width = `${contentWidth + 44}px`;
    iframe.style.height = `${contentHeight + 40}px`;
    await delay(60);

    const [{ jsPDF }, html2canvasMod] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);
    const html2canvas = html2canvasMod.default;

    const scale = Math.min(
      2,
      Math.sqrt(MAX_CANVAS_PIXELS / (contentWidth * contentHeight)),
    );

    const canvas = await html2canvas(target as HTMLElement, {
      scale: Math.max(1.15, scale),
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: contentWidth,
      windowWidth: contentWidth,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 20_000,
      onclone: (clonedDoc) => {
        const root = clonedDoc.getElementById("kipit-statement") as HTMLElement | null;
        if (root) {
          root.style.transform = "none";
          root.style.opacity = "1";
          root.style.margin = "0";
        }
        clonedDoc.body.style.background = "#ffffff";
      },
    });

    // Prefer the already-imported jsPDF constructor (avoid require in ESM builds).
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    if (!canvas.width || !canvas.height) {
      throw new Error("Statement canvas was empty");
    }

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

      const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
      const sliceHeightMm = sliceH / pxPerMm;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, margin, usableWidth, sliceHeightMm);

      y += sliceH;
      pageIndex += 1;
      if (pageIndex > 40) break;
    }

    const blob = pdf.output("blob");
    if (!blob || blob.size < 64) throw new Error("Generated PDF was empty");
    return blob;
  } finally {
    iframe.remove();
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

  // Prefer server Chromium print PDF (vector text, Appendix C / Statement_template match).
  try {
    const { fetchStatementPdfBlob } = await import("@/lib/api");
    const blob = await fetchStatementPdfBlob({
      title: input.title,
      subtitle: input.subtitle,
      reference: input.reference,
      filename: pdfName,
      rows: input.rows,
      clientMeta: input.clientMeta,
      portfolioSummary: input.portfolioSummary,
      whtSection: input.whtSection,
      investments: input.investments,
      transactions: input.transactions,
    });
    if (blob.size >= 64) {
      triggerDownload(blob, pdfName);
      return;
    }
  } catch {
    /* fall through to client render */
  }

  try {
    const blob = await documentPdfBlob(input);
    triggerDownload(blob, pdfName);
  } catch (err) {
    try {
      printDocumentPdf(input);
    } catch {
      const brand = await getBrandAssets().catch(() => undefined);
      const html = buildHtml(input, brand);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      triggerDownload(blob, defaultFilename(input, "html"));
    }
    const detail = err instanceof Error && err.message ? ` (${err.message})` : "";
    throw new Error(
      `PDF download failed${detail}. Use the print dialog (Save as PDF) or the HTML copy.`,
    );
  }
}

export async function documentPdfBase64(input: DocumentPdfInput): Promise<{
  filename: string;
  contentType: "application/pdf";
  contentBase64: string;
}> {
  let blob: Blob;
  try {
    const { fetchStatementPdfBlob } = await import("@/lib/api");
    blob = await fetchStatementPdfBlob({
      title: input.title,
      subtitle: input.subtitle,
      reference: input.reference,
      filename: defaultFilename(input, "pdf"),
      rows: input.rows,
      clientMeta: input.clientMeta,
      portfolioSummary: input.portfolioSummary,
      whtSection: input.whtSection,
      investments: input.investments,
      transactions: input.transactions,
    });
  } catch {
    blob = await documentPdfBlob(input);
  }
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
