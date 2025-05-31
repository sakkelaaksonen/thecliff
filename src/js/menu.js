class MenuRenderer {
    constructor() {
        // Use environment variable injected at build time
        const apiBaseUrl = process.env.API_BASE_URL || '';
        this.apiUrl = apiBaseUrl 
            ? `${apiBaseUrl}/api/menu.php`  // Development
            : '/api/menu.php';              // Production
        
        // ... rest of constructor
    }
    // ... rest of class unchanged
} 