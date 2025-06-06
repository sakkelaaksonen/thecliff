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
 * Configure secure session settings
 */
function configureSecureSession() {
    // Only configure if session hasn't started yet
    if (session_status() === PHP_SESSION_NONE) {
        // Secure session configuration
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_samesite', 'Strict');
        
        // Session name and lifetime
        session_name('CLIFF_ADMIN_SESSION');
        ini_set('session.cookie_lifetime', 0); // Session cookie
        ini_set('session.gc_maxlifetime', SESSION_TIMEOUT);
        
        // Regenerate session ID periodically
        ini_set('session.gc_probability', 1);
        ini_set('session.gc_divisor', 100);
    }
}

/**
 * Generate session fingerprint for additional security
 */
function generateSessionFingerprint() {
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    $acceptLanguage = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : '';
    $acceptEncoding = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
    
    return hash('sha256', $userAgent . $acceptLanguage . $acceptEncoding);
}

/**
 * Get client IP address (considering proxies)
 */
function getClientIP() {
    $ipKeys = array('HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR');
    
    foreach ($ipKeys as $key) {
        if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            
            // Validate IP address
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
}

/**
 * Regenerate session ID safely
 */
function regenerateSessionId() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }
}

/**
 * Check if user is logged in with enhanced security
 */
function isAdminLoggedIn() {
    configureSecureSession();
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Basic login check
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    // Session timeout check
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_TIMEOUT) {
        destroySession();
        return false;
    }
    
    // Last activity timeout (30 minutes of inactivity)
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > 1800) {
        destroySession();
        return false;
    }
    
    // IP address validation (if set)
    if (isset($_SESSION['ip_address'])) {
        $currentIP = getClientIP();
        if ($_SESSION['ip_address'] !== $currentIP) {
            destroySession();
            return false;
        }
    }
    
    // Browser fingerprint validation (if set)
    if (isset($_SESSION['fingerprint'])) {
        $currentFingerprint = generateSessionFingerprint();
        if ($_SESSION['fingerprint'] !== $currentFingerprint) {
            destroySession();
            return false;
        }
    }
    
    // Regenerate session ID periodically (every 15 minutes)
    if (!isset($_SESSION['last_regeneration']) || (time() - $_SESSION['last_regeneration']) > 900) {
        regenerateSessionId();
        $_SESSION['last_regeneration'] = time();
    }
    
    // Update last activity
    $_SESSION['last_activity'] = time();
    
    return true;
}

/**
 * Validate admin credentials
 */
function validateAdminCredentials($username, $password) {
    return $username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH);
}

/**
 * Initialize secure admin session after successful login
 */
function initializeAdminSession($username) {
    configureSecureSession();
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Regenerate session ID to prevent fixation
    regenerateSessionId();
    
    // Set session data
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['last_regeneration'] = time();
    $_SESSION['ip_address'] = getClientIP();
    $_SESSION['fingerprint'] = generateSessionFingerprint();
    
    // Generate CSRF token
    $_SESSION['csrf_token'] = bin2hex(openssl_random_pseudo_bytes(32));
}

/**
 * Destroy session completely
 */
function destroySession() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        // Clear session data
        $_SESSION = array();
        
        // Delete session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy session
        session_destroy();
    }
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(openssl_random_pseudo_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 */
function validateCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
