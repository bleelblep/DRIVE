# Cloud Provider Switching Guide

## Overview

The Drive archive supports multiple cloud storage providers with seamless switching. This allows you to maintain redundant file sources and switch between them when needed (e.g., when bandwidth limits are reached).

## Supported Providers

1. **Google Drive** - Primary provider using Google Drive API
2. **SoapysCloud** - Alternative provider using static database files

## How It Works

The archive uses a provider abstraction layer that makes cloud storage transparent to the frontend:

- **Single configuration file** (`provider-config.js`) controls which provider is active
- **Separate databases** for each provider to accommodate different directory structures
- **Unified API** ensures the frontend works identically with both providers
- **No frontend changes needed** when switching providers

## Provider Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (HTML Pages)           │
│    (index.html, videos.html, etc.)      │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────▼─────────┐
         │  provider-config.js│
         │  (Switch Provider) │
         └─────────┬──────────┘
                   │
        ┌──────────┴───────────┐
        │                      │
┌───────▼────────┐    ┌────────▼─────────┐
│  Google Drive  │    │   SoapysCloud    │
│  - Live API    │    │  - Static DB     │
│  - search-db-  │    │  - search-db-    │
│    googledrive │    │    soapyscloud   │
│    .json       │    │    .json         │
└────────────────┘    └──────────────────┘
```

## File Structure

```
DRIVE/
├── provider-config.js              # Provider configuration (EDIT THIS TO SWITCH)
├── provider-adapter.js             # Abstraction layer (don't modify)
├── search-db-googledrive.json      # Google Drive database
├── search-db-soapyscloud.json      # SoapysCloud database
├── soapyscloud-database-template.json  # Template for SoapysCloud entries
└── build-search-db.html            # Database builder (provider-aware)
```

## Switching Providers

### Quick Switch (1 minute)

1. **Open** `provider-config.js` in a text editor
2. **Find** line 10:
   ```javascript
   const ACTIVE_PROVIDER = 'google-drive';
   ```
3. **Change** to:
   ```javascript
   const ACTIVE_PROVIDER = 'soapyscloud';
   ```
4. **Save** the file
5. **Reload** the website - it now uses SoapysCloud!

That's it! No other changes needed.

### Detailed Configuration

#### Google Drive Configuration

```javascript
'google-drive': {
    name: 'Google Drive',
    apiKey: 'YOUR_GOOGLE_API_KEY',
    searchDatabasePath: '/search-db-googledrive.json',
    collections: {
        music: {
            folderId: '1QTJTb0pBfDEZtEXOx8xKrxQmryMiYUPZ',
            name: 'Music',
            gradientFrom: 'purple-600',
            gradientTo: 'pink-600'
        },
        // ... other collections
    }
}
```

#### SoapysCloud Configuration

```javascript
'soapyscloud': {
    name: 'SoapysCloud',
    apiKey: null, // No API key needed for static links
    searchDatabasePath: '/search-db-soapyscloud.json',
    collections: {
        music: {
            folderId: null, // Not used for SoapysCloud
            baseUrl: 'https://soapyscloud.com/music',
            name: 'Music',
            gradientFrom: 'purple-600',
            gradientTo: 'pink-600'
        },
        // ... other collections
    }
}
```

## Setting Up SoapysCloud

SoapysCloud uses a static database file instead of a live API. Here's how to set it up:

### 1. Populate the Database

Open `soapyscloud-database-template.json` to see the required format:

```json
{
  "metadata": {
    "version": "1.0",
    "provider": "soapyscloud",
    "generated": "2025-11-22T00:00:00.000Z",
    "totalFiles": 3,
    "totalSize": 15728640,
    "collections": {
      "music": 1,
      "videos": 1,
      "photos": 1
    }
  },
  "files": [
    {
      "id": "soapys-001",
      "name": "example-song.mp3",
      "path": "music/example-song.mp3",
      "collection": "music",
      "type": "audio",
      "mimeType": "audio/mpeg",
      "size": 5242880,
      "thumbnailLink": "https://soapyscloud.com/thumbnails/example-song.jpg",
      "webViewLink": "https://soapyscloud.com/view/example-song.mp3",
      "webContentLink": "https://soapyscloud.com/download/example-song.mp3",
      "modifiedTime": "2025-11-22T00:00:00.000Z"
    }
  ]
}
```

### 2. Database Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier | `"soapys-001"` |
| `name` | File name | `"song.mp3"` |
| `path` | Full path in collection | `"music/folder/song.mp3"` |
| `collection` | Collection category | `"music"`, `"videos"`, `"photos"`, `"interviews"`, `"misc"` |
| `type` | File type | `"audio"`, `"video"`, `"image"`, `"document"`, `"folder"` |
| `mimeType` | MIME type | `"audio/mpeg"`, `"video/mp4"`, `"application/vnd.google-apps.folder"` |
| `size` | File size in bytes | `5242880` (use `0` for folders) |
| `parentId` | **Parent folder ID** (enables browsing) | `"music-root"` for root level, or folder's `id` for nested items |
| `thumbnailLink` | Thumbnail URL | `"https://..."` (or `null`) |
| `webViewLink` | Preview/view URL | `"https://..."` |
| `webContentLink` | Download URL | `"https://..."` |
| `modifiedTime` | Last modified | ISO 8601 timestamp |

**Important for Folder Browsing:**
- Root-level items use `parentId: "{collection}-root"` (e.g., `"music-root"`, `"videos-root"`)
- Items inside folders use `parentId` matching the folder's `id` field
- Folders themselves should have `type: "folder"` and `mimeType: "application/vnd.google-apps.folder"`
- This structure allows the UI to navigate folders exactly like Google Drive

### 3. Create Your Database

**Option A: Manual Entry**

1. Copy `soapyscloud-database-template.json`
2. Replace example entries with your SoapysCloud links
3. Save as `search-db-soapyscloud.json`

**Option B: Script/Automation**

Create a script to generate the JSON from your SoapysCloud file list:

```javascript
// Example: Generate database from file list with folder support
const files = [
  { name: "Album Name", type: "folder", collection: "music", parentId: "music-root" },
  { name: "song1.mp3", url: "https://soapyscloud.com/d/abc123", size: 5242880, collection: "music", parentId: "soapys-folder-001" },
  { name: "song2.mp3", url: "https://soapyscloud.com/d/def456", size: 4194304, collection: "music", parentId: "music-root" },
  // ... more files
];

