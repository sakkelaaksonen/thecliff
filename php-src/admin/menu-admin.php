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
     * Validate price format
     */
    public static function validatePrice($price) {
        $price = floatval($price);
        return max(0, round($price, 2));
    }
    
    /**
     * Sanitize description
     */
    public static function sanitizeDescription($description) {
        $description = trim(strip_tags($description));
        return substr($description, 0, 500); // Limit length
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
        $this->dataDir = __DIR__ . '/../../data';
        $this->menuFile = $this->dataDir . '/menu.json';
        $this->ensureDataDirectory();
    }
    
    /**
     * Ensure data directory exists
     */
    private function ensureDataDirectory() {
        if (!is_dir($this->dataDir)) {
            if (!mkdir($this->dataDir, 0755, true)) {
                throw new Exception('Unable to create data directory');
            }
        }
    }
    
    /**
     * Load menu data, create default if doesn't exist
     */
    public function loadMenu() {
        if (!file_exists($this->menuFile)) {
            $defaultMenu = array(
                'categories' => array(
                    array(
                        'id' => 'wine-selection',
                        'name' => 'Wine Selection',
                        'items' => array()
                    ),
                    array(
                        'id' => 'bar-bites',
                        'name' => 'Bar Bites',
                        'items' => array()
                    )
                )
            );
            $this->saveMenu($defaultMenu);
            return $defaultMenu;
        }
        
        $content = file_get_contents($this->menuFile);
        if ($content === false) {
            throw new Exception('Unable to read menu file');
        }
        
        $menu = json_decode($content, true);
        if ($menu === null) {
            throw new Exception('Invalid menu file format');
        }
        
        return $menu;
    }
    
    /**
     * Save menu data with backup
     */
    private function saveMenu($menuData) {
        // Create backup if file exists
        if (file_exists($this->menuFile)) {
            $backupFile = $this->menuFile . '.backup.' . date('Y-m-d-H-i-s');
            copy($this->menuFile, $backupFile);
            
            // Keep only last 5 backups
            $backups = glob($this->menuFile . '.backup.*');
            if (count($backups) > 5) {
                rsort($backups);
                for ($i = 5; $i < count($backups); $i++) {
                    unlink($backups[$i]);
                }
            }
        }
        
        $json = json_encode($menuData, JSON_PRETTY_PRINT);
        if (file_put_contents($this->menuFile, $json, LOCK_EX) === false) {
            throw new Exception('Unable to save menu file');
        }
    }
    
    /**
     * Add new menu item
     */
    public function addItem($categoryId, $name, $description, $price) {
        try {
            $menu = $this->loadMenu();
            
            // Validate and sanitize input
            $name = MenuValidator::sanitizeName($name);
            $description = MenuValidator::sanitizeDescription($description);
            $price = MenuValidator::validatePrice($price);
            
            if (empty($name)) {
                return array('success' => false, 'message' => 'Item name is required');
            }
            
            if (!MenuValidator::isValidCategory($categoryId, $menu)) {
                return array('success' => false, 'message' => 'Invalid category selected');
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
            for ($i = 0; $i < count($menu['categories']); $i++) {
                if ($menu['categories'][$i]['id'] === $categoryId) {
                    $menu['categories'][$i]['items'][] = $newItem;
                    break;
                }
            }
            
            $this->saveMenu($menu);
            
            return array('success' => true, 'message' => 'Item added successfully');
            
        } catch (Exception $e) {
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Update existing menu item
     */
    public function updateItem($itemId, $name, $description, $price) {
        try {
            $menu = $this->loadMenu();
            
            // Validate and sanitize input
            $name = MenuValidator::sanitizeName($name);
            $description = MenuValidator::sanitizeDescription($description);
            $price = MenuValidator::validatePrice($price);
            
            if (empty($name)) {
                return array('success' => false, 'message' => 'Item name is required');
            }
            
            // Find and update item
            $found = false;
            for ($i = 0; $i < count($menu['categories']); $i++) {
                for ($j = 0; $j < count($menu['categories'][$i]['items']); $j++) {
                    if ($menu['categories'][$i]['items'][$j]['id'] === $itemId) {
                        $menu['categories'][$i]['items'][$j]['name'] = $name;
                        $menu['categories'][$i]['items'][$j]['description'] = $description;
                        $menu['categories'][$i]['items'][$j]['price'] = $price;
                        $found = true;
                        break 2;
                    }
                }
            }
            
            if (!$found) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->saveMenu($menu);
            
            return array('success' => true, 'message' => 'Item updated successfully');
            
        } catch (Exception $e) {
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Toggle item availability
     */
    public function toggleAvailability($itemId) {
        try {
            $menu = $this->loadMenu();
            
            // Find and toggle item
            $found = false;
            for ($i = 0; $i < count($menu['categories']); $i++) {
                for ($j = 0; $j < count($menu['categories'][$i]['items']); $j++) {
                    if ($menu['categories'][$i]['items'][$j]['id'] === $itemId) {
                        $menu['categories'][$i]['items'][$j]['available'] = !$menu['categories'][$i]['items'][$j]['available'];
                        $found = true;
                        break 2;
                    }
                }
            }
            
            if (!$found) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->saveMenu($menu);
            
            return array('success' => true, 'message' => 'Item availability updated');
            
        } catch (Exception $e) {
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete menu item
     */
    public function deleteItem($itemId) {
        try {
            $menu = $this->loadMenu();
            
            // Find and remove item
            $found = false;
            for ($i = 0; $i < count($menu['categories']); $i++) {
                for ($j = 0; $j < count($menu['categories'][$i]['items']); $j++) {
                    if ($menu['categories'][$i]['items'][$j]['id'] === $itemId) {
                        array_splice($menu['categories'][$i]['items'], $j, 1);
                        $found = true;
                        break 2;
                    }
                }
            }
            
            if (!$found) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->saveMenu($menu);
            
            return array('success' => true, 'message' => 'Item deleted successfully');
            
        } catch (Exception $e) {
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
}

// Process form submission
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /admin/');
    exit;
}

// Validate CSRF token first
$csrfToken = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
if (!validateCSRFToken($csrfToken)) {
    header("Location: /admin/?message=" . urlencode('Invalid request. Please try again.') . "&type=error");
    exit;
}

$menuManager = new MenuManager();
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action) {
    case 'add_item':
        $result = $menuManager->addItem(
            isset($_POST['category_id']) ? $_POST['category_id'] : '',
            isset($_POST['name']) ? $_POST['name'] : '',
            isset($_POST['description']) ? $_POST['description'] : '',
            isset($_POST['price']) ? $_POST['price'] : 0
        );
        break;
        
    case 'update_item':
        $result = $menuManager->updateItem(
            isset($_POST['item_id']) ? $_POST['item_id'] : '',
            isset($_POST['name']) ? $_POST['name'] : '',
            isset($_POST['description']) ? $_POST['description'] : '',
            isset($_POST['price']) ? $_POST['price'] : 0
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