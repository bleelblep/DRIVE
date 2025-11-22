# DirectAdmin MySQL Setup Guide for SoapysCloud

This guide will walk you through setting up a MySQL database on DirectAdmin (froge.host) and managing your SoapysCloud database.

---

## Table of Contents
1. [Creating the MySQL Database](#1-creating-the-mysql-database)
2. [Uploading and Running the Schema](#2-uploading-and-running-the-schema)
3. [Importing Your JSON Data](#3-importing-your-json-data)
4. [Configuring the PHP API](#4-configuring-the-php-api)
5. [Switching to MySQL Mode](#5-switching-to-mysql-mode)
6. [Backing Up Your Database](#6-backing-up-your-database)
7. [Restoring a Backup](#7-restoring-a-backup)
8. [Performance Tips](#8-performance-tips)

---

## 1. Creating the MySQL Database

### Step 1: Log into DirectAdmin
- Go to your DirectAdmin control panel (usually `https://yourdomain.com:2222`)
- Enter your username and password

### Step 2: Access MySQL Management
- Click on **"MySQL Management"** (under "Your Account" or "Databases" section)

### Step 3: Create New Database
1. Scroll to the **"Create new database"** section
2. Fill in the following:
   - **Database Name**: `soapyscloud_db` (or your preferred name)
   - **Database User**: Create a new user or use existing
   - **Password**: Use a strong password (save this!)
   - **Confirm Password**: Re-enter the password

3. Click **"Create"**

### Step 4: Note Your Database Credentials
Write down these important details:
```
Database Host: localhost (or your server's hostname)
Database Name: username_soapyscloud_db (DirectAdmin adds your username prefix)
Database User: username_dbuser (DirectAdmin adds your username prefix)
Database Password: [your password]
```

**Important**: DirectAdmin typically prefixes database and user names with your account username!

Example:
- If your DirectAdmin username is `johndoe`
- And you create a database named `soapyscloud_db`
- The full database name will be: `johndoe_soapyscloud_db`

---

## 2. Uploading and Running the Schema

### Option A: Using phpMyAdmin (Easiest)

1. In DirectAdmin, click **"phpMyAdmin"** under MySQL Management
2. Log in with your database credentials
3. Select your database (`username_soapyscloud_db`) from the left sidebar
4. Click the **"SQL"** tab at the top
5. Copy the contents of `soapyscloud-schema.sql`
6. Paste into the SQL query box
7. Click **"Go"** to execute

You should see messages like:
```
✓ Table 'artists' created
✓ Table 'albums' created
✓ Table 'files' created
✓ Table 'metadata' created
```

### Option B: Using File Manager and SSH (Advanced)

1. Upload `soapyscloud-schema.sql` via File Manager
2. Access SSH/Terminal
3. Run:
```bash
mysql -u username_dbuser -p username_soapyscloud_db < soapyscloud-schema.sql
```
4. Enter your password when prompted

---

## 3. Importing Your JSON Data

### Step 1: Update Migration Script
1. Open `database/migrate-json-to-mysql.php`
2. Update these lines (around line 13-16):

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'username_dbuser');  // ← Your full username with prefix
define('DB_PASS', 'your_password_here');
define('DB_NAME', 'username_soapyscloud_db');  // ← Your full database name
```

### Step 2: Upload Files
Upload these files to your web server:
- `database/migrate-json-to-mysql.php` → `/public_html/database/`
- `search-db-soapyscloud.json` → `/public_html/`

### Step 3: Run Migration Script

**Option A: Via Browser** (if your hosting allows PHP execution)
- Navigate to: `https://yourdomain.com/database/migrate-json-to-mysql.php`
- You should see output like:
```
=== SoapysCloud JSON to MySQL Migration ===
✓ JSON loaded successfully
✓ Connected to database
Processing collection: motherland
  ✓ Artist: MOTHERLAND (ID: 1)
...
=== Migration Complete ===
Total Artists: 2
Total Albums: 6
Total Files: 27
```

**Option B: Via SSH/Terminal**
```bash
cd /home/yourusername/domains/yourdomain.com/public_html/database
php migrate-json-to-mysql.php
```

**Security Note**: Delete or move `migrate-json-to-mysql.php` after running to prevent unauthorized access!

---

## 4. Configuring the PHP API

### Step 1: Update API Configuration
1. Open `api/soapyscloud-api.php`
2. Update lines 15-18:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'username_dbuser');  // ← Your database user
define('DB_PASS', 'your_password_here');  // ← Your password
define('DB_NAME', 'username_soapyscloud_db');  // ← Your database name
```

### Step 2: Upload API File
- Upload `api/soapyscloud-api.php` → `/public_html/api/`

### Step 3: Test the API
Visit in your browser:
```
https://yourdomain.com/api/soapyscloud-api.php?action=stats
```

You should see JSON output like:
```json
{
  "success": true,
  "stats": {
    "total_files": 27,
    "total_artists": 2,
    "total_albums": 6,
    ...
  }
}
```

If you see an error, check:
- Database credentials are correct
- File has proper permissions (644)
- PHP is enabled for your account

---

## 5. Switching to MySQL Mode

### Step 1: Update Provider Config
1. Open `provider-config.js`
2. Find the `soapyscloud` configuration (around line 53)
3. Change `useMySQLAPI` to `true`:

```javascript
'soapyscloud': {
    name: 'SoapysCloud',
    apiKey: null,
    searchDatabasePath: '/search-db-soapyscloud.json',
    useMySQLAPI: true,  // ← Change this to true
    apiEndpoint: '/api/soapyscloud-api.php',
    ...
}
```

### Step 2: Clear Browser Cache
- Hard refresh your website (Ctrl+Shift+R or Cmd+Shift+R)
- Or clear browser cache in settings

### Step 3: Verify It's Working
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Reload your page
4. You should see: `"Using MySQL API for SoapysCloud data"`
5. Check Network tab - you should see requests to `soapyscloud-api.php`

---

## 6. Backing Up Your Database

DirectAdmin provides multiple backup methods:

### Method 1: Automatic Backups (DirectAdmin)

1. In DirectAdmin, go to **"Create/Restore Backups"**
2. Click **"Backup your home directory now"**
3. Select **"Backup everything"** or just **"MySQL databases"**
4. Click **"Create Backup"**
5. Backups are stored in `/home/username/backups/`

### Method 2: Manual Export via phpMyAdmin

1. Go to **phpMyAdmin**
2. Select your database (`username_soapyscloud_db`)
3. Click **"Export"** tab at the top
4. Select **"Quick"** export method
5. Format: **SQL**
6. Click **"Go"**
7. Save the `.sql` file to your computer

**Recommended naming**: `soapyscloud_backup_2025-11-22.sql`

### Method 3: SSH/Command Line Export

```bash
# Export entire database
mysqldump -u username_dbuser -p username_soapyscloud_db > soapyscloud_backup_$(date +%Y%m%d).sql

# Export with compression
mysqldump -u username_dbuser -p username_soapyscloud_db | gzip > soapyscloud_backup_$(date +%Y%m%d).sql.gz
```

### Automated Backup Script (Optional)

Create `backup-soapyscloud-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/yourusername/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="username_dbuser"
DB_NAME="username_soapyscloud_db"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p'your_password' $DB_NAME | gzip > $BACKUP_DIR/soapyscloud_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "soapyscloud_*.sql.gz" -mtime +30 -delete

echo "Backup completed: soapyscloud_$DATE.sql.gz"
```

Make it executable:
```bash
chmod +x backup-soapyscloud-db.sh
```

Schedule in cron (daily at 2 AM):
```bash
crontab -e
# Add this line:
0 2 * * * /home/yourusername/backup-soapyscloud-db.sh
```

---

## 7. Restoring a Backup

### Method 1: Via phpMyAdmin

1. Open **phpMyAdmin**
2. Select your database
3. Click **"Import"** tab
4. Click **"Choose File"** and select your `.sql` backup
5. Click **"Go"**
6. Wait for confirmation message

### Method 2: Via SSH/Terminal

```bash
# Restore from SQL file
mysql -u username_dbuser -p username_soapyscloud_db < soapyscloud_backup_20251122.sql

# Restore from compressed file
gunzip < soapyscloud_backup_20251122.sql.gz | mysql -u username_dbuser -p username_soapyscloud_db
```

---

## 8. Performance Tips

### For 1,749+ Files

1. **Enable Query Cache** (ask your host if not enabled)
   - DirectAdmin → MySQL Management → Configuration

2. **Monitor Database Size**
   ```sql
   SELECT
       table_name AS 'Table',
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
   FROM information_schema.TABLES
   WHERE table_schema = 'username_soapyscloud_db'
   ORDER BY (data_length + index_length) DESC;
   ```

3. **Optimize Tables Monthly**
   - In phpMyAdmin: Select all tables → "With selected:" → "Optimize table"
   - Or via SQL:
   ```sql
   OPTIMIZE TABLE artists, albums, files, metadata;
   ```

4. **Use API Pagination** (for very large datasets)
   - Modify the API to add `&limit=100&offset=0` support
   - Load files in batches instead of all at once

### Expected Performance

| Files | JSON Load Time | MySQL API Time | Database Size |
|-------|----------------|----------------|---------------|
| 27    | ~10ms         | ~50ms          | ~50 KB        |
| 500   | ~100ms        | ~80ms          | ~500 KB       |
| 1,749 | ~500ms        | ~120ms         | ~2 MB         |
| 5,000 | ~2s (slow!)   | ~200ms         | ~5 MB         |

MySQL becomes significantly faster than JSON after ~500 files.

---

## Troubleshooting

### "Connection failed" Error
- Check database credentials in both API and migration scripts
- Verify database user has permissions: `SELECT, INSERT, UPDATE, DELETE`
- Make sure database name includes your DirectAdmin username prefix

### "Table doesn't exist" Error
- Re-run the schema file: `soapyscloud-schema.sql`
- Check database is selected in phpMyAdmin

### API Returns Empty Results
- Verify migration script ran successfully
- Check data exists: `SELECT COUNT(*) FROM files;`
- Look at browser console for JavaScript errors

### Slow Performance
- Run `ANALYZE TABLE files;` in phpMyAdmin
- Check if indexes exist: `SHOW INDEX FROM files;`
- Consider upgrading hosting plan for more RAM

---

## Security Best Practices

1. **Never commit database passwords** to version control
2. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
3. **Restrict API access** via `.htaccess` if needed:
   ```apache
   # In /public_html/api/.htaccess
   Order Deny,Allow
   Deny from all
   Allow from yourdomain.com
   ```
4. **Delete migration scripts** after use
5. **Regular backups** (automated daily backups recommended)
6. **Monitor database size** to avoid quota issues

---

## Next Steps

1. ✅ Create MySQL database in DirectAdmin
2. ✅ Run schema file
3. ✅ Import JSON data via migration script
4. ✅ Configure API with database credentials
5. ✅ Test API endpoints
6. ✅ Switch provider-config.js to MySQL mode
7. ✅ Set up automated backups
8. ✅ Delete migration script for security

---

## Support Resources

- **DirectAdmin Documentation**: https://docs.directadmin.com/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **phpMyAdmin Documentation**: https://docs.phpmyadmin.net/

For SoapysCloud-specific issues, check the project repository or contact your developer.

---

**Database successfully set up!** 🎉

Your SoapysCloud database is now optimized for 1,749+ files with fast searching, filtering, and scalability.
