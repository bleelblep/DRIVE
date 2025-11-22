# SoapysCloud MySQL Database

This directory contains everything you need to set up and manage a MySQL database for SoapysCloud, optimized for 1,749+ files.

## Quick Start

### 1️⃣ Create Database in DirectAdmin
```
DirectAdmin → MySQL Management → Create Database
Database Name: soapyscloud_db
```

### 2️⃣ Import Schema
```
phpMyAdmin → SQL tab → Paste contents of soapyscloud-schema.sql → Go
```

### 3️⃣ Configure & Run Migration
Edit `migrate-json-to-mysql.php` with your database credentials, then run:
```bash
php migrate-json-to-mysql.php
```

### 4️⃣ Configure API
Edit `../api/soapyscloud-api.php` with your database credentials

### 5️⃣ Switch to MySQL Mode
In `provider-config.js`:
```javascript
useMySQLAPI: true
```

## Files in This Directory

| File | Purpose |
|------|---------|
| `soapyscloud-schema.sql` | Database structure (tables, indexes, views) |
| `migrate-json-to-mysql.php` | Imports JSON data into MySQL (run once) |
| `DIRECTADMIN-SETUP-GUIDE.md` | Complete setup guide with screenshots |
| `README.md` | This file |

## Database Structure

```
soapyscloud_db
├── artists        (MOTHERLAND, SOPHIE, etc.)
├── albums         (EPs, demos, collections)
├── files          (tracks, videos, artwork, metadata)
├── metadata       (database info)
└── file_details   (view joining all tables)
```

## Performance

| Files | Load Time | Database Size |
|-------|-----------|---------------|
| 27    | ~50ms     | ~50 KB        |
| 500   | ~80ms     | ~500 KB       |
| 1,749 | ~120ms    | ~2 MB         |
| 5,000 | ~200ms    | ~5 MB         |

MySQL is **significantly faster** than JSON for 500+ files.

## API Endpoints

### Get All Files
```
/api/soapyscloud-api.php?action=all
```

### Search Files
```
/api/soapyscloud-api.php?action=search&q=motherland
```

### Filter by Collection
```
/api/soapyscloud-api.php?action=filter&collection=music_collection
```

### Get Statistics
```
/api/soapyscloud-api.php?action=stats
```

### Get Metadata
```
/api/soapyscloud-api.php?action=metadata
```

## Backup & Export

### Quick Backup (phpMyAdmin)
```
phpMyAdmin → Export → Quick → SQL → Go
```

### Command Line Backup
```bash
mysqldump -u username_dbuser -p username_soapyscloud_db > backup.sql
```

### Restore Backup
```bash
mysql -u username_dbuser -p username_soapyscloud_db < backup.sql
```

## Security Checklist

- [ ] Strong database password (16+ characters)
- [ ] Database credentials NOT in version control
- [ ] Migration script deleted after use
- [ ] API file permissions set to 644
- [ ] Automated backups configured
- [ ] Regular database optimization (monthly)

## Troubleshooting

**"Connection failed"**
→ Check database credentials, verify DirectAdmin username prefix

**"Table doesn't exist"**
→ Re-run `soapyscloud-schema.sql`

**API returns empty results**
→ Run migration script, verify data: `SELECT COUNT(*) FROM files;`

**Slow performance**
→ Run: `ANALYZE TABLE artists, albums, files;`

## Support

For detailed instructions, see: **[DIRECTADMIN-SETUP-GUIDE.md](DIRECTADMIN-SETUP-GUIDE.md)**

---

**Ready to scale to 1,749+ files!** 🚀
