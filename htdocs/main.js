(() => {
    'use strict';
    console.log('main.js loaded');
    /**
     * HTTPS Redirect Module
     * Redirects to HTTPS when on production domain thecliff.fi
     */
    const HTTPSRedirect = {
        config: {
            productionDomain: 'thecliff.fi'
        },

        init() {
            this.checkAndRedirect();
        },

        checkAndRedirect() {
            const { hostname, protocol } = window.location;
            
            // Only redirect if we're on the production domain and not already using HTTPS
            if (hostname === this.config.productionDomain && protocol === 'http:') {
                this.redirectToHTTPS();
            }
        },

        redirectToHTTPS() {
            try {
                const currentUrl = new URL(window.location.href);
                
                // Validate domain
                if (currentUrl.hostname !== this.config.productionDomain) {
                    console.warn('Unexpected hostname for HTTPS redirect:', currentUrl.hostname);
                    return;
                }
                
                // Set protocol to HTTPS
                currentUrl.protocol = 'https:';
                
                console.warn('Redirecting to HTTPS:', currentUrl.href);
                window.location.replace(currentUrl.href);
            } catch (error) {
                console.error('Invalid URL for HTTPS redirect:', error);
            }
        }
    };

    /**
     * Video Control Module
     * Handles background video sound toggling and related UI
     */
    const VideoControl = {
        elements: {
            video: null,
            soundToggle: null,
            soundOnIcon: null,
            soundOffIcon: null
        },

        init() {
            this.elements.video = document.getElementById('bgVideo');
            this.elements.soundToggle = document.getElementById('soundToggle');
            this.elements.soundOnIcon = document.getElementById('soundOnIcon');
            this.elements.soundOffIcon = document.getElementById('soundOffIcon');

            if (!this.elements.video || !this.elements.soundToggle) return;
            this.bindEvents();
        },

        bindEvents() {
            this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        },

        toggleSound() {
            this.elements.video.muted = !this.elements.video.muted;
            this.elements.soundOnIcon.classList.toggle('hidden');
            this.elements.soundOffIcon.classList.toggle('hidden');
        }
    };

    /**
     * Navigation Module
     * Handles smooth scrolling, navigation highlighting, and visibility
     */
    const Navigation = {
        elements: {
            links: null,
            nav: null,
            heroSection: null
        },

        init() {
            this.elements.links = document.querySelectorAll('nav a');
            this.elements.nav = document.querySelector('nav');
            this.elements.heroSection = document.getElementById('hero');
            this.bindEvents();
        },

        bindEvents() {
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleSmoothScroll(e, anchor));
            });

            // Scroll spy for navigation highlighting and visibility
            window.addEventListener('scroll', () => this.handleScroll());
            
            // Initial check on page load
            this.handleScroll();
        },

        handleSmoothScroll(e, anchor) {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        },

        handleScroll() {
            this.updateNavigationVisibility();
            this.updateNavigationHighlight();
        },

        updateNavigationVisibility() {
            if (!this.elements.heroSection || !this.elements.nav) return;
            
            // Get the first video container (pure video section)
            const videoContainer = this.elements.heroSection.querySelector('.hero-video-container');
            if (!videoContainer) return;
            
            const videoRect = videoContainer.getBoundingClientRect();
            // Show navigation when video section is mostly scrolled past
            const videoVisible = videoRect.bottom > 50;
            
            if (videoVisible) {
                this.elements.nav.classList.add('nav-hidden');
            } else {
                this.elements.nav.classList.remove('nav-hidden');
            }
        },

        updateNavigationHighlight() {
            const sections = ['hero', 'menu', 'events', 'contact'];
            let activeSection = 0;
            
            sections.forEach((section, index) => {
                const element = document.getElementById(section);
                if (!element) return;
                
                const rect = element.getBoundingClientRect();
                // Adjust threshold for the new hero structure
                const threshold = section === 'hero' ? window.innerHeight : 100;
                
                if (rect.top <= threshold && rect.bottom >= threshold) {
                    activeSection = index;
                }
            });

            this.updateNavigation(activeSection);
        },

        updateNavigation(activeIndex) {
            this.elements.links.forEach(link => {
                link.classList.remove('text-cliff-carmine-light');
                link.classList.remove('ring-2', 'ring-white');
            });
            
            this.elements.links[activeIndex].classList.add('text-cliff-carmine-light');
            this.elements.links[activeIndex].classList.add('ring-2', 'ring-white');
        }
    };

    /**
     * Initialize the application
     */
    function init() {
        HTTPSRedirect.init(); // Run HTTPS redirect first
        VideoControl.init();
        Navigation.init();
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
})();