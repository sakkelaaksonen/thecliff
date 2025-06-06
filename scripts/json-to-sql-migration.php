#!/usr/bin/env php
<?php
/**
 * JSON to SQL Migration Script for The Cliff Menu System
 * Converts existing menu.json to SQL database
 * 
 * Usage:
 *   php scripts/json-to-sql-migration.php
 *   php scripts/json-to-sql-migration.php --environment=development
 *   php scripts/json-to-sql-migration.php --environment=production
 */

// Database configuration
class DatabaseConfig {
    public static function getConfig($environment = 'development') {
        switch ($environment) {
            case 'development':
                return [
                    'type' => 'sqlite',
                    'path' => __DIR__ . '/../data/menu.db'
                ];
            
            case 'production':
                return [
                    'type' => 'mysql',
                    'host' => $_ENV['DB_HOST'] ?? 'localhost',
                    'database' => $_ENV['DB_NAME'] ?? 'thecliff_menu',
                    'username' => $_ENV['DB_USER'] ?? 'root',
                    'password' => $_ENV['DB_PASS'] ?? '',
                    'charset' => 'utf8mb4'
                ];
            
            default:
                throw new Exception("Unknown environment: $environment");
        }
    }
}

class MenuMigration {
    private $pdo;
    private $environment;
    
    public function __construct($environment = 'development') {
        $this->environment = $environment;
        $this->connectDatabase();
    }
    
