(() => {
    'use strict';

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
            }else {
                console.log('Not redirecting to HTTPS');
            }
        },

        redirectToHTTPS() {
            const httpsUrl = window.location.href.replace('http:', 'https:');
            
            // Use replace() instead of assign() to avoid back button issues
            window.location.replace(httpsUrl);
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
     * Handles smooth scrolling and navigation state
     */
    const Navigation = {
        elements: {
            links: null
        },

        init() {
            this.elements.links = document.querySelectorAll('nav a');
            this.bindEvents();
        },

        bindEvents() {
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleSmoothScroll(e, anchor));
            });

            // Scroll spy for navigation highlighting
            window.addEventListener('scroll', () => this.handleScroll());
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
            const sections = ['hero', 'menu', 'events'];
            let activeSection = 0;
            
            sections.forEach((section, index) => {
                const element = document.getElementById(section);
                if (!element) return;
                
                const rect = element.getBoundingClientRect();
                const threshold = section === 'hero' ? window.innerHeight / 2 : 100;
                
                if (rect.top <= threshold && rect.bottom >= threshold) {
                    activeSection = index;
                }
            });

            this.updateNavigation(activeSection);
        },

        updateNavigation(activeIndex) {
            this.elements.links.forEach(link => link.classList.remove('text-cliff-carmine-light'));
            this.elements.links[activeIndex].classList.add('text-cliff-carmine-light');
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