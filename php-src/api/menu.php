<?php
// php-src/api/menu.php
/**
 * Read-only Menu API for display purposes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Cache-Control: public, max-age=60'); // 1 minute cache

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