/* ==========================================================================
   Aurelia Grand 3D — Vanilla JS + Three.js + GSAP
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
if (prefersReducedMotion || lowPowerDevice) {
  window.location.replace("../2d-site/index.html");
}

const loadingScreen = document.getElementById("loading-screen");
const isMobile = window.innerWidth < 768;
let heroRenderer, heroScene, heroCamera, heroGroup, heroParticles;
let ambientRenderer, ambientScene, ambientCamera, ambientPoints;
let roomRenderer, roomScene, roomCamera, roomGroup;
let globeRenderer, globeScene, globeCamera, globeEarth, globeClouds, beacon, beaconGlow;
let textureLoader;
let roomCurrentRotY = 0;
let roomDragging = false;
let heroRunning = !isMobile;
let roomRunning = true;
let globeRunning = true;
let ambientRunning = true;
const clock = new THREE.Clock();

const roomData = [
  {
    "title": "Suit Dry Cleaning",
    "desc": "Trusted finish for business and occasion wear",
    "price": "Contact us",
    "image": "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=1400&q=85&sig=10"
  },
  {
    "title": "Shirt Wash & Iron",
    "desc": "Pressed, folded, and ready for the week",
    "price": "Contact us",
    "image": "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=1400&q=85&sig=11"
  },
  {
    "title": "Delicate Fabrics",
    "desc": "Voile curtains, wool coats, and specialty garments",
    "price": "Contact us",
    "image": "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=1400&q=85&sig=12"
  }
];

const EARTH_TEXTURE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_CLOUDS = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png";
const EARTH_BUMP = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_TEXTURE_FALLBACK = "../assets/earth-atmos.jpg";
const EARTH_CLOUDS_FALLBACK = "../assets/earth-clouds.png";
const EARTH_BUMP_FALLBACK = "../assets/earth-normal.jpg";

function initLoadingManager() {
  textureLoader = new THREE.TextureLoader();
  const manager = new THREE.LoadingManager();
  manager.onLoad = () => {
    gsap.to(loadingScreen, { autoAlpha: 0, duration: 0.6, pointerEvents: "none" });
  };
  textureLoader.manager = manager;
  setTimeout(() => {
    if (loadingScreen.style.opacity !== "0") {
      gsap.to(loadingScreen, { autoAlpha: 0, duration: 0.5, pointerEvents: "none" });
    }
  }, 4500);
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function goldMaterial(emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({
    color: 0xc89b3c,
    metalness: 0.82,
    roughness: 0.28,
    emissive,
    emissiveIntensity,
  });
}

function initNavbar() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

function initHeroScene() {
  if (isMobile) return;
  const canvas = document.getElementById("hero-canvas");
  heroScene = new THREE.Scene();
  heroCamera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  heroCamera.position.set(0, 2.2, 7.2);
  heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  heroScene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dir = new THREE.DirectionalLight(0xffe5c3, 1.2);
  dir.position.set(4, 6, 4);
  heroScene.add(dir);
  const point = new THREE.PointLight(0xc89b3c, 1.5, 20);
  point.position.set(-3, 2.5, 2);
  heroScene.add(point);

  heroGroup = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a2f,
    metalness: 0.45,
    roughness: 0.2,
    transmission: 0.35,
    transparent: true,
    opacity: 0.9,
  });
  const parts = [
    new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 1.5), mat.clone()),
    new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 1.25), mat.clone()),
    new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.75, 1.0), mat.clone()),
    new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 18), mat.clone()),
  ];
  parts[0].position.y = 0.4;
  parts[1].position.y = 1.25;
  parts[2].position.y = 2.2;
  parts[3].position.set(1.35, 1.4, 0.0);
  parts.forEach((p) => heroGroup.add(p));
  heroScene.add(heroGroup);

  // Gold dust particles
  const pCount = 420;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3 + 0] = (Math.random() - 0.5) * 18;
    pPos[i * 3 + 1] = Math.random() * 7 - 2;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xc89b3c, size: 0.05, transparent: true, opacity: 0.65 });
  heroParticles = new THREE.Points(pGeo, pMat);
  heroScene.add(heroParticles);

  // Scroll explosion animation
  gsap.to(parts[0].position, { y: 0.1, z: -1.8, scrollTrigger: { trigger: "#rooms", start: "top 85%", end: "top 15%", scrub: true } });
  gsap.to(parts[1].position, { y: 2.2, x: -2.2, scrollTrigger: { trigger: "#rooms", start: "top 85%", end: "top 15%", scrub: true } });
  gsap.to(parts[2].position, { y: 3.2, x: 2.1, scrollTrigger: { trigger: "#rooms", start: "top 85%", end: "top 15%", scrub: true } });
  gsap.to(parts[3].position, { y: 2.8, x: 3.0, scrollTrigger: { trigger: "#rooms", start: "top 85%", end: "top 15%", scrub: true } });
  gsap.to(heroGroup.rotation, { y: Math.PI * 0.55, scrollTrigger: { trigger: "#rooms", start: "top 85%", end: "top 10%", scrub: true } });

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 0.45;
    const y = (e.clientY / window.innerHeight - 0.5) * 0.26;
    gsap.to(heroCamera.position, { x, y: 2.2 - y, duration: 0.5, overwrite: true });
  });

  const heroObserver = new IntersectionObserver(([entry]) => { heroRunning = entry.isIntersecting; }, { threshold: 0.08 });
  heroObserver.observe(document.querySelector(".hero"));
}

function initAmbientScene() {
  const canvas = document.getElementById("ambient-canvas");
  ambientScene = new THREE.Scene();
  ambientCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
  ambientCamera.position.z = 9;
  ambientRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  ambientRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ambientRenderer.setSize(window.innerWidth, window.innerHeight);

  const count = 220;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = -Math.random() * 10;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  ambientPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xc89b3c, size: 0.06, transparent: true, opacity: 0.28 }));
  ambientScene.add(ambientPoints);
}

function buildLaundryShowcase(textureUrl) {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.08), goldMaterial());
  frame.position.z = -0.04;
  group.add(frame);

  const wallGeo = new THREE.PlaneGeometry(3.2, 2.1);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.9 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.z = 0.02;
  group.add(wall);

  textureLoader.load(textureUrl, (tex) => {
    tex.encoding = THREE.sRGBEncoding;
    wall.material.map = tex;
    wall.material.roughness = 0.65;
    wall.material.needsUpdate = true;
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.75, metalness: 0.15 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.05, 0.55);
  group.add(floor);

  // Keep showcase image-focused (no product geometry),
  // and move the scene with gentle camera/rotation motion.
  const photoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.65),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
  );
  photoPlane.position.set(0, -0.05, 0.15);
  textureLoader.load(textureUrl, (tex) => {
    tex.encoding = THREE.sRGBEncoding;
    photoPlane.material.map = tex;
    photoPlane.material.needsUpdate = true;
  });
  group.add(photoPlane);

  return group;
}

function switchRoom(index) {
  if (!roomGroup || !roomScene) return;
  const rot = roomGroup.rotation.y;
  roomScene.remove(roomGroup);
  roomGroup = buildLaundryShowcase(roomData[index].image);
  roomGroup.rotation.y = rot;
  roomScene.add(roomGroup);
}

function buildAmenityIcon(type) {
  const group = new THREE.Group();
  const gold = goldMaterial();
  const goldGlow = goldMaterial(0xc89b3c, 0.25);

  if (type === "steam-press") {
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.9), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }));
    board.position.y = -0.3;
    group.add(board);
    const iron = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.42, 24), goldGlow);
    iron.rotation.z = Math.PI / 2;
    iron.position.set(0.1, -0.08, 0.05);
    group.add(iron);
  } else if (type === "hanger") {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 12, 24, Math.PI), gold);
    hook.position.y = 0.44;
    group.add(hook);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12), gold);
    bar.position.y = 0.25;
    group.add(bar);
    const hanger = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 3), gold);
    hanger.rotation.x = Math.PI / 2;
    hanger.position.y = 0.05;
    group.add(hanger);
  } else if (type === "stain-shield") {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.2, 28), gold);
    shield.rotation.x = Math.PI / 2;
    group.add(shield);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 18), new THREE.MeshStandardMaterial({ color: 0x6ea5d8, roughness: 0.2, metalness: 0.3 }));
    drop.position.y = 0.15;
    group.add(drop);
  } else if (type === "alteration") {
    const scissorA = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.08), goldGlow);
    scissorA.rotation.z = 0.48;
    group.add(scissorA);
    const scissorB = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.08), goldGlow);
    scissorB.rotation.z = -0.48;
    group.add(scissorB);
    const loopL = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 10, 20), gold);
    loopL.position.set(-0.34, -0.2, 0);
    group.add(loopL);
    const loopR = loopL.clone();
    loopR.position.x = 0.34;
    group.add(loopR);
  }

  return group;
}

function initRoomViewer() {
  const canvas = document.getElementById("room-canvas");
  roomScene = new THREE.Scene();
  roomCamera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  roomCamera.position.set(0, 0.15, 4.2);
  roomCamera.lookAt(0, -0.2, 0);
  roomRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  roomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  roomRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  roomRenderer.outputEncoding = THREE.sRGBEncoding;
  roomRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  roomRenderer.toneMappingExposure = 1.1;

  roomScene.add(new THREE.AmbientLight(0xfff5e8, 0.45));
  const light = new THREE.DirectionalLight(0xffffff, 0.85);
  light.position.set(2.5, 3.5, 2.5);
  roomScene.add(light);
  const rim = new THREE.DirectionalLight(0xc89b3c, 0.35);
  rim.position.set(-3, 1, -2);
  roomScene.add(rim);

  roomGroup = buildLaundryShowcase(roomData[0].image);
  roomScene.add(roomGroup);

  let lastX = 0;
  canvas.addEventListener("pointerdown", (e) => { roomDragging = true; lastX = e.clientX; });
  window.addEventListener("pointerup", () => { roomDragging = false; });
  window.addEventListener("pointermove", (e) => {
    if (!roomDragging) return;
    roomCurrentRotY += (e.clientX - lastX) * 0.008;
    lastX = e.clientX;
  });

  const dots = [...document.querySelectorAll(".dot")];
  const roomTitle = document.getElementById("room-title");
  const roomDesc = document.getElementById("room-desc");
  const roomPrice = document.getElementById("room-price");
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      dots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
      const idx = Number(dot.dataset.room);
      const r = roomData[idx];
      roomTitle.textContent = r.title;
      roomDesc.textContent = r.desc;
      roomPrice.textContent = r.price;
      switchRoom(idx);
      const spin = { val: roomCurrentRotY };
      gsap.to(spin, {
        val: roomCurrentRotY + 0.5,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => { roomCurrentRotY = spin.val; },
      });
    });
  });

  const observer = new IntersectionObserver(([entry]) => { roomRunning = entry.isIntersecting; }, { threshold: 0.1 });
  observer.observe(document.getElementById("rooms"));
}

function initAmenities3D() {
  const canvases = document.querySelectorAll(".amenity-canvas");
  canvases.forEach((canvas) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
    camera.position.set(0, 0.3, 3.2);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    scene.add(new THREE.AmbientLight(0xfff5e8, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(2, 3, 4);
    scene.add(dl);
    const accent = new THREE.PointLight(0xc89b3c, 0.5, 8);
    accent.position.set(-1, 2, 2);
    scene.add(accent);

    const icon = buildAmenityIcon(canvas.dataset.icon);
    scene.add(icon);

    canvas.addEventListener("mouseenter", () => gsap.to(icon.rotation, { y: icon.rotation.y + Math.PI * 0.75, duration: 0.6 }));
    canvas.addEventListener("mouseenter", () => icon.children.forEach((c) => {
      if (c.material && c.material.emissive) gsap.to(c.material.emissive, { r: 0.2, g: 0.15, b: 0.06, duration: 0.3 });
    }));
    canvas.addEventListener("mouseleave", () => icon.children.forEach((c) => {
      if (c.material && c.material.emissive) gsap.to(c.material.emissive, { r: 0, g: 0, b: 0, duration: 0.3 });
    }));

    const animate = () => {
      icon.rotation.y += 0.008;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  });
}

function initGlobe() {
  const canvas = document.getElementById("globe-canvas");
  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  globeCamera.position.z = 3.2;
  globeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  globeRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  globeRenderer.outputEncoding = THREE.sRGBEncoding;

  globeScene.add(new THREE.AmbientLight(0x4f638d, 0.45));
  const dl = new THREE.DirectionalLight(0xffffff, 1.1);
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

  const londonPos = latLonToVector3(51.555249, -0.3155235, 1.12);
  beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 2 })
  );
  beacon.position.copy(londonPos);
  globeEarth.add(beacon);

  beaconGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.35 })
  );
  beaconGlow.position.copy(londonPos);
  globeEarth.add(beaconGlow);

  const beaconLight = new THREE.PointLight(0xffcc66, 0.8, 2);
  beaconLight.position.copy(londonPos);
  globeEarth.add(beaconLight);

  document.getElementById("toggle-map").addEventListener("click", () => {
    document.getElementById("map-wrapper").classList.toggle("hidden");
  });

  const observer = new IntersectionObserver(([entry]) => { globeRunning = entry.isIntersecting; }, { threshold: 0.1 });
  observer.observe(document.getElementById("location"));
}

function initUI() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 60), { passive: true });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const backdrop = document.getElementById("nav-backdrop");
  const closeMenu = () => {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.hidden = true;
    document.body.style.overflow = "";
  };
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("active", open);
      hamburger.setAttribute("aria-expanded", open);
      if (backdrop) backdrop.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    backdrop?.addEventListener("click", closeMenu);
  }

  // Testimonial slider
  const track = document.getElementById("testimonial-track");
  const slides = track.children;
  let idx = 0;
  function showSlide(i) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    track.style.display = "flex";
    track.style.transition = "transform .45s ease";
  }
  document.getElementById("prev-test").addEventListener("click", () => showSlide(idx - 1));
  document.getElementById("next-test").addEventListener("click", () => showSlide(idx + 1));
  setInterval(() => showSlide(idx + 1), 5000);

  // Counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const start = performance.now();
      const duration = 1300;
      const isDecimal = target % 1 !== 0;
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const v = target * (1 - Math.pow(1 - t, 3));
        el.textContent = isDecimal ? v.toFixed(1) : Math.floor(v);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

  // Reveals
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(el, { y: 30, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 84%" },
    });
  });

  gsap.from(".hero-content", { y: 24, autoAlpha: 0, duration: 1.0, delay: 0.2, ease: "power2.out" });
}

function onResize() {
  if (heroRenderer && heroCamera) {
    const c = document.getElementById("hero-canvas");
    heroCamera.aspect = c.clientWidth / c.clientHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(c.clientWidth, c.clientHeight);
  }
  if (ambientRenderer && ambientCamera) {
    ambientCamera.aspect = window.innerWidth / window.innerHeight;
    ambientCamera.updateProjectionMatrix();
    ambientRenderer.setSize(window.innerWidth, window.innerHeight);
  }
  if (roomRenderer && roomCamera) {
    const c = document.getElementById("room-canvas");
    roomCamera.aspect = c.clientWidth / c.clientHeight;
    roomCamera.updateProjectionMatrix();
    roomRenderer.setSize(c.clientWidth, c.clientHeight);
  }
  if (globeRenderer && globeCamera) {
    const c = document.getElementById("globe-canvas");
    globeCamera.aspect = c.clientWidth / c.clientHeight;
    globeCamera.updateProjectionMatrix();
    globeRenderer.setSize(c.clientWidth, c.clientHeight);
  }
}

function animate() {
  const elapsed = clock.getElapsedTime();
  if (ambientRunning && ambientRenderer) {
    ambientPoints.rotation.y = elapsed * 0.03;
    ambientRenderer.render(ambientScene, ambientCamera);
  }
  if (!isMobile && heroRunning && heroRenderer) {
    heroGroup.rotation.y += 0.0035;
    heroParticles.rotation.y += 0.0009;
    heroRenderer.render(heroScene, heroCamera);
  }
  if (roomRunning && roomRenderer && roomGroup) {
    if (!roomDragging) roomCurrentRotY += 0.002;
    roomGroup.rotation.y = roomCurrentRotY;
    roomGroup.position.y = Math.sin(elapsed * 0.9) * 0.03;
    roomRenderer.render(roomScene, roomCamera);
  }
  if (globeRunning && globeRenderer && globeEarth) {
    globeEarth.rotation.y += 0.002;
    if (globeClouds) globeClouds.rotation.y += 0.0025;
    const pulse = 1 + Math.sin(elapsed * 3.4) * 0.25;
    if (beaconGlow) beaconGlow.scale.setScalar(pulse);
    globeRenderer.render(globeScene, globeCamera);
  }
  requestAnimationFrame(animate);
}

initLoadingManager();
initNavbar();
initHeroScene();
initAmbientScene();
initRoomViewer();
initAmenities3D();
initGlobe();
initUI();
window.addEventListener("resize", onResize);
onResize();
animate();
