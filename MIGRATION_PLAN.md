# Migration to SQL Backend - Complete Plan

## 🎯 Overview

This document outlines the migration from JSON-based menu storage to a SQL database backend.

### Current Architecture
- **Data Storage**: `data/menu.json` file
- **API**: `php-src/api/menu.php` (reads JSON)
- **Admin**: `php-src/admin/menu-admin.php` (writes JSON)
- **Frontend**: Fetches from `/api/menu.php`

### Target Architecture
- **Data Storage**: SQLite (dev) / MySQL (production)
- **API**: `php-src/api/menu-sql.php` (queries database)
- **Admin**: Updated to use `MenuManagerSQL` class
- **Frontend**: Same API calls, no changes needed

## 📊 Database Schema

### Tables
```sql
categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

menu_items (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) → categories.id,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(8,2),
    available BOOLEAN,
    sort_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

dietary_restrictions (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50),
    icon VARCHAR(10),
    color VARCHAR(7)
)

item_dietary (
    item_id VARCHAR(50) → menu_items.id,
    dietary_id INTEGER → dietary_restrictions.id
)

menu_versions (
    id INTEGER PRIMARY KEY,
    version_name VARCHAR(100),
    created_at TIMESTAMP,
    data_snapshot TEXT -- JSON backup
)
```

## 🛠️ Migration Steps

### Phase 1: Preparation (Day 1)
1. **Create database schema**
   ```bash
   # Already created: database/schema.sql
   ```

2. **Implement SQL classes**
   - ✅ `DatabaseManager` - Connection handling
   - ✅ `MenuManagerSQL` - CRUD operations
   - ✅ `MenuValidator` - Input validation (reused)

3. **Create migration script**
   ```bash
   # Already created: scripts/json-to-sql-migration.php
   ```

4. **Add NPM scripts**
   ```bash
   npm run db:migrate        # Default (development)
   npm run db:migrate:dev    # Development (SQLite)
   npm run db:migrate:prod   # Production (MySQL)
   npm run db:backup         # Create backup
   ```

### Phase 2: Development Migration (Day 2)
1. **Run development migration**
   ```bash
   npm run db:migrate:dev
   ```

2. **Test SQL API**
   ```bash
   # Test new endpoint
   curl http://localhost:8080/api/menu-sql.php
   ```

3. **Update admin to use SQL**
   - Modify `menu-admin.php` to use `MenuManagerSQL`
   - Test all CRUD operations

4. **Verify data integrity**
   - Compare JSON vs SQL output
   - Test all admin functions

### Phase 3: Production Migration (Day 3)

#### Pre-Migration
1. **Setup MySQL database**
   ```sql
   CREATE DATABASE thecliff_menu;
   CREATE USER 'thecliff_user'@'localhost';
   -- See database/production-setup.md
   ```

2. **Install phpMyAdmin** (optional)
   ```bash
   sudo apt install phpmyadmin
   ```

3. **Set environment variables**
   ```bash
   export DB_HOST=localhost
   export DB_NAME=thecliff_menu
   export DB_USER=thecliff_user  
   export DB_PASS=secure_password
   ```

4. **Backup current system**
   ```bash
   cp data/menu.json data/menu.json.backup
   ```

#### Migration Execution
1. **Run production migration**
   ```bash
   npm run db:migrate:prod
   ```

2. **Verify migration**
   - Check all categories migrated
   - Verify all menu items
   - Test API endpoints

3. **Switch API endpoint**
   - Update configuration to use `menu-sql.php`
   - OR rename files to replace JSON version

4. **Test everything**
   - Frontend menu loading
   - Admin CRUD operations
   - Performance check

### Phase 4: Code Updates

#### Update Admin Files
```php
// php-src/admin/menu-admin.php
require_once __DIR__ . '/menu-manager-sql.php';

// Replace:
$menuManager = new MenuManager();
// With:
$menuManager = new MenuManagerSQL();
```

#### Switch API Endpoint
```php
// Option 1: Replace php-src/api/menu.php content
// Option 2: Update routing to use menu-sql.php
// Option 3: Rename files
```

#### Frontend (No Changes Needed)
- API returns identical JSON structure
- No frontend code changes required
- Same caching behavior

## 🔄 Benefits of Migration

### Performance
- **Faster queries**: SQL indexes vs file reading
- **Concurrent access**: Database handles multiple requests
- **Better caching**: Query-level caching options

### Features  
- **Transaction safety**: ACID compliance
- **Data validation**: Foreign key constraints
- **Backup/versioning**: Built-in backup system
- **Scalability**: Can handle larger menus

### Management
- **phpMyAdmin**: Visual database management
- **SQL tools**: Standard database tools
- **Monitoring**: Database performance metrics
- **Backup automation**: Standard DB backup tools

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Database | SQLite | MySQL |
| Location | `data/menu.db` | Remote MySQL server |
| Management | File-based | phpMyAdmin |
| Backup | File copy | mysqldump |
| Performance | Good | Excellent |
| Concurrent Users | Limited | High |

## ⚠️ Rollback Plan

If migration fails:

1. **Keep JSON backup**
   ```bash
   cp data/menu.json.backup data/menu.json
   ```

2. **Revert API endpoint**
   - Switch back to JSON-based API
   - Revert admin to use JSON MenuManager

3. **Fix issues and retry**
   - Debug database problems
   - Test migration in development
   - Re-run when ready

## 📈 Testing Checklist

### Development Testing
- [ ] Migration script runs successfully
- [ ] All categories migrated correctly
- [ ] All menu items with correct data
- [ ] SQL API returns identical JSON
- [ ] Admin can add/edit/delete items
- [ ] Toggle availability works
- [ ] Frontend displays menu correctly

### Production Testing  
- [ ] MySQL connection works
- [ ] Migration completes without errors
- [ ] Performance acceptable
- [ ] Backup system functional
- [ ] phpMyAdmin access works
- [ ] All admin functions work
- [ ] Frontend performance good

## 🚀 Post-Migration

### Immediate Tasks
- Monitor error logs
- Check performance metrics
- Verify backup automation
- Test under load

### Future Enhancements
- Add dietary restriction management
- Implement menu versioning UI
- Add advanced search/filtering
- Performance optimization
- Audit logging

### Cleanup
- Remove JSON-based files (after confirmation)
- Update documentation
- Archive migration scripts
- Document new procedures

## 📞 Support

### Issues During Migration
1. Check error logs: `/var/log/apache2/error.log`
2. Verify database connection
3. Check environment variables
4. Test with minimal data first

### Key Files
- **Schema**: `database/schema.sql`
- **Migration**: `scripts/json-to-sql-migration.php`
- **SQL Manager**: `php-src/admin/menu-manager-sql.php`
- **SQL API**: `php-src/api/menu-sql.php`
- **Production Setup**: `database/production-setup.md`

This migration provides a solid foundation for future enhancements while maintaining full backward compatibility during the transition. 