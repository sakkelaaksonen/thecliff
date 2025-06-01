<?php
// php-src/admin/login.php
require_once __DIR__ . '/config.php';

initSecureSession();

// If already logged in, redirect to admin area
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $redirect = isset($_SESSION['redirect_after_login']) ? $_SESSION['redirect_after_login'] : 'index.php';
    unset($_SESSION['redirect_after_login']);
    header('Location: ' . $redirect);
    exit;
}

$error = '';
$lockout = false;

// Check for lockout
if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] >= MAX_LOGIN_ATTEMPTS) {
    if (isset($_SESSION['lockout_time']) && time() - $_SESSION['lockout_time'] < LOCKOUT_TIME) {
        $lockout = true;
        $remaining = LOCKOUT_TIME - (time() - $_SESSION['lockout_time']);
        $error = "Too many failed attempts. Try again in " . ceil($remaining / 60) . " minutes.";
    } else {
        // Reset lockout
        unset($_SESSION['login_attempts']);
        unset($_SESSION['lockout_time']);
    }
}

// Process login form
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$lockout) {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Verify credentials
    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
        // Successful login
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Reset login attempts
        unset($_SESSION['login_attempts']);
        unset($_SESSION['lockout_time']);
        
        // Redirect to requested page or admin home
        $redirect = isset($_SESSION['redirect_after_login']) ? $_SESSION['redirect_after_login'] : 'index.php';
        unset($_SESSION['redirect_after_login']);
        header('Location: ' . $redirect);
        exit;
    } else {
        // Failed login
        $_SESSION['login_attempts'] = isset($_SESSION['login_attempts']) ? $_SESSION['login_attempts'] + 1 : 1;
        
        if ($_SESSION['login_attempts'] >= MAX_LOGIN_ATTEMPTS) {
            $_SESSION['lockout_time'] = time();
            $lockout = true;
            $error = "Too many failed attempts. Account locked for " . (LOCKOUT_TIME / 60) . " minutes.";
        } else {
            $remaining = MAX_LOGIN_ATTEMPTS - $_SESSION['login_attempts'];
            $error = "Invalid credentials. $remaining attempts remaining.";
        }
    }
}

// Check for expired session message
if (isset($_GET['expired'])) {
    $error = "Your session has expired. Please log in again.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .login-header h1 {
            color: #333;
            margin: 0;
            font-size: 1.5rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        input[type="text"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #007cba;
            box-shadow: 0 0 0 2px rgba(0,124,186,0.2);
        }
        .login-button {
            width: 100%;
            padding: 0.75rem;
            background: #007cba;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .login-button:hover:not(:disabled) {
            background: #005a87;
        }
        .login-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border: 1px solid #fcc;
        }
        .footer {
            text-align: center;
            margin-top: 2rem;
            color: #888;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>Admin Login</h1>
        </div>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="post" action="">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required <?php echo $lockout ? 'disabled' : ''; ?>>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required <?php echo $lockout ? 'disabled' : ''; ?>>
            </div>
            
            <button type="submit" class="login-button" <?php echo $lockout ? 'disabled' : ''; ?>>
                <?php echo $lockout ? 'Account Locked' : 'Login'; ?>
            </button>
        </form>
        
        <div class="footer">
            Secure Admin Access
        </div>
    </div>
</body>
</html> 