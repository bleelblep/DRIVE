/**
 * Folder Display Name Configuration
 *
 * This file allows you to customize how folder names are displayed in the UI.
 * The actual folder names from SoapysCloud remain unchanged - this only affects
 * what users see in the interface.
 *
 * USAGE:
 * - Add entries in the format: 'original_folder_name': 'Custom Display Name'
 * - If a folder name is not in this mapping, the original name will be shown
 * - You can use any characters including spaces, special characters, emojis
 *
 * EXAMPLES:
 * - 'press_concerts_photoshoots' → 'Press, Concerts & Photoshoots'
 * - '3d_models' → '3D Models'
 * - 'unreleased_tracks' → 'Unreleased Tracks 🎵'
 */

const FOLDER_DISPLAY_NAMES = {
    // ========== MISC COLLECTION ==========
    '3d_models': '3D Models',
    '3d-models': '3D Models',
    'fonts': 'Fonts',
    'documents': 'Documents',

    // ========== MUSIC COLLECTION ==========
    // Artist/album names - add your custom mappings here
    'motherland': 'Motherland',
    'Demo - Misc.': 'Demo - Miscellaneous',
    'music_videos': 'Music Videos',

    // ========== PHOTOS COLLECTION ==========
    // Event names - add your custom mappings here
    // 'artist_name': 'Artist Name',
    'press_concerts_photoshoots': 'Press, Concerts & Photoshoots',

    // ========== VIDEOS COLLECTION ==========
    // Video categories - add your custom mappings here

};

/**
 * Get the display name for a folder
 * @param {string} folderName - The original folder name from the cloud provider
 * @param {string} collectionKey - The collection this folder belongs to (e.g., 'misc', 'music')
 * @returns {string} The display name to show in the UI, or the original name if no mapping exists
 */
function getFolderDisplayName(folderName, collectionKey = '') {
    // First try exact match
    if (FOLDER_DISPLAY_NAMES[folderName]) {
        return FOLDER_DISPLAY_NAMES[folderName];
    }

    // Try collection-specific key (e.g., 'misc_press_concerts_photoshoots')
    const collectionSpecificKey = `${collectionKey}_${folderName}`;
    if (FOLDER_DISPLAY_NAMES[collectionSpecificKey]) {
        return FOLDER_DISPLAY_NAMES[collectionSpecificKey];
    }

    // Fallback: return original folder name unchanged
    return folderName;
}

/**
 * Check if a folder has a custom display name configured
 * @param {string} folderName - The original folder name
 * @returns {boolean} True if a custom display name is configured
 */
function hasCustomDisplayName(folderName) {
    return FOLDER_DISPLAY_NAMES.hasOwnProperty(folderName);
}
