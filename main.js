(() => {
    'use strict';

    // DOM Elements
    const elements = {
        video: null,
        soundToggle: null,
        soundOnIcon: null,
        soundOffIcon: null,
        navDots: null,
        navLinks: null
    };

    // Configuration
    const config = {
        sections: ['hero', 'menu', 'events'],
        heroThreshold: window.innerHeight / 2,
        menuThreshold: 100
    };

    /**
     * Initialize the application
     */
    function init() {
        // Cache DOM elements
        elements.video = document.getElementById('bgVideo');
        elements.soundToggle = document.getElementById('soundToggle');
        elements.soundOnIcon = document.getElementById('soundOnIcon');
        elements.soundOffIcon = document.getElementById('soundOffIcon');
        elements.navDots = document.querySelectorAll('.fixed.right-4 a');
        elements.navLinks = document.querySelectorAll('nav a');

        // Bind events
        bindEvents();
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Sound toggle
        elements.soundToggle?.addEventListener('click', handleSoundToggle);

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Scroll spy
        window.addEventListener('scroll', handleScroll);
    }

    /**
     * Handle sound toggle click
     */
    function handleSoundToggle() {
        if (elements.video.muted) {
            unmute();
        } else {
            mute();
        }
    }

    /**
     * Unmute video and update UI
     */
    function unmute() {
        elements.video.muted = false;
        elements.soundOnIcon.classList.remove('hidden');
        elements.soundOffIcon.classList.add('hidden');
        elements.soundToggle.setAttribute('aria-label', 'Mute sound');
    }

    /**
     * Mute video and update UI
     */
    function mute() {
        elements.video.muted = true;
        elements.soundOnIcon.classList.add('hidden');
        elements.soundOffIcon.classList.remove('hidden');
        elements.soundToggle.setAttribute('aria-label', 'Unmute sound');
    }

    /**
     * Handle smooth scrolling
     * @param {Event} e - Click event
     */
    function handleSmoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    /**
     * Handle scroll events for navigation updates
     */
    function handleScroll() {
        let activeSection = false;
        
        config.sections.forEach((section, index) => {
            const element = document.getElementById(section);
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const isHero = section === 'hero';
            const threshold = isHero ? config.heroThreshold : config.menuThreshold;
            
            if (rect.top <= threshold && rect.bottom >= threshold) {
                activeSection = true;
                updateNavigation(index);
            }
        });

        if (!activeSection) {
            resetNavigation();
        }
    }

    /**
     * Update navigation state
     * @param {number} activeIndex - Index of active section
     */
    function updateNavigation(activeIndex) {
        elements.navDots.forEach(dot => dot.classList.remove('bg-amber-500'));
        elements.navLinks.forEach(link => link.classList.remove('text-amber-300'));
        
        elements.navDots[activeIndex].classList.add('bg-amber-500');
        elements.navLinks[activeIndex].classList.add('text-amber-300');
    }

    /**
     * Reset navigation to default state
     */
    function resetNavigation() {
        elements.navDots.forEach(dot => dot.classList.remove('bg-amber-500'));
        elements.navLinks.forEach(link => link.classList.remove('text-amber-300'));
        elements.navLinks[0].classList.add('text-amber-300');
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
})();