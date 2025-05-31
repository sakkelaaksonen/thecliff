/**
 * Main application entry point
 * Demonstrates ES module usage with esbuild bundling
 */

import { initializeApp } from './modules/app.js';

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Hello World from main.js!');
  
  
  initializeApp();
  initHeroContactButton();
});

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