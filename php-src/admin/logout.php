<?php
// php-src/admin/logout.php
/**
 * Secure logout - PHP 5.6 compatible
 */

require_once __DIR__ . '/config.php';

// Configure secure session
configureSecureSession();
session_start();

// Destroy the session completely
destroySession();

// Redirect to login with cache prevention headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Location: /admin/login.php');
exit;
?> 