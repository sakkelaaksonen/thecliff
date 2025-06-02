<?php
// php-src/admin/index.php
// Protected admin dashboard - PHP 5.6 compatible

// Authentication check - must be first
require_once __DIR__ . '/auth-check.php';

// Generate CSRF token
$csrfToken = generateCSRFToken();

// Load menu data for category dropdown
$menuFile = __DIR__ . '/../../data/menu.json';
$menuData = file_exists($menuFile) ? json_decode(file_get_contents($menuFile), true) : array('categories' => array());

// Load the HTML content
$htmlFile = __DIR__ . '/index.html';
if (!file_exists($htmlFile)) {
    http_response_code(404);
    exit('Admin interface not found');
}

$htmlContent = file_get_contents($htmlFile);

// Inject CSRF token into forms
$csrfInput = '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($csrfToken) . '">';

// Replace placeholder or inject after action inputs
$htmlContent = str_replace(
    '<input type="hidden" name="action"',
    $csrfInput . "\n                <input type=\"hidden\" name=\"action\"",
    $htmlContent
);


// Set appropriate headers
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Output the modified content
echo $htmlContent;
?> 