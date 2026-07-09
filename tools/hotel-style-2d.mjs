import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TESTIMONIALS, GALLERY_IDS } from "./layout-presets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function img(id, w = 800) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

function heroWidgetHtml(b, layout) {
  if (!layout.heroWidget) return "";
  const w = layout.widget;
  if (w === "reservation" || w === "trip") {
    return `<div class="booking-widget fade-up" id="hero-booking">
      <form class="booking-form" id="hero-booking-form" novalidate>
        <div class="booking-field"><label for="check-in">Check-in</label><input type="date" id="check-in" required /><span class="field-error" id="err-check-in"></span></div>
        <div class="booking-field"><label for="check-out">Check-out</label><input type="date" id="check-out" required /><span class="field-error" id="err-check-out"></span></div>
        <div class="booking-field"><label for="guests">Guests</label><select id="guests"><option>1</option><option selected>2</option><option>3</option><option>4+</option></select></div>
        <button type="submit" class="btn-gold booking-submit">${esc(b.cta)}</button>
      </form>
    </div>`;
  }
  if (w === "appointment" || w === "consult" || w === "service" || w === "book") {
    return `<div class="booking-widget fade-up" id="hero-booking">
      <form class="booking-form" id="hero-booking-form" novalidate>
        <div class="booking-field"><label for="check-in">Preferred Date</label><input type="date" id="check-in" required /><span class="field-error" id="err-check-in"></span></div>
        <div class="booking-field"><label for="check-out">Time</label><input type="time" id="check-out" required /><span class="field-error" id="err-check-out"></span></div>
        <div class="booking-field"><label for="guests">Service</label><select id="guests">${b.offerings.slice(0, 3).map((o) => `<option>${esc(o.title)}</option>`).join("")}</select></div>
        <button type="submit" class="btn-gold booking-submit">${esc(b.cta)}</button>
      </form>
    </div>`;
  }
  return `<div class="booking-widget fade-up" id="hero-booking">
    <form class="booking-form" id="hero-booking-form" novalidate>
      <div class="booking-field"><label for="check-in">Date</label><input type="date" id="check-in" required /><span class="field-error" id="err-check-in"></span></div>
      <div class="booking-field"><label for="check-out">Details</label><input type="text" id="check-out" placeholder="Your needs" required /><span class="field-error" id="err-check-out"></span></div>
      <div class="booking-field"><label for="guests">Type</label><select id="guests">${b.offerings.slice(0, 3).map((o) => `<option>${esc(o.title)}</option>`).join("")}</select></div>
      <button type="submit" class="btn-gold booking-submit">${esc(b.cta)}</button>
    </form>
  </div>`;
}

