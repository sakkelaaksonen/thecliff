// src/js/modules/app.js
var CONFIG = {
  // Element IDs
  elements: {
    bgVideo: "bgVideo",
    soundToggle: "soundToggle",
    soundOnIcon: "soundOnIcon",
    soundOffIcon: "soundOffIcon",
    hero: "hero",
    mainContent: "main-content"
  },
  // CSS Classes
  classes: {
    // Navigation classes
    navHidden: "nav-hidden",
    textCliffCarmineLight: "text-cliff-carmine-light",
    ring2: "ring-2",
    ringWhite: "ring-white",
    // Icon visibility
    hidden: "hidden",
    // Hero video container
    heroVideoContainer: "hero-video-container"
  },
  // Selectors
  selectors: {
    nav: "nav",
    navLinks: "nav a",
    anchorLinks: 'a[href^="#"]'
  },
  // Magic numbers and thresholds
  thresholds: {
    videoVisibilityOffset: 50,
    heroScrollThreshold: 100,
    // For non-hero sections
    navigationHighlightThreshold: 100
  },
  // Section names for navigation
  sections: ["hero", "menu", "events", "contact"],
  // Domain configuration
  domains: {
    production: "thecliff.fi"
  },
  // Scroll behavior
  scroll: {
    behavior: "smooth"
  }
};
var HTTPSRedirect = {
  init() {
    this.checkAndRedirect();
  },
  checkAndRedirect() {
    const { hostname, protocol } = window.location;
    if (hostname === CONFIG.domains.production && protocol === "http:") {
      this.redirectToHTTPS();
    }
  },
  redirectToHTTPS() {
    try {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.hostname !== CONFIG.domains.production) {
        console.warn("Unexpected hostname for HTTPS redirect:", currentUrl.hostname);
        return;
      }
      currentUrl.protocol = "https:";
      console.warn("Redirecting to HTTPS:", currentUrl.href);
      window.location.replace(currentUrl.href);
    } catch (error) {
      console.error("Invalid URL for HTTPS redirect:", error);
    }
  }
};
var VideoControl = {
  elements: {
    video: null,
    soundToggle: null,
    soundOnIcon: null,
    soundOffIcon: null
  },
  init() {
    this.elements.video = document.getElementById(CONFIG.elements.bgVideo);
    this.elements.soundToggle = document.getElementById(CONFIG.elements.soundToggle);
    this.elements.soundOnIcon = document.getElementById(CONFIG.elements.soundOnIcon);
    this.elements.soundOffIcon = document.getElementById(CONFIG.elements.soundOffIcon);
    if (!this.elements.video || !this.elements.soundToggle) return;
    this.bindEvents();
  },
  bindEvents() {
    this.elements.soundToggle.addEventListener("click", () => this.toggleSound());
  },
  toggleSound() {
    this.elements.video.muted = !this.elements.video.muted;
    this.elements.soundOnIcon.classList.toggle(CONFIG.classes.hidden);
    this.elements.soundOffIcon.classList.toggle(CONFIG.classes.hidden);
  }
};
var Navigation = {
  elements: {
    links: null,
    nav: null,
    heroSection: null
  },
  init() {
    this.elements.links = document.querySelectorAll(CONFIG.selectors.navLinks);
    this.elements.nav = document.querySelector(CONFIG.selectors.nav);
    this.elements.heroSection = document.getElementById(CONFIG.elements.hero);
    this.bindEvents();
  },
  bindEvents() {
    document.querySelectorAll(CONFIG.selectors.anchorLinks).forEach((anchor) => {
      anchor.addEventListener("click", (e) => this.handleSmoothScroll(e, anchor));
    });
    window.addEventListener("scroll", () => this.handleScroll());
    this.handleScroll();
  },
  handleSmoothScroll(e, anchor) {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: CONFIG.scroll.behavior
      });
    }
  },
  handleScroll() {
    this.updateNavigationVisibility();
    this.updateNavigationHighlight();
  },
  updateNavigationVisibility() {
    if (!this.elements.heroSection || !this.elements.nav) return;
    const videoContainer = this.elements.heroSection.querySelector(`.${CONFIG.classes.heroVideoContainer}`);
    if (!videoContainer) return;
    const videoRect = videoContainer.getBoundingClientRect();
    const videoVisible = videoRect.bottom > CONFIG.thresholds.videoVisibilityOffset;
    if (videoVisible) {
      this.elements.nav.classList.add(CONFIG.classes.navHidden);
    } else {
      this.elements.nav.classList.remove(CONFIG.classes.navHidden);
    }
  },
  updateNavigationHighlight() {
    let activeSection = 0;
    CONFIG.sections.forEach((section, index) => {
      const element = document.getElementById(section);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const threshold = section === CONFIG.elements.hero ? window.innerHeight : CONFIG.thresholds.navigationHighlightThreshold;
      if (rect.top <= threshold && rect.bottom >= threshold) {
        activeSection = index;
      }
    });
    this.updateNavigation(activeSection);
  },
  updateNavigation(activeIndex) {
    this.elements.links.forEach((link) => {
      link.classList.remove(CONFIG.classes.textCliffCarmineLight);
      link.classList.remove(CONFIG.classes.ring2, CONFIG.classes.ringWhite);
    });
    if (this.elements.links[activeIndex]) {
      this.elements.links[activeIndex].classList.add(CONFIG.classes.textCliffCarmineLight);
      this.elements.links[activeIndex].classList.add(CONFIG.classes.ring2, CONFIG.classes.ringWhite);
    }
  }
};
function initializeApp() {
  HTTPSRedirect.init();
  VideoControl.init();
  Navigation.init();
}

// src/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Hello World from main.js!");
  initializeApp();
});
