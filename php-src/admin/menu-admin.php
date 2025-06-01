<?php
// php-src/admin/menu-admin.php
/**
 * Menu Administration Backend - Form Processing Only
 * Authentication handled by PHP session
 */

// Authentication check - must be first
require_once __DIR__ . '/auth-check.php';

class MenuValidator {
    /**
     * Sanitize and validate item name
     */
    public static function sanitizeName($name) {
        $name = trim(strip_tags($name));
        $name = filter_var($name, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
        return $name;
    }
    
    /**
     * Validate item name
     */
    public static function isValidName($name) {
        return strlen($name) >= 2 && strlen($name) <= 100 && 
               preg_match('/^[a-zA-Z0-9\s\-\.\,\&\']+$/', $name);
    }
    
    /**
     * Sanitize description
     */
    public static function sanitizeDescription($description) {
        $description = trim(strip_tags($description));
        return substr($description, 0, 500);
    }
    
    /**
     * Sanitize and validate price
     */
    public static function sanitizePrice($price) {
        $price = filter_var($price, FILTER_VALIDATE_FLOAT);
        if ($price === false || $price < 0.01 || $price > 999.99) {
            return false;
        }
        return round($price, 2);
    }
    
    /**
     * Validate category ID against current menu categories
     */
    public static function isValidCategory($categoryId, $menuData) {
        if (!$menuData || !isset($menuData['categories'])) {
            return false;
        }
        
        foreach ($menuData['categories'] as $category) {
            if ($category['id'] === $categoryId) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Generate unique item ID
     */
    public static function generateItemId($name) {
        $id = strtolower(trim($name));
        $id = preg_replace('/[^a-z0-9]+/', '-', $id);
        $id = trim($id, '-');
        return $id . '-' . substr(uniqid(), -6);
    }
}

class MenuManager {
    private $menuFile;
    private $dataDir;
    
    public function __construct() {
        // Use shared data directory at project root
        $this->dataDir = realpath(__DIR__ . '/../../data');
        $this->menuFile = $this->dataDir . '/menu.json';
        $this->ensureDataDirectory();
        $this->initializeMenuFile();
    }
    
    /**
     * Ensure data directory exists
     */
    private function ensureDataDirectory() {
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
    }
    
    /**
     * Initialize menu file with default structure
     */
    private function initializeMenuFile() {
        if (!file_exists($this->menuFile)) {
            $defaultMenu = array(
                'lastUpdated' => date('c'),
                'categories' => array(
                    array(
                        'id' => 'mains',
                        'name' => 'Main Courses',
                        'items' => array()
                    ),
                    array(
                        'id' => 'sides',
                        'name' => 'Sides & Appetizers',
                        'items' => array()
                    ),
                    array(
                        'id' => 'desserts',
                        'name' => 'Desserts',
                        'items' => array()
                    )
                )
            );
            $this->saveMenuData($defaultMenu);
        }
    }
    
    /**
     * Load menu data from JSON file
     */
    public function loadMenuData() {
        if (!file_exists($this->menuFile)) {
            return false;
        }
        
        $jsonData = file_get_contents($this->menuFile);
        $menuData = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Menu JSON decode error: ' . json_last_error_msg());
            return false;
        }
        
        return $menuData;
    }
    
    /**
     * Save menu data to JSON file with atomic write
     */
    public function saveMenuData($menuData) {
        $menuData['lastUpdated'] = date('c');
        
        // Validate JSON structure
        $jsonData = json_encode($menuData, JSON_PRETTY_PRINT);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Menu JSON encode error: ' . json_last_error_msg());
            return false;
        }
        
        // Atomic write: write to temp file first
        $tempFile = $this->menuFile . '.tmp';
        
        // Use file locking to prevent concurrent writes
        $handle = fopen($tempFile, 'w');
        if (!$handle) {
            error_log('Cannot create temp menu file: ' . $tempFile);
            return false;
        }
        
        if (flock($handle, LOCK_EX)) {
            fwrite($handle, $jsonData);
            fflush($handle);
            flock($handle, LOCK_UN);
            fclose($handle);
            
            // Atomic rename
            if (rename($tempFile, $this->menuFile)) {
                return true;
            } else {
                error_log('Cannot rename temp menu file');
                unlink($tempFile);
                return false;
            }
        } else {
            fclose($handle);
            unlink($tempFile);
            error_log('Cannot lock temp menu file');
            return false;
        }
    }
    
    /**
     * Add new menu item
     */
    public function addItem($categoryId, $name, $description, $price) {
        // Load current menu first to validate category
        $menuData = $this->loadMenuData();
        if (!$menuData) {
            return array('success' => false, 'message' => 'Cannot load menu data');
        }
        
        // Sanitize inputs
        $name = MenuValidator::sanitizeName($name);
        $description = MenuValidator::sanitizeDescription($description);
        $price = MenuValidator::sanitizePrice($price);
        
        // Validate inputs
        if (!MenuValidator::isValidName($name)) {
            return array('success' => false, 'message' => 'Invalid item name');
        }
        
        if (!MenuValidator::isValidCategory($categoryId, $menuData)) {
            return array('success' => false, 'message' => 'Invalid category');
        }
        
        if ($price === false) {
            return array('success' => false, 'message' => 'Invalid price');
        }
        
        // Create new item
        $newItem = array(
            'id' => MenuValidator::generateItemId($name),
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'available' => true
        );
        
        // Add to appropriate category
        foreach ($menuData['categories'] as &$category) {
            if ($category['id'] === $categoryId) {
                $category['items'][] = $newItem;
                break;
            }
        }
        
        // Save updated menu
        if ($this->saveMenuData($menuData)) {
            return array('success' => true, 'message' => 'Item added successfully');
        } else {
            return array('success' => false, 'message' => 'Failed to save menu');
        }
    }
    
    /**
     * Toggle item availability
     */
    public function toggleAvailability($itemId) {
        $menuData = $this->loadMenuData();
        if (!$menuData) {
            return array('success' => false, 'message' => 'Cannot load menu data');
        }
        
        // Find and toggle item
        foreach ($menuData['categories'] as &$category) {
            foreach ($category['items'] as &$item) {
                if ($item['id'] === $itemId) {
                    $item['available'] = !$item['available'];
                    
                    if ($this->saveMenuData($menuData)) {
                        return array('success' => true, 'message' => 'Item updated successfully');
                    } else {
                        return array('success' => false, 'message' => 'Failed to save menu');
                    }
                }
            }
        }
        
        return array('success' => false, 'message' => 'Item not found');
    }
    
    /**
     * Delete menu item
     */
    public function deleteItem($itemId) {
        $menuData = $this->loadMenuData();
        if (!$menuData) {
            return array('success' => false, 'message' => 'Cannot load menu data');
        }
        
        // Find and remove item
        foreach ($menuData['categories'] as &$category) {
            $category['items'] = array_filter($category['items'], function($item) use ($itemId) {
                return $item['id'] !== $itemId;
            });
            $category['items'] = array_values($category['items']); // Reindex array
        }
        
        if ($this->saveMenuData($menuData)) {
            return array('success' => true, 'message' => 'Item deleted successfully');
        } else {
            return array('success' => false, 'message' => 'Failed to save menu');
        }
    }
}

// Handle POST requests only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method not allowed');
}

$menuManager = new MenuManager();
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action) {
    case 'add_item':
        $result = $menuManager->addItem(
            isset($_POST['category_id']) ? $_POST['category_id'] : '',
            isset($_POST['item_name']) ? $_POST['item_name'] : '',
            isset($_POST['item_description']) ? $_POST['item_description'] : '',
            isset($_POST['item_price']) ? $_POST['item_price'] : ''
        );
        break;
        
    case 'toggle_availability':
        $result = $menuManager->toggleAvailability(isset($_POST['item_id']) ? $_POST['item_id'] : '');
        break;
        
    case 'delete_item':
        $result = $menuManager->deleteItem(isset($_POST['item_id']) ? $_POST['item_id'] : '');
        break;
        
    default:
        $result = array('success' => false, 'message' => 'Invalid action');
}

// Redirect back to admin page with message
$message = $result['success'] ? 'success' : 'error';
header("Location: /admin/?message=" . urlencode($result['message']) . "&type=" . $message);
exit;
?> 