const database = {
  metadata: {
    version: "1.0",
    provider: "soapyscloud",
    generated: new Date().toISOString(),
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    collections: {} // Calculate counts
  },
  files: files.map((file, index) => ({
    id: `soapys-${file.type === 'folder' ? 'folder-' : ''}${String(index + 1).padStart(3, '0')}`,
    name: file.name,
    path: file.path || file.name,
    collection: file.collection,
    type: file.type || detectType(file.name),
    mimeType: file.type === 'folder' ? 'application/vnd.google-apps.folder' : getMimeType(file.name),
    size: file.size || 0,
    parentId: file.parentId, // IMPORTANT: Include parent folder ID
    thumbnailLink: file.thumbnail || null,
    webViewLink: file.url || null,
    webContentLink: file.url || null,
    modifiedTime: new Date().toISOString()
  }))
};
```

### 4. Update Provider URLs

In `provider-config.js`, update the SoapysCloud `baseUrl` values to match your actual SoapysCloud URLs:

```javascript
music: {
    folderId: null,
    baseUrl: 'https://your-actual-soapyscloud-url.com/music', // UPDATE THIS
    name: 'Music',
    // ...
}
```

## Usage Scenarios

### Scenario 1: Monthly Bandwidth Limit Reached

```
1. SoapysCloud bandwidth exhausted on day 25
2. Open provider-config.js
3. Change ACTIVE_PROVIDER to 'google-drive'
4. Save and reload website
5. Site now serves from Google Drive
```

### Scenario 2: Testing New Provider

```
1. Populate search-db-soapyscloud.json with test files
2. Switch to 'soapyscloud' in provider-config.js
3. Test functionality
4. Switch back to 'google-drive' if issues occur
```

### Scenario 3: Regional Availability

```
1. Google Drive blocked in certain regions
2. Users can switch to 'soapyscloud' locally
3. No server-side changes needed
```

## Important Notes

### For Google Drive
- Requires valid API key in `provider-config.js`
- Fetches files in real-time from Google Drive API
- Supports folder navigation and live updates
- Database file (`search-db-googledrive.json`) is optional (used for global search)

### For SoapysCloud
- No API key required
- All file information must be in `search-db-soapyscloud.json`
- **Supports folder browsing** using `parentId` field in database
- Maintains same UI/UX as Google Drive (users won't notice the difference)
- Database file is **required** and must be complete

### Switching Considerations

1. **Database Sync**: Keep both databases updated with current files
2. **Link Validity**: Ensure SoapysCloud links don't expire
3. **Testing**: Test both providers periodically
4. **User Communication**: Inform users if switching providers
5. **Backup**: Always maintain both databases as backups

## Building Provider Databases

### Building Google Drive Database

1. Open `build-search-db.html` in browser
2. Ensure `ACTIVE_PROVIDER = 'google-drive'` in `provider-config.js`
3. Click "Build Database"
4. Wait for scanning to complete
5. Download `search-db-googledrive.json`
6. Upload to website root

### Building SoapysCloud Database

Since SoapysCloud doesn't have a live API, you'll need to:

1. Export your file list from SoapysCloud
2. Convert to the required JSON format using a script
3. Validate the JSON structure
4. Save as `search-db-soapyscloud.json`
5. Upload to website root

## Troubleshooting

### Problem: Files Not Loading After Switch

**Solution:**
- Verify `ACTIVE_PROVIDER` value is correct
- Check that database file exists at the path specified in `searchDatabasePath`
- Clear browser cache and reload

### Problem: Search Not Working

**Solution:**
- Ensure database file is accessible (check browser network tab)
- Verify JSON is valid (use JSONLint.com)
- Check that `files` array is populated

### Problem: Preview/Download Links Broken

**Solution:**
- For Google Drive: Check API key is valid and not restricted
- For SoapysCloud: Verify URLs in database are correct and active

### Problem: Provider Switch Doesn't Take Effect

**Solution:**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check for JavaScript errors in console

## Advanced: Adding a Third Provider

To add another provider (e.g., Dropbox, OneDrive):

1. **Add configuration** to `provider-config.js`:
   ```javascript
   'dropbox': {
       name: 'Dropbox',
       apiKey: 'YOUR_DROPBOX_KEY',
       searchDatabasePath: '/search-db-dropbox.json',
       collections: { /* ... */ }
   }
   ```

2. **Update `provider-adapter.js`** to handle the new provider's API

3. **Create database file**: `search-db-dropbox.json`

4. **Test thoroughly** before deploying

## Best Practices

1. ✅ **Keep databases synchronized** - Update both when adding files
2. ✅ **Test before switching** - Verify new provider works before going live
3. ✅ **Monitor bandwidth** - Track usage to avoid unexpected outages
4. ✅ **Document changes** - Note when/why you switched providers
5. ✅ **Backup databases** - Keep copies of both database files
6. ✅ **Validate links** - Periodically check that SoapysCloud links work

## Summary

The provider switching system gives you:

- ✨ **Flexibility** - Switch providers instantly when needed
- 🔄 **Redundancy** - Maintain multiple file sources
- 🎯 **Simplicity** - One-line change to switch providers
- 🚀 **Performance** - No frontend impact when switching
- 🔧 **Control** - Full control over which provider serves files

**Remember:** The key file is `provider-config.js` - that's the only file you need to edit to switch providers!
