# Migration Guide: GitHub Pages → froge.host

Complete guide for migrating your DRIVE site from GitHub Pages to froge.host hosting with DirectAdmin.

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [DirectAdmin Setup](#directadmin-setup)
3. [File Upload Methods](#file-upload-methods)
4. [Google Drive API Configuration](#google-drive-api-configuration)
5. [Testing & Verification](#testing--verification)
6. [Post-Migration Tasks](#post-migration-tasks)
7. [Automated Deployment](#automated-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] Access to froge.host DirectAdmin panel
- [ ] FTP/SFTP credentials (get from DirectAdmin)
- [ ] Your domain name pointed to froge.host (DNS configured)
- [ ] Access to Google Cloud Console (for API key updates)
- [ ] Latest code committed to your repository
- [ ] Production CSS built (`npm run build:css`)

---

## DirectAdmin Setup

### Step 1: Access DirectAdmin

1. Log in to your DirectAdmin panel at: `https://froge.host:2222` (or the URL provided by froge.host)
2. Enter your username and password

### Step 2: Locate Your Public Directory

Your website files should be uploaded to one of these directories:
- `/public_html` (most common for primary domain)
- `/domains/yourdomain.com/public_html` (for addon domains)

To verify:
1. In DirectAdmin, go to **File Manager**
2. Look for the `public_html` directory
3. Note the full path for later use

### Step 3: Get FTP Credentials

1. In DirectAdmin, go to **FTP Management** → **FTP Accounts**
2. Either use your main account or create a new FTP account
3. Note down:
   - **FTP Host**: Usually `ftp.yourdomain.com` or `ftp.froge.host`
   - **Username**: Your DirectAdmin username (or FTP username)
   - **Password**: Your password
   - **Port**: 21 (FTP) or 22 (SFTP - more secure)

---

## File Upload Methods

### Method 1: Automated Deployment Script (Recommended)

We've created deployment scripts for you. Choose one:

#### Option A: Standard Script (with embedded credentials)

1. Edit `deploy-ftp.sh`:
   ```bash
   FTP_HOST="ftp.yourdomain.com"   # Update this
   FTP_USER="your-ftp-username"     # Update this
   FTP_PASS="your-ftp-password"     # Update this
   REMOTE_DIR="/public_html"        # Verify this path
   ```

2. Run the script:
   ```bash
   ./deploy-ftp.sh
   ```

#### Option B: Secure Script (using .netrc)

1. Edit `deploy-ftp-secure.sh`:
   ```bash
   FTP_HOST="ftp.yourdomain.com"   # Update this
   FTP_USER="your-ftp-username"     # Update this
   REMOTE_DIR="/public_html"        # Verify this path
   ```

2. Run the script (it will prompt for password on first run):
   ```bash
   ./deploy-ftp-secure.sh
   ```

**Prerequisites:**
- Install `lftp`:
  - Ubuntu/Debian: `sudo apt-get install lftp`
  - macOS: `brew install lftp`
  - Arch: `sudo pacman -S lftp`

### Method 2: DirectAdmin File Manager (Manual Upload)

1. Log in to DirectAdmin
2. Go to **File Manager**
3. Navigate to `public_html`
4. Click **Upload** in the top menu
5. Select all your website files (see checklist below)
6. Wait for upload to complete

**Files to Upload:**
- All `.html` files (index.html, music.html, videos.html, etc.)
- All `.js` files (provider-config.js, provider-adapter.js, darkmode.js, etc.)
- All `.css` files (darkmode.css, transitions.css, etc.)
- `dist/` folder (contains compiled styles.css)
- `images/` folder
- `search-db-googledrive.json`
- `search-db-soapyscloud.json`
- `soapyscloud-database-template.json`
- `folder-category-config.js`

**Files NOT to Upload:**
- `.git/` and `.github/`
- `node_modules/`
- `src/` (source CSS files)
- `.gitignore`, `.gitattributes`
- `package.json`, `package-lock.json`
- `tailwind.config.js`
- `README*.md` files
- Deployment scripts (`deploy-ftp.sh`, etc.)

### Method 3: FTP Client (FileZilla, Cyberduck, etc.)

1. Download an FTP client:
   - [FileZilla](https://filezilla-project.org/) (Windows, Mac, Linux)
   - [Cyberduck](https://cyberduck.io/) (Mac, Windows)
   - [WinSCP](https://winscp.net/) (Windows)

2. Configure connection:
   - **Protocol**: SFTP (preferred) or FTP
   - **Host**: Your FTP hostname
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: 22 (SFTP) or 21 (FTP)

3. Connect and upload files to `/public_html`

---

## Google Drive API Configuration

**CRITICAL STEP:** Your Google Drive API key must be updated to allow your new domain.

### Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Update API Key Restrictions

1. Click on your API key (the one used in your site)
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your new froge.host domain:
     ```
     https://yourdomain.com/*
     https://www.yourdomain.com/*
     ```
   - Keep the existing GitHub Pages URL if you want both to work:
     ```
     https://bleelblep.github.io/DRIVE/*
     ```
   - Keep localhost for development:
     ```
     http://localhost:*
     ```

3. Under **API restrictions**:
   - Select **Restrict key**
   - Ensure only **Google Drive API** is selected

4. Click **Save**

### Step 3: Wait for Propagation

- API key restrictions may take a few minutes to propagate
- If your site doesn't work immediately, wait 5-10 minutes

---

## Testing & Verification

### Test Checklist

After uploading files, test the following:

- [ ] Homepage loads (`https://yourdomain.com`)
- [ ] Navigation works (all menu links)
- [ ] Dark mode toggle works
- [ ] Page transitions are smooth
- [ ] Music page loads files from Google Drive
- [ ] Videos page loads and plays videos
- [ ] Photos page displays images
- [ ] Interviews page works
- [ ] Miscellaneous page works
- [ ] Search functionality works (if applicable)
- [ ] Stats page displays correctly
- [ ] Mobile responsiveness (test on phone)

### Common Issues

**Issue: "Failed to load files" or blank pages**
- **Cause**: Google Drive API key restrictions not updated
- **Fix**: Check Google Cloud Console API restrictions (see above)

**Issue: Styling looks broken**
- **Cause**: CSS file not uploaded or wrong path
- **Fix**: Ensure `dist/styles.css` is uploaded

**Issue: 404 errors**
- **Cause**: Files in wrong directory
- **Fix**: Ensure files are in `/public_html` (or your site's root)

**Issue: Images not loading**
- **Cause**: Relative paths broken
- **Fix**: Verify `images/` folder is uploaded

---

## Post-Migration Tasks

### 1. Update README.md

Update the live demo link in your README:

```markdown
🔗 Visit the website at: [yourdomain.com](https://yourdomain.com)
```

### 2. Update GitHub Pages (Optional)

You can keep GitHub Pages as a backup or redirect:

**Option A: Keep Both Running**
- Maintain both deployments
- Both will work with updated API restrictions

**Option B: Disable GitHub Pages**
1. Go to your GitHub repository settings
2. Navigate to **Pages**
3. Set source to **None**

**Option C: Add Redirect to GitHub Pages**
Create a new `index.html` on GitHub Pages:
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://yourdomain.com">
    <title>Redirecting...</title>
</head>
<body>
    <p>This site has moved to <a href="https://yourdomain.com">yourdomain.com</a></p>
</body>
</html>
```

### 3. Set Up SSL/HTTPS

froge.host should provide SSL certificates automatically via Let's Encrypt:

1. In DirectAdmin, go to **SSL Certificates**
2. If not already enabled, request a Let's Encrypt certificate
3. Ensure "Force SSL/HTTPS" is enabled
4. Test: `https://yourdomain.com` should work

### 4. Update Social Media Links

If you've shared your site on social media or other platforms, update links:
- Update bio links
- Update pinned posts
- Notify community of new URL

---

## Automated Deployment

### Set Up Regular Deployments

For future updates, use the deployment script:

1. Make changes to your site locally
2. Test locally
3. Commit to git (optional - for backup)
4. Run deployment script:
   ```bash
   ./deploy-ftp-secure.sh
   ```

### Workflow Example

```bash
# Make changes
vim index.html

# Build CSS if needed
npm run build:css

# Test locally
# (Open index.html in browser)

# Deploy to froge.host
./deploy-ftp-secure.sh

# Commit to git (backup)
git add .
git commit -m "Update homepage"
git push
```

### Automation Options

**Option 1: Create an alias**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias deploy-drive='cd /path/to/DRIVE && npm run build:css && ./deploy-ftp-secure.sh'
```

**Option 2: CI/CD with GitHub Actions**

If froge.host allows FTP access, you can create a GitHub Action:

```yaml
name: Deploy to froge.host

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build CSS
        run: npm run build:css

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          server-dir: /public_html/
```

Then add secrets to GitHub:
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

---

## Troubleshooting

### Performance Issues

**Slow Load Times**
- Enable gzip compression in DirectAdmin (if available)
- Optimize images before uploading
- Consider using a CDN for static assets

**High Bandwidth Usage**
- Monitor usage in DirectAdmin
- Consider switching to SoapysCloud provider during high traffic
- Implement caching headers

### API Issues

**Quota Exceeded**
- Google Drive API has daily quotas
- Monitor usage in Google Cloud Console
- Consider implementing caching
- Switch to SoapysCloud when needed

**Authentication Errors**
- Verify API key is correct in config files
- Check API restrictions in Google Cloud Console
- Ensure domain is added to allowed referrers
- Wait a few minutes for restrictions to propagate

### DirectAdmin Issues

**Can't Access DirectAdmin**
- Verify URL (usually `https://hostname:2222`)
- Check username/password
- Contact froge.host support

**Files Not Showing**
- Check file permissions (should be 644 for files, 755 for directories)
- Verify correct directory (`public_html`)
- Clear DirectAdmin file manager cache

**FTP Connection Refused**
- Verify FTP is enabled in DirectAdmin
- Check firewall settings
- Try SFTP (port 22) instead of FTP (port 21)
- Contact froge.host support

---

## Support & Resources

### froge.host Support
- Contact froge.host support for hosting-specific issues
- Check their documentation for DirectAdmin guides

### Google Drive API
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)

### Site Documentation
- [API Security Guide](API_SECURITY.md)
- [Cloud Provider Switching](CLOUD_PROVIDER_SWITCHING.md)
- [Smooth Page Transitions](SMOOTH_PAGE_TRANSITIONS_GUIDE.md)

---

## Migration Complete! 🎉

Your site should now be live on froge.host. Don't forget to:

1. ✅ Test all functionality
2. ✅ Update API restrictions
3. ✅ Share new URL
4. ✅ Set up automated deployments
5. ✅ Monitor site performance

**Need help?** Open an issue on GitHub or consult the documentation above.

---

**Made with 💜 for the SOPHIE archive community**