export function generateHotel2dHtml(b) {
  const L = b.layout;
  const initial = b.brand.charAt(0).toUpperCase();
  const fh = b.fontH.replace(/\+/g, " ");
  const fb = b.fontB.replace(/\+/g, " ");

  const offeringsHtml = b.offerings.map((o) => `
        <article class="room-card reveal">
          <div class="room-image">
            <img src="${o.image}" alt="${esc(o.title)}" />
            <div class="room-overlay"><p>${esc(o.long)}</p></div>
          </div>
          <div class="room-info">
            <h3>${esc(o.title)}</h3>
            <p class="room-price">${o.price === "Contact us" ? "<strong>Contact us</strong>" : `From <strong>${esc(o.price)}</strong>`}</p>
            <ul class="room-amenities">${o.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            <a href="#booking" class="btn-outline">View Details</a>
          </div>
        </article>`).join("");

  const featuresHtml = L.featuresList.map(([icon, title, desc]) => `
        <div class="amenity reveal">
          <div class="amenity-icon">${icon}</div>
          <h3>${esc(title)}</h3>
          <p>${esc(desc)}</p>
        </div>`).join("");

  const galleryHtml = GALLERY_IDS.map((id, i) => {
    const cls = i === 1 ? "gallery-item reveal tall" : i === 3 ? "gallery-item reveal wide" : "gallery-item reveal";
    return `<div class="${cls}" data-index="${i}"><img src="${img(id, 600)}" alt="${esc(b.brand)} gallery" /></div>`;
  }).join("");

  const testimonialsHtml = TESTIMONIALS.map((t, i) => `
          <div class="testimonial-slide${i === 0 ? " active" : ""}">
            <div class="stars">★★★★★</div>
            <blockquote>"${esc(t.quote.replace("premium", b.brand))}"</blockquote>
            <div class="testimonial-author">
              <img src="${img(t.img, 80)}" alt="${esc(t.name)}" />
              <div><strong>${esc(t.name)}</strong><span>${esc(t.loc)}</span></div>
            </div>
          </div>`).join("");

  const offersHtml = b.packages.map((p, i) => `
        <article class="offer-card reveal">
          ${i === 0 ? '<div class="offer-badge">Featured</div>' : ""}
          <img src="${img(b.hero, 500)}" alt="${esc(p.title)}" />
          <div class="offer-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
            <p class="offer-price">${p.price === "Contact us" ? "<strong>Contact us</strong>" : `From <strong>${esc(p.price.replace(/^From /, ""))}</strong>`}</p>
            <a href="#booking" class="btn-gold">Book Now</a>
          </div>
        </article>`).join("");

  const serviceOptions = b.offerings.map((o) => `<option value="${esc(o.title.toLowerCase().replace(/\s+/g, "-"))}">${esc(o.title)}</option>`).join("");

  const statsHtml = b.stats.map((s) => `
          <div class="stat">
            <span class="stat-number" ${s.num ? `data-target="${s.num}"` : ""}>${s.num ? "0" : esc(s.val)}</span>
            <span class="stat-label">${esc(s.label)}</span>
          </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(b.brand)} — ${esc(b.tagline)}" />
  <title>${esc(b.brand)} | ${esc(b.tagline)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${b.fontH}:ital,wght@0,400;0,600;0,700;1,400&family=${b.fontB}:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="#home" class="logo"><span class="logo-mark">${initial}</span><span class="logo-text">${esc(b.brand)}</span></a>
      <nav class="nav-links" id="nav-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#offerings">${esc(L.offerings.split(" ")[0])}</a>
        <a href="#features">${esc(L.features)}</a>
        <a href="#spotlight">${esc(L.spotlight)}</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#booking" class="btn-gold nav-cta">${esc(b.cta)}</a>
      <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="home">
    <div class="hero-bg"><img src="${img(b.hero, 1920)}" alt="${esc(b.brand)}" /><div class="hero-overlay"></div></div>
    <div class="hero-content">
      <p class="hero-eyebrow fade-up">${esc(b.name)} · Premium</p>
      <h1 class="hero-title fade-up">${esc(b.tagline)}</h1>
      <p class="hero-subtitle fade-up">${esc(b.brand)} delivers excellence, craftsmanship, and care in every detail.</p>
    </div>
    ${heroWidgetHtml(b, L)}
  </section>

  <section class="section about" id="about">
    <div class="container about-grid">
      <div class="about-image reveal"><img src="${img(b.hero, 800)}" alt="${esc(b.brand)}" /><div class="about-image-accent"></div></div>
      <div class="about-text reveal">
        <p class="section-eyebrow">Welcome</p>
        <h2 class="section-title">A Legacy of<br />Excellence</h2>
        <p>${esc(LAYOUT_TEXT(b))}</p>
        <p>At ${esc(b.brand)}, we combine expertise with genuine care to deliver experiences our clients remember.</p>
        <div class="stats-grid">${statsHtml}</div>
      </div>
    </div>
  </section>

  <section class="section rooms" id="offerings">
    <div class="container">
      <div class="section-header reveal">
        <p class="section-eyebrow">${esc(b.name)}</p>
        <h2 class="section-title">${esc(L.offerings)}</h2>
        <p class="section-desc">${esc(L.offeringsDesc)}</p>
      </div>
      <div class="rooms-grid">${offeringsHtml}</div>
    </div>
  </section>

  <section class="section amenities" id="features">
    <div class="container">
      <div class="section-header reveal">
        <p class="section-eyebrow">Experience</p>
        <h2 class="section-title">${esc(L.featuresTitle)}</h2>
      </div>
      <div class="amenities-grid">${featuresHtml}</div>
    </div>
  </section>

  <section class="section dining" id="spotlight">
    <div class="container dining-grid">
      <div class="dining-images reveal">
        <img src="${img(b.hero, 700)}" alt="" class="dining-img-main" />
        <img src="${img(GALLERY_IDS[2], 400)}" alt="" class="dining-img-secondary" />
      </div>
      <div class="dining-text reveal">
        <p class="section-eyebrow">${esc(L.spotlight)}</p>
        <h2 class="section-title">${esc(L.spotlightTitle)}</h2>
        <p>${esc(b.offerDesc)}</p>
        <p>${esc(b.brand)} is committed to delivering an unparalleled experience tailored to your needs.</p>
        <div class="dining-details">
          <div><strong>Hours</strong><span>Mon – Sat, 9am – 7pm</span></div>
          <div><strong>Consultation</strong><span>By appointment</span></div>
          <div><strong>Response</strong><span>Within 24 hours</span></div>
        </div>
        <a href="#contact" class="btn-gold">${esc(b.cta)}</a>
      </div>
    </div>
  </section>

  <section class="section gallery" id="gallery">
    <div class="container">
      <div class="section-header reveal"><p class="section-eyebrow">Visual Journey</p><h2 class="section-title">Gallery</h2></div>
      <div class="gallery-grid" id="gallery-grid">${galleryHtml}</div>
    </div>
  </section>

  <div class="lightbox" id="lightbox" aria-hidden="true">
    <button class="lightbox-close" id="lightbox-close">&times;</button>
    <button class="lightbox-prev" id="lightbox-prev">&#8249;</button>
    <img src="" alt="" id="lightbox-img" />
    <button class="lightbox-next" id="lightbox-next">&#8250;</button>
  </div>

  <section class="section testimonials" id="testimonials">
    <div class="container">
      <div class="section-header reveal"><p class="section-eyebrow">Client Voices</p><h2 class="section-title">What Our Clients Say</h2></div>
      <div class="testimonial-carousel" id="testimonial-carousel">
        <div class="testimonial-track" id="testimonial-track">${testimonialsHtml}</div>
        <div class="carousel-controls">
          <button class="carousel-btn" id="carousel-prev">&#8249;</button>
          <div class="carousel-dots" id="carousel-dots"></div>
          <button class="carousel-btn" id="carousel-next">&#8250;</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section offers" id="offers">
    <div class="container">
      <div class="section-header reveal"><p class="section-eyebrow">Exclusive</p><h2 class="section-title">Special Offers</h2></div>
      <div class="offers-grid">${offersHtml}</div>
    </div>
  </section>

  <section class="section location" id="location">
    <div class="container location-grid">
      <div class="location-info reveal">
        <p class="section-eyebrow">Find Us</p>
        <h2 class="section-title">Our Location</h2>
        <address><strong>${esc(b.brand)}</strong><br />123 Business Avenue<br />Suite 100, City Center</address>
        <ul class="nearby-list">
          <li><strong>Downtown</strong> — 5 min walk</li>
          <li><strong>Transit Hub</strong> — 8 min walk</li>
          <li><strong>Parking</strong> — On-site available</li>
        </ul>
        <a href="https://maps.google.com" target="_blank" rel="noopener" class="btn-outline">Get Directions</a>
      </div>
      <div class="location-map reveal">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.0!2d-0.1527!3d51.5024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzA4LjYiTiAwwrAwOScwOS43Ilc!5e0!3m2!1sen!2suk!4v1" loading="lazy" title="Map"></iframe>
      </div>
    </div>
  </section>

  <section class="section contact" id="contact">
    <div class="container">
      <div class="section-header reveal"><p class="section-eyebrow">Reservations</p><h2 class="section-title">${esc(b.cta)}</h2></div>
      <form class="contact-form reveal" id="booking" novalidate>
        <div class="form-row">
          <div class="float-field"><input type="text" id="fname" placeholder=" " required /><label for="fname">Full Name</label><span class="field-error" id="err-fname"></span></div>
          <div class="float-field"><input type="email" id="femail" placeholder=" " required /><label for="femail">Email</label><span class="field-error" id="err-femail"></span></div>
        </div>
        <div class="form-row">
          <div class="float-field"><input type="tel" id="fphone" placeholder=" " required /><label for="fphone">Phone</label><span class="field-error" id="err-fphone"></span></div>
          <div class="float-field"><select id="froom" required><option value="" disabled selected></option>${serviceOptions}</select><label for="froom">${esc(L.formServiceLabel)}</label><span class="field-error" id="err-froom"></span></div>
        </div>
        <div class="form-row">
          <div class="float-field"><input type="date" id="fcheckin" placeholder=" " required /><label for="fcheckin">Preferred Date</label><span class="field-error" id="err-fcheckin"></span></div>
          <div class="float-field"><input type="date" id="fcheckout" placeholder=" " /><label for="fcheckout">Alternate Date</label><span class="field-error" id="err-fcheckout"></span></div>
        </div>
        <div class="float-field full"><textarea id="fmessage" rows="4" placeholder=" "></textarea><label for="fmessage">Special Requests</label></div>
        <button type="submit" class="btn-gold form-submit">Submit Request</button>
        <p class="form-success" id="form-success" hidden>Thank you! We'll be in touch shortly.</p>
      </form>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="#home" class="logo"><span class="logo-mark">${initial}</span><span class="logo-text">${esc(b.brand)}</span></a>
        <p>${esc(b.tagline)} — premium ${esc(b.name.toLowerCase())} services you can trust.</p>
        <div class="social-links"><a href="#">IG</a><a href="#">FB</a><a href="#">TW</a><a href="#">LI</a></div>
      </div>
      <div class="footer-links"><h4>Quick Links</h4><a href="#offerings">${esc(L.offerings)}</a><a href="#features">${esc(L.features)}</a><a href="#gallery">Gallery</a><a href="#offers">Offers</a></div>
      <div class="footer-contact"><h4>Contact</h4><p>(555) 123-4567</p><p>hello@${b.slug.replace(/-/g, "")}.com</p><p>123 Business Avenue</p></div>
      <div class="footer-newsletter"><h4>Newsletter</h4><p>Exclusive offers delivered to your inbox.</p>
        <form class="newsletter-form" id="newsletter-form"><input type="email" placeholder="Your email" required /><button type="submit" class="btn-gold">Subscribe</button></form>
      </div>
    </div>
    <div class="footer-bottom"><div class="container"><p>&copy; ${new Date().getFullYear()} ${esc(b.brand)}</p><a href="../index.html" class="footer-back">← Back to Menu</a></div></div>
  </footer>
  <a href="#booking" class="sticky-book" id="sticky-book">${esc(b.cta)}</a>
  <script src="script.js"></script>
</body>
</html>`;
}

function LAYOUT_TEXT(b) {
  const texts = {
    hospitality: "Crafted with passion and served with excellence for every guest.",
    wellness: "Holistic care designed around your wellbeing and relaxation.",
    fitness: "Built for every fitness level with expert guidance and modern facilities.",
    medical: "Patient-first care backed by expertise and compassion.",
    professional: "Trusted expertise and proven results when it matters most.",
    retail: "Curated quality and exceptional service in every interaction.",
    trade: "Reliable professionals delivering guaranteed results.",
    education: "Learning paths designed for real-world outcomes.",
    automotive: "Quality vehicles and expert service you can depend on.",
    events: "Memorable experiences, flawlessly delivered every time.",
    pet: "Love and expertise for your furry family members.",
    travel: "Journeys crafted with care, adventure, and attention to detail.",
  };
  return texts[b.category] || texts.professional;
}

export function generateHotel2dCss(b) {
  let css = fs.readFileSync(path.join(ROOT, "hotel/2d-site/style.css"), "utf8");
  const fh = b.fontH.replace(/\+/g, " ");
  const fb = b.fontB.replace(/\+/g, " ");
  const accentLight = b.accent;
  const accentDark = b.primary;

  css = css
    .replace(/Cormorant Garamond/g, fh)
    .replace(/"Inter"/g, `"${fb}"`)
    .replace(/#c9a469/gi, b.accent)
    .replace(/#d4af6a/gi, accentLight)
    .replace(/#a8864a/gi, accentDark)
    .replace(/rgba\(201, 164, 105/g, `rgba(${hexRgb(b.accent)}`);
  return css;
}

function hexRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function getHotel2dJs() {
  return fs.readFileSync(path.join(ROOT, "hotel/2d-site/script.js"), "utf8");
}
