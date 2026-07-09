import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BUSINESSES } from "./business-config.mjs";
import { enrichBusiness } from "./layout-presets.mjs";
import { esc, generateHotel2dHtml, generateHotel2dCss, getHotel2dJs } from "./hotel-style-2d.mjs";
import { generateHotel3dHtml, generateHotel3dCss, generateHotel3dJs } from "./hotel-style-3d.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function generateBusinessIndex(b) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(b.name)} | ${esc(b.brand)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../subpage.css" />
  <style>
    :root { --biz-accent: ${b.accent}; --biz-primary: ${b.primary}; }
    body { --accent: ${b.accent}; }
    .panel::before { background: linear-gradient(90deg, ${b.accent}, color-mix(in srgb, ${b.accent} 60%, ${b.primary})); }
    .brand-badge { display: inline-flex; align-items: center; gap: .5rem; margin-top: .5rem; padding: .35rem .85rem; border-radius: 100px; background: color-mix(in srgb, ${b.accent} 12%, transparent); border: 1px solid color-mix(in srgb, ${b.accent} 30%, transparent); font-size: .82rem; font-weight: 600; color: ${b.primary}; }
    .brand-mark { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${b.accent}; display: grid; place-items: center; font-weight: 700; font-size: .75rem; color: ${b.accent}; }
    .btn-desc { display: block; font-size: .72rem; font-weight: 500; opacity: .75; margin-top: .15rem; }
    .btn-2d { border-color: color-mix(in srgb, ${b.accent} 25%, var(--border)); }
    .btn-3d { border-color: color-mix(in srgb, ${b.primary} 20%, var(--border)); }
  </style>
</head>
<body>
  <div class="panel">
    <div class="top">
      <div class="kicker">Premium Website Suite</div>
      <h1 class="title">${esc(b.name)}</h1>
      <p class="subtitle">${esc(b.tagline)}</p>
      <div class="brand-badge"><span class="brand-mark">${esc(b.brand.charAt(0).toUpperCase())}</span>${esc(b.brand)}</div>
    </div>
    <div class="btn-grid">
      <button class="btn btn-2d" id="btn-2d" type="button">
        2D Site
        <span class="btn-desc">Full premium layout — booking, gallery, offers</span>
      </button>
      <button class="btn btn-3d" id="btn-3d" type="button">
        3D Site
        <span class="btn-desc">Immersive Three.js showcase + globe</span>
      </button>
      <button class="btn" id="btn-crm" type="button">
        CRM
        <span class="btn-desc">Client management portal</span>
      </button>
    </div>
    <button class="back" id="btn-back" type="button">← Back to categories</button>
  </div>
  <script>
    document.getElementById("btn-2d").onclick = () => location.href = "2d-site/index.html";
    document.getElementById("btn-3d").onclick = () => location.href = "3d-site/index.html";
    document.getElementById("btn-crm").onclick = () => location.href = "crm.html";
    document.getElementById("btn-back").onclick = () => location.href = "../index.html";
  </script>
</body>
</html>`;
}

function writeSite(raw) {
  const b = enrichBusiness(raw);
  const dir = path.join(ROOT, b.slug);
  const d2 = path.join(dir, "2d-site");
  const d3 = path.join(dir, "3d-site");
  fs.mkdirSync(d2, { recursive: true });
  fs.mkdirSync(d3, { recursive: true });

  fs.writeFileSync(path.join(d2, "index.html"), generateHotel2dHtml(b));
  fs.writeFileSync(path.join(d2, "style.css"), generateHotel2dCss(b));
  fs.writeFileSync(path.join(d2, "script.js"), getHotel2dJs());

  fs.writeFileSync(path.join(d3, "index.html"), generateHotel3dHtml(b));
  fs.writeFileSync(path.join(d3, "style.css"), generateHotel3dCss(b));
  fs.writeFileSync(path.join(d3, "script.js"), generateHotel3dJs(b));

  fs.writeFileSync(path.join(dir, "index.html"), generateBusinessIndex(b));
  console.log(`✓ ${b.slug} — ${b.brand}`);
}

console.log(`Generating ${BUSINESSES.length} hotel-style business sites...\n`);
BUSINESSES.forEach(writeSite);
console.log(`\nDone! ${BUSINESSES.length} businesses upgraded to hotel-style 2D + 3D.`);
console.log("Hotel kept as custom premium build.");
