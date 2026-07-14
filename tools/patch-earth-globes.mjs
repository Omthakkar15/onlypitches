/**
 * Patch all business 3d-site pages with a proper textured Earth globe,
 * address line, Maps CTAs, and local earth texture fallbacks.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_ASSETS = path.join(ROOT, "cafe", "assets");
const EARTH_FILES = ["earth-atmos.jpg", "earth-clouds.png", "earth-normal.jpg"];

const SKIP_HTML_CUSTOM = new Set(["dry-cleaner"]); // keep custom address/maps

const EARTH_CONSTS = `const EARTH_TEXTURE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_CLOUDS = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png";
const EARTH_BUMP = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_TEXTURE_FALLBACK = "../assets/earth-atmos.jpg";
const EARTH_CLOUDS_FALLBACK = "../assets/earth-clouds.png";
const EARTH_BUMP_FALLBACK = "../assets/earth-normal.jpg";`;

const INIT_GLOBE = `function initGlobe() {
  const canvas = document.getElementById("globe-canvas");
  if (!canvas) return;
  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  globeCamera.position.z = 3.2;
  globeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  globeRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  globeRenderer.outputEncoding = THREE.sRGBEncoding;

  globeScene.add(new THREE.AmbientLight(0x4f638d, 0.45));
  const dl = new THREE.DirectionalLight(0xffffff, 1.15);
  dl.position.set(5, 2, 4);
  globeScene.add(dl);
  const rim = new THREE.DirectionalLight(0x89a9ff, 0.45);
  rim.position.set(-4, 1, -3);
  globeScene.add(rim);

  const earthMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.02 });
  globeEarth = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), earthMat);
  globeScene.add(globeEarth);

  textureLoader.load(
    EARTH_TEXTURE,
    (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      globeEarth.material.map = tex;
      globeEarth.material.needsUpdate = true;
    },
    undefined,
    () => {
      textureLoader.load(EARTH_TEXTURE_FALLBACK, (tex) => {
        tex.encoding = THREE.sRGBEncoding;
        globeEarth.material.map = tex;
        globeEarth.material.needsUpdate = true;
      });
    }
  );
  textureLoader.load(
    EARTH_BUMP,
    (bump) => {
      globeEarth.material.bumpMap = bump;
      globeEarth.material.bumpScale = 0.045;
      globeEarth.material.needsUpdate = true;
    },
    undefined,
    () => {
      textureLoader.load(EARTH_BUMP_FALLBACK, (bump) => {
        globeEarth.material.bumpMap = bump;
        globeEarth.material.bumpScale = 0.045;
        globeEarth.material.needsUpdate = true;
      });
    }
  );

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false });
  globeClouds = new THREE.Mesh(new THREE.SphereGeometry(1.14, 48, 48), cloudMat);
  globeScene.add(globeClouds);
  textureLoader.load(
    EARTH_CLOUDS,
    (cloudTex) => {
      cloudTex.encoding = THREE.sRGBEncoding;
      globeClouds.material.map = cloudTex;
      globeClouds.material.alphaMap = cloudTex;
      globeClouds.material.needsUpdate = true;
    },
    undefined,
    () => {
      textureLoader.load(EARTH_CLOUDS_FALLBACK, (cloudTex) => {
        cloudTex.encoding = THREE.sRGBEncoding;
        globeClouds.material.map = cloudTex;
        globeClouds.material.alphaMap = cloudTex;
        globeClouds.material.needsUpdate = true;
      });
    }
  );

  globeScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.BackSide })
  ));

  const pinPos = latLonToVector3(51.5024, -0.1527, 1.12);
  beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 2 })
  );
  beacon.position.copy(pinPos);
  globeEarth.add(beacon);

  beaconGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.35 })
  );
  beaconGlow.position.copy(pinPos);
  globeEarth.add(beaconGlow);

  const beaconLight = new THREE.PointLight(0xffcc66, 0.8, 2);
  beaconLight.position.copy(pinPos);
  globeEarth.add(beaconLight);

  const toggle = document.getElementById("toggle-map");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.getElementById("map-wrapper").classList.toggle("hidden");
    });
  }

  const locationEl = document.getElementById("location");
  if (locationEl) {
    const observer = new IntersectionObserver(([entry]) => { globeRunning = entry.isIntersecting; }, { threshold: 0.1 });
    observer.observe(locationEl);
  }
}`;

const LOCATION_HTML = `  <section class="section reveal" id="location">
    <div class="container split">
      <div>
        <h2>Interactive Location Globe</h2>
        <p class="muted globe-meta">123 Business Avenue, London, United Kingdom · Mon–Sat: 9:00 AM to 7:00 PM</p>
        <canvas id="globe-canvas" class="globe-canvas"></canvas>
        <div class="globe-actions">
          <a href="https://www.google.com/maps/search/?api=1&query=51.5024,-0.1527" target="_blank" rel="noopener noreferrer" class="btn-gold">Open in Google Maps</a>
          <button id="toggle-map" class="btn-gold" type="button">Show Map</button>
        </div>
      </div>
      <div id="map-wrapper" class="map-wrapper hidden">
        <iframe title="Map" src="https://www.google.com/maps?q=51.5024,-0.1527&z=16&output=embed" loading="lazy"></iframe>
      </div>
    </div>
  </section>`;

const GLOBE_CSS = `.globe-meta { margin: 0.5rem 0 1rem; }
.globe-canvas {
  width: 100%;
  height: 320px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: radial-gradient(ellipse at 50% 50%, #0d1528 0%, #050508 75%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  display: block;
  margin-bottom: 0.8rem;
}
.globe-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.4rem; }
.map-wrapper iframe { width: 100%; height: 370px; border: 0; border-radius: 12px; }
.hidden { display: none; }`;

function copyEarthAssets(slug) {
  const dest = path.join(ROOT, slug, "assets");
  fs.mkdirSync(dest, { recursive: true });
  for (const file of EARTH_FILES) {
    const src = path.join(SRC_ASSETS, file);
    const out = path.join(dest, file);
    if (fs.existsSync(src) && !fs.existsSync(out)) {
      fs.copyFileSync(src, out);
    } else if (fs.existsSync(src)) {
      fs.copyFileSync(src, out);
    }
  }
}

function patchScript(jsPath) {
  let js = fs.readFileSync(jsPath, "utf8");
  const before = js;

  // Replace EARTH constant block (old threejs.org or partial CDN without fallbacks)
  js = js.replace(
    /const EARTH_TEXTURE = [\s\S]*?(?=\nfunction |\nconst [A-Z]|\nlet |\nvar )/,
    `${EARTH_CONSTS}\n\n`
  );

  // If fallbacks still missing after replace quirks, force-add
  if (!js.includes("EARTH_TEXTURE_FALLBACK")) {
    js = js.replace(
      /const EARTH_BUMP = "[^"]+";/,
      (m) => `${m}\nconst EARTH_TEXTURE_FALLBACK = "../assets/earth-atmos.jpg";\nconst EARTH_CLOUDS_FALLBACK = "../assets/earth-clouds.png";\nconst EARTH_BUMP_FALLBACK = "../assets/earth-normal.jpg";`
    );
  }

  // Replace entire initGlobe function
  if (/function initGlobe\s*\(/.test(js)) {
    js = js.replace(/function initGlobe\s*\([^)]*\)\s*\{[\s\S]*?\n\}(?=\n\s*function |\n\s*init|\n*$)/, INIT_GLOBE);
  }

  if (js !== before) {
    fs.writeFileSync(jsPath, js);
    return true;
  }
  return false;
}

function patchHtml(htmlPath, slug) {
  if (SKIP_HTML_CUSTOM.has(slug)) return false;
  let html = fs.readFileSync(htmlPath, "utf8");
  if (!html.includes('id="location"')) return false;

  // Already has the upgraded layout
  if (html.includes("globe-meta") && html.includes("Open in Google Maps") && html.includes("globe-actions")) {
    return false;
  }

  const replaced = html.replace(
    /<section class="section reveal" id="location">[\s\S]*?<\/section>/,
    LOCATION_HTML
  );
  if (replaced === html) return false;
  fs.writeFileSync(htmlPath, replaced);
  return true;
}

function patchCss(cssPath) {
  let css = fs.readFileSync(cssPath, "utf8");
  const before = css;

  if (css.includes(".globe-meta") && css.includes(".globe-actions")) {
    // Still refresh .globe-canvas if it's the old one-liner
    css = css.replace(
      /\.globe-canvas\s*\{[^}]*\}/,
      `.globe-canvas {
  width: 100%;
  height: 320px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: radial-gradient(ellipse at 50% 50%, #0d1528 0%, #050508 75%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  display: block;
  margin-bottom: 0.8rem;
}`
    );
  } else if (/\.globe-canvas\s*\{/.test(css)) {
    css = css.replace(
      /\.globe-canvas\s*\{[^}]*\}\s*\.map-wrapper iframe\{[^}]*\}\s*\.hidden\{[^}]*\}/,
      GLOBE_CSS
    );
    if (css === before) {
      css = css.replace(/\.globe-canvas\s*\{[^}]*\}/, GLOBE_CSS);
    }
  } else {
    css += `\n${GLOBE_CSS}\n`;
  }

  if (!css.includes(".globe-meta")) {
    css = css.replace(/\.globe-canvas/, `.globe-meta { margin: 0.5rem 0 1rem; }\n.globe-canvas`);
  }
  if (!css.includes(".globe-actions")) {
    css = css.replace(
      /\.globe-canvas[\s\S]*?margin-bottom: 0\.8rem;\n\}/,
      (m) => `${m}\n.globe-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.4rem; }`
    );
  }

  if (css !== before) {
    fs.writeFileSync(cssPath, css);
    return true;
  }
  return false;
}

const dirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, d.name, "3d-site", "script.js")))
  .map((d) => d.name);

let stats = { js: 0, html: 0, css: 0, assets: 0 };

for (const slug of dirs) {
  copyEarthAssets(slug);
  stats.assets++;

  const jsPath = path.join(ROOT, slug, "3d-site", "script.js");
  const htmlPath = path.join(ROOT, slug, "3d-site", "index.html");
  const cssPath = path.join(ROOT, slug, "3d-site", "style.css");

  if (patchScript(jsPath)) stats.js++;
  if (fs.existsSync(htmlPath) && patchHtml(htmlPath, slug)) stats.html++;
  if (fs.existsSync(cssPath) && patchCss(cssPath)) stats.css++;
}

console.log(`Patched ${dirs.length} 3d sites.`);
console.log(`  assets copied: ${stats.assets}`);
console.log(`  script.js: ${stats.js}`);
console.log(`  index.html: ${stats.html}`);
console.log(`  style.css: ${stats.css}`);
