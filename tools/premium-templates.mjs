export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function heroUrl(id, w = 1920) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

const TRUST = {
  hospitality: ["Award-Winning", "Fresh Ingredients", "Expert Staff", "5-Star Rated"],
  wellness: ["Licensed Therapists", "Organic Products", "Private Suites", "Top Rated"],
  fitness: ["Certified Coaches", "Modern Equipment", "Open 24/7", "Results Driven"],
  medical: ["Board Certified", "Same-Day Care", "Insurance Accepted", "Patient First"],
  professional: ["Licensed Experts", "Confidential", "Proven Results", "Trusted Firm"],
  retail: ["Premium Quality", "Curated Selection", "Easy Returns", "Expert Advice"],
  trade: ["Licensed & Insured", "Free Estimates", "On-Time Service", "Satisfaction Guaranteed"],
  education: ["Expert Faculty", "Small Classes", "Proven Results", "Flexible Schedule"],
  automotive: ["Certified Techs", "Genuine Parts", "Warranty Included", "Fair Pricing"],
  events: ["Full Service", "Creative Team", "On-Time Delivery", "5-Star Reviews"],
  pet: ["Loving Care", "Certified Staff", "Safe Environment", "Happy Pets"],
  travel: ["Best Price Guarantee", "24/7 Support", "Curated Trips", "Trusted Agency"],
};

const PROCESS = {
  hospitality: ["Consult & Plan", "Prepare & Craft", "Serve & Delight"],
  wellness: ["Consultation", "Personalized Care", "Lasting Results"],
  fitness: ["Assessment", "Custom Program", "Track Progress"],
  medical: ["Book Visit", "Expert Care", "Follow-Up Support"],
  professional: ["Initial Consult", "Strategy & Action", "Deliver Results"],
  retail: ["Browse Collection", "Expert Guidance", "Take Home Quality"],
  trade: ["Request Quote", "Professional Service", "Quality Guaranteed"],
  education: ["Choose Program", "Learn & Practice", "Achieve Goals"],
  automotive: ["Schedule Service", "Expert Repair", "Drive Confidently"],
  events: ["Discovery Call", "Plan & Design", "Flawless Execution"],
  pet: ["Book Appointment", "Loving Care", "Happy Companion"],
  travel: ["Choose Destination", "We Handle Details", "Enjoy the Journey"],
};

const TESTIMONIALS = [
  ["Exceptional professionalism from start to finish. Truly a premium experience.", "Sarah M.", "Verified Client"],
  ["Attention to detail and quality is unmatched. We return every time.", "James R.", "Long-time Customer"],
  ["The team went above and beyond. Highly recommend to anyone.", "Elena K.", "5-Star Review"],
];

