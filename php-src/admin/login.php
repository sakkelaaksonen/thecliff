<?php
// php-src/admin/login.php
/**
 * Debug admin login - no redirects
 */

require_once __DIR__ . '/config.php';
session_start();

echo "<h1>Login Debug Page</h1>";
echo "<p><strong>File:</strong> " . __FILE__ . "</p>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Session Status:</strong> " . session_status() . "</p>";

// Debug session data
echo "<h2>Session Data:</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Check if already logged in
$isLoggedIn = isAdminLoggedIn();
echo "<p><strong>isAdminLoggedIn():</strong> " . ($isLoggedIn ? 'TRUE' : 'FALSE') . "</p>";

if ($isLoggedIn) {
    echo "<p style='color: green;'>✅ User is logged in!</p>";
    echo "<p><a href='/admin/index.php'>👉 Click here to go to admin dashboard</a></p>";
} else {
    echo "<p style='color: red;'>❌ User is NOT logged in</p>";
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>Processing Login Form:</h2>";
    
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    echo "<p><strong>Username:</strong> " . htmlspecialchars($username) . "</p>";
    echo "<p><strong>Password length:</strong> " . strlen($password) . "</p>";
    
    $isValid = validateAdminCredentials($username, $password);
    echo "<p><strong>Credentials valid:</strong> " . ($isValid ? 'TRUE' : 'FALSE') . "</p>";
    
    if ($isValid) {
        echo "<p style='color: green;'>✅ Setting session variables...</p>";
        
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        echo "<p>Session variables set:</p>";
        echo "<pre>" . print_r($_SESSION, true) . "</pre>";
        
        echo "<p style='color: green;'>✅ Login successful!</p>";
        echo "<p><a href='/admin/index.php'>👉 Click here to go to admin dashboard</a></p>";
    } else {
        $error = 'Invalid username or password';
        echo "<p style='color: red;'>❌ " . $error . "</p>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login Debug</title>
    <style>
        body { font-family: monospace; margin: 2rem; }
        .form-container { background: #f5f5f5; padding: 2rem; margin: 2rem 0; }
        input { padding: 0.5rem; margin: 0.5rem; }
        button { padding: 0.5rem 1rem; background: #007cba; color: white; border: none; }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Login Form</h2>
        
        <?php if ($error): ?>
            <div style="color: red; background: #fee; padding: 1rem;">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>
        
        <form method="post">
            <div>
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username" value="admin" required>
            </div>
            
            <div>
                <label for="password">Password:</label><br>
                <input type="password" id="password" name="password" value="password" required>
            </div>
            
            <div>
                <button type="submit">Login</button>
            </div>
        </form>
        
        <p><em>Default credentials: admin / password</em></p>
    </div>
    
    <hr>
    
    <h2>Debug Links</h2>
    <ul>
        <li><a href="/admin/index.php">Admin Dashboard</a></li>
        <li><a href="/admin/logout.php">Logout</a></li>
        <li><a href="/admin/login.php">Refresh this page</a></li>
        <li><a href="/">Back to website</a></li>
    </ul>
</body>
</html> 