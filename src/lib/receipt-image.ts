import { naira, type Transaction } from "@/lib/portfolio-data";

const NAVY = "#1a3a6b";
const GOLD = "#d4a017";
const TEXT = "#1a2744";
const MUTED = "#6b7a90";
const BORDER = "#e6ebf2";
const WHITE = "#ffffff";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/** Build a PNG File of the branded Kipit receipt (no HTML share). */
export async function buildReceiptImageFile(txn: Transaction): Promise<File> {
  const width = 720;
  const pad = 40;
  const rows: { label: string; value: string }[] = [
    { label: "Description", value: txn.label },
    { label: "Date & time", value: `${txn.date} · ${txn.time}` },
    { label: "Type", value: txn.type },
    { label: "Status", value: txn.status },
    { label: "Source", value: txn.source },
    { label: "Destination", value: txn.destination },
    ...(txn.related ? [{ label: "Investment", value: txn.related.name }] : []),
    { label: "Reference", value: txn.reference },
  ];

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("Could not create receipt image.");

  measure.font = "600 22px system-ui,Segoe UI,sans-serif";
  const valueLines = rows.map((r) => {
    measure.font = "700 22px system-ui,Segoe UI,sans-serif";
    return wrapText(measure, r.value, width - pad * 2 - 200);
  });
  const rowsHeight = valueLines.reduce((sum, lines) => sum + Math.max(1, lines.length) * 28 + 28, 0);

  const heroH = 220;
  const footerH = 90;
  const height = heroH + 28 + rowsHeight + footerH;

  const canvas = document.createElement("canvas");
  const scale = Math.min(window.devicePixelRatio || 2, 3);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create receipt image.");
  ctx.scale(scale, scale);

  // Card background
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, width, height);

  // Navy hero
  const heroGrad = ctx.createLinearGradient(0, 0, width, heroH);
  heroGrad.addColorStop(0, "#152f5c");
  heroGrad.addColorStop(1, NAVY);
  ctx.fillStyle = heroGrad;
  ctx.fillRect(0, 0, width, heroH);

  // Soft gold glow
  const glow = ctx.createRadialGradient(width - 40, 20, 10, width - 40, 20, 180);
  glow.addColorStop(0, "rgba(212,160,23,0.35)");
  glow.addColorStop(1, "rgba(212,160,23,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, heroH);

  ctx.fillStyle = WHITE;
  ctx.font = "800 28px Georgia, 'Times New Roman', serif";
  ctx.fillText("Kipit", pad, 56);

  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "800 14px system-ui,Segoe UI,sans-serif";
  const eyebrow = txn.direction === "in" ? "AMOUNT RECEIVED" : "AMOUNT PAID";
  ctx.fillText(eyebrow, pad, 100);

  ctx.fillStyle = WHITE;
  ctx.font = "800 48px system-ui,Segoe UI,sans-serif";
  ctx.fillText(naira(txn.amount), pad, 152);

  // Reference pill
  const pill = txn.reference;
  ctx.font = "700 16px system-ui,Segoe UI,sans-serif";
  const pillW = ctx.measureText(pill).width + 44;
  const pillX = pad;
  const pillY = 172;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, pillX, pillY, pillW, 32, 16);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(pillX + 16, pillY + 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.fillText(pill, pillX + 30, pillY + 21);

  // Tear line
  let y = heroH + 14;
  ctx.strokeStyle = BORDER;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(width - pad, y);
  ctx.stroke();
  ctx.setLineDash([]);

  y += 28;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const lines = valueLines[i]!;
    ctx.fillStyle = MUTED;
    ctx.font = "500 18px system-ui,Segoe UI,sans-serif";
    ctx.fillText(row.label, pad, y + 18);

    ctx.fillStyle = TEXT;
    ctx.font = "700 20px system-ui,Segoe UI,sans-serif";
    let ly = y + 18;
    for (const line of lines) {
      const tw = ctx.measureText(line).width;
      ctx.fillText(line, width - pad - tw, ly);
      ly += 28;
    }

    y += Math.max(1, lines.length) * 28 + 28;
    ctx.strokeStyle = BORDER;
    ctx.beginPath();
    ctx.moveTo(pad, y - 12);
    ctx.lineTo(width - pad, y - 12);
    ctx.stroke();
  }

  ctx.fillStyle = MUTED;
  ctx.font = "500 16px system-ui,Segoe UI,sans-serif";
  const footer =
    "Issued by Kipit. Investments are administered by Kipit's SEC-licensed partner.";
  const footerLines = wrapText(ctx, footer, width - pad * 2);
  let fy = height - footerH + 28;
  for (const line of footerLines) {
    ctx.fillText(line, pad, fy);
    fy += 22;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create receipt image."))), "image/png");
  });
  return new File([blob], `kipit-receipt-${txn.reference}.png`, { type: "image/png" });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
