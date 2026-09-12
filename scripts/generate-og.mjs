/**
 * Generates public/og.png (1200×630) — the social card used by LinkedIn,
 * Slack, X and iMessage.
 *
 * Rendered with sharp, so it uses locally installed fonts rather than the
 * webfonts the site itself loads. Georgia is Fraunces' declared fallback in
 * the type stack, so the card stays on-tone. If you want the card set in
 * real Fraunces, install the font locally and change DISPLAY below.
 *
 *   npm run og
 */
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DISPLAY = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const SANS = "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const META = "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const BG = "#FDFCFC";
const INK = "#0A0A0A";
const MUTED = "#777169";
const RULE = "#EBE8E4";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const headline = ["Product design for complex,", "real-world systems."];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="${RULE}" stroke-width="2"/>

  <text x="88" y="112" font-family="${META}" font-size="19" letter-spacing="2.4" fill="${MUTED}">PORTFOLIO</text>

  ${headline
    .map(
      (line, i) =>
        `<text x="86" y="${288 + i * 82}" font-family="${DISPLAY}" font-size="70" font-weight="500" letter-spacing="-1.6" fill="${INK}">${esc(
          line,
        )}</text>`,
    )
    .join("\n  ")}

  <line x1="88" y1="452" x2="1112" y2="452" stroke="${RULE}" stroke-width="2"/>

  <text x="88" y="510" font-family="${SANS}" font-size="30" font-weight="600" fill="${INK}">Ajinkya Kale</text>
  <text x="88" y="552" font-family="${SANS}" font-size="24" fill="${MUTED}">Lead Product Designer</text>

  <text x="1112" y="510" text-anchor="end" font-family="${META}" font-size="17" letter-spacing="1.4" fill="${MUTED}">FINTECH · BANKING · HEALTHCARE</text>
  <text x="1112" y="552" text-anchor="end" font-family="${META}" font-size="17" letter-spacing="1.4" fill="${MUTED}">SAAS · ED-TECH</text>
</svg>`;

await mkdir(resolve(root, "public"), { recursive: true });
await writeFile(resolve(root, "public/og.svg"), svg);
await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630, { fit: "fill" })
  .png()
  .toFile(resolve(root, "public/og.png"));

console.log("Wrote public/og.png (1200×630)");
