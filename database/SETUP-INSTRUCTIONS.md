# SoapysCloud: Scanning Your Drive & Setting Up MySQL Database

This guide shows you how to **scan your actual files** on domain.com/drive/, save them to a MySQL database, and have GitHub Pages fetch from that database.

---

## Architecture Overview

```
┌─────────────────┐        HTTPS API Call        ┌──────────────────┐
│  GitHub Pages   │ ──────────────────────────> │  domain.com      │
│  (Static Site)  │                              │                  │
│                 │ <────────────────────────── │  PHP API         │
└─────────────────┘        JSON Response         │  ↓               │
                                                  │  MySQL Database  │
                                                  └──────────────────┘
```

**Key Points:**
- GitHub Pages CANNOT access databases directly (static files only)
- Your domain.com hosts the PHP API + MySQL database
- JavaScript on GitHub Pages makes HTTP requests to domain.com/api/
- Users never see the backend - it's all transparent

---

## Step-by-Step Setup

### 1️⃣ Create MySQL Database in DirectAdmin

1. Log into DirectAdmin (usually `https://yourdomain.com:2222`)
2. Click **"MySQL Management"**
3. Create new database:
   - Database Name: `soapyscloud_db`
   - User: Create new or use existing
   - Password: Use strong password and **SAVE IT**
4. DirectAdmin will prefix your username (e.g., `username_soapyscloud_db`)

**Write down these credentials:**
```
DB_HOST: localhost
DB_USER: username_soapyscloud_db   (with your prefix!)
DB_PASS: your_password_here
DB_NAME: username_soapyscloud_db
```

---

### 2️⃣ Upload and Run Database Schema

**Option A: Using phpMyAdmin (Recommended)**
1. In DirectAdmin, click **"phpMyAdmin"**
2. Select your database from left sidebar
3. Click **"SQL"** tab
4. Copy/paste contents of `soapyscloud-schema.sql`
5. Click **"Go"**

You should see:
```
✓ Table 'artists' created
✓ Table 'albums' created
✓ Table 'files' created
✓ Table 'metadata' created
```

---

### 3️⃣ Configure the Scanner Script

Open `database/scan-and-index-drive.php` and update lines 17-24:

```php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'yourusername_soapyscloud_db');  // ← Your full database user
define('DB_PASS', 'your_actual_password');         // ← Your database password
define('DB_NAME', 'yourusername_soapyscloud_db');  // ← Your full database name

// Directory Configuration
define('DRIVE_PATH', '/home/yourusername/public_html/drive/');  // ← Absolute path to drive folder
define('BASE_URL', 'https://yourdomain.com/drive/');            // ← Your domain URL
```

**How to find your absolute path:**
```bash
# In DirectAdmin → File Manager, navigate to /drive/
# Or SSH and run:
pwd
# Example result: /home/yourusername/public_html/drive/
```

---

### 4️⃣ Upload Scanner to Your Server

Upload `scan-and-index-drive.php` to:
```
/public_html/database/scan-and-index-drive.php
```

Using DirectAdmin File Manager or FTP.

---

### 5️⃣ Run the Scanner

**Option A: Via Browser**
Visit: `https://yourdomain.com/database/scan-and-index-drive.php`

**Option B: Via SSH**
```bash
cd /home/yourusername/public_html/database/
php scan-and-index-drive.php
```

You should see output like:
```
=== SoapysCloud Drive Scanner & Indexer ===
✓ Connected to database
✓ Existing data cleared
Scanning drive directory: /home/yourusername/public_html/drive/

  Indexed 100 files...
  Indexed 200 files...
  Indexed 300 files...

=== Indexing Complete ===
Total Artists: 15
Total Albums: 42
Total Files: 362

✓ Database indexing successful!
```

**IMPORTANT:** Delete `scan-and-index-drive.php` after running for security!

---

### 6️⃣ Configure the PHP API

