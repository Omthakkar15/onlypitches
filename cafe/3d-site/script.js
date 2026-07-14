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
    title: "Single Origin Pour",
    desc: "Ethiopian Yirgacheffe",
    price: "From $5",
    food: "coffee",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85&sig=10",
  },
  {
    title: "Avocado Toast",
    desc: "Sourdough, chili flakes",
    price: "From $12",
    food: "sandwich",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1400&q=85",
  },
  {
    title: "Almond Croissant",
    desc: "Buttery, twice-baked",
    price: "From $4",
    food: "croissant",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1400&q=85",
  },
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
    color: 0xd4a574,
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
  const point = new THREE.PointLight(0xd4a574, 1.5, 20);
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
  const pMat = new THREE.PointsMaterial({ color: 0xd4a574, size: 0.05, transparent: true, opacity: 0.65 });
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
  ambientPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xd4a574, size: 0.06, transparent: true, opacity: 0.28 }));
  ambientScene.add(ambientPoints);
}

function paintMat(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extras.roughness ?? 0.45,
    metalness: extras.metalness ?? 0.08,
    ...extras,
  });
}

function buildCafeBackdrop(group, textureUrl) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.08), goldMaterial());
  frame.position.z = -0.04;
  group.add(frame);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.9 })
  );
  wall.position.z = 0.02;
  group.add(wall);
  if (textureUrl) {
    textureLoader.load(textureUrl, (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      wall.material.map = tex;
      wall.material.roughness = 0.65;
      wall.material.needsUpdate = true;
    });
  }

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.8),
    paintMat(0x3a2a1c, { roughness: 0.7, metalness: 0.12 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.05, 0.55);
  group.add(floor);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    paintMat(0xffe4b5, { emissive: 0xffc870, emissiveIntensity: 1.1 })
  );
  lamp.position.set(0, 1.05, 0.2);
  group.add(lamp);
  const lampLight = new THREE.PointLight(0xffd699, 0.7, 5);
  lampLight.position.copy(lamp.position);
  group.add(lampLight);
}

function buildCoffeeMug() {
  const mug = new THREE.Group();
  const ceramic = paintMat(0xf5f0e8, { roughness: 0.35 });
  const coffee = paintMat(0x3b2214, { roughness: 0.55, metalness: 0.05 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.72, 32), ceramic);
  body.position.y = -0.35;
  mug.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 36), ceramic);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.01;
  mug.add(rim);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 32), coffee);
  liquid.position.y = -0.05;
  mug.add(liquid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 12, 28, Math.PI * 1.3), ceramic);
  handle.position.set(0.52, -0.32, 0);
  handle.rotation.y = Math.PI / 2;
  handle.rotation.z = -0.2;
  mug.add(handle);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.65, 0.05, 36), ceramic);
  saucer.position.y = -0.74;
  mug.add(saucer);
  return mug;
}

function buildSandwich() {
  const food = new THREE.Group();
  const bread = paintMat(0xe8c890, { roughness: 0.75 });
  const green = paintMat(0x4f8f46, { roughness: 0.7 });
  const avocado = paintMat(0x7aab3a, { roughness: 0.55 });
  const tomato = paintMat(0xc23b3b, { roughness: 0.5 });
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.16, 0.85), bread);
  bottom.position.y = -0.55;
  food.add(bottom);
  const greens = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.75), green);
  greens.position.y = -0.42;
  food.add(greens);
  const slice = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 0.7), avocado);
  slice.position.y = -0.32;
  food.add(slice);
  const tom = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 20), tomato);
  tom.rotation.z = Math.PI / 2;
  tom.position.set(-0.2, -0.22, 0.05);
  food.add(tom);
  const tom2 = tom.clone();
  tom2.position.x = 0.28;
  food.add(tom2);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.16, 0.85), bread);
  top.position.y = -0.12;
  top.rotation.z = 0.04;
  food.add(top);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.98, 0.05, 36), paintMat(0xf0ebe3));
  plate.position.y = -0.72;
  food.add(plate);
  return food;
}

