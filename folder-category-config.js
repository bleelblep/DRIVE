/**
 * Folder and File Category Configuration
 *
 * This file allows you to manually assign categories to folders and files
 * in the misc collection for filtering purposes.
 *
 * AVAILABLE CATEGORIES:
 * - '3d-models' - 3D model files and folders
 * - 'fonts' - Font files and folders
 * - 'documents' - Document files and folders
 * - 'media' - Photos, videos, audio (can add this category if needed)
 * - 'other' - Uncategorized items
 *
 * USAGE:
 * - Add folder paths or names to assign categories to entire folders
 * - Add file extensions to auto-categorize files by type
 * - If a file/folder doesn't match any rule, it will show in 'All'
 */

// Assign categories to specific folder paths or folder names
const FOLDER_CATEGORIES = {
    // ========== BY FOLDER NAME ==========
    // Media folders
    'press_concerts_photoshoots': 'media',
    'photos': 'media',
    'videos': 'media',
    'audio': 'media',
    'images': 'media',
    'Pictures': 'media',
    'Videos': 'media',
    'Audio': 'media',
    'Media': 'media',

    // 3D Model folders
    '3d_models': '3d-models',
    '3d-models': '3d-models',
    '3D Models': '3d-models',
    '3D_Models': '3d-models',
    'models': '3d-models',
    'Models': '3d-models',

    // Font folders
    'fonts': 'fonts',
    'Fonts': 'fonts',
    'typefaces': 'fonts',
    'Typefaces': 'fonts',

    // Document folders
    'documents': 'documents',
    'Documents': 'documents',
    'docs': 'documents',
    'Docs': 'documents',
    'pdfs': 'documents',
    'PDFs': 'documents',
    'text': 'documents',
    'Text': 'documents',

    // ========== BY FOLDER PATH ==========
    // You can also specify full paths relative to misc root
    // Example: 'press_concerts_photoshoots/2024': 'media',

    // ========== SOAPYSCLOUD MISC COLLECTION ==========
    // Add specific folders from https://soapyscloud.com/drive/misc/ here
    // Check the actual folder names on the server and add them below
    // Example entries (update these based on your actual folders):
    // 'artwork': 'media',
    // 'press-kit': 'documents',
    // 'logos': 'media',
    // 'merchandise': 'media',
};

// Auto-categorize files by their extension
const FILE_EXTENSION_CATEGORIES = {
    // 3D Models
    'obj': '3d-models',
    'fbx': '3d-models',
    'stl': '3d-models',
    'blend': '3d-models',
    'dae': '3d-models',
    'gltf': '3d-models',
    'glb': '3d-models',
    '3ds': '3d-models',
    'max': '3d-models',
    'ma': '3d-models',
    'mb': '3d-models',
    'c4d': '3d-models',
    'skp': '3d-models',
    'ply': '3d-models',
    'x3d': '3d-models',
    'collada': '3d-models',

    // Fonts
    'ttf': 'fonts',
    'otf': 'fonts',
    'woff': 'fonts',
    'woff2': 'fonts',
    'eot': 'fonts',
    'fon': 'fonts',
    'fnt': 'fonts',
    'dfont': 'fonts',
    'suit': 'fonts',

    // Documents
    'pdf': 'documents',
    'doc': 'documents',
    'docx': 'documents',
    'txt': 'documents',
    'rtf': 'documents',
    'odt': 'documents',
    'pages': 'documents',
    'md': 'documents',
    'tex': 'documents',
    'xls': 'documents',
    'xlsx': 'documents',
    'ppt': 'documents',
    'pptx': 'documents',
    'key': 'documents',
    'numbers': 'documents',
    'csv': 'documents',
    'json': 'documents',
    'xml': 'documents',
    'log': 'documents',
    'readme': 'documents',

    // Media - Images
    'jpg': 'media',
    'jpeg': 'media',
    'png': 'media',
    'gif': 'media',
    'bmp': 'media',
    'svg': 'media',
    'webp': 'media',
    'tiff': 'media',
    'tif': 'media',
    'ico': 'media',
    'psd': 'media',
    'ai': 'media',
    'eps': 'media',
    'raw': 'media',
    'cr2': 'media',
    'nef': 'media',
    'dng': 'media',
    'heic': 'media',
    'heif': 'media',

    // Media - Videos
    'mp4': 'media',
    'mov': 'media',
    'avi': 'media',
    'mkv': 'media',
    'webm': 'media',
    'flv': 'media',
    'wmv': 'media',
    'mpg': 'media',
    'mpeg': 'media',
    'm4v': 'media',
    '3gp': 'media',
    'ogv': 'media',
    'vob': 'media',
    'mts': 'media',
    'm2ts': 'media',

    // Media - Audio
    'mp3': 'media',
    'wav': 'media',
    'flac': 'media',
    'm4a': 'media',
    'aac': 'media',
    'ogg': 'media',
    'wma': 'media',
    'opus': 'media',
    'ape': 'media',
    'alac': 'media',
    'aiff': 'media',
    'au': 'media',
    'mid': 'media',
    'midi': 'media',
};

/**
 * Get the category for a file or folder
 * @param {string} name - The file or folder name
 * @param {string} path - The full path from the collection root
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {string} The category name, or null if no category assigned
 */
function getFileCategory(name, path = '', isFolder = false) {
    // For folders, check folder categories
    if (isFolder) {
        // Check exact folder name match
        if (FOLDER_CATEGORIES[name]) {
            return FOLDER_CATEGORIES[name];
        }

        // Check full path match
        if (FOLDER_CATEGORIES[path]) {
            return FOLDER_CATEGORIES[path];
        }

        // Check if any parent folder has a category
        const pathParts = path.split('/').filter(p => p);
        for (const part of pathParts) {
            if (FOLDER_CATEGORIES[part]) {
                return FOLDER_CATEGORIES[part];
            }
        }

        return null;
    }

    // For files, check extension
    const extension = name.split('.').pop().toLowerCase();
    if (FILE_EXTENSION_CATEGORIES[extension]) {
        return FILE_EXTENSION_CATEGORIES[extension];
    }

    // Check if the file is in a categorized folder
    const pathParts = path.split('/').filter(p => p);
    for (const part of pathParts) {
        if (FOLDER_CATEGORIES[part]) {
            return FOLDER_CATEGORIES[part];
        }
    }

    return null;
}

/**
 * Get all available categories
 * @returns {Array} Array of category objects with id and display name
 */
function getAvailableCategories() {
    return [
        { id: 'all', name: 'All' },
        { id: '3d-models', name: '3D Models' },
        { id: 'fonts', name: 'Fonts' },
        { id: 'documents', name: 'Documents' },
        { id: 'media', name: 'Media' },
    ];
}