Open `api/soapyscloud-api.php` and update lines 15-18:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'yourusername_soapyscloud_db');  // ← Your database user
define('DB_PASS', 'your_actual_password');         // ← Your password
define('DB_NAME', 'yourusername_soapyscloud_db');  // ← Your database name
```

Upload to: `/public_html/api/soapyscloud-api.php`

---

### 7️⃣ Test the API

Visit in your browser:
```
https://yourdomain.com/api/soapyscloud-api.php?action=stats
```

You should see JSON like:
```json
{
  "success": true,
  "stats": {
    "total_files": 362,
    "total_artists": 15,
    "total_albums": 42,
    "database_version": "2.0.0"
  }
}
```

✅ If you see this, your API is working!

---

### 8️⃣ Update GitHub Pages to Use the API

In your GitHub repository, open `provider-config.js` and find the `soapyscloud` section:

```javascript
'soapyscloud': {
    name: 'SoapysCloud',
    apiKey: null,
    searchDatabasePath: '/search-db-soapyscloud.json',  // ← Old JSON method
    useMySQLAPI: true,                                  // ← Change to true
    apiEndpoint: 'https://yourdomain.com/api/soapyscloud-api.php',  // ← Add your domain
    // ... rest of config
}
```

**Key changes:**
1. `useMySQLAPI: true` - Enable MySQL mode
2. `apiEndpoint: 'https://yourdomain.com/api/soapyscloud-api.php'` - Point to your API

---

### 9️⃣ Deploy to GitHub Pages

1. Commit changes to `provider-config.js`
2. Push to GitHub
3. Wait for GitHub Pages to rebuild (usually 1-2 minutes)

---

### 🔟 Test End-to-End

1. Visit your GitHub Pages site
2. Open browser DevTools (F12) → Console tab
3. Look for: `"Using MySQL API for SoapysCloud data"`
4. Search for files - they should load from your MySQL database!

---

## File Locations Summary

**On domain.com:**
```
/public_html/
├── drive/                          ← Your actual files
├── api/
│   └── soapyscloud-api.php        ← API endpoint (keep this)
└── database/
    ├── scan-and-index-drive.php   ← DELETE after running!
    └── soapyscloud-schema.sql
```

**On GitHub:**
```
your-repo/
└── provider-config.js              ← Update with API endpoint
```

---

## Updating the Index (When You Add New Files)

When you add new files to domain.com/drive/:

1. Upload `scan-and-index-drive.php` again
2. Run it: `https://yourdomain.com/database/scan-and-index-drive.php`
3. Delete it after running
4. Your GitHub Pages site will automatically see the new files!

**Or automate it with a cron job** (see Advanced section below).

---

## Security Checklist

- [ ] Database password is strong (16+ characters)
- [ ] Database credentials NOT in version control
- [ ] `scan-and-index-drive.php` deleted after use
- [ ] API file permissions: `chmod 644 soapyscloud-api.php`
- [ ] Consider IP restricting the API if needed

---

## Advanced: Automated Daily Scanning

Create a cron job to automatically re-index daily:

```bash
# In DirectAdmin → Cron Jobs
# Or crontab -e

# Run daily at 3 AM
0 3 * * * /usr/bin/php /home/yourusername/public_html/database/scan-and-index-drive.php > /dev/null 2>&1
```

This way your database stays in sync with your drive automatically!

---

## Troubleshooting

### "Connection failed"
- Check database credentials in scanner and API files
- Verify DirectAdmin username prefix

### "Directory not found"
- Check `DRIVE_PATH` is correct absolute path
- Use SSH `pwd` command in drive folder to get exact path

### API returns 0 files
- Re-run scanner script
- Check database: `SELECT COUNT(*) FROM files;` in phpMyAdmin

### GitHub Pages shows old data
- Hard refresh (Ctrl+Shift+R)
- Check browser Console for API endpoint URL
- Verify `useMySQLAPI: true` is set

---

## What Happens Behind the Scenes

1. **Scanner runs** → Scans drive/ folder → Stores file info in MySQL
2. **GitHub Pages loads** → JavaScript makes API call to domain.com
3. **API queries database** → Returns JSON with all files
4. **Frontend displays files** → User sees the same interface as before!

The switch is **completely invisible to users** ✨

---

## Need Help?

- Check API directly: `https://yourdomain.com/api/soapyscloud-api.php?action=all`
- View browser Console (F12) for errors
- Check phpMyAdmin → your database → files table to see indexed data

---

**You're all set!** Your GitHub Pages site now dynamically loads files from your MySQL database on domain.com. 🚀
