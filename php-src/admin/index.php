<?php
// php-src/admin/index.php
// Protected admin dashboard - PHP 5.6 compatible

// Authentication check - must be first
require_once __DIR__ . '/auth-check.php';

// Load the HTML content
$htmlFile = __DIR__ . '/index.html';
if (!file_exists($htmlFile)) {
    http_response_code(404);
    exit('Admin interface not found');
}

$htmlContent = file_get_contents($htmlFile);

// Set appropriate headers
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Output the protected content
echo $htmlContent;
?> 