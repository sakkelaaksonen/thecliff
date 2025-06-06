<?php
/**
 * SQL-based Menu Manager for The Cliff
 * Replaces the JSON-based MenuManager with database operations
 * PHP 5.6 compatible
 */

class DatabaseManager {
    private static $instance = null;
    private $pdo;
    private $environment;
    
    private function __construct() {
        $this->environment = $this->detectEnvironment();
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function detectEnvironment() {
        // Check if we're on localhost
        if (isset($_SERVER['HTTP_HOST']) && (
            strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
            strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
        )) {
            return 'development';
        }
        return 'production';
    }
    
    private function connect() {
        try {
            if ($this->environment === 'development') {
                // SQLite for development
                $dbPath = __DIR__ . '/../../data/menu.db';
                $this->pdo = new PDO("sqlite:$dbPath");
                $this->pdo->exec('PRAGMA foreign_keys = ON');
            } else {
                // MySQL for production
                $host = $_ENV['DB_HOST'] ?? 'localhost';
                $dbname = $_ENV['DB_NAME'] ?? 'thecliff_menu';
                $username = $_ENV['DB_USER'] ?? 'root';
                $password = $_ENV['DB_PASS'] ?? '';
                
                $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
                $this->pdo = new PDO($dsn, $username, $password);
            }
            
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getPdo() {
        return $this->pdo;
    }
    
    public function getEnvironment() {
        return $this->environment;
    }
}

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
     * Generate unique item ID
     */
    public static function generateItemId($name) {
        $id = strtolower(trim($name));
        $id = preg_replace('/[^a-z0-9]+/', '-', $id);
        $id = trim($id, '-');
        return $id . '-' . substr(uniqid(), -6);
    }
}

class MenuManagerSQL {
    private $db;
    private $pdo;
    
    public function __construct() {
        $this->db = DatabaseManager::getInstance();
        $this->pdo = $this->db->getPdo();
    }
    
    /**
     * Load complete menu data (API compatible format)
     */
    public function loadMenu() {
        try {
            // Get categories with their items
            $stmt = $this->pdo->prepare("
                SELECT 
                    c.id as category_id,
                    c.name as category_name,
                    c.description as category_description,
                    m.id as item_id,
                    m.name as item_name,
                    m.description as item_description,
                    m.price,
                    m.available,
                    m.sort_order
                FROM categories c
                LEFT JOIN menu_items m ON c.id = m.category_id
                WHERE c.active = 1
                ORDER BY c.sort_order, m.sort_order
            ");
            
            $stmt->execute();
            $rows = $stmt->fetchAll();
            
            // Group by categories
            $categories = array();
            $categoryMap = array();
            
            foreach ($rows as $row) {
                $categoryId = $row['category_id'];
                
                // Initialize category if not exists
                if (!isset($categoryMap[$categoryId])) {
                    $categoryMap[$categoryId] = count($categories);
                    $categories[] = array(
                        'id' => $categoryId,
                        'name' => $row['category_name'],
                        'description' => $row['category_description'],
                        'items' => array()
                    );
                }
                
                // Add item if exists
                if ($row['item_id']) {
                    $categories[$categoryMap[$categoryId]]['items'][] = array(
                        'id' => $row['item_id'],
                        'name' => $row['item_name'],
                        'description' => $row['item_description'],
                        'price' => floatval($row['price']),
                        'available' => (bool)$row['available'],
                        'dietary' => array()
                    );
                }
            }
            
            return array(
                'categories' => $categories,
                'lastUpdated' => date('c')
            );
            
        } catch (Exception $e) {
            throw new Exception('Failed to load menu: ' . $e->getMessage());
        }
    }
    
    /**
     * Add new menu item
     */
    public function addItem($categoryId, $name, $description, $price) {
        try {
            $this->pdo->beginTransaction();
            
            // Validate and sanitize input
            $name = MenuValidator::sanitizeName($name);
            $description = MenuValidator::sanitizeDescription($description);
            $price = MenuValidator::validatePrice($price);
            
            if (empty($name)) {
                return array('success' => false, 'message' => 'Item name is required');
            }
            
            // Validate category exists
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM categories WHERE id = ? AND active = 1");
            $stmt->execute(array($categoryId));
            if ($stmt->fetchColumn() == 0) {
                return array('success' => false, 'message' => 'Invalid category selected');
            }
            
            // Get next sort order for this category
            $stmt = $this->pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM menu_items WHERE category_id = ?");
            $stmt->execute(array($categoryId));
            $sortOrder = $stmt->fetchColumn();
            
            // Insert new item
            $itemId = MenuValidator::generateItemId($name);
            $stmt = $this->pdo->prepare("
                INSERT INTO menu_items (id, category_id, name, description, price, available, sort_order)
                VALUES (?, ?, ?, ?, ?, 1, ?)
            ");
            
            $stmt->execute(array($itemId, $categoryId, $name, $description, $price, $sortOrder));
            
            $this->pdo->commit();
            
            return array('success' => true, 'message' => 'Item added successfully', 'item_id' => $itemId);
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Update existing menu item
     */
    public function updateItem($itemId, $name, $description, $price) {
        try {
            $this->pdo->beginTransaction();
            
            // Validate and sanitize input
            $name = MenuValidator::sanitizeName($name);
            $description = MenuValidator::sanitizeDescription($description);
            $price = MenuValidator::validatePrice($price);
            
            if (empty($name)) {
                return array('success' => false, 'message' => 'Item name is required');
            }
            
            // Update item
            $stmt = $this->pdo->prepare("
                UPDATE menu_items 
                SET name = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $stmt->execute(array($name, $description, $price, $itemId));
            
            if ($stmt->rowCount() == 0) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->pdo->commit();
            
            return array('success' => true, 'message' => 'Item updated successfully');
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Toggle item availability
     */
    public function toggleAvailability($itemId) {
        try {
            $this->pdo->beginTransaction();
            
            // Toggle availability
            $stmt = $this->pdo->prepare("
                UPDATE menu_items 
                SET available = CASE WHEN available = 1 THEN 0 ELSE 1 END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $stmt->execute(array($itemId));
            
            if ($stmt->rowCount() == 0) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->pdo->commit();
            
            return array('success' => true, 'message' => 'Item availability updated');
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete menu item
     */
    public function deleteItem($itemId) {
        try {
            $this->pdo->beginTransaction();
            
            // Delete item
            $stmt = $this->pdo->prepare("DELETE FROM menu_items WHERE id = ?");
            $stmt->execute(array($itemId));
            
            if ($stmt->rowCount() == 0) {
                return array('success' => false, 'message' => 'Item not found');
            }
            
            $this->pdo->commit();
            
            return array('success' => true, 'message' => 'Item deleted successfully');
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
        }
    }
    
    /**
     * Get all categories (for dropdown)
     */
    public function getCategories() {
        $stmt = $this->pdo->prepare("
            SELECT id, name, description 
            FROM categories 
            WHERE active = 1 
            ORDER BY sort_order
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    /**
     * Create menu backup
     */
    public function createBackup($versionName = null) {
        try {
            if (!$versionName) {
                $versionName = "Manual backup - " . date('Y-m-d H:i:s');
            }
            
            $menuData = $this->loadMenu();
            
            $stmt = $this->pdo->prepare("
                INSERT INTO menu_versions (version_name, data_snapshot)
                VALUES (?, ?)
            ");
            
            $stmt->execute(array($versionName, json_encode($menuData)));
            
            return array('success' => true, 'message' => 'Backup created successfully');
            
        } catch (Exception $e) {
            return array('success' => false, 'message' => 'Backup failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Get menu statistics
     */
    public function getStatistics() {
        $stats = array();
        
        // Total categories
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM categories WHERE active = 1");
        $stats['categories'] = $stmt->fetchColumn();
        
        // Total items
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM menu_items");
        $stats['total_items'] = $stmt->fetchColumn();
        
        // Available items
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM menu_items WHERE available = 1");
        $stats['available_items'] = $stmt->fetchColumn();
        
        // Items by category
        $stmt = $this->pdo->query("
            SELECT c.name, COUNT(m.id) as count 
            FROM categories c 
            LEFT JOIN menu_items m ON c.id = m.category_id 
            WHERE c.active = 1
            GROUP BY c.id, c.name 
            ORDER BY c.sort_order
        ");
        $stats['by_category'] = $stmt->fetchAll();
        
        return $stats;
    }
}
?> 