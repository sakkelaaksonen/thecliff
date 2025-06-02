/**
 * Menu Renderer Module
 * Handles dynamic menu loading and rendering from API
 * 
 * @typedef {Object} MenuItem
 * @property {string} name - The name of the menu item
 * @property {string} description - Description of the menu item
 * @property {number|string} price - Price of the item (numeric or string format)
 * @property {boolean} available - Whether the item is currently available
 * 
 * @typedef {Object} MenuCategory
 * @property {string} name - The name of the menu category (e.g., "Wine Selection", "Bar Bites")
 * @property {MenuItem[]} items - Array of menu items in this category
 * 
 * @typedef {Object} MenuData
 * @property {MenuCategory[]} categories - Array of menu categories
 * 
 * @example
 * // Expected API response structure:
 * {
 *   "categories": [
 *     {
 *       "name": "Wine Selection",
 *       "items": [
 *         {
 *           "name": "House Red Wine",
 *           "description": "A smooth blend of local grapes",
 *           "price": 12.50,
 *           "available": true
 *         },
 *         {
 *           "name": "Premium Chardonnay",
 *           "description": "Crisp white wine with citrus notes",
 *           "price": 15.00,
 *           "available": false
 *         }
 *       ]
 *     },
 *     {
 *       "name": "Bar Bites",
 *       "items": [
 *         {
 *           "name": "Cliff Burger",
 *           "description": "Signature beef burger with house sauce",
 *           "price": 18.00,
 *           "available": true
 *         }
 *       ]
 *     }
 *   ]
 * }
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
     * @returns {string} The complete API URL
     */
    getApiUrl() {
        // Provide fallback if process.env is not defined
        const apiBaseUrl = (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) || '';
        return apiBaseUrl 
            ? `${apiBaseUrl}${CONFIG.api.endpoint}`  // Development
            : CONFIG.api.endpoint;              // Production
    }
    
    /**
     * Initialize the menu renderer
     * @returns {Promise<void>}
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
     * @returns {Promise<void>}
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
     * @returns {Promise<void>}
     * @throws {Error} When API request fails or times out
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
     * @param {MenuData} menuData - The menu data to render
     * @throws {Error} When menu data is invalid
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
     * @param {MenuData} menuData - The menu data to validate
     * @returns {boolean} True if valid, false otherwise
     */
    validateMenuData(menuData) {
        return menuData && 
               Array.isArray(menuData.categories) && 
               menuData.categories.length > 0;
    }
    
    /**
     * Generate complete menu HTML
     * @param {MenuData} menuData - The menu data
     * @returns {string} Complete HTML string for all menu categories
     */
    generateMenuHTML(menuData) {
        return menuData.categories
            .filter(category => this.categoryHasAvailableItems(category))
            .map((category, index) => this.generateCategoryHTML(category, index))
            .join('');
    }
    
    /**
     * Check if category has any available items
     * @param {MenuCategory} category - The category to check
     * @returns {boolean} True if category has available items
     */
    categoryHasAvailableItems(category) {
        return category.items && 
               category.items.length > 0 && 
               category.items.some(item => item.available);
    }
    
    /**
     * Generate HTML for a single category
     * @param {MenuCategory} category - The category data
     * @param {number} categoryIndex - Index of the category (for styling)
     * @returns {string} HTML string for the category
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
     * @param {MenuItem[]} items - Array of menu items
     * @returns {string} HTML string for all items
     */
    generateItemsHTML(items) {
        return items
            .map(item => this.generateAvailableItemHTML(item))
            .join('');
    }
    
    /**
     * Generate HTML for a single menu item (only available items now)
     * @param {MenuItem} item - The menu item data
     * @returns {string} HTML string for the item
     */
    generateItemHTML(item) {
        return this.generateAvailableItemHTML(item);
    }
    
    /**
     * Generate HTML for available menu item
     * @param {MenuItem} item - The menu item data
     * @returns {string} HTML string for available item
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
     * @param {number|string} price - The price to format
     * @returns {string} Formatted price string
     */
    formatPrice(price) {
        return typeof price === 'number' ? price.toFixed(2) : String(price);
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} HTML-escaped text
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