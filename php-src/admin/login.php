<?php
// php-src/admin/login.php
/**
 * Production admin login - PHP 5.6 compatible
 */

require_once __DIR__ . '/config.php';
session_start();

// If already logged in, redirect to admin
if (isAdminLoggedIn()) {
    header('Location: /admin/index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    if (validateAdminCredentials($username, $password)) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        header('Location: /admin/index.php');
        exit;
    } else {
        $error = 'Invalid username or password';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - The Cliff</title>
    <link rel="stylesheet" href="../css/main.css">
    <meta name="robots" content="noindex, nofollow">
    <style>
        .login-container {
            max-width: 400px;
            width: 100%;
        }
    </style>
</head>
<body class="bg-black text-white min-h-screen">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="login-container space-y-8">
            <div class="text-center">
                <h1 class="text-4xl font-bold text-cliff-carmine-bright uppercase tracking-wider mb-2">
                    The Cliff
                </h1>
                <p class="text-gray-400 text-lg uppercase tracking-wide">Admin Access</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <form method="post" class="space-y-6">
                <div>
                    <label for="username" class="block text-gray-200 font-semibold text-lg uppercase tracking-wide mb-3">
                        Username
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="w-full bg-black/60 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-cliff-carmine focus:ring-2 focus:ring-cliff-carmine/20 transition-all"
                        placeholder="Enter username"
                        required 
                        autocomplete="username"
                    >
                </div>
                
                <div>
                    <label for="password" class="block text-gray-200 font-semibold text-lg uppercase tracking-wide mb-3">
                        Password
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="w-full bg-black/60 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-cliff-carmine focus:ring-2 focus:ring-cliff-carmine/20 transition-all"
                        placeholder="Enter password"
                        required 
                        autocomplete="current-password"
                    >
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-cliff-carmine hover:bg-cliff-carmine-dark text-white font-semibold py-3 px-6 rounded-lg text-lg uppercase tracking-wide transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cliff-carmine/50"
                >
                    Sign In
                </button>
            </form>
            
            <div class="text-center">
                <a 
                    href="/" 
                    class="text-gray-400 hover:text-cliff-carmine-light text-base transition-colors duration-300"
                >
                    ← Back to Website
                </a>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('username').focus();
    </script>
</body>
</html> 