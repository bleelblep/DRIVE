# SoapysCloud Database Automation Guide

## Quick Start

You have **2 automated tools** to generate the database instead of manually adding files:

### 🌐 Option 1: Browser-Based Tool (Easiest)

**File**: `auto-build-soapyscloud-db.html`

1. Open `auto-build-soapyscloud-db.html` in your browser
2. Choose your method:

   **Method A: Parse Directory HTML**
   - Go to your soapysdrive.com directory
   - Right-click → "View Page Source" (or Ctrl+U)
   - Copy the entire HTML
   - Paste into the tool
   - Enter base URL (e.g., `https://soapysdrive.com/drive/music/`)
   - Select collection (music/videos/photos)
   - Click "Parse & Generate Database"

   **Method B: Simple File List**
   - Copy file names from directory (one per line)
   - Paste in the tool
   - Provide URL pattern: `https://soapysdrive.com/drive/music/{filename}`
   - Click "Generate Database"

3. Download the generated `search-db-soapyscloud.json`
4. Replace the existing file

### 🐍 Option 2: Python Script (Advanced)

**File**: `scrape-soapyscloud.py`

**Requirements**: Python 3.6+

**Installation** (if scraping from URL):
```bash
pip install requests beautifulsoup4
```

**Usage**:

```bash
python3 scrape-soapyscloud.py
```

**Interactive prompts**:
1. Choose input method:
   - Option 1: Scrape from URL (requires internet)
   - Option 2: Parse saved HTML file

2. Provide URL or file path

3. Enter collection name (music/videos/photos/interviews/misc)

4. Script generates `search-db-soapyscloud.json`

## Step-by-Step Example

### Example: Scraping Music Directory

1. **Visit**: `https://soapysdrive.com/drive/music/`

2. **Copy the page source**:
   - Press `Ctrl+U` (or Cmd+Option+U on Mac)
   - Select all (`Ctrl+A`)
   - Copy (`Ctrl+C`)

3. **Open**: `auto-build-soapyscloud-db.html` in browser

4. **Paste** HTML in the text area

5. **Enter**:
   - Base URL: `https://soapysdrive.com/drive/music/`
   - Collection: `music`

6. **Click** "Parse & Generate Database"

7. **Review** the results:
   - Check file count
   - Verify URLs are correct
   - Browse the file list

8. **Download** `search-db-soapyscloud.json`

9. **Replace** the existing file in your repository

10. **Done!** All files are now in the database

## Processing Multiple Collections

To build a complete database with all collections:

### Browser Tool Method:

1. **Generate each collection separately**:
   - Music: Parse from `soapysdrive.com/drive/music/`
   - Videos: Parse from `soapysdrive.com/drive/videos/`
   - Photos: Parse from `soapysdrive.com/drive/photos/`

2. **Merge the files arrays**:
   ```javascript
   // Open browser console on auto-build-soapyscloud-db.html
   const musicDB = { /* paste music database */ };
   const videosDB = { /* paste videos database */ };
   const photosDB = { /* paste photos database */ };

   const mergedDB = {
       metadata: {
           version: "1.0",
           provider: "soapyscloud",
           generated: new Date().toISOString(),
           totalFiles: musicDB.files.length + videosDB.files.length + photosDB.files.length,
           totalSize: musicDB.metadata.totalSize + videosDB.metadata.totalSize + photosDB.metadata.totalSize,
           collections: {
               music: musicDB.metadata.collections.music,
               videos: videosDB.metadata.collections.videos,
               photos: photosDB.metadata.collections.photos,
               interviews: 0,
               misc: 0
           }
       },
       files: [...musicDB.files, ...videosDB.files, ...photosDB.files]
   };

   console.log(JSON.stringify(mergedDB, null, 2));
   ```

3. **Copy** the merged JSON and save as `search-db-soapyscloud.json`

### Python Script Method:

Run the script multiple times and manually merge the JSON files:

```bash
# Generate music database
python3 scrape-soapyscloud.py
# Enter music directory details...
# Rename output: mv search-db-soapyscloud.json music-db.json

# Generate videos database
python3 scrape-soapyscloud.py
# Enter videos directory details...
# Rename output: mv search-db-soapyscloud.json videos-db.json

# Merge manually in a text editor or using jq
```

## Handling Nested Folders

If your directory has folders (e.g., albums in music):

### Current Limitation:
Both tools currently place all files at root level with `parentId: "{collection}-root"`

### Manual Fix Required:

After generating the database:

1. **Identify folders** in the generated file list
2. **Update `parentId`** for files inside folders:
   ```json
   {
     "id": "soapys-001",
     "name": "track.mp3",
     "parentId": "soapys-folder-001",  // Change this to match folder's id
     "path": "music/Album Name/track.mp3"  // Update path too
   }
   ```

### Better Approach:
Generate one directory at a time:
- Parse root level → get root files and folders
- Parse each folder separately → assign correct `parentId`
- Merge manually

## Troubleshooting

### "No files found" after parsing

**Cause**: HTML structure doesn't match expected format

**Solution**:
1. Check if the directory listing is actually in the HTML
2. Try "Simple File List" mode instead
3. Look at browser console for errors

### URLs not working

**Cause**: Incorrect base URL or relative paths

**Solution**:
1. Verify base URL ends with `/`
2. Check if directory uses absolute or relative links
3. Test one URL manually to confirm pattern

### Wrong file sizes

**Cause**: Directory doesn't show sizes or format is different

**Solution**:
1. File sizes default to 0 if not detected (this is okay)
2. Sizes are for display only, not critical for functionality
3. Can manually add sizes later if needed

### Duplicate files when merging

**Cause**: Same file parsed twice from different collections

**Solution**:
- Check `id` fields - they must be unique
- Renumber IDs when merging: `soapys-001`, `soapys-002`, etc.

## Tips for Best Results

1. ✅ **Test with one collection first** - Start with music or photos
2. ✅ **Verify URLs are accessible** - Test a few download links
3. ✅ **Keep IDs unique** - When merging, ensure no duplicate IDs
4. ✅ **Backup original database** - Keep `search-db-soapyscloud.json.backup`
5. ✅ **Validate JSON** - Use jsonlint.com before deploying
6. ✅ **Check collections count** - Ensure metadata matches actual files

## Next Steps After Generation

1. **Validate** the JSON:
   ```bash
   python3 -m json.tool search-db-soapyscloud.json > /dev/null
   ```

2. **Test** in browser:
   - Open your website with the new database
   - Navigate to music.html, videos.html, etc.
   - Verify files load correctly
   - Test download links

3. **Commit** changes:
   ```bash
   git add search-db-soapyscloud.json
   git commit -m "Update SoapysCloud database with automated generation"
   git push
   ```

## Alternative: Manual Scripting

If the automated tools don't work for your directory structure, you can write a custom script:

```javascript
// custom-builder.js
const fs = require('fs');

const yourFiles = [
    { name: 'song1.mp3', url: 'https://...', size: 5242880 },
    { name: 'song2.mp3', url: 'https://...', size: 4194304 },
    // ... add all your files
];

// Use the same structure as in auto-build-soapyscloud-db.html
// ... generate database ...

fs.writeFileSync('search-db-soapyscloud.json', JSON.stringify(database, null, 2));
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your directory listing is accessible
3. Try the simple file list mode
4. Post in GitHub issues with example HTML snippet
