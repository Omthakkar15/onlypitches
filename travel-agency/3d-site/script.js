/* ==========================================================================
   Aurelia Grand 3D — Vanilla JS + Three.js + GSAP
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);

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
    "title": "Europe Tours",
    "desc": "Guided packages",
    "price": "From $2500+",
    "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=85&sig=10"
  },
  {
    "title": "Honeymoons",
    "desc": "Romantic escapes",
    "price": "From $3000+",
    "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=85&sig=11"
  },
  {
    "title": "Custom Itinerary",
    "desc": "Planning fee",
    "price": "From $200",
    "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=85&sig=12"
  }
];

const EARTH_TEXTURE = "https://threejs.org/examples/textures/planets/Earth_atmos_2048.jpg";
const EARTH_CLOUDS = "https://threejs.org/examples/textures/planets/Earth_clouds_1024.png";
const EARTH_BUMP = "https://threejs.org/examples/textures/planets/Earth_normal_2048.jpg";

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
    color: 0x00b4d8,
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
  const point = new THREE.PointLight(0x00b4d8, 1.5, 20);
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
  const pMat = new THREE.PointsMaterial({ color: 0x00b4d8, size: 0.05, transparent: true, opacity: 0.65 });
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
  ambientPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00b4d8, size: 0.06, transparent: true, opacity: 0.28 }));
  ambientScene.add(ambientPoints);
}

function buildBedroomDiorama(textureUrl) {
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

  const bedBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.28, 2.05),
    new THREE.MeshStandardMaterial({ color: 0xf0ebe3, roughness: 0.55 })
  );
  bedBase.position.set(0, -0.82, 0.35);
  group.add(bedBase);

  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.18, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 })
  );
  mattress.position.set(0, -0.66, 0.35);
  group.add(mattress);

  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.95, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x3d3428, roughness: 0.6, metalness: 0.2 })
  );
  headboard.position.set(0, -0.42, -0.72);
  group.add(headboard);

  const pillowL = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.12, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.9 })
  );
  pillowL.position.set(-0.35, -0.52, -0.35);
  pillowL.rotation.x = -0.15;
  group.add(pillowL);

  const pillowR = pillowL.clone();
  pillowR.position.x = 0.35;
  group.add(pillowR);

  const nightstand = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.42, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.5 })
  );
  nightstand.position.set(1.15, -0.84, -0.2);
  group.add(nightstand);

  const lampGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffe4b5, emissive: 0xffc870, emissiveIntensity: 1.2 })
  );
  lampGlow.position.set(1.15, -0.55, -0.2);
  group.add(lampGlow);

  const lampPoint = new THREE.PointLight(0xffd699, 0.6, 4);
  lampPoint.position.copy(lampGlow.position);
  group.add(lampPoint);

  return group;
}

function switchRoom(index) {
  if (!roomGroup || !roomScene) return;
  const rot = roomGroup.rotation.y;
  roomScene.remove(roomGroup);
  roomGroup = buildBedroomDiorama(roomData[index].image);
  roomGroup.rotation.y = rot;
  roomScene.add(roomGroup);
}

function buildAmenityIcon(type) {
  const group = new THREE.Group();
  const gold = goldMaterial();
  const goldGlow = goldMaterial(0x00b4d8, 0.25);

  if (type === "pool") {
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 0.12, 48),
      new THREE.MeshStandardMaterial({ color: 0x3a8fb5, metalness: 0.6, roughness: 0.15, emissive: 0x1a4a6a, emissiveIntensity: 0.3 })
    );
    group.add(water);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.06, 12, 48), gold);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.06;
    group.add(rim);
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.06, 2),
      new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.8 })
    );
    deck.position.y = -0.08;
    group.add(deck);
  } else if (type === "spa") {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), gold);
    bowl.rotation.x = Math.PI;
    group.add(bowl);
    const steam = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, emissive: 0xffffff, emissiveIntensity: 0.4 })
    );
    steam.position.set(-0.25, 0.55, 0);
    group.add(steam);
    const steam2 = steam.clone();
    steam2.position.set(0.2, 0.7, 0.1);
    steam2.scale.setScalar(0.8);
    group.add(steam2);
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.9 })
    );
    stone.position.y = -0.1;
    group.add(stone);
  } else if (type === "gym") {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 16), goldGlow);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);
    const weightL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 24), gold);
    weightL.rotation.z = Math.PI / 2;
    weightL.position.x = -0.72;
    group.add(weightL);
    const weightR = weightL.clone();
    weightR.position.x = 0.72;
    group.add(weightR);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.7 }));
    grip.position.y = 0.14;
    group.add(grip);
  } else if (type === "wine") {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.7, 12), gold);
    stem.position.y = -0.15;
    group.add(stem);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.05, 24), gold);
    base.position.y = -0.5;
    group.add(base);
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2.2),
      new THREE.MeshStandardMaterial({ color: 0x8b1a2e, metalness: 0.5, roughness: 0.3, emissive: 0x4a0a15, emissiveIntensity: 0.2 })
    );
    bowl.rotation.x = Math.PI;
    bowl.position.y = 0.15;
    group.add(bowl);
    const liquid = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 24),
      new THREE.MeshStandardMaterial({ color: 0x6b1020, metalness: 0.7, roughness: 0.2 })
    );
    liquid.rotation.x = -Math.PI / 2;
    liquid.position.y = 0.14;
    group.add(liquid);
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
  const rim = new THREE.DirectionalLight(0x00b4d8, 0.35);
  rim.position.set(-3, 1, -2);
  roomScene.add(rim);

  roomGroup = buildBedroomDiorama(roomData[0].image);
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
    const accent = new THREE.PointLight(0x00b4d8, 0.5, 8);
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

  globeScene.add(new THREE.AmbientLight(0x4466aa, 0.35));
  const dl = new THREE.DirectionalLight(0xffffff, 1.1);
  dl.position.set(5, 2, 4);
  globeScene.add(dl);

  const earthMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.85, metalness: 0.05 });
  globeEarth = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), earthMat);
  globeScene.add(globeEarth);

  textureLoader.load(EARTH_TEXTURE, (tex) => {
    tex.encoding = THREE.sRGBEncoding;
    globeEarth.material.map = tex;
    globeEarth.material.needsUpdate = true;
  });
  textureLoader.load(EARTH_BUMP, (bump) => {
    globeEarth.material.bumpMap = bump;
    globeEarth.material.bumpScale = 0.04;
    globeEarth.material.needsUpdate = true;
  });

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false });
  globeClouds = new THREE.Mesh(new THREE.SphereGeometry(1.14, 48, 48), cloudMat);
  globeScene.add(globeClouds);
  textureLoader.load(EARTH_CLOUDS, (cloudTex) => {
    cloudTex.encoding = THREE.sRGBEncoding;
    globeClouds.material.map = cloudTex;
    globeClouds.material.alphaMap = cloudTex;
    globeClouds.material.needsUpdate = true;
  });

  globeScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.BackSide })
  ));

  const londonPos = latLonToVector3(51.5074, -0.1278, 1.12);
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
    if (!roomDragging) roomCurrentRotY += 0.003;
    roomGroup.rotation.y = roomCurrentRotY;
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