function buildCroissant() {
  const pastry = new THREE.Group();
  const dough = paintMat(0xd4a05a, { roughness: 0.55, metalness: 0.05 });
  const glaze = paintMat(0xe8c07a, { roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 - t * 0.04, 0.2 - t * 0.05, 0.38, 16),
      i % 2 === 0 ? dough : glaze
    );
    const angle = -0.9 + t * 1.8;
    seg.position.set(Math.sin(angle) * 0.55, -0.45 + Math.cos(angle) * 0.08, Math.cos(angle) * 0.15);
    seg.rotation.z = angle;
    seg.rotation.y = 0.35;
    pastry.add(seg);
  }
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.88, 0.05, 36), paintMat(0xf5f0e8));
  plate.position.y = -0.72;
  pastry.add(plate);
  return pastry;
}

function buildCafeShowcase(item) {
  const group = new THREE.Group();
  buildCafeBackdrop(group, item.image);

  let food;
  if (item.food === "sandwich") food = buildSandwich();
  else if (item.food === "croissant") food = buildCroissant();
  else food = buildCoffeeMug();

  food.position.set(0, 0.05, 0.35);
  group.add(food);
  return group;
}

function switchRoom(index) {
  if (!roomGroup || !roomScene) return;
  const rot = roomGroup.rotation.y;
  roomScene.remove(roomGroup);
  roomGroup = buildCafeShowcase(roomData[index]);
  roomGroup.rotation.y = rot;
  roomScene.add(roomGroup);
}

function buildAmenityIcon(type) {
  const group = new THREE.Group();
  const cream = paintMat(0xf5f0e8);
  const coffee = paintMat(0x4a2c1a);
  const bread = paintMat(0xd4a05a);
  const green = paintMat(0x5a9a4a);
  const gold = goldMaterial();

  if (type === "coffee") {
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.55, 28), cream);
    group.add(mug);
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 24), coffee);
    liquid.position.y = 0.18;
    group.add(liquid);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 10, 20, Math.PI * 1.25), cream);
    handle.position.set(0.42, 0, 0);
    handle.rotation.y = Math.PI / 2;
    group.add(handle);
  } else if (type === "sandwich") {
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.7), bread);
    bottom.position.y = -0.2;
    group.add(bottom);
    const filling = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.6), green);
    group.add(filling);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.7), bread);
    top.position.y = 0.2;
    group.add(top);
  } else if (type === "pastry") {
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.14 - t * 0.03, 0.18 - t * 0.03, 0.32, 14), bread);
      const angle = -0.75 + t * 1.5;
      seg.position.set(Math.sin(angle) * 0.4, Math.cos(angle) * 0.05, 0);
      seg.rotation.z = angle;
      group.add(seg);
    }
  } else if (type === "latte") {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.5, 28), cream);
    group.add(cup);
    const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), paintMat(0xfff8ee));
    foam.position.y = 0.2;
    group.add(foam);
    const art = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), coffee);
    art.position.y = 0.26;
    group.add(art);
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.05, 28), gold);
    saucer.position.y = -0.3;
    group.add(saucer);
  } else {
    const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), cream);
    group.add(fallback);
  }

  return group;
}

function initRoomViewer() {
  const canvas = document.getElementById("room-canvas");
  roomScene = new THREE.Scene();
  roomCamera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  roomCamera.position.set(0, 0.35, 3.8);
  roomCamera.lookAt(0, -0.35, 0.2);
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
  const rim = new THREE.DirectionalLight(0xd4a574, 0.35);
  rim.position.set(-3, 1, -2);
  roomScene.add(rim);

  roomGroup = buildCafeShowcase(roomData[0]);
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
    const accent = new THREE.PointLight(0xd4a574, 0.5, 8);
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

  const londonPos = latLonToVector3(51.5024, -0.1527, 1.12);
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
