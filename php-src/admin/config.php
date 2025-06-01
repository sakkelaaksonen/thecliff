<?php
// php-src/admin/config.php
/**
 * Admin configuration with environment variables
 */

// Load environment variables in development
if (file_exists(__DIR__ . '/../../.env')) {
    $envFile = __DIR__ . '/../../.env';
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '"\'');
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Admin credentials from environment variables
define('ADMIN_USERNAME', $_ENV['ADMIN_USERNAME'] ?? getenv('ADMIN_USERNAME') ?? 'admin');
define('ADMIN_PASSWORD_HASH', $_ENV['ADMIN_PASSWORD_HASH'] ?? getenv('ADMIN_PASSWORD_HASH') ?? password_hash('password', PASSWORD_DEFAULT));

// Session configuration
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

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
    
    // Check session timeout
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
?> 