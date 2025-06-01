<?php
// php-src/admin/index.php
/**
 * Debug admin dashboard - no redirects
 */

require_once __DIR__ . '/config.php';
session_start();

echo "<h1>Admin Dashboard Debug</h1>";
echo "<p><strong>File:</strong> " . __FILE__ . "</p>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";

// Debug session data
echo "<h2>Session Data:</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Check authentication
$isLoggedIn = isAdminLoggedIn();
echo "<p><strong>isAdminLoggedIn():</strong> " . ($isLoggedIn ? 'TRUE' : 'FALSE') . "</p>";

if (!$isLoggedIn) {
    echo "<p style='color: red;'>❌ User is NOT logged in!</p>";
    echo "<p><a href='/admin/login.php'>👉 Click here to go to login</a></p>";
} else {
    echo "<p style='color: green;'>✅ User is logged in!</p>";
    echo "<p>Welcome, " . htmlspecialchars($_SESSION['admin_username'] ?? 'Admin') . "!</p>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard Debug</title>
    <style>
        body { font-family: monospace; margin: 2rem; }
    </style>
</head>
<body>
    <hr>
    
    <h2>Debug Links</h2>
    <ul>
        <li><a href="/admin/login.php">Login Page</a></li>
        <li><a href="/admin/logout.php">Logout</a></li>
        <li><a href="/admin/index.php">Refresh this page</a></li>
        <li><a href="/">Back to website</a></li>
    </ul>
    
    <?php if ($isLoggedIn): ?>
        <h2>Admin Functions</h2>
        <ul>
            <li><a href="/admin/menu-admin.php">Menu Management</a></li>
        </ul>
    <?php endif; ?>
</body>
</html> 