/**
 * Configuration object for all CSS classes, IDs, and magic numbers
 */
import features from '../../_data/features.js';
import HTTPSRedirect from './https.js';
import Navigation from './navigation.js';
import VideoControl from './video.js';
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
    if (features.menu.indexMenu.enabled) {
        const menuRenderer = new MenuRenderer();
        menuRenderer.init();
    }
    
    console.log('The Cliff app initialized');
}

