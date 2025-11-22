/**
 * Cloud Provider Configuration
 *
 * This file controls which cloud storage provider is used for serving files.
 *
 * SWITCHING PROVIDERS:
 * - Change the ACTIVE_PROVIDER value to 'google-drive' or 'soapyscloud'
 * - No frontend changes needed - the switch is completely transparent
 * - Each provider uses its own database file
 */

// CHANGE THIS VALUE TO SWITCH PROVIDERS
const ACTIVE_PROVIDER = 'soapyscloud'; // Options: 'google-drive', 'soapyscloud'

const PROVIDER_CONFIG = {
    'google-drive': {
        name: 'Google Drive',
        apiKey: 'AIzaSyA8lfUHsneUaeCaZnqA97nfxuE1KmdDbFY',
        searchDatabasePath: '/search-db-googledrive.json',
        collections: {
            music: {
                folderId: '1QTJTb0pBfDEZtEXOx8xKrxQmryMiYUPZ',
                name: 'Music',
                gradientFrom: 'purple-600',
                gradientTo: 'pink-600'
            },
            videos: {
                folderId: '106ou0uHbipb2aBFHSEatwPXaikLps2jv',
                name: 'Videos',
                gradientFrom: 'blue-600',
                gradientTo: 'purple-600'
            },
            photos: {
                folderId: '1CC5zQFYAVtiS9mkpVG_RdYSbcEGHSqJW',
                name: 'Photos',
                gradientFrom: 'green-600',
                gradientTo: 'teal-600'
            },
            interviews: {
                folderId: '12VHCh27m1gwFfdRiPnZpjgkyaS77vHBU',
                name: 'Interviews',
                gradientFrom: 'yellow-600',
                gradientTo: 'orange-600'
            },
            misc: {
                folderId: '1bcWBsGris6-QDetXZapgegUVq8qBkaAo',
                name: 'Misc',
                gradientFrom: 'red-600',
                gradientTo: 'pink-600'
            }
        }
    },
    'soapyscloud': {
        name: 'SoapysCloud',
        apiKey: null, // SoapysCloud uses direct links, no API key needed
        searchDatabasePath: '/search-db-soapyscloud.json',
        collections: {
            music: {
                folderId: null, // SoapysCloud folder structure to be configured
                baseUrl: 'https://soapyscloud.com/music', // Example URL structure
                name: 'Music',
                gradientFrom: 'purple-600',
                gradientTo: 'pink-600'
            },
            videos: {
                folderId: null,
                baseUrl: 'https://soapyscloud.com/videos',
                name: 'Videos',
                gradientFrom: 'blue-600',
                gradientTo: 'purple-600'
            },
            photos: {
                folderId: null,
                baseUrl: 'https://soapyscloud.com/photos',
                name: 'Photos',
                gradientFrom: 'green-600',
                gradientTo: 'teal-600'
            },
            interviews: {
                folderId: null,
                baseUrl: 'https://soapyscloud.com/interviews',
                name: 'Interviews',
                gradientFrom: 'yellow-600',
                gradientTo: 'orange-600'
            },
            misc: {
                folderId: null,
                baseUrl: 'https://soapyscloud.com/misc',
                name: 'Misc',
                gradientFrom: 'red-600',
                gradientTo: 'pink-600'
            }
        }
    }
};

/**
 * Get the current active provider configuration
 */
function getProviderConfig() {
    const config = PROVIDER_CONFIG[ACTIVE_PROVIDER];
    if (!config) {
        console.error(`Invalid provider: ${ACTIVE_PROVIDER}`);
        return PROVIDER_CONFIG['google-drive']; // Fallback to Google Drive
    }
    return {
        ...config,
        provider: ACTIVE_PROVIDER
    };
}

/**
 * Get collection configuration for the active provider
 */
function getCollectionConfig(collectionKey) {
    const providerConfig = getProviderConfig();
    return providerConfig.collections[collectionKey] || null;
}

/**
 * Get the search database path for the active provider
 */
function getSearchDatabasePath() {
    const providerConfig = getProviderConfig();
    return providerConfig.searchDatabasePath;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PROVIDER_CONFIG = PROVIDER_CONFIG;
    window.ACTIVE_PROVIDER = ACTIVE_PROVIDER;
    window.getProviderConfig = getProviderConfig;
    window.getCollectionConfig = getCollectionConfig;
    window.getSearchDatabasePath = getSearchDatabasePath;
}
