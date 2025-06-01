<?php
// php-src/admin/config.php
/**
 * Admin configuration - PHP 5.6 compatible
 * Loads credentials from external file outside document root
 */

// Initialize variables
$adminUsername = '';
$adminPasswordHash = '';

// Load from external credential file (production)
$externalConfig =  '../../admin-config.php';

if (file_exists($externalConfig)) {
    include $externalConfig;
    
} 

// Fallback to .env file (development only)
if (empty($adminUsername) || empty($adminPasswordHash)) {
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
}

// Validate that credentials are set
if (empty($adminUsername) || empty($adminPasswordHash)) {
    die('Admin credentials not configured. Please create admin-credentials.php file or run setup-admin.php');
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
