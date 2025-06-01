<?php
// php-src/admin/test.php
// Minimal test to check what's causing 500 errors

echo "PHP Test Page<br>";
echo "PHP Version: " . phpversion() . "<br>";

// Test if we can include config
try {
    require_once __DIR__ . '/config.php';
    echo "✅ Config loaded successfully<br>";
    echo "Username: " . ADMIN_USERNAME . "<br>";
    echo "Password hash set: " . (defined('ADMIN_PASSWORD_HASH') ? 'YES' : 'NO') . "<br>";
} catch (Exception $e) {
    echo "❌ Config error: " . $e->getMessage() . "<br>";
}

// Test session
try {
    session_start();
    echo "✅ Session started<br>";
} catch (Exception $e) {
    echo "❌ Session error: " . $e->getMessage() . "<br>";
}

// Test environment variables
echo "ENV ADMIN_USERNAME: " . (getenv('ADMIN_USERNAME') ?: 'NOT SET') . "<br>";
echo "ENV ADMIN_PASSWORD_HASH: " . (getenv('ADMIN_PASSWORD_HASH') ? 'SET' : 'NOT SET') . "<br>";

echo "<br>Test complete.";
?> 