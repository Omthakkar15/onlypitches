import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { esc } from "./hotel-style-2d.mjs";
import { GALLERY_IDS, TESTIMONIALS } from "./layout-presets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SUPPORTED_ICONS = ["pool", "spa", "gym", "wine"];

function img(id, w = 800) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

function resolveIcon(icon, i) {
  return SUPPORTED_ICONS.includes(icon) ? icon : SUPPORTED_ICONS[i % 4];
}

export function generateHotel3dHtml(b) {
  const L = b.layout;
  const initial = b.brand.charAt(0).toUpperCase();
  const showcase = b.showcase3d;
  const amenities = b.amenityIcons.map((a, i) => ({ ...a, icon: resolveIcon(a.icon, i) }));

  const statsHtml = b.stats.map((s) => `
        <div class="stat"><strong data-count="${s.num ?? s.val}">0</strong><span>${esc(s.label)}</span></div>`).join("");

  const dotsHtml = showcase.map((_, i) =>
    `<button class="dot${i === 0 ? " active" : ""}" data-room="${i}" aria-label="${esc(showcase[i].title)}"></button>`
  ).join("");

  const cardsHtml = showcase.map((s) =>
    `<article class="card"><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></article>`
  ).join("");

  const amenitiesHtml = amenities.map((a) =>
    `<div class="amenity"><canvas class="amenity-canvas" data-icon="${a.icon}"></canvas><span>${esc(a.label)}</span></div>`
  ).join("");

  const galleryHtml = GALLERY_IDS.slice(0, 4).map((id) =>
    `<img src="${img(id, 600)}" alt="${esc(b.brand)}" />`
  ).join("\n        ");

  const testimonialsHtml = TESTIMONIALS.slice(0, 3).map((t) =>
    `<article class="testimonial"><p>"${esc(t.quote.replace("premium", b.brand))}"</p><strong>— ${esc(t.name.split(" ")[0])} ${t.name.split(" ")[1]?.charAt(0) || ""}.</strong></article>`
  ).join("");

  const roomOptions = showcase.map((s) => `<option>${esc(s.title)}</option>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(b.brand)} — immersive 3D ${esc(b.name.toLowerCase())} experience." />
  <title>${esc(b.brand)} | 3D ${esc(b.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${b.fontH}:wght@500;600;700&family=${b.fontB}:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="loading-screen" class="loading-screen">
    <div class="loading-logo">${initial}</div>
    <p>${esc(b.brand)}</p>
    <div class="loading-spinner"></div>
  </div>

  <canvas id="ambient-canvas" class="ambient-canvas"></canvas>

  <header class="navbar" id="navbar">
    <div class="container nav-inner">
      <a href="#home" class="logo">${esc(b.brand)}</a>
      <nav class="nav-links" id="nav-links">
        <a href="#home">Home</a>
        <a href="#rooms">${esc(L.offerings.split(" ")[0])}</a>
        <a href="#amenities">${esc(L.features)}</a>
        <a href="#dining">${esc(L.spotlight)}</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="btn-gold">${esc(b.cta)}</a>
    </div>
  </header>

  <section class="hero" id="home">
    <canvas id="hero-canvas" class="hero-canvas"></canvas>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="eyebrow">Immersive 3D Experience</p>
      <h1>${esc(b.tagline)}</h1>
      <p>Discover ${esc(b.brand)} through cinematic design, premium craftsmanship, and unforgettable service.</p>
      <a href="#rooms" class="btn-gold">Explore ${esc(L.offerings.split(" ")[0])}</a>
    </div>
  </section>

  <section class="section about reveal">
    <div class="container split">
      <div>
        <p class="eyebrow dark">Welcome</p>
        <h2>Crafted for Clients Who Expect Excellence</h2>
        <p class="muted">${esc(b.brand)} blends expertise with genuine care. Every experience is orchestrated with precision and warmth.</p>
      </div>
      <div class="stats">${statsHtml}
      </div>
    </div>
  </section>

  <section class="section room-showcase reveal" id="rooms">
    <div class="container">
      <h2 class="center">3D ${esc(L.offerings)} Showcase</h2>
      <p class="center muted">Drag to rotate and switch between options.</p>
      <div class="room-wrap">
        <canvas id="room-canvas" class="room-canvas"></canvas>
        <div class="room-panel">
          <h3 id="room-title">${esc(showcase[0].title)}</h3>
          <p id="room-desc">${esc(showcase[0].desc)}</p>
          <p class="price" id="room-price">${esc(showcase[0].price)}</p>
          <div class="room-dots">${dotsHtml}</div>
        </div>
      </div>
      <div class="cards-grid">${cardsHtml}</div>
    </div>
  </section>

  <section class="section amenities reveal" id="amenities">
    <div class="container">
      <h2 class="center">3D ${esc(L.features)}</h2>
      <div class="amenities-grid">${amenitiesHtml}</div>
    </div>
  </section>

  <section class="section reveal" id="dining">
    <div class="container split">
      <img class="rounded" src="${img(b.hero, 1200)}" alt="${esc(b.brand)}" />
      <div>
        <p class="eyebrow dark">${esc(L.spotlight)}</p>
        <h2>${esc(L.spotlightTitle)}</h2>
        <p class="muted">${esc(b.offerDesc)} ${esc(b.brand)} is committed to delivering an unparalleled experience tailored to your needs.</p>
      </div>
    </div>
  </section>

  <section class="section reveal" id="gallery">
    <div class="container">
      <h2 class="center">Gallery</h2>
      <div class="gallery-grid">
        ${galleryHtml}
      </div>
    </div>
  </section>

  <section class="section reveal">
    <div class="container">
      <h2 class="center">Client Testimonials</h2>
      <div class="testimonial-slider" id="testimonial-slider">
        <button id="prev-test">‹</button>
        <div class="testimonial-track" id="testimonial-track">${testimonialsHtml}</div>
        <button id="next-test">›</button>
      </div>
    </div>
  </section>

  <section class="section reveal" id="location">
    <div class="container split">
      <div>
        <h2>Interactive Location Globe</h2>
        <canvas id="globe-canvas" class="globe-canvas"></canvas>
        <button id="toggle-map" class="btn-gold" type="button">Show Map</button>
      </div>
      <div id="map-wrapper" class="map-wrapper hidden">
        <iframe title="Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.0!2d-0.1527!3d51.5024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzA4LjYiTiAwwrAwOScwOS43Ilc!5e0!3m2!1sen!2suk!4v1" loading="lazy"></iframe>
      </div>
    </div>
  </section>

  <section class="section reveal" id="contact">
    <div class="container">
      <h2 class="center">${esc(b.cta)}</h2>
      <form class="booking-form">
        <div class="field"><input placeholder=" " required /><label>Name</label></div>
        <div class="field"><input type="email" placeholder=" " required /><label>Email</label></div>
        <div class="field"><input type="date" placeholder=" " required /><label>Preferred Date</label></div>
        <div class="field"><input type="date" placeholder=" " /><label>Alternate Date</label></div>
        <div class="field"><select required><option value="" selected disabled></option>${roomOptions}</select><label>${esc(L.formServiceLabel)}</label></div>
        <div class="field"><input placeholder=" " required /><label>Phone</label></div>
        <div class="field full"><textarea placeholder=" "></textarea><label>Message</label></div>
        <button type="submit" class="btn-gold">Submit</button>
      </form>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p>${esc(b.brand)} — ${esc(b.tagline)}</p>
      <p><a href="../index.html">← Back to ${esc(b.name)} Menu</a></p>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;
}

function hexToThree(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `0x${n.toString(16).padStart(6, "0")}`;
}

export function generateHotel3dCss(b) {
  const fh = b.fontH.replace(/\+/g, " ");
  const fb = b.fontB.replace(/\+/g, " ");
  let css = fs.readFileSync(path.join(ROOT, "hotel/3d-site/style.css"), "utf8");
  css = css
    .replace(/Cormorant Garamond/g, fh)
    .replace(/Inter/g, fb)
    .replace(/#c9a15a/gi, b.accent)
    .replace(/#dfc08b/gi, b.accent)
    .replace(/#c9a469/gi, b.accent);
  return css;
}

export function generateHotel3dJs(b) {
  let js = fs.readFileSync(path.join(ROOT, "hotel/3d-site/script.js"), "utf8");
  const roomJson = JSON.stringify(
    b.showcase3d.map((s) => ({
      title: s.title,
      desc: s.desc,
      price: s.price,
      image: s.image,
    })),
    null,
    2
  );
  js = js.replace(/const roomData = \[[\s\S]*?\];/, `const roomData = ${roomJson};`);

  const goldHex = hexToThree(b.accent);
  js = js
    .replace(/0xc9a15a/g, goldHex)
    .replace(/color: 0xc9a15a/g, `color: ${goldHex}`);
  return js;
}
