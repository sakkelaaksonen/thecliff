<?php
// php-src/api/menu.php
/**
 * Read-only Menu API for display purposes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Disable cache for development, enable for production
$isLocalhost = isset($_SERVER['HTTP_HOST']) && (
    strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
);

if ($isLocalhost) {
    // No caching for development
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    // Light caching for production (1 minute)
    header('Cache-Control: public, max-age=60');
}

// Load menu data from shared location
$menuFile = realpath(__DIR__ . '/../../data/menu.json');

if (!file_exists($menuFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Menu data not found']);
    exit;
}

$jsonData = file_get_contents($menuFile);
$menuData = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid menu data']);
    exit;
}

echo json_encode($menuData);
?> 