/**
 * Menu Renderer Module
 * Handles dynamic menu loading and rendering from API
 */

const CONFIG = {
    elements: {
        menuContainer: 'menu'
    },
    
    text: {
        unavailableLabel: 'Currently Unavailable',
        errorMessage: 'Failed to load menu. Please try again later.'
    },
    
    api: {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
        endpoint: '/api/menu.php'
    }
};

class MenuRenderer {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.menuContainer = null;
        this.retryCount = 0;
    }
    
    /**
     * Get API URL based on environment
     */
    getApiUrl() {
        const apiBaseUrl = process.env.API_BASE_URL || '';
        return apiBaseUrl 
            ? `${apiBaseUrl}${CONFIG.api.endpoint}`  // Development
            : CONFIG.api.endpoint;              // Production
    }
    
    /**
     * Initialize the menu renderer
     */
    async init() {
        this.menuContainer = document.getElementById(CONFIG.elements.menuContainer);
        if (!this.menuContainer) {
            console.warn('Menu container not found');
            return;
        }
        
        await this.loadMenuWithRetry();
    }
    
    /**
     * Load menu with retry logic
     */
    async loadMenuWithRetry() {
        try {
            await this.loadAndRenderMenu();
            this.retryCount = 0; // Reset on success
        } catch (error) {
            console.error(`Menu load attempt ${this.retryCount + 1} failed:`, error);
            
            if (this.retryCount < CONFIG.api.retryAttempts) {
                this.retryCount++;
                setTimeout(() => this.loadMenuWithRetry(), CONFIG.api.retryDelay);
            } else {
                this.showError();
            }
        }
    }
    
    /**
     * Fetch menu data and render
     */
    async loadAndRenderMenu() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);
        
        try {
            const response = await fetch(this.apiUrl, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const menuData = await response.json();
            this.renderMenu(menuData);
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    /**
     * Render menu data to DOM
     */
    renderMenu(menuData) {
        if (!this.validateMenuData(menuData)) {
            throw new Error('Invalid menu data structure');
        }
        
        const html = this.generateMenuHTML(menuData);
        this.menuContainer.innerHTML = html;
        console.log('Menu rendered');
    }
    
    /**
     * Validate menu data structure
     */
    validateMenuData(menuData) {
        return menuData && 
               Array.isArray(menuData.categories) && 
               menuData.categories.length > 0;
    }
    
    /**
     * Generate complete menu HTML
     */
    generateMenuHTML(menuData) {
        return menuData.categories
            .filter(category => this.categoryHasAvailableItems(category))
            .map((category, index) => this.generateCategoryHTML(category, index))
            .join('');
    }
    
    /**
     * Check if category has any available items
     */
    categoryHasAvailableItems(category) {
        return category.items && 
               category.items.length > 0 && 
               category.items.some(item => item.available);
    }
    
    /**
     * Generate HTML for a single category
     */
    generateCategoryHTML(category, categoryIndex) {
        const bgClass = categoryIndex % 2 === 1 ? 'bg-neutral-900' : '';
        const availableItems = category.items.filter(item => item.available);
        const itemsHTML = this.generateItemsHTML(availableItems);
        
        return `
            <div class="min-h-screen flex flex-col p-6 md:p-12 pt-24 ${bgClass}">
                <h2 class="text-4xl md:text-5xl font-bold text-amber-500 mb-8 text-center">
                    ${this.escapeHtml(category.name)}
                </h2>
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto w-full">
                    ${itemsHTML}
                </div>
            </div>
        `;
    }
    
    /**
     * Generate HTML for all items in a category
     */
    generateItemsHTML(items) {
        return items
            .map(item => this.generateAvailableItemHTML(item))
            .join('');
    }
    
    /**
     * Generate HTML for a single menu item (only available items now)
     */
    generateItemHTML(item) {
        return this.generateAvailableItemHTML(item);
    }
    
    /**
     * Generate HTML for available menu item
     */
    generateAvailableItemHTML(item) {
        return `
            <div class="bg-black/50 p-6 rounded-lg border border-amber-600">
                <h3 class="text-2xl font-semibold mb-2 text-amber-400">
                    ${this.escapeHtml(item.name)}
                </h3>
                <p class="text-gray-300 mb-2">
                    ${this.escapeHtml(item.description)}
                </p>
                <p class="text-amber-500 font-semibold">
                    $${this.formatPrice(item.price)}
                </p>
            </div>
        `;
    }
    
    /**
     * Format price for display
     */
    formatPrice(price) {
        return typeof price === 'number' ? price.toFixed(2) : String(price);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show error message
     */
    showError() {
        this.menuContainer.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <p class="text-red-400 text-xl">${CONFIG.text.errorMessage}</p>
            </div>
        `;
    }
}

export default MenuRenderer; 