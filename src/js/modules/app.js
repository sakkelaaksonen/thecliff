/**
 * Configuration object for all CSS classes, IDs, and magic numbers
 */
const CONFIG = {
    // Element IDs
    elements: {
        bgVideo: 'bgVideo',
        soundToggle: 'soundToggle',
        soundOnIcon: 'soundOnIcon',
        soundOffIcon: 'soundOffIcon',
        hero: 'hero',
        mainContent: 'main-content'
    },

    // CSS Classes
    classes: {
        // Navigation classes
        navHidden: 'nav-hidden',
        textCliffCarmineLight: 'text-cliff-carmine-light',
        ring2: 'ring-2',
        ringWhite: 'ring-white',
        
        // Icon visibility
        hidden: 'hidden',
        
        // Hero video container
        heroVideoContainer: 'hero-video-container'
    },

    // Selectors
    selectors: {
        nav: 'nav',
        navLinks: 'nav a',
        anchorLinks: 'a[href^="#"]'
    },

    // Magic numbers and thresholds
    thresholds: {
        videoVisibilityOffset: 50,
        heroScrollThreshold: 100, // For non-hero sections
        navigationHighlightThreshold: 100
    },

    // Section names for navigation
    sections: ['hero', 'menu', 'events', 'contact'],

    // Domain configuration
    domains: {
        production: 'thecliff.fi'
    },

    // Scroll behavior
    scroll: {
        behavior: 'smooth'
    }
};

import  HTTPSRedirect  from './https.js';
import  Navigation  from './navigation.js';
import  VideoControl  from './video.js';
import MenuRenderer from './menu.js';

/**
 * Application initialization and coordination
 */
export function initializeApp() {
    // Initialize core modules in order
    HTTPSRedirect.init();
    VideoControl.init();
    Navigation.init();
    
    // Initialize menu renderer
    const menuRenderer = new MenuRenderer();
    menuRenderer.init();
    
    console.log('The Cliff app initialized');
}

