<?php
// php-src/admin/auth-check.php
/**
 * Simple authentication check
 * Include this at the top of any protected admin page
 */

require_once __DIR__ . '/config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Store the requested page for redirect after login
    $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
    header('Location: /admin/login.php');
    exit;
}

// Check session timeout
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_TIMEOUT) {
    session_destroy();
    header('Location: /admin/login.php?expired=1');
    exit;
}

// Update last activity
$_SESSION['last_activity'] = time();
?> 