<?php
/**
 * SoapysCloud JSON to MySQL Migration Script
 *
 * This script imports the existing search-db-soapyscloud.json
 * into the MySQL database.
 *
 * Run this ONCE after setting up the database schema.
 *
 * Usage: php migrate-json-to-mysql.php
 */

// Configuration (UPDATE THESE VALUES)
define('DB_HOST', 'localhost');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_NAME', 'soapyscloud_db');
define('JSON_FILE', '../search-db-soapyscloud.json');

echo "=== SoapysCloud JSON to MySQL Migration ===\n\n";

// Check if JSON file exists
if (!file_exists(JSON_FILE)) {
    die("ERROR: JSON file not found at " . JSON_FILE . "\n");
}

// Load JSON data
echo "Loading JSON data...\n";
$jsonData = json_decode(file_get_contents(JSON_FILE), true);

if (!$jsonData) {
    die("ERROR: Failed to parse JSON file\n");
}

echo "✓ JSON loaded successfully\n";
echo "  Total collections: " . count($jsonData['collections']) . "\n\n";

// Connect to database
echo "Connecting to MySQL database...\n";
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die("ERROR: Database connection failed: " . $mysqli->connect_error . "\n");
}

$mysqli->set_charset('utf8mb4');
echo "✓ Connected to database\n\n";

// Start transaction
$mysqli->begin_transaction();

