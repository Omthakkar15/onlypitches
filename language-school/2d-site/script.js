/**
 * Aurelia Grand Hotel — Premium Single-Page JS
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initGalleryLightbox();
  initTestimonialCarousel();
  initHeroBooking();
  initContactForm();
  initNewsletter();
  initStickyBook();
});

/* ==========================================================================
   Navbar — transparent → solid on scroll
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   Mobile hamburger menu
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* ==========================================================================
   Scroll reveal (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
}

/* ==========================================================================
   Animated stat counters
   ========================================================================== */
function initStatCounters() {
  const stats = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => observer.observe(s));
}

/* ==========================================================================
   Gallery lightbox
   ========================================================================== */
function initGalleryLightbox() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  const images = Array.from(items).map((item) => ({
    src: item.querySelector("img").src,
    alt: item.querySelector("img").alt,
  }));
  let current = 0;

  function show(index) {
    current = (index + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function hide() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach((item, i) => item.addEventListener("click", () => show(i)));
  closeBtn.addEventListener("click", hide);
  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hide();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

/* ==========================================================================
   Testimonial carousel
   ========================================================================== */
function initTestimonialCarousel() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const dotsContainer = document.getElementById("carousel-dots");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Review ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".carousel-dot");

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  const carousel = document.getElementById("testimonial-carousel");
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", resetTimer);

  resetTimer();
}

/* ==========================================================================
   Hero booking widget validation
   ========================================================================== */
function initHeroBooking() {
  const form = document.getElementById("hero-booking-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const checkIn = document.getElementById("check-in");
    const checkOut = document.getElementById("check-out");
    const errIn = document.getElementById("err-check-in");
    const errOut = document.getElementById("err-check-out");

    errIn.textContent = "";
    errOut.textContent = "";

    if (!checkIn.value) {
      errIn.textContent = "Required";
      valid = false;
    }
    if (!checkOut.value) {
      errOut.textContent = "Required";
      valid = false;
    }
    if (checkIn.value && checkOut.value && new Date(checkOut.value) <= new Date(checkIn.value)) {
      errOut.textContent = "Must be after check-in";
      valid = false;
    }

    if (valid) {
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      document.getElementById("fcheckin").value = checkIn.value;
      document.getElementById("fcheckout").value = checkOut.value;
    }
  });
}

/* ==========================================================================
   Contact / booking form validation
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("booking");
  if (!form) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: "fname", err: "err-fname", check: (v) => v.trim() !== "", msg: "Name is required" },
      { id: "femail", err: "err-femail", check: (v) => emailRegex.test(v), msg: "Valid email required" },
      { id: "fphone", err: "err-fphone", check: (v) => v.trim().length >= 7, msg: "Phone is required" },
      { id: "froom", err: "err-froom", check: (v) => v !== "", msg: "Select a room" },
      { id: "fcheckin", err: "err-fcheckin", check: (v) => v !== "", msg: "Check-in required" },
      { id: "fcheckout", err: "err-fcheckout", check: (v) => v !== "", msg: "Check-out required" },
    ];

    fields.forEach(({ id, err, check, msg }) => {
      const input = document.getElementById(id);
      const errorEl = document.getElementById(err);
      errorEl.textContent = "";
      if (!check(input.value)) {
        errorEl.textContent = msg;
        valid = false;
      }
    });

    const checkIn = document.getElementById("fcheckin").value;
    const checkOut = document.getElementById("fcheckout").value;
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      document.getElementById("err-fcheckout").textContent = "Must be after check-in";
      valid = false;
    }

    if (valid) {
      form.querySelectorAll("input, select, textarea, button").forEach((el) => (el.disabled = true));
      const success = document.getElementById("form-success");
      success.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

/* ==========================================================================
   Newsletter
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    input.value = "";
    input.placeholder = "Subscribed! Thank you.";
    setTimeout(() => (input.placeholder = "Your email"), 3000);
  });
}

/* ==========================================================================
   Sticky mobile Book Now — show after scrolling past hero
   ========================================================================== */
function initStickyBook() {
  const btn = document.getElementById("sticky-book");
  const hero = document.querySelector(".hero");
  if (!btn || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      btn.style.opacity = entry.isIntersecting ? "0" : "1";
      btn.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
    },
    { threshold: 0.1 }
  );
  observer.observe(hero);
}
