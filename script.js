/**
 * BizBuilder — Business Directory
 * Vanilla JavaScript: render grid, search/filter, selection, scroll animations
 */

/* ==========================================================================
   Category data — exact business names as specified
   ========================================================================== */
const CATEGORIES = [
  {
    id: "hospitality",
    title: "Hospitality & Food",
    icon: "🍽️",
    businesses: [
      "Hotel", "Restaurant", "Cafe", "Spa", "Resort",
      "Bar/Pub", "Bakery", "Catering Service", "Cloud Kitchen", "Homestay/B&B",
    ],
  },
  {
    id: "health-beauty",
    title: "Health & Beauty",
    icon: "💆",
    businesses: [
      "Salon", "Gym/Fitness Center", "Dental Clinic", "Medical Clinic",
      "Yoga Studio", "Physiotherapy Center", "Nail Studio", "Massage Center",
    ],
  },
  {
    id: "professional",
    title: "Professional Services",
    icon: "💼",
    businesses: [
      "Law Firm", "Accounting Firm", "Real Estate Agency", "Insurance Agency",
      "Consulting Firm", "Financial Advisory",
    ],
  },
  {
    id: "retail",
    title: "Retail & Shopping",
    icon: "🛍️",
    businesses: [
      "Boutique/Clothing Store", "Jewelry Store", "Furniture Store",
      "Electronics Store", "Grocery Store", "Bookstore",
    ],
  },
  {
    id: "home-trade",
    title: "Home & Trade Services",
    icon: "🔧",
    businesses: [
      "Plumbing Service", "Electrician", "Cleaning Service", "Dry Cleaner", "Pest Control",
      "Interior Design", "Construction Company", "Landscaping Service",
    ],
  },
  {
    id: "education",
    title: "Education",
    icon: "📚",
    businesses: [
      "Coaching Center", "Preschool/Daycare", "Driving School",
      "Music/Dance Academy", "Language School",
    ],
  },
  {
    id: "automotive",
    title: "Automotive",
    icon: "🚗",
    businesses: [
      "Car Dealership", "Auto Repair Shop", "Car Wash/Detailing",
    ],
  },
  {
    id: "events",
    title: "Events & Creative",
    icon: "📸",
    businesses: [
      "Photography Studio", "Event Management", "Wedding Planner",
      "DJ/Entertainment Service",
    ],
  },
  {
    id: "pet",
    title: "Pet Services",
    icon: "🐾",
    businesses: [
      "Pet Grooming", "Veterinary Clinic", "Pet Boarding",
    ],
  },
  {
    id: "travel",
    title: "Travel",
    icon: "✈️",
    businesses: [
      "Travel Agency", "Car Rental", "Tour Operator",
    ],
  },
];

/* ==========================================================================
   Application state
   ========================================================================== */
const state = {
  selectedBusiness: null,
  selectedCategory: null,
};

/* ==========================================================================
   DOM references
   ========================================================================== */
const categoryGrid = document.getElementById("category-grid");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const searchStatus = document.getElementById("search-status");
const noResults = document.getElementById("no-results");
const bottomBar = document.getElementById("bottom-bar");
const bottomBarText = document.getElementById("bottom-bar-text");
const btnContinue = document.getElementById("btn-continue");

/* ==========================================================================
   Render category cards and fixed-size business buttons
   ========================================================================== */
function renderCategories() {
  categoryGrid.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const card = document.createElement("article");
    card.className = "category-card";
    card.dataset.categoryId = category.id;

    // Category header: icon + title
    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <span class="category-icon" aria-hidden="true">${category.icon}</span>
      <h2 class="category-title">${category.title}</h2>
    `;

    // Uniform 2-column grid of fixed-size buttons
    const grid = document.createElement("div");
    grid.className = "business-grid";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", category.title);

    category.businesses.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "business-btn";
      btn.textContent = name;
      btn.dataset.business = name;
      btn.dataset.category = category.title;
      btn.setAttribute("aria-pressed", "false");

      // Click and keyboard (Enter/Space handled natively on button)
      btn.addEventListener("click", () => selectBusiness(btn, name, category.title));

      grid.appendChild(btn);
    });

    card.appendChild(header);
    card.appendChild(grid);
    categoryGrid.appendChild(card);
  });
}

/* ==========================================================================
   Helpers
   ========================================================================== */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ==========================================================================
   Selection — navigate into per-business folder
   ========================================================================== */
function selectBusiness(buttonEl, businessName, categoryTitle) {
  // Remove active state from all buttons
  document.querySelectorAll(".business-btn.is-selected").forEach((btn) => {
    btn.classList.remove("is-selected");
    btn.setAttribute("aria-pressed", "false");
  });

  // Mark clicked button as selected
  buttonEl.classList.add("is-selected");
  buttonEl.setAttribute("aria-pressed", "true");

  // Update state
  state.selectedBusiness = businessName;
  state.selectedCategory = categoryTitle;

  // Navigate to that business' own folder (index.html inside it)
  const folder = slugify(businessName);
  window.location.href = `${folder}/index.html`;
}

function showBottomBar() {
  bottomBar.classList.add("is-visible");
  bottomBar.setAttribute("aria-hidden", "false");
}

/* ==========================================================================
   Search / filter — dim non-matching buttons in real time
   ========================================================================== */
function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  clearSearchBtn.hidden = query.length === 0;

  let matchCount = 0;
  let totalCount = 0;

  document.querySelectorAll(".category-card").forEach((card) => {
    let visibleInCard = 0;

    card.querySelectorAll(".business-btn").forEach((btn) => {
      totalCount++;
      const name = btn.dataset.business.toLowerCase();
      const matches = query === "" || name.includes(query);

      btn.classList.toggle("is-filtered-out", query !== "" && !matches);

      if (matches) {
        visibleInCard++;
        if (query !== "") matchCount++;
      }
    });

    // Hide entire category card when no buttons match
    card.classList.toggle("is-hidden", query !== "" && visibleInCard === 0);
  });

  // Status message
  if (query) {
    searchStatus.textContent =
      matchCount > 0
        ? `${matchCount} matching business type${matchCount !== 1 ? "s" : ""} found`
        : "";
    noResults.hidden = matchCount > 0;
  } else {
    searchStatus.textContent = "";
    noResults.hidden = true;
  }
}

function clearSearch() {
  searchInput.value = "";
  clearSearchBtn.hidden = true;
  handleSearch();
  searchInput.focus();
}

/* ==========================================================================
   Continue button — placeholder confirmation
   ========================================================================== */
function handleContinue() {
  if (!state.selectedBusiness) return;
  alert(`Great! Let's build your ${state.selectedBusiness} website.`);
}

/* ==========================================================================
   Scroll animations — Intersection Observer with stagger
   ========================================================================== */
function initScrollAnimations() {
  const cards = document.querySelectorAll(".category-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );

  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.07}s`;
    observer.observe(card);
  });
}

/* ==========================================================================
   Init
   ========================================================================== */
function init() {
  renderCategories();
  initScrollAnimations();

  searchInput.addEventListener("input", handleSearch);
  clearSearchBtn.addEventListener("click", clearSearch);
  btnContinue.addEventListener("click", handleContinue);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearSearch();
  });
}

document.addEventListener("DOMContentLoaded", init);
