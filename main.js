(() => {
    'use strict';

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
        config: {
            sections: ['hero', 'menu', 'events'],
            heroThreshold: window.innerHeight / 2,
            menuThreshold: 100
        },

        elements: {
            dots: null,
            links: null
        },

        init() {
            this.elements.dots = document.querySelectorAll('.fixed.right-4 a');
            this.elements.links = document.querySelectorAll('nav a');
            this.bindEvents();
        },

        bindEvents() {
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleSmoothScroll(e, anchor));
            });

            // Scroll spy
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
            let activeSection = false;
            
            this.config.sections.forEach((section, index) => {
                const element = document.getElementById(section);
                if (!element) return;
                
                const rect = element.getBoundingClientRect();
                const isHero = section === 'hero';
                const threshold = isHero ? this.config.heroThreshold : this.config.menuThreshold;
                
                if (rect.top <= threshold && rect.bottom >= threshold) {
                    activeSection = true;
                    this.updateNavigation(index);
                }
            });

            if (!activeSection) {
                this.resetNavigation();
            }
        },

        updateNavigation(activeIndex) {
            this.elements.dots.forEach(dot => dot.classList.remove('bg-amber-500'));
            this.elements.links.forEach(link => link.classList.remove('text-amber-300'));
            
            this.elements.dots[activeIndex].classList.add('bg-amber-500');
            this.elements.links[activeIndex].classList.add('text-amber-300');
        },

        resetNavigation() {
            this.elements.dots.forEach(dot => dot.classList.remove('bg-amber-500'));
            this.elements.links.forEach(link => link.classList.remove('text-amber-300'));
            this.elements.links[0].classList.add('text-amber-300');
        }
    };

    /**
     * Initialize the application
     */
    function init() {
        VideoControl.init();
        Navigation.init();
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
})();