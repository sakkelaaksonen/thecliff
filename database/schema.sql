-- The Cliff Menu System Database Schema
-- Compatible with SQLite (development) and MySQL (production)
-- No environment-specific modifications needed

-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Dietary restrictions/tags table
CREATE TABLE dietary_restrictions (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10),
    color VARCHAR(7)
);

-- Many-to-many relationship between items and dietary restrictions
CREATE TABLE item_dietary (
    item_id VARCHAR(50),
    dietary_id INTEGER,
    PRIMARY KEY (item_id, dietary_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (dietary_id) REFERENCES dietary_restrictions(id) ON DELETE CASCADE
);

-- Menu versions/history for backup/rollback
CREATE TABLE menu_versions (
    id INTEGER PRIMARY KEY,
    version_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_snapshot TEXT -- JSON backup
);

-- Insert default categories
INSERT INTO categories (id, name, description, sort_order) VALUES
('mains', 'Main Courses', 'Hearty meals to satisfy your appetite', 1),
('sides', 'Sides & Appetizers', 'Perfect starters and accompaniments', 2),
('desserts', 'Desserts', 'Sweet endings to your meal', 3),
('drinks', 'Drinks', 'Beverages and cocktails', 4),
('lunchm', 'Lunch - Monday', 'Monday lunch specials', 10),
('lunchtu', 'Lunch - Tuesday', 'Tuesday lunch specials', 11),
('lunchwe', 'Lunch - Wednesday', 'Wednesday lunch specials', 12),
('lunchth', 'Lunch - Thursday', 'Thursday lunch specials', 13),
('lunchfr', 'Lunch - Friday', 'Friday lunch specials', 14);

-- Insert default dietary restrictions
INSERT INTO dietary_restrictions (name, icon, color) VALUES
('Vegetarian', '🌱', '#4ade80'),
('Vegan', '🌿', '#22c55e'),
('Gluten-Free', '🌾', '#f59e0b'),
('Dairy-Free', '🥛', '#06b6d4'),
('Spicy', '🌶️', '#ef4444'),
('Halal', '☪️', '#8b5cf6'),
('Kosher', '✡️', '#6366f1'); 