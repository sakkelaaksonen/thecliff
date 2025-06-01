<?php
// php-src/admin/auth-check.php
/**
 * Simple authentication check - PHP 5.6 compatible
 * Include this at the top of any protected admin page
 */

require_once __DIR__ . '/config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isAdminLoggedIn()) {
    // Store the requested page for redirect after login
    $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
    header('Location: /admin/login.php');
    exit;
}

// Update last activity
$_SESSION['last_activity'] = time();
?> 