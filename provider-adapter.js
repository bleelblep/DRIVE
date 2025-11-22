/**
 * Cloud Provider Adapter
 *
 * This abstraction layer makes the cloud storage provider transparent to the frontend.
 * Supports both Google Drive API and SoapysCloud static databases.
 */

class ProviderAdapter {
    constructor() {
        this.providerConfig = getProviderConfig();
        this.provider = this.providerConfig.provider;
        this.isInitialized = false;
        this.soapysCloudData = null;
    }

    /**
     * Initialize the active provider
     */
    async init() {
        console.log(`Initializing provider: ${this.providerConfig.name}`);

        if (this.provider === 'google-drive') {
            await this.initGoogleDrive();
        } else if (this.provider === 'soapyscloud') {
            await this.initSoapysCloud();
        }

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
     * Initialize SoapysCloud (load static database)
     */
    async initSoapysCloud() {
        try {
            const response = await fetch(this.providerConfig.searchDatabasePath);
            if (!response.ok) {
                throw new Error(`Failed to load SoapysCloud database: ${response.statusText}`);
            }
            this.soapysCloudData = await response.json();
            console.log('SoapysCloud database loaded:', this.soapysCloudData.metadata);
        } catch (error) {
            console.error('Error loading SoapysCloud database:', error);
            // Initialize with empty database
            this.soapysCloudData = {
                metadata: {
                    version: "1.0",
                    provider: "soapyscloud",
                    totalFiles: 0,
                    totalSize: 0,
                    collections: {}
                },
                files: []
            };
        }
    }

    /**
     * Load files from a collection
     * Returns a unified response format regardless of provider
     */
    async loadFiles(collectionKey, pageToken = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.provider === 'google-drive') {
            return await this.loadFilesFromGoogleDrive(collectionKey, pageToken);
        } else if (this.provider === 'soapyscloud') {
            return await this.loadFilesFromSoapysCloud(collectionKey);
        }
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
     * Load files from SoapysCloud static database
     */
    async loadFilesFromSoapysCloud(collectionKey) {
        if (!this.soapysCloudData) {
            throw new Error('SoapysCloud database not loaded');
        }

        // Filter files by collection
        const files = this.soapysCloudData.files.filter(
            file => file.collection === collectionKey
        );

        return {
            files: files,
            nextPageToken: null, // SoapysCloud loads all files at once
            provider: 'soapyscloud'
        };
    }

    /**
     * Load all files recursively (for search functionality)
     */
    async loadAllFiles() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.provider === 'google-drive') {
            return await this.loadAllFilesFromGoogleDrive();
        } else if (this.provider === 'soapyscloud') {
            return this.soapysCloudData.files;
        }
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
     * Get statistics for the active provider
     */
    async getStats() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.provider === 'soapyscloud') {
            return this.soapysCloudData.metadata;
        } else {
            // For Google Drive, calculate stats from API
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
