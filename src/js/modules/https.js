/**
 * HTTPS Redirect Module
 * Redirects HTTP to HTTPS in production
 */
export default HTTPSRedirect = {
    init() {
        // Only redirect in production (not localhost)
        if (window.location.protocol === 'http:' && 
            !window.location.hostname.includes('localhost') &&
            !window.location.hostname.includes('127.0.0.1')) {
            
            const httpsUrl = window.location.href.replace('http:', 'https:');
            window.location.replace(httpsUrl);
        }
    }
};    