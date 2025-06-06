<?php
// php-src/api/menu-sql.php
/**
 * SQL-based Menu API for display purposes
 * Replaces the JSON file-based API with database queries
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

// Include the SQL menu manager
require_once __DIR__ . '/../admin/menu-manager-sql.php';

try {
    $menuManager = new MenuManagerSQL();
    $menuData = $menuManager->loadMenu();
    
    // Return data in the same format as the JSON API
    echo json_encode($menuData);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load menu data: ' . $e->getMessage()]);
}
?> 