export function generate2dHtml(b, sec) {
  const initial = b.brand.charAt(0).toUpperCase();
  const trust = TRUST[b.category] || TRUST.professional;
  const process = PROCESS[b.category] || PROCESS.professional;
  const hero = heroUrl(b.hero);

  const cards = b.items.map((row, i) => {
    const [title, price, desc] = row.split("|");
    const num = String(i + 1).padStart(2, "0");
    return `<article class="service-card reveal">
      <div class="card-visual" style="background-image:url('${heroUrl(b.hero, 800)}')">
        <span class="card-num">${num}</span>
        <div class="card-visual-overlay"></div>
      </div>
      <div class="card-content">
        <h3>${esc(title)}</h3>
        <p class="card-price">${esc(price)}</p>
        <p class="card-desc">${esc(desc)}</p>
        <a href="#contact" class="card-link">Learn more <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
  }).join("\n        ");

  const trustHtml = trust.map((t) => `<div class="trust-item"><span class="trust-dot"></span>${esc(t)}</div>`).join("");
  const processHtml = process.map((step, i) => `<div class="process-step reveal"><span class="step-num">${i + 1}</span><h3>${esc(step)}</h3></div>`).join("");
  const testimonialsHtml = TESTIMONIALS.map(([q, name, role], i) =>
    `<blockquote class="testimonial-slide${i === 0 ? " active" : ""}" data-slide="${i}"><p>"${esc(q.replace("premium experience", b.brand + " experience"))}"</p><footer><strong>${esc(name)}</strong><span>${esc(role)}</span></footer></blockquote>`
  ).join("\n          ");
  const galleryHtml = [0, 1, 2, 3].map((i) =>
    `<div class="gallery-item reveal" style="background-image:url('${heroUrl(b.hero, 600 + i * 100)}')"></div>`
  ).join("");

  const stat1Num = b.stat1.replace(/[^0-9.]/g, "") || "";
  const stat2Num = b.stat2.replace(/[^0-9.]/g, "") || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(b.brand)} — ${esc(b.tagline)}. Premium ${esc(b.name.toLowerCase())} services." />
  <title>${esc(b.brand)} | ${esc(b.tagline)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${b.fontH}:ital,wght@0,400;0,600;0,700;1,400&family=${b.fontB}:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="#home" class="logo">
        <span class="logo-mark">${initial}</span>
        <span class="logo-text">${esc(b.brand)}</span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Main">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="btn-primary nav-cta">${esc(b.cta)}</a>
      <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="home">
    <div class="hero-media" style="background-image:url('${hero}')"></div>
    <div class="hero-gradient"></div>
    <div class="hero-grain" aria-hidden="true"></div>
    <div class="hero-inner">
      <div class="hero-content reveal">
        <p class="eyebrow">${esc(b.name)} · Est. Premium</p>
        <h1>${esc(b.tagline)}</h1>
        <p class="hero-lead">Experience the difference at ${esc(b.brand)} — where excellence, craftsmanship, and client care define everything we do.</p>
        <div class="hero-actions">
          <a href="#contact" class="btn-primary btn-lg">${esc(b.cta)}</a>
          <a href="#services" class="btn-outline">Explore Services</a>
        </div>
      </div>
    </div>
    <div class="scroll-hint" aria-hidden="true"><span></span></div>
  </section>

  <div class="trust-bar">
    <div class="container trust-inner">${trustHtml}</div>
  </div>

  <section class="section about" id="about">
    <div class="container about-grid reveal">
      <div class="about-visual">
        <div class="about-frame" style="background-image:url('${heroUrl(b.hero, 900)}')"></div>
        <div class="about-accent" aria-hidden="true"></div>
      </div>
      <div class="about-copy">
        <p class="eyebrow">Our Story</p>
        <h2>Crafted for Discerning Clients</h2>
        <p class="lead">${sec.about}</p>
        <p>At <strong>${esc(b.brand)}</strong>, every detail reflects our commitment to premium quality and personalized service.</p>
        <div class="stats-row">
          <div class="stat">${stat1Num ? '<strong data-count="' + stat1Num + '">0</strong>' : '<strong>' + esc(b.stat1) + '</strong>'}<span>${esc(b.stat1l)}</span></div>
          <div class="stat">${stat2Num ? '<strong data-count="' + stat2Num + '">0</strong>' : '<strong>' + esc(b.stat2) + '</strong>'}<span>${esc(b.stat2l)}</span></div>
          <div class="stat"><strong data-count="${b.stat3}">0</strong><span>${esc(b.stat3l)}</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section services" id="services">
    <div class="container">
      <header class="section-header reveal">
        <p class="eyebrow">What We Offer</p>
        <h2>${esc(sec.main)}</h2>
        <p class="section-desc">Curated offerings designed to deliver exceptional value and results.</p>
      </header>
      <div class="services-grid">${cards}</div>
    </div>
  </section>

  <section class="section process">
    <div class="container">
      <header class="section-header center reveal">
        <p class="eyebrow">How It Works</p>
        <h2>Simple. Seamless. Professional.</h2>
      </header>
      <div class="process-grid">${processHtml}</div>
    </div>
  </section>

  <section class="section offer" id="offer">
    <div class="container">
      <div class="offer-panel reveal">
        <div class="offer-glow" aria-hidden="true"></div>
        <div class="offer-content">
          <p class="eyebrow">Exclusive Offer</p>
          <h2>${esc(b.offer)}</h2>
          <p>${esc(b.offerDesc)}</p>
          <a href="#contact" class="btn-primary">${esc(b.cta)}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section testimonials">
    <div class="container">
      <header class="section-header center reveal">
        <p class="eyebrow">Testimonials</p>
        <h2>Trusted by Our Clients</h2>
      </header>
      <div class="testimonial-slider reveal">
        <div class="testimonial-track">${testimonialsHtml}</div>
        <div class="testimonial-nav">
          <button type="button" class="t-btn" id="t-prev" aria-label="Previous">‹</button>
          <div class="t-dots" id="t-dots"></div>
          <button type="button" class="t-btn" id="t-next" aria-label="Next">›</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section gallery" id="gallery">
    <div class="container">
      <header class="section-header center reveal">
        <p class="eyebrow">Gallery</p>
        <h2>A Glimpse of Excellence</h2>
      </header>
      <div class="gallery-grid">${galleryHtml}</div>
    </div>
  </section>

  <section class="section contact" id="contact">
    <div class="container contact-grid reveal">
      <div class="contact-copy">
        <p class="eyebrow">Contact</p>
        <h2>Let's Start a Conversation</h2>
        <p>Reach out to ${esc(b.brand)} — our team responds within one business day.</p>
        <ul class="contact-list">
          <li><span class="ci-label">Address</span>123 Business Avenue, Suite 100</li>
          <li><span class="ci-label">Phone</span><a href="tel:+15551234567">(555) 123-4567</a></li>
          <li><span class="ci-label">Email</span><a href="mailto:hello@${b.slug.replace(/-/g, "")}.com">hello@${b.slug.replace(/-/g, "")}.com</a></li>
          <li><span class="ci-label">Hours</span>Mon – Sat, 9am – 7pm</li>
        </ul>
      </div>
      <form class="contact-form" id="contact-form" novalidate>
        <div class="field"><label for="name">Full Name</label><input id="name" name="name" type="text" required /><span class="field-err"></span></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /><span class="field-err"></span></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" /></div>
        <div class="field"><label for="message">Message</label><textarea id="message" name="message" rows="4" required></textarea><span class="field-err"></span></div>
        <button type="submit" class="btn-primary btn-full">Send Message</button>
      </form>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <span class="logo-mark">${initial}</span>
        <strong>${esc(b.brand)}</strong>
        <p>${esc(b.tagline)}</p>
      </div>
      <div><h4>Navigate</h4><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a></div>
      <div><h4>Services</h4>${b.items.slice(0, 3).map((row) => { const [t] = row.split("|"); return "<span>" + esc(t) + "</span>"; }).join("")}</div>
      <div><h4>Connect</h4><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">Facebook</a></div>
    </div>
    <div class="footer-bottom"><p>&copy; ${new Date().getFullYear()} ${esc(b.brand)}. All rights reserved.</p></div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;
}

export function generate2dCss(b) {
  const fh = b.fontH.replace(/\+/g, " ");
  const fb = b.fontB.replace(/\+/g, " ");
  return `:root {
  --primary: ${b.primary};
  --accent: ${b.accent};
  --bg: ${b.bg};
  --surface: color-mix(in srgb, ${b.primary} 40%, ${b.bg});
  --surface-2: rgba(255,255,255,.04);
  --text: #f8f5f0;
  --muted: rgba(248,245,240,.68);
  --line: rgba(255,255,255,.09);
  --font-h: '${fh}', Georgia, serif;
  --font-b: '${fb}', system-ui, sans-serif;
  --radius: 10px;
  --radius-lg: 16px;
  --ease: cubic-bezier(.4,0,.2,1);
  --shadow: 0 20px 60px rgba(0,0,0,.35);
  --glow: 0 0 60px color-mix(in srgb, ${b.accent} 25%, transparent);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-b);background:var(--bg);color:var(--text);line-height:1.7;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer;border:none;background:none}
.container{width:min(1180px,92%);margin:0 auto}
.section{padding:clamp(4rem,8vw,6.5rem) 0;position:relative}
.section-header{margin-bottom:3rem}
.section-header.center{text-align:center}
.section-header .section-desc{color:var(--muted);max-width:540px;margin:.75rem auto 0}
.eyebrow{font-size:.72rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:.85rem}
h1,h2,h3{font-family:var(--font-h);font-weight:600;line-height:1.15}
h1{font-size:clamp(2.4rem,5.5vw,4rem);margin-bottom:1.25rem}
h2{font-size:clamp(1.85rem,3.5vw,2.75rem)}
.lead{font-size:1.05rem;color:var(--muted);margin-bottom:1rem}

.navbar{position:fixed;inset:0 0 auto;z-index:1000;padding:1.1rem 0;transition:padding .35s var(--ease),background .35s,box-shadow .35s}
.navbar.scrolled{padding:.7rem 0;background:rgba(0,0,0,.82);backdrop-filter:blur(16px);box-shadow:0 4px 30px rgba(0,0,0,.25)}
.nav-inner{width:min(1180px,92%);margin:0 auto;display:flex;align-items:center;gap:1.5rem}
.logo{display:flex;align-items:center;gap:.65rem}
.logo-mark{width:38px;height:38px;border:1.5px solid var(--accent);border-radius:50%;display:grid;place-items:center;font-family:var(--font-h);font-size:1rem;color:var(--accent)}
.logo-text{font-family:var(--font-h);font-size:1.2rem;font-weight:600}
.nav-links{display:flex;gap:1.75rem;margin-left:auto}
.nav-links a{font-size:.88rem;font-weight:500;color:rgba(255,255,255,.78);transition:color .25s}
.nav-links a:hover{color:var(--accent)}
.btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:.8rem 1.6rem;background:var(--accent);color:var(--bg);font-weight:600;font-size:.88rem;letter-spacing:.04em;border-radius:6px;transition:transform .25s,box-shadow .25s,filter .25s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px color-mix(in srgb,var(--accent) 40%,transparent);filter:brightness(1.05)}
.btn-outline{display:inline-flex;padding:.78rem 1.5rem;border:1.5px solid rgba(255,255,255,.35);border-radius:6px;font-weight:600;font-size:.88rem;transition:all .25s}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-lg{padding:1rem 2rem;font-size:.95rem}
.btn-full{width:100%}
.hamburger{display:none;flex-direction:column;gap:5px;margin-left:auto;padding:4px}
.hamburger span{width:22px;height:2px;background:var(--text);transition:transform .3s}
.hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

.hero{min-height:100vh;position:relative;display:flex;align-items:center;overflow:hidden}
.hero-media{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.05);animation:heroZoom 20s ease infinite alternate}
@keyframes heroZoom{to{transform:scale(1.12)}}
.hero-gradient{position:absolute;inset:0;background:linear-gradient(105deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 85%,transparent) 35%,color-mix(in srgb,var(--primary) 55%,transparent) 70%,transparent 100%)}
.hero-grain{position:absolute;inset:0;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.hero-inner{position:relative;z-index:2;width:min(1180px,92%);margin:0 auto;padding:8rem 0 5rem}
.hero-content{max-width:620px}
.hero-lead{font-size:1.1rem;color:var(--muted);margin-bottom:2rem;max-width:520px}
.hero-actions{display:flex;flex-wrap:wrap;gap:1rem}
.scroll-hint{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);z-index:2}
.scroll-hint span{display:block;width:1px;height:48px;background:linear-gradient(var(--accent),transparent);animation:scrollPulse 2s ease infinite}
@keyframes scrollPulse{0%,100%{opacity:.3;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}

.trust-bar{border-block:1px solid var(--line);background:var(--surface-2);padding:1.1rem 0}
.trust-inner{display:flex;flex-wrap:wrap;justify-content:center;gap:1.5rem 2.5rem}
.trust-item{display:flex;align-items:center;gap:.5rem;font-size:.78rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.trust-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}

.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about-visual{position:relative}
.about-frame{aspect-ratio:4/5;border-radius:var(--radius-lg);background-size:cover;background-position:center;box-shadow:var(--shadow)}
.about-accent{position:absolute;inset:-12px -12px auto auto;width:55%;height:55%;border:1px solid var(--accent);border-radius:var(--radius-lg);z-index:-1;opacity:.5}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2rem}
.stat{padding:1.25rem 1rem;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);text-align:center}
.stat strong{display:block;font-family:var(--font-h);font-size:1.85rem;color:var(--accent)}
.stat span{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}

