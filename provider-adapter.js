/**
 * Cloud Provider Adapter
 *
 * This abstraction layer provides access to Google Drive API.
 */

class ProviderAdapter {
    constructor(collectionKey = null) {
        this.providerConfig = getProviderConfig();
        this.provider = this.providerConfig.provider;
        this.collectionKey = collectionKey;
        this.isInitialized = false;
    }

    /**
     * Initialize the Google Drive API
     */
    async init() {
        console.log(`Initializing provider: ${this.providerConfig.name}`);
        await this.initGoogleDrive();
        this.isInitialized = true;
    }

    /**
     * Initialize Google Drive API
     */
    async initGoogleDrive() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.providerConfig.apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    });
                    console.log('Google Drive API initialized');
                    resolve();
                } catch (error) {
                    console.error('Error initializing Google Drive API:', error);
                    reject(error);
                }
            });
        });
    }

    /**
     * Load files from a specific folder (uses collection set in constructor)
     * @param {string} folderId - Folder ID to load files from
     * @returns {Promise<Array>} Array of files with type property added
     */
    async loadFilesFromFolder(folderId) {
        if (!this.isInitialized) {
            await this.init();
        }

        if (!this.collectionKey) {
            throw new Error('Collection key not set. Initialize ProviderAdapter with a collection key.');
        }

        try {
            let allLoadedFiles = [];
            let pageToken = null;

            // Paginate through all files in the folder
            do {
                const response = await gapi.client.drive.files.list({
                    q: `'${folderId}' in parents and trashed=false`,
                    fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, size, modifiedTime, iconLink)',
                    pageSize: 1000,
                    orderBy: 'folder,name',
                    pageToken: pageToken,
                });

                allLoadedFiles = allLoadedFiles.concat(response.result.files || []);
                pageToken = response.result.nextPageToken;
            } while (pageToken);

            // Add type property to all files
            return allLoadedFiles.map(file => ({
                ...file,
                type: this.getFileType(file.mimeType)
            }));

        } catch (error) {
            console.error('Error loading files from folder:', error);
            throw error;
        }
    }

    /**
     * Helper to determine file type from mimeType
     */
    getFileType(mimeType) {
        if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'document';
    }

    /**
     * Load files from a collection
     * @param {string} collectionKey - Collection name (music, videos, etc.)
     * @param {string|null} pageToken - Page token for pagination
     */
    async loadFiles(collectionKey, pageToken = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        return await this.loadFilesFromGoogleDrive(collectionKey, pageToken);
    }

    /**
     * Load files from Google Drive API
     */
    async loadFilesFromGoogleDrive(collectionKey, pageToken = null) {
        const collectionConfig = this.providerConfig.collections[collectionKey];
        if (!collectionConfig || !collectionConfig.folderId) {
            throw new Error(`Invalid collection: ${collectionKey}`);
        }

        try {
            const response = await gapi.client.drive.files.list({
                q: `'${collectionConfig.folderId}' in parents and trashed=false`,
                fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, size, modifiedTime, iconLink)',
                pageSize: 1000,
                orderBy: 'folder,name',
                pageToken: pageToken,
            });

            return {
                files: response.result.files || [],
                nextPageToken: response.result.nextPageToken || null,
                provider: 'google-drive'
            };
        } catch (error) {
            console.error('Error loading files from Google Drive:', error);
            return {
                files: [],
                nextPageToken: null,
                provider: 'google-drive',
                error: error.message
            };
        }
    }

    /**
     * Load all files recursively (for search functionality)
     */
    async loadAllFiles() {
        if (!this.isInitialized) {
            await this.init();
        }

        return await this.loadAllFilesFromGoogleDrive();
    }

    /**
     * Load all files from Google Drive (recursive folder traversal)
     */
    async loadAllFilesFromGoogleDrive() {
        const allFiles = [];
        const collections = ['music', 'videos', 'photos', 'interviews', 'misc'];

        for (const collection of collections) {
            const collectionConfig = this.providerConfig.collections[collection];
            if (!collectionConfig || !collectionConfig.folderId) continue;

            const files = await this.loadAllFilesRecursive(collectionConfig.folderId, '', collection);
            allFiles.push(...files);
        }

        return allFiles;
    }

    /**
     * Recursive helper for Google Drive folder traversal
     */
    async loadAllFilesRecursive(folderId, path = '', collection = '') {
        let allFiles = [];
        let pageToken = null;

        do {
            const response = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, size, modifiedTime)',
                pageSize: 1000,
                orderBy: 'folder,name',
                pageToken: pageToken,
            });

            const files = response.result.files || [];

            for (const file of files) {
                const filePath = path ? `${path}/${file.name}` : file.name;

                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    const subFiles = await this.loadAllFilesRecursive(file.id, filePath, collection);
                    allFiles.push(...subFiles);
                } else {
                    allFiles.push({
                        ...file,
                        path: filePath,
                        collection: collection
                    });
                }
            }

            pageToken = response.result.nextPageToken;
        } while (pageToken);

        return allFiles;
    }

    /**
     * Get statistics for Google Drive
     */
    async getStats() {
        if (!this.isInitialized) {
            await this.init();
        }

        // Calculate stats from API
        const allFiles = await this.loadAllFiles();
        const stats = {
            provider: 'google-drive',
            totalFiles: allFiles.length,
            totalSize: allFiles.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0),
            collections: {}
        };

        const collections = ['music', 'videos', 'photos', 'interviews', 'misc'];
        collections.forEach(collection => {
            stats.collections[collection] = allFiles.filter(f => f.collection === collection).length;
        });

        return stats;
    }

    /**
     * Search files across all collections
     */
    async searchFiles(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const allFiles = await this.loadAllFiles();
        const lowerQuery = query.toLowerCase();

        return allFiles.filter(file => {
            const nameMatch = file.name.toLowerCase().includes(lowerQuery);
            const pathMatch = file.path && file.path.toLowerCase().includes(lowerQuery);
            return nameMatch || pathMatch;
        });
    }
}

// Export for use in HTML files
if (typeof window !== 'undefined') {
    window.ProviderAdapter = ProviderAdapter;
}
