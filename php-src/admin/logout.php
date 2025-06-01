<?php
// php-src/admin/logout.php
/**
 * Simple logout - PHP 5.6 compatible
 */

session_start();

// Destroy the session
session_destroy();

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login
header('Location: /admin/login.php');
exit;
?> 