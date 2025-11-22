/**
 * Cloud Provider Adapter
 *
 * This abstraction layer makes the cloud storage provider transparent to the frontend.
 * Supports both Google Drive API and SoapysCloud static databases.
 */

class ProviderAdapter {
    constructor(collectionKey = null) {
        this.providerConfig = getProviderConfig();
        this.provider = this.providerConfig.provider;
        this.collectionKey = collectionKey;
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
     * Initialize SoapysCloud (load static database or connect to MySQL API)
     */
    async initSoapysCloud() {
        try {
            // Check if using MySQL API
            if (this.providerConfig.useMySQLAPI) {
                console.log('Using MySQL API for SoapysCloud data');
                try {
                    // Load all files from MySQL API
                    const response = await fetch(`${this.providerConfig.apiEndpoint}?action=all`);
                    if (!response.ok) {
                        throw new Error(`Failed to load from MySQL API: ${response.statusText}`);
                    }
                    const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'API request failed');
                }

                // Transform MySQL API response to match expected format
                // Parse URLs to dynamically build folder hierarchy based on actual structure
                const foldersMap = new Map();
                const transformedFiles = [];

                // Helper function to normalize collection type
                const normalizeCollectionType = (collectionType) => {
                    if (!collectionType) return 'misc';
                    // Map collection_type from API to expected collection names
                    const mapping = {
                        'music_collection': 'music',
                        'photos': 'photos',
                        'misc': 'misc',
                        'videos': 'videos',
                        'interviews': 'interviews'
                    };
                    return mapping[collectionType] || collectionType;
                };

                // Process all files and dynamically create folders from URL paths
                (data.files || []).forEach(file => {
                    const collectionType = normalizeCollectionType(file.album?.collection_type);

                    // Parse URL to get actual folder structure
                    // Example: https://soapyscloud.com/drive/music/motherland/Demo - Misc./01 Intro.mp3
                    // Extract path after /drive/{collection}/
                    const url = file.url;
                    const basePattern = /\/drive\/[^\/]+\/(.+)$/;
                    const match = url.match(basePattern);

                    if (!match) {
                        console.warn('Could not parse URL:', url);
                        return;
                    }

                    // Get the relative path (e.g., "motherland/Demo - Misc./01 Intro.mp3")
                    // Decode the path to handle percent-encoded characters (e.g., %20 for space, %% for %)
                    let relativePath;
                    try {
                        relativePath = decodeURIComponent(match[1]);
                    } catch (e) {
                        // If decoding fails (malformed URI), use the original
                        console.warn('Failed to decode URI component:', match[1], e);
                        relativePath = match[1];
                    }
                    const pathSegments = relativePath.split('/');
                    const fileName = pathSegments[pathSegments.length - 1];
                    const folderSegments = pathSegments.slice(0, -1);

                    // Create folder entries for each folder in the path
                    let currentParentId = `${collectionType}-root`;
                    let currentPath = '';

                    folderSegments.forEach((folderName, index) => {
                        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
                        const folderId = `folder-${collectionType}-${currentPath.replace(/[^a-zA-Z0-9\/]/g, '-')}`;

                        if (!foldersMap.has(folderId)) {
                            // Get display name and category if config functions are available
                            const displayName = typeof getFolderDisplayName === 'function'
                                ? getFolderDisplayName(folderName, collectionType)
                                : folderName;
                            const category = typeof getFileCategory === 'function'
                                ? getFileCategory(folderName, currentPath, true, collectionType)
                                : null;

                            foldersMap.set(folderId, {
                                id: folderId,
                                name: folderName,
                                displayName: displayName,
                                category: category,
                                mimeType: 'application/vnd.google-apps.folder',
                                collection: collectionType,
                                parentId: currentParentId,
                                size: 0,
                                webViewLink: null,
                                webContentLink: null,
                                thumbnailLink: null,
                                modifiedTime: file.created_at,
                                path: currentPath,
                                _isFolder: true
                            });
                        }

                        // Next folder's parent is this folder
                        currentParentId = folderId;
                    });

                    // Convert file_type to mimeType format
                    let mimeType = 'application/octet-stream';
                    if (file.file_type === 'audio') {
                        mimeType = `audio/${file.format || 'mpeg'}`;
                    } else if (file.file_type === 'video') {
                        mimeType = `video/${file.format || 'mp4'}`;
                    } else if (file.file_type === 'image') {
                        mimeType = `image/${file.format || 'jpeg'}`;
                    } else if (file.file_type === 'folder') {
                        mimeType = 'application/vnd.google-apps.folder';
                    } else if (file.file_type === 'text') {
                        mimeType = 'text/plain';
                    }

                    // Get category if config function is available
                    const fileCategory = typeof getFileCategory === 'function'
                        ? getFileCategory(fileName, relativePath, false, collectionType)
                        : null;

                    // Add the file (parent is the deepest folder or collection-root if no folders)
                    transformedFiles.push({
                        id: file.id || file.url,
                        name: fileName,
                        displayName: fileName, // Files use their name as display name
                        category: fileCategory,
                        mimeType: mimeType,
                        collection: collectionType,
                        parentId: currentParentId,
                        size: file.file_size || 0,
                        webViewLink: file.url,
                        webContentLink: file.url,
                        thumbnailLink: null,
                        modifiedTime: file.updated_at || file.created_at,
                        path: relativePath,
                        _original: file
                    });
                });

                // Add all folders to the files array
                foldersMap.forEach(folder => {
                    transformedFiles.push(folder);
                });

                this.soapysCloudData = {
                    metadata: {
                        version: "2.0",
                        provider: "soapyscloud",
                        totalFiles: data.total || 0
                    },
                    files: transformedFiles
                };

                    console.log('SoapysCloud MySQL data loaded:', data.total, 'files');
                } catch (mysqlError) {
                    console.warn('MySQL API failed, falling back to JSON file:', mysqlError.message);
                    // Fall back to JSON file if MySQL API fails
                    const response = await fetch(this.providerConfig.searchDatabasePath);
                    if (!response.ok) {
                        throw new Error(`Failed to load SoapysCloud JSON fallback: ${response.statusText}`);
                    }
                    this.soapysCloudData = await response.json();
                    console.log('SoapysCloud JSON fallback loaded:', this.soapysCloudData.metadata);
                }
            } else {
                // Use traditional JSON file
                console.log('Using JSON file for SoapysCloud data');
                const response = await fetch(this.providerConfig.searchDatabasePath);
                if (!response.ok) {
                    throw new Error(`Failed to load SoapysCloud database: ${response.statusText}`);
                }
                this.soapysCloudData = await response.json();
                console.log('SoapysCloud database loaded:', this.soapysCloudData.metadata);
            }
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

            if (this.provider === 'google-drive') {
                // For Google Drive, paginate through all files in the folder
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

            } else if (this.provider === 'soapyscloud') {
                // For SoapysCloud, filter files by parentId
                if (!this.soapysCloudData) {
                    throw new Error('SoapysCloud database not loaded');
                }

                allLoadedFiles = this.soapysCloudData.files.filter(file => {
                    const matchesCollection = file.collection === this.collectionKey;
                    const matchesFolder = file.parentId === folderId;
                    return matchesCollection && matchesFolder;
                });
            }

            // Add type, displayName, and category properties to all files
            return allLoadedFiles.map(file => {
                const isFolder = this.getFileType(file.mimeType) === 'folder';
                const displayName = file.displayName ||
                    (typeof getFolderDisplayName === 'function' && isFolder
                        ? getFolderDisplayName(file.name, this.collectionKey)
                        : file.name);
                const category = file.category ||
                    (typeof getFileCategory === 'function'
                        ? getFileCategory(file.name, file.path || '', isFolder, this.collectionKey)
                        : null);

                return {
                    ...file,
                    type: this.getFileType(file.mimeType),
                    displayName: displayName,
                    category: category
                };
            });

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
     * Returns a unified response format regardless of provider
     * @param {string} collectionKey - Collection name (music, videos, etc.)
     * @param {string|null} folderIdOrPageToken - For Google Drive: pageToken; For SoapysCloud: folderId
     */
    async loadFiles(collectionKey, folderIdOrPageToken = null) {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.provider === 'google-drive') {
            // For Google Drive, this is a pageToken
            return await this.loadFilesFromGoogleDrive(collectionKey, folderIdOrPageToken);
        } else if (this.provider === 'soapyscloud') {
            // For SoapysCloud, this is a folderId for navigation
            return await this.loadFilesFromSoapysCloud(collectionKey, folderIdOrPageToken);
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
     * Supports folder navigation by filtering based on parentId
     */
    async loadFilesFromSoapysCloud(collectionKey, folderId = null) {
        if (!this.soapysCloudData) {
            throw new Error('SoapysCloud database not loaded');
        }

        // If no folderId specified, use the root folder for this collection
        const targetFolderId = folderId || `${collectionKey}-root`;

        // Filter files by collection and parent folder
        const files = this.soapysCloudData.files.filter(file => {
            const matchesCollection = file.collection === collectionKey;
            const matchesFolder = file.parentId === targetFolderId;
            return matchesCollection && matchesFolder;
        });

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