    private function connectDatabase() {
        $config = DatabaseConfig::getConfig($this->environment);
        
        try {
            if ($config['type'] === 'sqlite') {
                // Ensure data directory exists
                $dataDir = dirname($config['path']);
                if (!is_dir($dataDir)) {
                    mkdir($dataDir, 0755, true);
                }
                
                $this->pdo = new PDO("sqlite:" . $config['path']);
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Enable foreign keys for SQLite
                $this->pdo->exec('PRAGMA foreign_keys = ON');
                
            } else if ($config['type'] === 'mysql') {
                $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
                $this->pdo = new PDO($dsn, $config['username'], $config['password']);
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            
            echo "✅ Connected to {$config['type']} database\n";
            
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function migrate() {
        echo "🚀 Starting migration to {$this->environment} environment\n";
        
        try {
            // Step 1: Create schema
            $this->createSchema();
            
            // Step 2: Load and validate JSON data
            $menuData = $this->loadJsonData();
            
            // Step 3: Migrate categories
            $this->migrateCategories($menuData);
            
            // Step 4: Migrate menu items
            $this->migrateMenuItems($menuData);
            
            // Step 5: Create backup
            $this->createBackup($menuData);
            
            echo "✅ Migration completed successfully!\n";
            echo "📊 Database summary:\n";
            $this->showMigrationSummary();
            
        } catch (Exception $e) {
            echo "❌ Migration failed: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    private function createSchema() {
        echo "📋 Creating database schema...\n";
        
        $schemaFile = __DIR__ . '/../database/schema.sql';
        if (!file_exists($schemaFile)) {
            throw new Exception("Schema file not found: $schemaFile");
        }
        
        $schema = file_get_contents($schemaFile);
        
        // Execute schema (split by semicolon and execute each statement)
        $statements = array_filter(array_map('trim', explode(';', $schema)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                try {
                    $this->pdo->exec($statement);
                } catch (PDOException $e) {
                    // Ignore "table already exists" errors
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        throw $e;
                    }
                }
            }
        }
        
        echo "✅ Schema created\n";
    }
    
    private function loadJsonData() {
        echo "📄 Loading menu.json data...\n";
        
        $jsonFile = __DIR__ . '/../data/menu.json';
        if (!file_exists($jsonFile)) {
            throw new Exception("Menu JSON file not found: $jsonFile");
        }
        
        $jsonContent = file_get_contents($jsonFile);
        $menuData = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        if (!isset($menuData['categories']) || !is_array($menuData['categories'])) {
            throw new Exception("Invalid menu structure: missing categories");
        }
        
        echo "✅ JSON data loaded (" . count($menuData['categories']) . " categories)\n";
        return $menuData;
    }
    
    private function migrateCategories($menuData) {
        echo "📂 Migrating categories...\n";
        
        // Clear existing categories (cascade will handle items)
        $this->pdo->exec("DELETE FROM categories");
        
        $stmt = $this->pdo->prepare("
            INSERT INTO categories (id, name, description, sort_order, active) 
            VALUES (?, ?, ?, ?, 1)
        ");
        
        $sortOrder = 1;
        foreach ($menuData['categories'] as $category) {
            $description = isset($category['description']) ? $category['description'] : null;
            
            $stmt->execute([
                $category['id'],
                $category['name'],
                $description,
                $sortOrder++
            ]);
        }
        
        echo "✅ Migrated " . count($menuData['categories']) . " categories\n";
    }
    
    private function migrateMenuItems($menuData) {
        echo "🍽️  Migrating menu items...\n";
        
        $stmt = $this->pdo->prepare("
            INSERT INTO menu_items (id, category_id, name, description, price, available, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $totalItems = 0;
        
        foreach ($menuData['categories'] as $category) {
            if (!isset($category['items']) || !is_array($category['items'])) {
                continue;
            }
            
            $sortOrder = 1;
            foreach ($category['items'] as $item) {
                $available = isset($item['available']) ? ($item['available'] ? 1 : 0) : 1;
                
                $stmt->execute([
                    $item['id'],
                    $category['id'],
                    $item['name'],
                    $item['description'] ?? null,
                    $item['price'],
                    $available,
                    $sortOrder++
                ]);
                
                $totalItems++;
                
                // Handle dietary restrictions if present
                if (isset($item['dietary']) && is_array($item['dietary']) && !empty($item['dietary'])) {
                    $this->migrateDietaryRestrictions($item['id'], $item['dietary']);
                }
            }
        }
        
        echo "✅ Migrated $totalItems menu items\n";
    }
    
    private function migrateDietaryRestrictions($itemId, $dietaryArray) {
        // This is a placeholder - dietary restrictions would need to be mapped
        // For now, we'll skip this as the current JSON doesn't have detailed dietary info
    }
    
    private function createBackup($menuData) {
        echo "💾 Creating backup...\n";
        
        $stmt = $this->pdo->prepare("
            INSERT INTO menu_versions (version_name, data_snapshot)
            VALUES (?, ?)
        ");
        
        $versionName = "Migration from JSON - " . date('Y-m-d H:i:s');
        $stmt->execute([$versionName, json_encode($menuData)]);
        
        echo "✅ Backup created\n";
    }
    
    private function showMigrationSummary() {
        $categories = $this->pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        $items = $this->pdo->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
        $available = $this->pdo->query("SELECT COUNT(*) FROM menu_items WHERE available = 1")->fetchColumn();
        
        echo "   📂 Categories: $categories\n";
        echo "   🍽️  Total items: $items\n";
        echo "   ✅ Available items: $available\n";
        echo "   ❌ Unavailable items: " . ($items - $available) . "\n";
    }
    
    public function testDatabase() {
        echo "🧪 Testing database connection and basic queries...\n";
        
        try {
            // Test categories
            $categories = $this->pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
            echo "✅ Categories table: $categories records\n";
            
            // Test menu items
            $items = $this->pdo->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
            echo "✅ Menu items table: $items records\n";
            
            // Test join query
            $result = $this->pdo->query("
                SELECT c.name as category, COUNT(m.id) as item_count 
                FROM categories c 
                LEFT JOIN menu_items m ON c.id = m.category_id 
                GROUP BY c.id, c.name
                ORDER BY c.sort_order
            ");
            
            echo "📊 Category breakdown:\n";
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                echo "   {$row['category']}: {$row['item_count']} items\n";
            }
            
        } catch (Exception $e) {
            echo "❌ Database test failed: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
}

// Main execution
try {
    // Parse command line arguments
    $environment = 'development';
    
    if (isset($argv[1])) {
        if (strpos($argv[1], '--environment=') === 0) {
            $environment = substr($argv[1], 14);
        }
    }
    
    echo "🏗️  The Cliff Menu Migration Tool\n";
    echo "================================\n";
    echo "Environment: $environment\n\n";
    
    $migration = new MenuMigration($environment);
    
    // Run migration
    $migration->migrate();
    
    // Test the database
    echo "\n";
    $migration->testDatabase();
    
    echo "\n🎉 Migration completed successfully!\n";
    echo "You can now update your application to use the SQL database.\n";
    
} catch (Exception $e) {
    echo "\n💥 Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?> 