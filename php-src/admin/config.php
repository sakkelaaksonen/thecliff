<?php
// php-src/admin/config.php
// Authentication configuration

// Admin credentials (in production, consider using environment variables)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', password_hash('password', PASSWORD_DEFAULT));

// Session configuration
define('SESSION_NAME', 'admin_session');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Security settings
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// Initialize session with security settings
function initSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Comment out problematic settings for production testing
        // ini_set('session.cookie_httponly', 1);
        // ini_set('session.cookie_secure', 1);
        // ini_set('session.use_strict_mode', 1);
        session_name(SESSION_NAME);
        session_start();
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}
?> 