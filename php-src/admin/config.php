<?php
// php-src/admin/config.php
/**
 * Admin configuration - PHP 5.6 compatible
 */

// Default credentials (fallback)
$adminUsername = 'admin';
$adminPasswordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

// Try environment variables first (production)
if (getenv('ADMIN_USERNAME')) {
    $adminUsername = getenv('ADMIN_USERNAME');
}
if (getenv('ADMIN_PASSWORD_HASH')) {
    $adminPasswordHash = getenv('ADMIN_PASSWORD_HASH');
}

// Try .env file (development)
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $content = file_get_contents($envFile);
    if ($content !== false) {
        if (preg_match('/ADMIN_USERNAME=(.+)/', $content, $matches)) {
            $adminUsername = trim($matches[1], '"\'');
        }
        if (preg_match('/ADMIN_PASSWORD_HASH=(.+)/', $content, $matches)) {
            $adminPasswordHash = trim($matches[1], '"\'');
        }
    }
}

// Define constants
define('ADMIN_USERNAME', $adminUsername);
define('ADMIN_PASSWORD_HASH', $adminPasswordHash);
define('SESSION_TIMEOUT', 3600);

/**
 * Check if user is logged in
 */
function isAdminLoggedIn() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_TIMEOUT) {
        session_destroy();
        return false;
    }
    
    return true;
}

/**
 * Validate admin credentials
 */
function validateAdminCredentials($username, $password) {
    return $username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH);
}