.services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.75rem}
.service-card{border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-2);transition:transform .4s var(--ease),box-shadow .4s,border-color .4s}
.service-card:hover{transform:translateY(-8px);box-shadow:var(--shadow);border-color:color-mix(in srgb,var(--accent) 35%,transparent)}
.card-visual{height:200px;background-size:cover;background-position:center;position:relative}
.card-visual-overlay{position:absolute;inset:0;background:linear-gradient(to top,var(--bg),transparent 60%)}
.card-num{position:absolute;top:1rem;left:1rem;font-family:var(--font-h);font-size:2rem;color:var(--accent);opacity:.9;line-height:1}
.card-content{padding:1.5rem}
.card-content h3{margin-bottom:.4rem;font-size:1.25rem}
.card-price{color:var(--accent);font-weight:700;font-size:.95rem;margin-bottom:.5rem}
.card-desc{color:var(--muted);font-size:.92rem;margin-bottom:1rem}
.card-link{font-size:.85rem;font-weight:600;color:var(--accent);display:inline-flex;align-items:center;gap:.35rem}

.process{background:var(--surface-2);border-block:1px solid var(--line)}
.process-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:1rem}
.process-step{text-align:center;padding:2rem 1.5rem;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg)}
.step-num{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1.5px solid var(--accent);color:var(--accent);font-family:var(--font-h);font-size:1.1rem;margin-bottom:1rem}

.offer-panel{position:relative;padding:clamp(2.5rem,5vw,4rem);border-radius:var(--radius-lg);border:1px solid var(--line);background:linear-gradient(135deg,var(--surface),var(--bg));overflow:hidden;text-align:center}
.offer-glow{position:absolute;width:400px;height:400px;border-radius:50%;background:var(--accent);opacity:.08;filter:blur(80px);top:-100px;right:-100px;pointer-events:none}
.offer-content{position:relative;max-width:560px;margin:0 auto}
.offer-content p{color:var(--muted);margin:1rem 0 1.75rem}

