# Production Database Setup

## MySQL Configuration

### 1. Create Database
```sql
CREATE DATABASE thecliff_menu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'thecliff_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON thecliff_menu.* TO 'thecliff_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Variables
Set these environment variables on your production server:

```bash
export DB_HOST=localhost
export DB_NAME=thecliff_menu
export DB_USER=thecliff_user
export DB_PASS=secure_password_here
```

Or add to your web server configuration:
```apache
# Apache .htaccess or VirtualHost
SetEnv DB_HOST localhost
SetEnv DB_NAME thecliff_menu
SetEnv DB_USER thecliff_user
SetEnv DB_PASS secure_password_here
```

### 3. Run Migration
```bash
# On production server
php scripts/json-to-sql-migration.php --environment=production
```

## phpMyAdmin Setup

### 1. Install phpMyAdmin
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install phpmyadmin

# CentOS/RHEL
sudo yum install phpMyAdmin
```

### 2. Configure Web Access
Add to your Apache configuration:
```apache
Alias /phpmyadmin /usr/share/phpmyadmin

<Directory /usr/share/phpmyadmin>
    Options SymLinksIfOwnerMatch
    DirectoryIndex index.php
    
    # Restrict access by IP (replace with your IP)
    <RequireAll>
        Require ip 192.168.1.0/24
        Require ip YOUR_IP_ADDRESS
    </RequireAll>
</Directory>
```

### 3. Secure phpMyAdmin
1. Change the default URL alias
2. Enable HTTPS only
3. Restrict access by IP address
4. Use strong MySQL passwords

## Migration Process

### Pre-Migration Checklist
- [ ] MySQL server running
- [ ] Database and user created
- [ ] Environment variables set
- [ ] Backup existing menu.json
- [ ] Test database connection

### Migration Steps
1. **Backup current data**: `cp data/menu.json data/menu.json.backup`
2. **Run migration**: `npm run db:migrate:prod`
3. **Verify data**: Check all categories and items migrated
4. **Test API**: Ensure `/api/menu-sql.php` works
5. **Update API endpoint**: Switch from `menu.php` to `menu-sql.php`
6. **Test admin interface**: Verify CRUD operations work

### Post-Migration
- [ ] Admin interface functional
- [ ] Frontend displays menu correctly
- [ ] All CRUD operations work
- [ ] Performance acceptable
- [ ] Backup system in place

## Rollback Plan

If migration fails:
1. Keep `menu.json` backup
2. Revert API endpoint to JSON version
3. Investigate and fix database issues
4. Re-run migration when ready

## Performance Optimization

### Database Indexes
```sql
-- Add indexes for better performance
CREATE INDEX idx_category_active ON categories(active);
CREATE INDEX idx_item_category ON menu_items(category_id);
CREATE INDEX idx_item_available ON menu_items(available);
CREATE INDEX idx_item_sort ON menu_items(category_id, sort_order);
```

### Query Optimization
- Use prepared statements (already implemented)
- Enable query caching in MySQL
- Monitor slow query log
- Consider connection pooling for high traffic

## Monitoring

### Database Health
- Monitor disk space
- Check connection limits
- Review slow queries
- Set up backup automation

### Application Monitoring
- API response times
- Database connection errors
- Memory usage
- Error logs 