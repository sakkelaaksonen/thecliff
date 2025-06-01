/**
 * Navigation Module
 * Handles smooth scrolling and active link highlighting
 */
const Navigation = {
    elements: {
        links: null
    },

    init() {
        this.elements.links = document.querySelectorAll('a[href^="#"]');
        this.bindEvents();
        this.updateActiveLink(); // Set initial state
    },

    bindEvents() {
        // Smooth scroll for anchor links
        this.elements.links.forEach(link => {
            link.addEventListener('click', this.handleLinkClick.bind(this));
        });

        // Update active link on scroll
        window.addEventListener('scroll', this.throttle(this.updateActiveLink.bind(this), 100));
    },

    handleLinkClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    updateActiveLink() {
        const scrollPosition = window.scrollY + 100; // Offset for header
        let activeIndex = 0;

        // Find which section is currently in view
        this.elements.links.forEach((link, index) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && targetElement.offsetTop <= scrollPosition) {
                activeIndex = index;
            }
        });

        // Update active states
        this.elements.links.forEach(link => {
            link.classList.remove('text-cliff-carmine-light', 'ring-2', 'ring-white');
        });
        
        if (this.elements.links[activeIndex]) {
            this.elements.links[activeIndex].classList.add('text-cliff-carmine-light', 'ring-2', 'ring-white');
        }
    },

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

export default Navigation;