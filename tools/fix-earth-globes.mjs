/**
 * Fix Earth globes: replace initGlobe by brace-matching and normalize EARTH constants.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const EARTH_CONSTS = `const EARTH_TEXTURE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_CLOUDS = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png";
const EARTH_BUMP = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_TEXTURE_FALLBACK = "../assets/earth-atmos.jpg";
const EARTH_CLOUDS_FALLBACK = "../assets/earth-clouds.png";
const EARTH_BUMP_FALLBACK = "../assets/earth-normal.jpg";
`;

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
  const rimLight = new THREE.DirectionalLight(0x89a9ff, 0.45);
  rimLight.position.set(-4, 1, -3);
  globeScene.add(rimLight);

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
      const map = document.getElementById("map-wrapper");
      if (map) map.classList.toggle("hidden");
    });
  }

  const locationEl = document.getElementById("location");
  if (locationEl) {
    const observer = new IntersectionObserver(([entry]) => { globeRunning = entry.isIntersecting; }, { threshold: 0.1 });
    observer.observe(locationEl);
  }
}`;

function extractFunction(source, name) {
  const startMatch = source.match(new RegExp(`function\\s+${name}\\s*\\(`));
  if (!startMatch) return null;
  const start = startMatch.index;
  let i = source.indexOf("{", start);
  if (i < 0) return null;
  let depth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1 };
      }
    }
  }
  return null;
}

function normalizeEarthConsts(js) {
  // Remove all EARTH_* constant lines
  js = js.replace(/^const EARTH_[A-Z_]+ = .*?;\r?\n/gm, "");
  // Insert clean block before initLoadingManager or first function after roomData
  if (/function initLoadingManager/.test(js)) {
    js = js.replace(/function initLoadingManager/, `${EARTH_CONSTS}\nfunction initLoadingManager`);
  } else if (/function latLonToVector3/.test(js)) {
    js = js.replace(/function latLonToVector3/, `${EARTH_CONSTS}\nfunction latLonToVector3`);
  } else {
    js = EARTH_CONSTS + "\n" + js;
  }
  return js;
}

const dirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, d.name, "3d-site", "script.js")))
  .map((d) => d.name);

let fixed = 0;
for (const slug of dirs) {
  const jsPath = path.join(ROOT, slug, "3d-site", "script.js");
  let js = fs.readFileSync(jsPath, "utf8");
  const before = js;

  js = normalizeEarthConsts(js);

  // Keep dry-cleaner custom beacon / maps coords
  if (slug !== "dry-cleaner") {
    const range = extractFunction(js, "initGlobe");
    if (range) {
      js = js.slice(0, range.start) + INIT_GLOBE + js.slice(range.end);
    }
  } else {
    // Ensure white base material for textured earth
    js = js.replace(
      /color: 0x2244aa, roughness: 0\.85, metalness: 0\.05/g,
      "color: 0xffffff, roughness: 0.82, metalness: 0.02"
    );
  }

  if (js !== before) {
    fs.writeFileSync(jsPath, js);
    fixed++;
  }
}

const leftover = [];
for (const slug of dirs) {
  const js = fs.readFileSync(path.join(ROOT, slug, "3d-site", "script.js"), "utf8");
  if (js.includes("0x2244aa")) leftover.push(slug);
}

console.log(`Fixed initGlobe/EARTH in ${fixed} sites.`);
console.log(`Remaining 0x2244aa: ${leftover.length ? leftover.join(", ") : "none"}`);
