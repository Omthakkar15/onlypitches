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
    "title": "Signature Cut",
    "desc": "Consultation included",
    "price": "From $65",
    "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85&sig=10"
  },
  {
    "title": "Balayage",
    "desc": "Hand-painted highlights",
    "price": "From $180",
    "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85&sig=11"
  },
  {
    "title": "Keratin Treatment",
    "desc": "Frizz-free 3 months",
    "price": "From $250",
    "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85&sig=12"
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
    color: 0xd4a5a5,
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
  const point = new THREE.PointLight(0xd4a5a5, 1.5, 20);
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
  const pMat = new THREE.PointsMaterial({ color: 0xd4a5a5, size: 0.05, transparent: true, opacity: 0.65 });
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
  ambientPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xd4a5a5, size: 0.06, transparent: true, opacity: 0.28 }));
  ambientScene.add(ambientPoints);
}

function buildSalonChairShowcase(textureUrl) {
  const group = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xc23b3b, roughness: 0.55, metalness: 0.08 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x3a3a3f, roughness: 0.22, metalness: 0.9 });
  const softPink = new THREE.MeshStandardMaterial({ color: 0xf0c4c8, roughness: 0.7, metalness: 0.05 });

  // Soft salon backdrop frame (like reference)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.06), softPink);
  frame.position.set(0, 0.15, -0.55);
  group.add(frame);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x1a1518, roughness: 0.9 })
  );
  wall.position.set(0, 0.15, -0.51);
  group.add(wall);
  if (textureUrl) {
    textureLoader.load(textureUrl, (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      wall.material.map = tex;
      wall.material.needsUpdate = true;
    });
  }

  // Circular salon light above chair
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2e0, emissiveIntensity: 1.4 })
  );
  lamp.position.set(0, 1.15, -0.2);
  group.add(lamp);
  const lampLight = new THREE.PointLight(0xffe8d2, 0.9, 5);
  lampLight.position.copy(lamp.position);
  group.add(lampLight);

  // Chrome circular base
  const baseOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.1, 40), chrome);
  baseOuter.position.y = -1.05;
  group.add(baseOuter);
  const baseInner = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.08, 36), chrome);
  baseInner.position.y = -0.97;
  group.add(baseInner);

  // Central pillar
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 20), chrome);
  pillar.position.y = -0.6;
  group.add(pillar);

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.9), red);
  seat.position.set(0, -0.18, 0.05);
  group.add(seat);

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.22), red);
  back.position.set(0, 0.42, -0.34);
  back.rotation.x = -0.08;
  group.add(back);

  // Headrest
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.2), red);
  head.position.set(0, 1.0, -0.28);
  group.add(head);

  // Armrests
  const armPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), chrome);
  armPostL.position.set(-0.52, 0.02, 0.05);
  group.add(armPostL);
  const armPostR = armPostL.clone();
  armPostR.position.x = 0.52;
  group.add(armPostR);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.55), red);
  armL.position.set(-0.52, 0.2, 0.08);
  group.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.52;
  group.add(armR);

  return group;
}

function switchRoom(index) {
  if (!roomGroup || !roomScene) return;
  const rot = roomGroup.rotation.y;
  roomScene.remove(roomGroup);
  roomGroup = buildSalonChairShowcase(roomData[index].image);
  roomGroup.rotation.y = rot;
  roomScene.add(roomGroup);
}

function buildAmenityIcon(type) {
  const group = new THREE.Group();
  const pink = new THREE.MeshStandardMaterial({ color: 0xe8a39a, roughness: 0.55, metalness: 0.08 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x4a4a4e, roughness: 0.28, metalness: 0.9 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xc4c4c8, roughness: 0.22, metalness: 0.88 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.4, metalness: 0.45 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7, metalness: 0.05 });

  if (type === "scissors") {
    const bladeA = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.09, 0.08), darkMetal);
    bladeA.position.set(0.12, 0.18, 0);
    bladeA.rotation.z = 0.38;
    group.add(bladeA);
    const bladeB = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.09, 0.08), darkMetal);
    bladeB.position.set(0.12, -0.18, 0);
    bladeB.rotation.z = -0.38;
    group.add(bladeB);
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), silver);
    hinge.rotation.x = Math.PI / 2;
    group.add(hinge);
    const loopL = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 12, 24), silver);
    loopL.position.set(-0.48, 0.28, 0);
    group.add(loopL);
    const loopR = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 12, 24), silver);
    loopR.position.set(-0.48, -0.28, 0);
    group.add(loopR);
  } else if (type === "friendly") {
    // Speech bubble body
    const bubble = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.78, 0.28), pink);
    bubble.position.y = 0.08;
    group.add(bubble);
    // Soft rounded look via corner caps
    [[-0.48, 0.38], [0.48, 0.38], [-0.48, -0.22], [0.48, -0.22]].forEach(([x, y]) => {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.28), pink);
      cap.position.set(x, y, 0);
      group.add(cap);
    });
    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), pink);
    tail.position.set(-0.28, -0.42, 0);
    tail.rotation.z = Math.PI / 4;
    group.add(tail);
    // Three dots (ellipsis)
    [-0.28, 0, 0.28].forEach((x) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), ink);
      dot.position.set(x, 0.1, 0.16);
      group.add(dot);
    });
  } else if (type === "pricing") {
    [-0.2, 0, 0.2].forEach((y, i) => {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48 - i * 0.015, 0.48 - i * 0.015, 0.14, 36),
        gold
      );
      coin.position.y = y;
      group.add(coin);
    });
  } else if (type === "loyalty") {
    const planet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), pink);
    group.add(planet);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 10, 56), gold);
    ring.rotation.x = Math.PI / 2.35;
    ring.rotation.y = 0.15;
    group.add(ring);
  } else {
    const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), pink);
    group.add(fallback);
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
  const rim = new THREE.DirectionalLight(0xd4a5a5, 0.35);
  rim.position.set(-3, 1, -2);
  roomScene.add(rim);

  roomGroup = buildSalonChairShowcase(roomData[0].image);
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
    camera.position.set(0, 0.15, 3.0);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    scene.add(new THREE.AmbientLight(0xfff5e8, 0.65));
    const dl = new THREE.DirectionalLight(0xffffff, 1.05);
    dl.position.set(2.2, 3.2, 4);
    scene.add(dl);
    const fill = new THREE.DirectionalLight(0xffd8d0, 0.35);
    fill.position.set(-2, 1, 2);
    scene.add(fill);

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
