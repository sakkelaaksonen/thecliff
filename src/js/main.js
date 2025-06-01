/**
 * Main application entry point
 * Demonstrates ES module usage with esbuild bundling
 */

import { initializeApp } from './modules/app.js';

/**
 * Initialize the application when DOM is loaded
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/**
 * Handle hero contact button click
 * Shows options to scroll to contact or open maps
 */
function initHeroContactButton() {
    const heroContactBtn = document.getElementById('heroContactBtn');
    
    if (heroContactBtn) {
        heroContactBtn.addEventListener('click', function(e) {
            const mapsUrl = this.dataset.mapsUrl;
            // Open Google Maps in new tab
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
            
        });
    }
} 