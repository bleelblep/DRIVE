# MediaViewer Component

A reusable media viewer component for displaying images, videos, audio, and documents across all collection pages.

## Features

- **Image Viewer**: Direct image display or Google Drive preview
- **Video Player**: Plyr-powered video player with quality/speed controls
- **Audio Support**: Custom audio handler callback (e.g., for floating players)
- **Document Viewer**: Preview or download options
- **Multi-Provider**: Supports both soapyscloud and Google Drive providers
- **Download Handler**: Built-in toast notification for downloads

## Installation

### 1. Include the files in your HTML

```html
<!-- In the <head> section -->
<link rel="stylesheet" href="MediaViewer.css" />

<!-- Before your main script -->
<script src="MediaViewer.js"></script>
```

### 2. Add required HTML elements

```html
<!-- Media Viewer Modal -->
<div id="mediaModal" class="hidden fixed inset-0 bg-black bg-opacity-90 z-[500] flex items-center justify-center p-4">
    <button onclick="closeMediaViewer()" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>
    <div id="mediaContent" class="max-w-7xl max-h-full w-full h-full flex items-center justify-center"></div>
</div>

<!-- Download Toast Notification -->
<div id="downloadToast" class="hidden fixed bottom-32 right-4 md:bottom-28 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 z-[250] max-w-sm border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white">Preparing download...</p>
            <p class="text-sm text-gray-500 dark:text-gray-400" id="downloadFileName"></p>
        </div>
    </div>
</div>
```

### 3. Initialize MediaViewer in your JavaScript

```javascript
// Initialize provider adapter first
let providerAdapter = new ProviderAdapter('your-collection-key');

// Initialize MediaViewer
let mediaViewer = null;

async function init() {
    await providerAdapter.init();

    // Initialize MediaViewer
    mediaViewer = new MediaViewer({
        providerAdapter: providerAdapter,
        // Optional: Custom audio handler for collections with special audio players
        onAudioOpen: customAudioHandler // e.g., loadSong for music collection
    });

    // Make it globally accessible for onclick handlers
    window.mediaViewer = mediaViewer;

    // ... rest of your initialization
}
```

## Usage

### Basic Usage

```javascript
// Open media viewer
function openMediaViewer(file) {
    mediaViewer.open(file);
}

// Close media viewer
function closeMediaViewer() {
    mediaViewer.close();
}

// Handle downloads
function handleDownload(url, fileName) {
    mediaViewer.handleDownload(url, fileName);
}
```

### File Object Format

The `file` object passed to `mediaViewer.open()` should have:

```javascript
{
    type: 'image' | 'video' | 'audio' | 'document' | 'folder',
    name: 'filename.ext',
    id: 'file-id',  // For Google Drive
    webContentLink: 'https://...', // Direct download URL
    webViewLink: 'https://...', // View URL
    thumbnailLink: 'https://...' // Optional thumbnail
}
```

### Custom Audio Handler (Optional)

For collections with custom audio players (like the music collection's floating player):

```javascript
function customAudioHandler(songData) {
    // songData includes: name, artist, url, cover_art_url
    loadSong(songData);
}

mediaViewer = new MediaViewer({
    providerAdapter: providerAdapter,
    onAudioOpen: customAudioHandler
});
```

## Configuration Options

```javascript
new MediaViewer({
    // Required
    providerAdapter: providerAdapter,  // ProviderAdapter instance

    // Optional
    onAudioOpen: function(songData) {}, // Custom audio handler
    modalId: 'mediaModal',              // Modal element ID
    contentId: 'mediaContent',          // Content container ID
    downloadToastId: 'downloadToast',  // Toast notification ID
    downloadFileNameId: 'downloadFileName' // File name display ID
})
```

## Dependencies

- **Plyr** (optional, for video playback): Include Plyr CSS and JS for video player functionality
  ```html
  <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
  <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
  ```

## File Type Detection Helper

The component includes a helper function for detecting file types from MIME types:

```javascript
function getFileType(mimeType) {
    if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
}
```

## Example: Using in a Photos Collection

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="MediaViewer.css" />
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
</head>
<body>
    <!-- Your collection UI here -->

    <!-- Include required HTML elements (modal, toast) -->

    <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
    <script src="MediaViewer.js"></script>
    <script src="provider-adapter.js"></script>

    <script>
        let providerAdapter = new ProviderAdapter('photos');
        let mediaViewer = null;

        async function init() {
            await providerAdapter.init();

            mediaViewer = new MediaViewer({
                providerAdapter: providerAdapter
                // No onAudioOpen needed for photos collection
            });

            window.mediaViewer = mediaViewer;
        }

        function openMediaViewer(file) {
            mediaViewer.open(file);
        }

        function closeMediaViewer() {
            mediaViewer.close();
        }

        init();
    </script>
</body>
</html>
```

## Migration from music.html

The MediaViewer component was extracted from music.html. To migrate other collections:

1. Add MediaViewer.css and MediaViewer.js includes
2. Add the modal and toast HTML elements
3. Initialize MediaViewer in your init function
4. Replace inline media viewer code with calls to `mediaViewer.open(file)`

## Styling

The component uses Tailwind-style classes and supports dark mode. You can customize:

- Modal background: `#mediaModal` class
- Plyr theme colors: See MediaViewer.css for light/dark mode Plyr customizations
- Toast notification positioning: Adjust `bottom-32 right-4` classes

## Browser Support

- Modern browsers with ES6+ support
- Plyr requires browsers that support HTML5 video
- Dark mode detection via `prefers-color-scheme` media query
