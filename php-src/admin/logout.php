<?php
// php-src/admin/logout.php
/**
 * Debug logout - no redirects
 */

session_start();

echo "<h1>Logout Debug</h1>";
echo "<p><strong>Before logout - Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Before logout - Session data:</strong></p>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Destroy the session
session_destroy();

echo "<p style='color: green;'>✅ Session destroyed</p>";

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
    echo "<p style='color: green;'>✅ Session cookie cleared</p>";
}

echo "<p><a href='/admin/login.php'>👉 Click here to go to login</a></p>";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logout Debug</title>
    <style>
        body { font-family: monospace; margin: 2rem; }
    </style>
</head>
<body>
    <h2>Debug Links</h2>
    <ul>
        <li><a href="/admin/login.php">Login Page</a></li>
        <li><a href="/admin/index.php">Admin Dashboard</a></li>
        <li><a href="/">Back to website</a></li>
    </ul>
</body>
</html> 