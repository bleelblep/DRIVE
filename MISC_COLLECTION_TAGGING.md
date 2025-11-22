# Misc Collection Category Tagging Guide

## Overview
The misc collection uses a manual tagging system to categorize files and folders into filterable categories. This works for both Google Drive and SoapysCloud providers.

## Available Categories
- **All** - Shows all files (no filter)
- **3D Models** - 3D model files (.obj, .fbx, .stl, .blend, etc.)
- **Fonts** - Font files (.ttf, .otf, .woff, etc.)
- **Documents** - Documents and text files (.pdf, .doc, .txt, etc.)
- **Media** - Photos, videos, and audio files (.jpg, .mp4, .mp3, etc.)

## How It Works

### For SoapysCloud
The system automatically categorizes files based on:
1. **Folder names** - Entire folders can be tagged with a category
2. **File extensions** - Files are auto-categorized based on their extension
3. **Parent folder inheritance** - Files inherit their parent folder's category

### Configuration File
All tagging is done in `folder-category-config.js`

## Adding Custom Tags

### To tag a specific folder:
1. Open `folder-category-config.js`
2. Find the `FOLDER_CATEGORIES` section
3. Add an entry like: `'folder-name': 'category-id'`

Example:
```javascript
const FOLDER_CATEGORIES = {
    // Your custom folders here
    'artwork': 'media',
    'press-kit': 'documents',
    '3d-assets': '3d-models',
    'brand-fonts': 'fonts',
};
```

### To add a file extension:
1. Open `folder-category-config.js`
2. Find the `FILE_EXTENSION_CATEGORIES` section
3. Add an entry like: `'ext': 'category-id'`

Example:
```javascript
const FILE_EXTENSION_CATEGORIES = {
    'zip': 'documents',
    'rar': 'documents',
};
```

## Finding Folder Names on SoapysCloud

To see what folders exist in your misc collection:
1. Visit https://soapyscloud.com/drive/misc/
2. Note the exact folder names (case-sensitive)
3. Add them to `FOLDER_CATEGORIES` with the appropriate category

## Testing Changes

After updating `folder-category-config.js`:
1. Clear your browser cache
2. Reload the misc collection page
3. Click the category filter buttons to verify files appear in the correct categories
4. Check that files without a category still appear under "All"

## Troubleshooting

### Only seeing PNG files or one file type?
- Check if a category filter is accidentally active
- Click "All" to see all files
- Verify the database has files beyond just PNGs

### Files not appearing in expected category?
- Check the folder name spelling (case-sensitive)
- Check the file extension is in `FILE_EXTENSION_CATEGORIES`
- Files without a matching rule will only show under "All"

### Changes not taking effect?
- Clear browser cache and reload
- Check the browser console for JavaScript errors
- Verify `folder-category-config.js` has no syntax errors

## PHP API Notes

The SoapysCloud PHP API (`api/soapyscloud-api.php`) returns files with:
- `url` - The file URL (used to parse folder structure)
- `file_type` - The type of file (audio, video, image, etc.)
- `album.collection_type` - Which collection it belongs to (music, misc, etc.)

The JavaScript code uses this data plus the manual tags to assign categories.