.testimonial-slider{max-width:720px;margin:0 auto;text-align:center}
.testimonial-slide{display:none}
.testimonial-slide.active{display:block;animation:fadeIn .5s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.testimonial-slide p{font-family:var(--font-h);font-size:clamp(1.2rem,2.5vw,1.55rem);font-style:italic;line-height:1.5;color:var(--muted);margin-bottom:1.5rem}
.testimonial-slide footer strong{display:block;color:var(--text);font-style:normal}
.testimonial-slide footer span{font-size:.85rem;color:var(--accent)}
.testimonial-nav{display:flex;align-items:center;justify-content:center;gap:1.25rem;margin-top:2rem}
.t-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);color:var(--text);font-size:1.4rem;line-height:1;transition:all .25s}
.t-btn:hover{border-color:var(--accent);color:var(--accent)}
.t-dots{display:flex;gap:.5rem}
.t-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25);cursor:pointer;transition:background .25s,transform .25s}
.t-dot.active{background:var(--accent);transform:scale(1.2)}

.gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.gallery-item{aspect-ratio:1;border-radius:var(--radius);background-size:cover;background-position:center;transition:transform .4s var(--ease),box-shadow .4s}
.gallery-item:hover{transform:scale(1.03);box-shadow:var(--shadow)}

.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.contact-list{list-style:none;margin-top:1.5rem}
.contact-list li{margin-bottom:1rem;color:var(--muted);font-size:.95rem}
.ci-label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:var(--accent);margin-bottom:.2rem}
.contact-list a:hover{color:var(--accent)}
.contact-form{padding:2rem;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface-2)}
.field{margin-bottom:1.1rem}
.field label{display:block;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:.4rem}
.field input,.field textarea{width:100%;padding:.85rem 1rem;background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:6px;color:var(--text);font-family:inherit;font-size:.95rem;transition:border-color .25s}
.field input:focus,.field textarea:focus{outline:none;border-color:var(--accent)}
.field-err{display:block;font-size:.75rem;color:#ff6b6b;margin-top:.25rem;min-height:1em}

.footer{border-top:1px solid var(--line);padding-top:3.5rem;background:color-mix(in srgb,var(--bg) 90%,#000)}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:2rem;padding-bottom:2.5rem}
.footer-brand .logo-mark{margin-bottom:.75rem}
.footer-brand strong{font-family:var(--font-h);font-size:1.15rem;display:block;margin-bottom:.5rem}
.footer-brand p{color:var(--muted);font-size:.9rem}
.footer h4{font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:var(--accent);margin-bottom:1rem}
.footer a,.footer span{display:block;color:var(--muted);font-size:.9rem;margin-bottom:.5rem}
.footer a:hover{color:var(--accent)}
.footer-bottom{padding:1.25rem 0;border-top:1px solid var(--line);text-align:center;color:var(--muted);font-size:.82rem}

.reveal{opacity:0;transform:translateY(28px);transition:opacity .75s var(--ease),transform .75s var(--ease)}
.reveal.visible{opacity:1;transform:none}

@media(max-width:900px){
  .about-grid,.contact-grid,.footer-grid{grid-template-columns:1fr}
  .process-grid{grid-template-columns:1fr}
  .gallery-grid{grid-template-columns:repeat(2,1fr)}
  .stats-row{grid-template-columns:1fr}
}
@media(max-width:768px){
  .hamburger{display:flex}
  .nav-links,.nav-cta{display:none}
  .nav-links.open{display:flex;position:fixed;inset:60px 0 auto;flex-direction:column;background:rgba(0,0,0,.95);padding:1.5rem;gap:1rem;border-bottom:1px solid var(--line)}
  .nav-links.open~.nav-cta,.nav-links.open{display:flex}
  .navbar .nav-cta{display:none}
}
`;

}

export function generate2dJs() {
  return `document.addEventListener("DOMContentLoaded",()=>{
  const navbar=document.getElementById("navbar");
  const hamburger=document.getElementById("hamburger");
  const navLinks=document.getElementById("nav-links");
  window.addEventListener("scroll",()=>navbar.classList.toggle("scrolled",scrollY>50),{passive:true});
  hamburger?.addEventListener("click",()=>{navLinks.classList.toggle("open");hamburger.classList.toggle("active");hamburger.setAttribute("aria-expanded",navLinks.classList.contains("open"));});
  navLinks?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{navLinks.classList.remove("open");hamburger?.classList.remove("active");}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}}),{threshold:.1,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
  document.querySelectorAll("[data-count]").forEach(el=>{
    const target=parseFloat(el.dataset.count);if(!target)return;
    const dec=target%1!==0;
    const o=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;
      const s=performance.now();const go=n=>{const t=Math.min((n-s)/1500,1);const v=target*(1-Math.pow(1-t,3));
        el.textContent=dec?v.toFixed(1):Math.floor(v);if(t<1)requestAnimationFrame(go);};
      requestAnimationFrame(go);o.unobserve(el);},{threshold:.5});
    o.observe(el);
  });
  const slides=[...document.querySelectorAll(".testimonial-slide")];
  const dotsEl=document.getElementById("t-dots");
  let idx=0;
  slides.forEach((_,i)=>{const d=document.createElement("button");d.className="t-dot"+(i?"":" active");d.type="button";d.addEventListener("click",()=>show(i));dotsEl?.appendChild(d);});
  function show(i){idx=(i+slides.length)%slides.length;slides.forEach((s,j)=>s.classList.toggle("active",j===idx));
    dotsEl?.querySelectorAll(".t-dot").forEach((d,j)=>d.classList.toggle("active",j===idx));}
  document.getElementById("t-prev")?.addEventListener("click",()=>show(idx-1));
  document.getElementById("t-next")?.addEventListener("click",()=>show(idx+1));
  setInterval(()=>show(idx+1),6000);
  document.getElementById("contact-form")?.addEventListener("submit",e=>{
    e.preventDefault();let ok=true;
    e.target.querySelectorAll("[required]").forEach(inp=>{
      const err=inp.parentElement.querySelector(".field-err");
      if(!inp.value.trim()){err.textContent="Required";ok=false;}else err.textContent="";
    });
    if(ok){alert("Thank you! Our team will respond shortly.");e.target.reset();}
  });
});`;
}

export function generate3dHtml(b, sec) {
  const initial = b.brand.charAt(0).toUpperCase();
  const hero = heroUrl(b.hero);
  const trust = TRUST[b.category] || TRUST.professional;
  const trustHtml = trust.map((t) => `<span class="trust-pill">${esc(t)}</span>`).join("");
  const items = b.items.map((row, i) => {
    const [title, price, desc] = row.split("|");
    return `<article class="svc-card reveal"><span class="svc-num">0${i + 1}</span><h3>${esc(title)}</h3><p class="svc-price">${esc(price)}</p><p>${esc(desc)}</p></article>`;
  }).join("\n        ");
  const galleryHtml = [0, 1, 2, 3].map((i) =>
    `<div class="gal-item reveal" style="background-image:url('${heroUrl(b.hero, 500 + i * 80)}')"></div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(b.brand)} — Immersive 3D ${esc(b.name)} experience." />
  <title>${esc(b.brand)} | 3D ${esc(b.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${b.fontH}:wght@400;600;700&family=${b.fontB}:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="loading-screen" class="loading-screen">
    <div class="load-ring"><span class="load-logo">${initial}</span></div>
    <p class="load-brand">${esc(b.brand)}</p>
    <p class="load-sub">Loading immersive experience</p>
    <div class="load-progress"><div class="load-bar"></div></div>
  </div>

  <canvas id="ambient-canvas" class="ambient-canvas" aria-hidden="true"></canvas>

  <header class="navbar" id="navbar">
    <div class="container nav-wrap">
      <a href="#home" class="logo"><span class="logo-mark">${initial}</span>${esc(b.brand)}</a>
      <nav class="nav-links" id="nav-links">
        <a href="#home">Home</a>
        <a href="#showcase">3D</a>
        <a href="#services">Services</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="btn-cta">${esc(b.cta)}</a>
      <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="home">
    <canvas id="hero-canvas" class="hero-canvas"></canvas>
    <div class="hero-overlay"></div>
    <div class="hero-inner container">
      <div class="hero-content reveal">
        <p class="eyebrow">Immersive 3D · ${esc(b.name)}</p>
        <h1>${esc(b.tagline)}</h1>
        <p>Step inside ${esc(b.brand)} — cinematic design meets world-class ${esc(b.name.toLowerCase())} excellence.</p>
        <div class="hero-btns">
          <a href="#showcase" class="btn-cta">Explore in 3D</a>
          <a href="#contact" class="btn-ghost">${esc(b.cta)}</a>
        </div>
      </div>
    </div>
  </section>

  <div class="trust-strip"><div class="container trust-flex">${trustHtml}</div></div>

  <section class="section about reveal">
    <div class="container split">
      <div>
        <p class="eyebrow">About</p>
        <h2>Excellence in ${esc(b.name)}</h2>
        <p class="muted">${sec.about} ${esc(b.brand)} sets the standard for premium service.</p>
      </div>
      <div class="stats">
        <div class="stat"><strong data-count="${b.stat3}">0</strong><span>${esc(b.stat3l)}</span></div>
        <div class="stat"><strong>${esc(b.stat1)}</strong><span>${esc(b.stat1l)}</span></div>
        <div class="stat"><strong>${esc(b.stat2)}</strong><span>${esc(b.stat2l)}</span></div>
      </div>
    </div>
  </section>

  <section class="section showcase reveal" id="showcase">
    <div class="container">
      <header class="sec-head center">
        <p class="eyebrow">Interactive</p>
        <h2>3D Showcase</h2>
        <p class="muted">Drag to rotate — explore our signature experience.</p>
      </header>
      <div class="showcase-wrap">
        <canvas id="feature-canvas" class="feature-canvas"></canvas>
        <aside class="showcase-panel">
          <h3>${esc(b.offer)}</h3>
          <p>${esc(b.offerDesc)}</p>
          <a href="#contact" class="btn-cta">${esc(b.cta)}</a>
        </aside>
      </div>
    </div>
  </section>

  <section class="section services reveal" id="services">
    <div class="container">
      <header class="sec-head center"><p class="eyebrow">Services</p><h2>${esc(sec.main)}</h2></header>
      <div class="svc-grid">${items}</div>
    </div>
  </section>

  <section class="section gallery reveal" id="gallery">
    <div class="container">
      <header class="sec-head center"><p class="eyebrow">Gallery</p><h2>Visual Excellence</h2></header>
      <div class="gal-grid">${galleryHtml}</div>
    </div>
  </section>

  <section class="section contact reveal" id="contact">
    <div class="container split">
      <div>
        <p class="eyebrow">Contact</p>
        <h2>Work With ${esc(b.brand)}</h2>
        <p class="muted">Our team is ready to help you get started.</p>
        <ul class="contact-list">
          <li><strong>Phone</strong> (555) 123-4567</li>
          <li><strong>Email</strong> hello@${b.slug.replace(/-/g, "")}.com</li>
          <li><strong>Hours</strong> Mon – Sat, 9am – 7pm</li>
        </ul>
      </div>
      <form class="contact-form" id="contact-form">
        <input type="text" placeholder="Your name" required />
        <input type="email" placeholder="Email address" required />
        <textarea rows="4" placeholder="Your message" required></textarea>
        <button type="submit" class="btn-cta btn-full">Send Message</button>
      </form>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <div><strong>${esc(b.brand)}</strong><p class="muted">${esc(b.tagline)}</p></div>
      <p>&copy; ${new Date().getFullYear()} ${esc(b.brand)}. All rights reserved.</p>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;
}

export function generate3dCss(b) {
  const fh = b.fontH.replace(/\+/g, " ");
  const fb = b.fontB.replace(/\+/g, " ");
  const hero = heroUrl(b.hero);
  return `:root{--primary:${b.primary};--accent:${b.accent};--bg:${b.bg};--text:#f8f5f0;--muted:rgba(248,245,240,.65);--line:rgba(255,255,255,.09);--font-h:'${fh}',serif;--font-b:'${fb}',sans-serif;--radius:12px;--ease:cubic-bezier(.4,0,.2,1)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-b);background:var(--bg);color:var(--text);line-height:1.65;overflow-x:hidden}
.container{width:min(1180px,92%);margin:0 auto}
.section{padding:clamp(4rem,7vw,6rem) 0}
.center{text-align:center}
.muted{color:var(--muted)}
.eyebrow{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:.75rem;font-weight:600}
h1,h2,h3{font-family:var(--font-h);font-weight:600;line-height:1.15}
h1{font-size:clamp(2rem,5vw,3.6rem);margin-bottom:1rem}
h2{font-size:clamp(1.7rem,3vw,2.5rem)}
.split{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.sec-head{margin-bottom:2.5rem}
.sec-head .muted{margin-top:.5rem}

.loading-screen{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem}
.load-ring{width:72px;height:72px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--accent);animation:spin 1s linear infinite;display:grid;place-items:center}
.load-logo{font-family:var(--font-h);font-size:1.5rem;color:var(--accent);animation:spin 1s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.load-brand{font-family:var(--font-h);font-size:1.25rem}
.load-sub{font-size:.8rem;color:var(--muted)}
.load-progress{width:140px;height:3px;background:var(--line);border-radius:2px;overflow:hidden;margin-top:.5rem}
.load-bar{height:100%;width:40%;background:var(--accent);animation:loadBar 1.2s ease infinite}
@keyframes loadBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}

.ambient-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.4}

.navbar{position:fixed;inset:0 0 auto;z-index:1000;padding:1rem 0;transition:background .35s,padding .35s}
.navbar.scrolled{padding:.65rem 0;background:rgba(0,0,0,.85);backdrop-filter:blur(14px);box-shadow:0 4px 24px rgba(0,0,0,.3)}
.nav-wrap{display:flex;align-items:center;gap:1.5rem}
.logo{display:flex;align-items:center;gap:.6rem;font-family:var(--font-h);font-size:1.15rem;color:var(--text);text-decoration:none}
.logo-mark{width:34px;height:34px;border:1.5px solid var(--accent);border-radius:50%;display:grid;place-items:center;font-size:.9rem;color:var(--accent)}
.nav-links{display:flex;gap:1.25rem;margin-left:auto}
.nav-links a{color:rgba(255,255,255,.75);text-decoration:none;font-size:.88rem;font-weight:500;transition:color .25s}
.nav-links a:hover{color:var(--accent)}
.btn-cta{display:inline-flex;align-items:center;padding:.7rem 1.4rem;background:var(--accent);color:var(--bg);font-weight:600;font-size:.88rem;border-radius:6px;text-decoration:none;border:none;cursor:pointer;transition:transform .25s,box-shadow .25s}
.btn-cta:hover{transform:translateY(-2px);box-shadow:0 10px 28px color-mix(in srgb,var(--accent) 35%,transparent)}
.btn-ghost{padding:.68rem 1.3rem;border:1.5px solid rgba(255,255,255,.3);border-radius:6px;font-weight:600;font-size:.88rem;color:var(--text);text-decoration:none;transition:border-color .25s,color .25s}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.btn-full{width:100%;justify-content:center}
.hamburger{display:none;flex-direction:column;gap:5px;margin-left:auto;background:none;border:none;cursor:pointer}
.hamburger span{width:22px;height:2px;background:var(--text)}

.hero{min-height:100vh;position:relative;display:flex;align-items:center}
.hero-canvas{position:absolute;inset:0;width:100%;height:100%}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(105deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 70%,transparent) 40%,transparent 75%);pointer-events:none}
.hero-inner{position:relative;z-index:2;padding:7rem 0 4rem}
.hero-content{max-width:540px}
.hero-content>p{color:var(--muted);margin-bottom:1.5rem}
.hero-btns{display:flex;flex-wrap:wrap;gap:1rem}

.trust-strip{border-block:1px solid var(--line);padding:1rem 0;background:rgba(255,255,255,.02)}
.trust-flex{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem 1.25rem}
.trust-pill{font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.45rem 1rem;border:1px solid var(--line);border-radius:100px;color:var(--muted)}

.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.stat{text-align:center;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius);background:rgba(255,255,255,.03)}
.stat strong{display:block;font-family:var(--font-h);font-size:1.75rem;color:var(--accent)}
.stat span{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}

.showcase-wrap{display:grid;grid-template-columns:1.4fr 1fr;gap:1.5rem;align-items:stretch;margin-top:1rem}
.feature-canvas{width:100%;min-height:400px;border-radius:var(--radius);border:1px solid var(--line);background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--primary) 50%,transparent),var(--bg));cursor:grab;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.feature-canvas:active{cursor:grabbing}
.showcase-panel{padding:2rem;border:1px solid var(--line);border-radius:var(--radius);background:rgba(255,255,255,.03);display:flex;flex-direction:column;justify-content:center}
.showcase-panel h3{margin-bottom:.75rem;font-size:1.35rem}
.showcase-panel p{color:var(--muted);margin-bottom:1.5rem;font-size:.95rem}
.showcase-panel .btn-cta{align-self:flex-start}

.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem}
.svc-card{padding:1.75rem;border:1px solid var(--line);border-radius:var(--radius);background:rgba(255,255,255,.03);transition:transform .35s,border-color .35s}
.svc-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 40%,transparent)}
.svc-num{font-family:var(--font-h);font-size:2rem;color:var(--accent);opacity:.6;line-height:1;margin-bottom:.75rem;display:block}
.svc-price{color:var(--accent);font-weight:700;margin:.4rem 0 .6rem}
.svc-card p{font-size:.9rem;color:var(--muted)}

.gal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.gal-item{aspect-ratio:1;border-radius:var(--radius);background-size:cover;background-position:center;transition:transform .4s}
.gal-item:hover{transform:scale(1.04)}

.contact-list{list-style:none;margin-top:1.25rem}
.contact-list li{margin-bottom:.85rem;color:var(--muted);font-size:.92rem}
.contact-list strong{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);margin-bottom:.15rem}
.contact-form{display:flex;flex-direction:column;gap:.85rem;padding:1.75rem;border:1px solid var(--line);border-radius:var(--radius);background:rgba(255,255,255,.03)}
.contact-form input,.contact-form textarea{padding:.8rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--line);border-radius:6px;color:var(--text);font-family:inherit;font-size:.95rem}
.contact-form input:focus,.contact-form textarea:focus{outline:none;border-color:var(--accent)}

.footer{border-top:1px solid var(--line);padding:2.5rem 0 1.5rem;margin-top:2rem}
.footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.footer strong{font-family:var(--font-h);font-size:1.1rem}
.reveal{opacity:0;transform:translateY(20px)}

@media(max-width:900px){.split,.showcase-wrap{grid-template-columns:1fr}.gal-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .hero-canvas{display:none}
  .hero{min-height:75vh;background:url('${hero}') center/cover}
  .hamburger{display:flex}
  .nav-links,.nav-wrap>.btn-cta{display:none}
  .nav-links.open{display:flex;position:fixed;inset:56px 0 auto;flex-direction:column;background:rgba(0,0,0,.95);padding:1.25rem;gap:.85rem;border-bottom:1px solid var(--line)}
}
`;
}

export function generate3dJs(b) {
  const accentHex = b.accent;
  const heroImg = heroUrl(b.hero);
  return `gsap.registerPlugin(ScrollTrigger);
const CFG={scene:"${b.scene}",accent:"${accentHex}",heroImg:"${heroImg}"};
const loading=document.getElementById("loading-screen");
const isMobile=matchMedia("(max-width:768px)").matches;
let heroR,heroS,heroC,heroG,heroPts;
let featR,featS,featC,featG,featY=0,featDrag=false,featLX=0;
let ambR,ambS,ambC,ambP;

function col(c){return new THREE.Color(c)}
function M(c,o={}){return new THREE.MeshStandardMaterial({color:col(c),metalness:o.m??.5,roughness:o.r??.4,emissive:o.e?col(o.e):0,emissiveIntensity:o.ei??0,transparent:o.t??false,opacity:o.o??1})}

function buildScene(type,accent){
  const g=new THREE.Group(),a=accent;
  const add=(m)=>g.add(m);
  switch(type){
    case"dining":add(new THREE.Mesh(new THREE.CylinderGeometry(1.1,1,.08,48),M("#f5f5f5",{r:.25})));
      const food=new THREE.Mesh(new THREE.SphereGeometry(.55,32,32,0,6.28,0,1.57),M(a,{r:.3}));
      food.position.y=.14;add(food);
      const fork=new THREE.Mesh(new THREE.BoxGeometry(.06,.75,.04),M(a,{m:.85}));fork.position.set(.95,.35,0);add(fork);break;
    case"brew":add(new THREE.Mesh(new THREE.CylinderGeometry(.5,.45,.95,32),M("#f0ebe3",{r:.55})));
      const liq=new THREE.Mesh(new THREE.CylinderGeometry(.44,.41,.14,32),M("#3a2218"));liq.position.y=.36;add(liq);
      const h=new THREE.Mesh(new THREE.TorusGeometry(.22,.04,8,16,3.14),M(a,{m:.75}));h.rotation.z=1.57;h.position.set(.58,0,0);add(h);break;
    case"wellness":[.65,.48,.36].forEach((r,i)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r,28,28),M(i?"#5a6a5d":"#7a8a7d",{r:.92}));s.position.set((i-1)*.55,i*.12,0);s.scale.y=.55;add(s)});
      const gl=new THREE.Mesh(new THREE.SphereGeometry(.14,16,16),M(a,{e:a,ei:1}));gl.position.y=.72;add(gl);break;
    case"fitness":const bar=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.1,16),M(a,{m:.85}));bar.rotation.z=1.57;add(bar);
      [-.9,.9].forEach(x=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.24,24),M("#2a2a2a",{m:.7}));w.rotation.z=1.57;w.position.x=x;add(w)});break;
    case"travel":const earth=new THREE.Mesh(new THREE.SphereGeometry(1.1,56,56),M("#1a3a6a",{r:.85}));add(earth);
      new THREE.TextureLoader().load("https://threejs.org/examples/textures/planets/Earth_atmos_2048.jpg",t=>{earth.material.map=t;earth.material.needsUpdate=true});
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.45,.025,8,64),M(a,{m:.9,r:.2}));ring.rotation.x=1.1;add(ring);break;
    case"legal":{[-.55,.55].forEach(x=>{const col=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,2,16),M("#e8e4dc",{r:.75}));col.position.x=x;add(col)});
      const beam=new THREE.Mesh(new THREE.BoxGeometry(1.5,.14,.28),M(a,{m:.65}));beam.position.y=1.1;add(beam);break;}
    case"jewelry":{const band=new THREE.Mesh(new THREE.TorusGeometry(.72,.09,16,48),M(a,{m:.95,r:.12}));band.rotation.x=1.57;add(band);
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.38,0),M("#aaddff",{e:"#4488ff",ei:.5,m:.4}));gem.position.y=.55;add(gem);break;}
    case"petgroom":const body=new THREE.Mesh(new THREE.SphereGeometry(.85,32,32),M(a,{r:.65}));body.scale.set(1,.72,1.05);add(body);
      [-.52,.52].forEach(x=>{const ear=new THREE.Mesh(new THREE.SphereGeometry(.24,16,16),M(a));ear.position.set(x,.52,0);add(ear)});break;
    case"dj":add(new THREE.Mesh(new THREE.CylinderGeometry(1,1,.06,48),M("#0a0a0a",{m:.4})));
      add(new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.07,32),M(a,{m:.8})));
      const gr=new THREE.Mesh(new THREE.TorusGeometry(.62,.012,8,48),M("#444",{m:.9}));gr.rotation.x=1.57;gr.position.y=.04;add(gr);break;
    default:const frame=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.25,.08),M(a,{m:.88,r:.25}));add(frame);
      const pic=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.05),M("#333"));pic.position.z=.05;add(pic);
      new THREE.TextureLoader().load(CFG.heroImg,t=>{pic.material.map=t;pic.material.needsUpdate=true});
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),M("#1a1510",{r:.8}));floor.rotation.x=-1.57;floor.position.y=-.72;add(floor);
  }
  return g;
}

function initAmbient(){
  const cv=document.getElementById("ambient-canvas");
  ambS=new THREE.Scene();ambC=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,50);ambC.position.z=8;
  ambR=new THREE.WebGLRenderer({canvas:cv,alpha:true});ambR.setPixelRatio(min(devicePixelRatio,2));ambR.setSize(innerWidth,innerHeight);
  const n=160,pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*28;pos[i*3+1]=(Math.random()-.5)*18;pos[i*3+2]=-Math.random()*8}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  ambP=new THREE.Points(geo,new THREE.PointsMaterial({color:CFG.accent,size:.05,transparent:true,opacity:.35}));
  ambS.add(ambP);
}

function initHero(){
  if(isMobile)return;
  const cv=document.getElementById("hero-canvas");
  heroS=new THREE.Scene();heroC=new THREE.PerspectiveCamera(48,cv.clientWidth/cv.clientHeight,.1,100);heroC.position.set(0,1.2,5.2);
  heroR=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  heroR.setPixelRatio(min(devicePixelRatio,2));heroR.setSize(cv.clientWidth,cv.clientHeight);
  heroR.outputEncoding=THREE.sRGBEncoding;heroR.toneMapping=THREE.ACESFilmicToneMapping;
  heroS.add(new THREE.AmbientLight(0xfff5ee,.45));
  const dl=new THREE.DirectionalLight(0xffffff,1);dl.position.set(4,5,5);heroS.add(dl);
  const pl=new THREE.PointLight(CFG.accent,1.4,22);pl.position.set(-2.5,2,3);heroS.add(pl);
  heroG=buildScene(CFG.scene,CFG.accent);heroS.add(heroG);
  const pc=280,p=new Float32Array(pc*3);
  for(let i=0;i<pc;i++){p[i*3]=(Math.random()-.5)*16;p[i*3+1]=Math.random()*7-2;p[i*3+2]=(Math.random()-.5)*16}
  const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(p,3));
  heroPts=new THREE.Points(pg,new THREE.PointsMaterial({color:CFG.accent,size:.045,transparent:true,opacity:.55}));
  heroS.add(heroPts);
  addEventListener("mousemove",e=>{const x=(e.clientX/innerWidth-.5)*.35,y=(e.clientY/innerHeight-.5)*.2;
    gsap.to(heroC.position,{x,y:1.2-y,duration:.6,overwrite:true})});
}

function initFeat(){
  const cv=document.getElementById("feature-canvas");
  featS=new THREE.Scene();featC=new THREE.PerspectiveCamera(40,cv.clientWidth/cv.clientHeight,.1,50);featC.position.set(0,.4,4.8);
  featR=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  featR.setPixelRatio(min(devicePixelRatio,2));featR.setSize(cv.clientWidth,cv.clientHeight);
  featR.outputEncoding=THREE.sRGBEncoding;featR.toneMapping=THREE.ACESFilmicToneMapping;
  featS.add(new THREE.AmbientLight(0xffffff,.5));
  const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(3,4,5);featS.add(dl);
  const rim=new THREE.DirectionalLight(CFG.accent,.4);rim.position.set(-3,1,-2);featS.add(rim);
  featG=buildScene(CFG.scene,CFG.accent);featS.add(featG);
  cv.addEventListener("pointerdown",e=>{featDrag=true;featLX=e.clientX});
  addEventListener("pointerup",()=>featDrag=false);
  addEventListener("pointermove",e=>{if(!featDrag)return;featY+=(e.clientX-featLX)*.009;featLX=e.clientX});
}

function resize(){
  if(heroR){const c=document.getElementById("hero-canvas");heroC.aspect=c.clientWidth/c.clientHeight;heroC.updateProjectionMatrix();heroR.setSize(c.clientWidth,c.clientHeight)}
  if(featR){const c=document.getElementById("feature-canvas");featC.aspect=c.clientWidth/c.clientHeight;featC.updateProjectionMatrix();featR.setSize(c.clientWidth,c.clientHeight)}
  if(ambR){ambC.aspect=innerWidth/innerHeight;ambC.updateProjectionMatrix();ambR.setSize(innerWidth,innerHeight)}
}

function tick(){
  requestAnimationFrame(tick);
  if(ambP){ambP.rotation.y+=.0004;ambR.render(ambS,ambC)}
  if(heroG){heroG.rotation.y+=.0035;heroPts&&(heroPts.rotation.y+=.0006);heroR?.render(heroS,heroC)}
  if(featG){if(!featDrag)featY+=.004;featG.rotation.y=featY;featR.render(featS,featC)}
}
tick();

addEventListener("scroll",()=>document.getElementById("navbar").classList.toggle("scrolled",scrollY>50),{passive:true});
addEventListener("resize",resize);
document.getElementById("hamburger")?.addEventListener("click",()=>document.getElementById("nav-links").classList.toggle("open"));

gsap.utils.toArray(".reveal").forEach(el=>gsap.fromTo(el,{y:28,autoAlpha:0},{y:0,autoAlpha:1,duration:.85,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 86%"}}));
document.querySelectorAll("[data-count]").forEach(el=>{const t=parseFloat(el.dataset.count);
  ScrollTrigger.create({trigger:el,start:"top 82%",onEnter:()=>gsap.to({v:0},{v:t,duration:1.5,ease:"power2.out",onUpdate(){el.textContent=t%1?this.targets()[0].v.toFixed(1):Math.floor(this.targets()[0].v)}})})});
document.getElementById("contact-form")?.addEventListener("submit",e=>{e.preventDefault();alert("Thank you! We will be in touch.");e.target.reset()});

setTimeout(()=>gsap.to(loading,{autoAlpha:0,duration:.6,onComplete:()=>loading.style.display="none"}),1400);
initAmbient();initHero();initFeat();resize();
`;
}