try {
    // Clear existing data (optional - remove if you want to keep existing data)
    echo "Clearing existing data...\n";
    $mysqli->query("DELETE FROM files");
    $mysqli->query("DELETE FROM albums");
    $mysqli->query("DELETE FROM artists");
    $mysqli->query("ALTER TABLE artists AUTO_INCREMENT = 1");
    $mysqli->query("ALTER TABLE albums AUTO_INCREMENT = 1");
    $mysqli->query("ALTER TABLE files AUTO_INCREMENT = 1");
    echo "✓ Existing data cleared\n\n";

    // Import artists and collections
    echo "Importing data...\n";

    $totalArtists = 0;
    $totalAlbums = 0;
    $totalFiles = 0;

    // Prepare statements for better performance
    $artistStmt = $mysqli->prepare("INSERT INTO artists (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
    $albumStmt = $mysqli->prepare("INSERT INTO albums (artist_id, title, year, type, collection_type) VALUES (?, ?, ?, ?, ?)");
    $fileStmt = $mysqli->prepare("INSERT INTO files (album_id, artist_id, title, filename, url, format, file_type, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // Process each collection
    foreach ($jsonData['collections'] as $collectionKey => $collection) {
        echo "\nProcessing collection: {$collectionKey}\n";

        $collectionType = $collection['type'] ?? 'misc';
        $artistId = null;

        // Handle artist if present
        if (isset($collection['artist'])) {
            $artistName = $collection['artist'];
            $artistStmt->bind_param('s', $artistName);
            $artistStmt->execute();
            $artistId = $mysqli->insert_id;
            $totalArtists++;
            echo "  ✓ Artist: {$artistName} (ID: {$artistId})\n";
        }

        // Process albums (music collections)
        if (isset($collection['albums'])) {
            foreach ($collection['albums'] as $album) {
                $albumTitle = $album['title'];
                $albumYear = $album['year'] ?? null;
                $albumType = $album['type'] ?? 'album';

                $albumStmt->bind_param('isiss', $artistId, $albumTitle, $albumYear, $albumType, $collectionType);
                $albumStmt->execute();
                $albumId = $mysqli->insert_id;
                $totalAlbums++;

                echo "    Album: {$albumTitle} (ID: {$albumId})\n";

                // Process tracks
                if (isset($album['tracks'])) {
                    foreach ($album['tracks'] as $track) {
                        $title = $track['title'];
                        $filename = $track['filename'];
                        $url = $track['url'];
                        $format = $track['format'] ?? '';
                        $fileType = determineFileType($format);
                        $quality = $track['quality'] ?? 'high';

                        $fileStmt->bind_param('iissssss', $albumId, $artistId, $title, $filename, $url, $format, $fileType, $quality);
                        $fileStmt->execute();
                        $totalFiles++;
                    }
                }

                // Process artwork
                if (isset($album['artwork'])) {
                    foreach ($album['artwork'] as $artwork) {
                        $title = 'Artwork: ' . $artwork['filename'];
                        $filename = $artwork['filename'];
                        $url = $artwork['url'];
                        $format = $artwork['format'] ?? '';
                        $fileType = 'image';
                        $quality = 'high';

                        $fileStmt->bind_param('iissssss', $albumId, $artistId, $title, $filename, $url, $format, $fileType, $quality);
                        $fileStmt->execute();
                        $totalFiles++;
                    }
                }

                // Process metadata files
                if (isset($album['metadata'])) {
                    foreach ($album['metadata'] as $metadata) {
                        $title = 'Info: ' . $metadata['filename'];
                        $filename = $metadata['filename'];
                        $url = $metadata['url'];
                        $format = 'txt';
                        $fileType = 'text';
                        $quality = 'high';

                        $fileStmt->bind_param('iissssss', $albumId, $artistId, $title, $filename, $url, $format, $fileType, $quality);
                        $fileStmt->execute();
                        $totalFiles++;
                    }
                }
            }
        }

        // Process videos
        if (isset($collection['videos'])) {
            // Create a video collection album
            $albumTitle = 'Music Videos';
            $albumType = 'video_collection';

            $albumStmt->bind_param('isiss', $artistId, $albumTitle, $albumYear = null, $albumType, $collectionType);
            $albumStmt->execute();
            $albumId = $mysqli->insert_id;
            $totalAlbums++;

            echo "    Video Collection (ID: {$albumId})\n";

            foreach ($collection['videos'] as $video) {
                // Get or create artist for this video
                $videoArtistId = $artistId;
                if (isset($video['artist']) && $video['artist'] !== ($collection['artist'] ?? '')) {
                    $videoArtistName = $video['artist'];
                    $artistStmt->bind_param('s', $videoArtistName);
                    $artistStmt->execute();
                    $videoArtistId = $mysqli->insert_id;
                }

                $title = $video['title'];
                $filename = $video['filename'];
                $url = $video['url'];
                $format = $video['format'] ?? '';
                $fileType = 'video';
                $quality = 'high';

                $fileStmt->bind_param('iissssss', $albumId, $videoArtistId, $title, $filename, $url, $format, $fileType, $quality);
                $fileStmt->execute();
                $totalFiles++;
            }
        }
    }

    // Update metadata
    echo "\n\nUpdating metadata...\n";
    $mysqli->query("UPDATE metadata SET meta_value = '" . ($jsonData['metadata']['database_version'] ?? '1.0.0') . "' WHERE meta_key = 'database_version'");
    $mysqli->query("UPDATE metadata SET meta_value = '" . ($jsonData['metadata']['source'] ?? '') . "' WHERE meta_key = 'source'");
    $mysqli->query("UPDATE metadata SET meta_value = '{$totalFiles}' WHERE meta_key = 'total_files'");
    $mysqli->query("UPDATE metadata SET meta_value = NOW() WHERE meta_key = 'last_updated'");

    // Commit transaction
    $mysqli->commit();

    echo "✓ Metadata updated\n\n";
    echo "=== Migration Complete ===\n";
    echo "Total Artists: {$totalArtists}\n";
    echo "Total Albums: {$totalAlbums}\n";
    echo "Total Files: {$totalFiles}\n";

} catch (Exception $e) {
    // Rollback on error
    $mysqli->rollback();
    die("ERROR: Migration failed: " . $e->getMessage() . "\n");
}

// Close connection
$mysqli->close();

echo "\nDatabase migration successful!\n";

/**
 * Determine file type from format/extension
 */
function determineFileType($format) {
    $format = strtolower($format);

    $audioFormats = ['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma'];
    $videoFormats = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'ts', 'webm'];
    $imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    $textFormats = ['txt', 'md', 'pdf', 'doc', 'docx'];

    if (in_array($format, $audioFormats)) return 'audio';
    if (in_array($format, $videoFormats)) return 'video';
    if (in_array($format, $imageFormats)) return 'image';
    if (in_array($format, $textFormats)) return 'text';

    return 'other';
}
