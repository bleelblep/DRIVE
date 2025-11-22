# ⚠️ IMPORTANT: Final Configuration Step

After you complete the database setup on domain.com, you need to make ONE change to this repository:

## What to Change

Open `provider-config.js` and update line 59:

### Current (WON'T WORK):
```javascript
apiEndpoint: '/api/soapyscloud-api.php', // ← Relative path - GitHub Pages can't access this!
```

### Change to (WILL WORK):
```javascript
apiEndpoint: 'https://yourdomain.com/api/soapyscloud-api.php', // ← Full URL to your domain!
```

**Replace `yourdomain.com` with your actual domain name.**

---

## Why This is Needed

- **GitHub Pages** is hosted on `username.github.io` (or your custom domain)
- **Your database** is hosted on `yourdomain.com`
- JavaScript needs the **full URL** to make cross-domain API calls
- A relative path like `/api/...` would try to call `username.github.io/api/...` which doesn't exist!

---

## Example Configurations

If your domain is `soapyscloud.com`:
```javascript
apiEndpoint: 'https://soapyscloud.com/api/soapyscloud-api.php',
```

If your domain is `example.com`:
```javascript
apiEndpoint: 'https://example.com/api/soapyscloud-api.php',
```

If using a subdomain like `api.soapyscloud.com`:
```javascript
apiEndpoint: 'https://api.soapyscloud.com/soapyscloud-api.php',
```

---

## How to Verify

After making this change:

1. Commit and push to GitHub
2. Open your GitHub Pages site
3. Open browser Console (F12)
4. Look for: `Using MySQL API for SoapysCloud data`
5. Check Network tab - you should see requests to `yourdomain.com/api/soapyscloud-api.php`
6. Search should work and load files from your database!

---

## Complete Checklist

- [ ] Database created in DirectAdmin
- [ ] Schema imported via phpMyAdmin
- [ ] `scan-and-index-drive.php` configured with database credentials
- [ ] Scanner script run successfully
- [ ] API file `soapyscloud-api.php` uploaded and configured
- [ ] API tested via browser: `https://yourdomain.com/api/soapyscloud-api.php?action=stats`
- [ ] **THIS FILE**: Updated `apiEndpoint` in `provider-config.js` with full domain URL
- [ ] Changes committed and pushed to GitHub
- [ ] GitHub Pages tested and working!

---

That's it! Once you change that one line, everything will work seamlessly. 🚀
