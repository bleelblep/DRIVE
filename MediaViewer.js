/**
 * MediaViewer - Reusable media viewer component for collections
 *
 * Supports:
 * - Images (with direct view or Google Drive preview)
 * - Videos (with Plyr player or Google Drive preview)
 * - Audio (with custom handler callback or Google Drive preview)
 * - Documents (with download/open options or Google Drive preview)
 *
 * Requires:
 * - Plyr library for video playback (when using soapyscloud provider)
 * - MediaViewer.css for styling
 */

class MediaViewer {
    constructor(config = {}) {
        this.config = {
            // Provider adapter instance (required)
            providerAdapter: config.providerAdapter,
            // Optional custom audio handler (for collections with custom players)
            onAudioOpen: config.onAudioOpen || null,
            // Modal element IDs
            modalId: config.modalId || 'mediaModal',
            contentId: config.contentId || 'mediaContent',
            downloadToastId: config.downloadToastId || 'downloadToast',
            downloadFileNameId: config.downloadFileNameId || 'downloadFileName',
        };

        this.currentPlayer = null;
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    /**
     * Open media viewer with the specified file
     * @param {Object} file - File object with type, name, webContentLink, webViewLink, etc.
     */
    open(file) {
        const modal = document.getElementById(this.config.modalId);
        const content = document.getElementById(this.config.contentId);

        // Clean up previous player
        if (this.currentPlayer) {
            this.currentPlayer.destroy();
            this.currentPlayer = null;
        }

        content.innerHTML = '';

        // Handle different file types
        if (file.type === 'image') {
            this._renderImage(file, content);
        } else if (file.type === 'video') {
            this._renderVideo(file, content);
        } else if (file.type === 'audio') {
            this._renderAudio(file, content);
            // If audio opened successfully with custom handler, don't show modal
            if (this.config.onAudioOpen && this._isCurrentProvider('soapyscloud')) {
                return;
            }
        } else if (file.type === 'document') {
            this._renderDocument(file, content);
        } else {
            this._renderUnsupported(file, content);
        }

        modal.classList.remove('hidden');
    }

    /**
     * Close the media viewer
     */
    close() {
        const modal = document.getElementById(this.config.modalId);
        const content = document.getElementById(this.config.contentId);

        // Clean up Plyr instance if it exists
        if (this.currentPlayer) {
            this.currentPlayer.destroy();
            this.currentPlayer = null;
        }

        // Stop any playing media by clearing iframe src before removing
        const iframe = content.querySelector('iframe');
        if (iframe) {
            iframe.src = 'about:blank';
        }

        modal.classList.add('hidden');

        // Small delay to ensure video stops before removing
        setTimeout(() => {
            content.innerHTML = '';
        }, 100);
    }

    /**
     * Handle file download
     * @param {string} url - Download URL
     * @param {string} fileName - File name
     */
    handleDownload(url, fileName) {
        const toast = document.getElementById(this.config.downloadToastId);
        const fileNameEl = document.getElementById(this.config.downloadFileNameId);

        if (toast && fileNameEl) {
            fileNameEl.textContent = fileName;
            toast.classList.remove('hidden');
        }

        // Create hidden link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Hide toast after 3 seconds
        if (toast) {
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    /**
     * Check if current provider matches
     */
    _isCurrentProvider(provider) {
        return this.config.providerAdapter &&
               this.config.providerAdapter.provider === provider;
    }

    /**
     * Render image preview
     */
    _renderImage(file, content) {
        if (this._isCurrentProvider('soapyscloud')) {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <img src="${file.webContentLink || file.webViewLink}" alt="${file.name}" class="max-w-full max-h-[70vh] object-contain">
                    ${this._renderActionButtons(file)}
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <iframe
                        src="https://drive.google.com/file/d/${file.id}/preview"
                        class="w-full h-full"
                        style="min-height: 70vh;"
                        allow="autoplay"
                        frameborder="0">
                    </iframe>
                    ${this._renderActionButtons(file, true)}
                    <p class="text-white/70 text-xs mt-3">
                        Note: If image doesn't display, you may need to click Open in Google Drive.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Render video preview with Plyr player
     */
    _renderVideo(file, content) {
        if (this._isCurrentProvider('soapyscloud')) {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <div id="plyrContainer" class="w-full" style="max-width: 1200px;">
                        <video id="plyrVideo" playsinline controls>
                            <source src="${file.webContentLink || file.webViewLink}" type="video/mp4">
                        </video>
                    </div>
                    ${this._renderActionButtons(file)}
                </div>
            `;

            // Initialize Plyr
            setTimeout(() => {
                const video = document.getElementById('plyrVideo');
                if (video && typeof Plyr !== 'undefined') {
                    this.currentPlayer = new Plyr(video, {
                        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
                        settings: ['quality', 'speed'],
                        quality: {
                            default: 720,
                            options: [1080, 720, 480, 360]
                        },
                        speed: {
                            selected: 1,
                            options: [0.5, 0.75, 1, 1.25, 1.5, 2]
                        }
                    });
                }
            }, 100);
        } else {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <iframe
                        src="https://drive.google.com/file/d/${file.id}/preview"
                        class="w-full h-full"
                        style="min-height: 70vh;"
                        allow="autoplay"
                        frameborder="0">
                    </iframe>
                    ${this._renderActionButtons(file, true)}
                    <p class="text-white/70 text-xs mt-3">
                        Note: If video doesn't play, you may need to click Open in Google Drive.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Render audio preview
     */
    _renderAudio(file, content) {
        if (this._isCurrentProvider('soapyscloud') && this.config.onAudioOpen) {
            // Use custom audio handler (e.g., for floating player)
            const songData = {
                name: file.displayName || file.name,
                artist: file.path || 'Unknown Artist',
                url: file.webContentLink || file.webViewLink,
                cover_art_url: file.thumbnailLink || this._getDefaultCoverArt()
            };

            this.config.onAudioOpen(songData);
            // Don't render anything in modal
            return;
        }

        // Use Google Drive iframe for google-drive provider or fallback
        content.innerHTML = `
            <div class="w-full flex flex-col items-center justify-center">
                <iframe
                    src="https://drive.google.com/file/d/${file.id}/preview"
                    class="w-full"
                    style="min-height: 100px; max-height: 150px; height: 150px;"
                    allow="autoplay"
                    frameborder="0">
                </iframe>
                ${this._renderActionButtons(file, true)}
                <p class="text-white/70 text-xs mt-3">
                    Note: If audio doesn't play, you may need to click Open in Google Drive.
                </p>
            </div>
        `;
    }

    /**
     * Render document preview
     */
    _renderDocument(file, content) {
        if (this._isCurrentProvider('soapyscloud')) {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <div class="bg-white/10 rounded-lg p-8 max-w-2xl w-full text-center">
                        <svg class="w-20 h-20 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <h3 class="text-white text-xl font-semibold mb-2">${file.name}</h3>
                        <p class="text-white/70 mb-6">Document preview not available. Download or open to view.</p>
                        <div class="flex gap-3 justify-center">
                            ${this._renderActionButtonsLarge(file)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center" style="min-height: 70vh;">
                    <iframe
                        src="https://drive.google.com/file/d/${file.id}/preview"
                        class="w-full h-full"
                        style="min-height: 70vh;"
                        allow="autoplay"
                        frameborder="0">
                    </iframe>
                    ${this._renderActionButtons(file, true)}
                    <p class="text-white/70 text-xs mt-3">
                        Note: If document doesn't display, you may need to click Open in Google Drive.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Render unsupported file type
     */
    _renderUnsupported(file, content) {
        content.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full text-center">
                <p class="text-gray-600 mb-4">Preview not available for this file type.</p>
                <a href="${file.webViewLink}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Open in Google Drive
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            </div>
        `;
    }

    /**
     * Render action buttons (Open/Download) - small size
     */
    _renderActionButtons(file, isGoogleDrive = false) {
        const openLabel = isGoogleDrive ? 'Open in Google Drive' : 'Open Original';
        return `
            <div class="mt-4 flex gap-3">
                ${file.webViewLink ? `
                    <a href="${file.webViewLink}" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        ${openLabel}
                    </a>
                ` : ''}
                ${file.webContentLink ? `
                    <button onclick='window.mediaViewer.handleDownload("${file.webContentLink}", "${file.name.replace(/'/g, "\\'")}")'
                       class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render action buttons (Open/Download) - large size for document center display
     */
    _renderActionButtonsLarge(file) {
        return `
            ${file.webViewLink ? `
                <a href="${file.webViewLink}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Open Original
                </a>
            ` : ''}
            ${file.webContentLink ? `
                <button onclick='window.mediaViewer.handleDownload("${file.webContentLink}", "${file.name.replace(/'/g, "\\'")}")'
                   class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download
                </button>
            ` : ''}
        `;
    }

    /**
     * Get default cover art for audio files
     */
    _getDefaultCoverArt() {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%239333ea" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" fill="white" font-size="40" text-anchor="middle" dy=".3em"%3E♪%3C/text%3E%3C/svg%3E';
    }
}

/**
 * Helper function to get file type from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - File type (folder, image, video, audio, document)
 */
function getFileType(mimeType) {
    if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
}
