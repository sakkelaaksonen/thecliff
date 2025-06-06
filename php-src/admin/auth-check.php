<?php
// php-src/admin/auth-check.php
/**
 * Enhanced authentication check - PHP 5.6 compatible
 * Include this at the top of any protected admin page
 */

require_once __DIR__ . '/config.php';

// Configure and start secure session
configureSecureSession();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in with enhanced security
if (!isAdminLoggedIn()) {
    // Store the requested page for redirect after login
    $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
    
    // Clear any existing session data
    destroySession();
    
    header('Location: /admin/login.php');
    exit;
}

// Session is valid - continue with page
?> 