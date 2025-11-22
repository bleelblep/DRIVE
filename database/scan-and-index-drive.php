<?php
/**
 * SoapysCloud Drive Scanner and Indexer
 *
 * This script scans your domain.com/drive/ directory and indexes
 * all files into the MySQL database.
 *
 * Usage: php scan-and-index-drive.php
 * Or visit: https://yourdomain.com/database/scan-and-index-drive.php
 *
 * IMPORTANT: Delete this file after running for security!
 */

// ============================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'soapyscl_db');           // Your DirectAdmin database user
define('DB_PASS', 'VLnU7nNTt2WkEVnFsvft'); // Your database password
define('DB_NAME', 'soapyscl_db');           // Your database name

// Directory Configuration
define('DRIVE_PATH', '/domains/soapyscloud.com/public_html/drive/'); // Absolute path to your drive folder
define('BASE_URL', 'https://soapyscloud.com/drive/');           // Base URL for file access

// File Type Configuration
define('ALLOWED_EXTENSIONS', [
    // Audio
    'mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma', 'opus',
    // Video
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'ts', 'm4v',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'psd',
    // Documents
    'pdf', 'txt', 'md', 'doc', 'docx', 'rtf', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp',
    // Fonts
    'otf', 'ttf', 'woff', 'woff2',
    // 3D Models
    'obj', 'fbx', 'blend', 'blend1', 'mtl', 'dae', 'stl', 'gltf', 'glb', '3ds', 'max', 'c4d',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'
]);

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

echo "=== SoapysCloud Drive Scanner & Indexer ===\n\n";

// Check if drive directory exists
if (!is_dir(DRIVE_PATH)) {
    die("ERROR: Drive directory not found: " . DRIVE_PATH . "\n");
}

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
    // Clear existing data
    echo "Clearing existing data...\n";
    $mysqli->query("DELETE FROM files");
    $mysqli->query("DELETE FROM albums");
    $mysqli->query("DELETE FROM artists");
    $mysqli->query("ALTER TABLE artists AUTO_INCREMENT = 1");
    $mysqli->query("ALTER TABLE albums AUTO_INCREMENT = 1");
    $mysqli->query("ALTER TABLE files AUTO_INCREMENT = 1");
    echo "✓ Existing data cleared\n\n";

    // Prepare statements
    $artistStmt = $mysqli->prepare("INSERT INTO artists (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
    $albumStmt = $mysqli->prepare("INSERT INTO albums (artist_id, title, collection_type) VALUES (?, ?, ?)");
    $fileStmt = $mysqli->prepare("INSERT INTO files (album_id, artist_id, title, filename, url, format, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // Statistics
    $totalFiles = 0;
    $totalArtists = 0;
    $totalAlbums = 0;
    $artistCache = [];
    $albumCache = [];

    echo "Scanning drive directory: " . DRIVE_PATH . "\n\n";

    // Scan directory recursively
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(DRIVE_PATH, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $file) {
        if (!$file->isFile()) {
            continue;
        }

        // Get file info
        $absolutePath = $file->getPathname();
        $relativePath = str_replace(DRIVE_PATH, '', $absolutePath);
        $filename = $file->getFilename();
        $extension = strtolower($file->getExtension());
        $fileSize = $file->getSize();

        // Skip files not in allowed extensions
        if (!empty(ALLOWED_EXTENSIONS) && !in_array($extension, ALLOWED_EXTENSIONS)) {
            continue;
        }

        // Parse path to determine collection, artist, album
        $pathParts = explode('/', $relativePath);
        $collectionType = determineCollectionType($pathParts[0] ?? 'misc');
        $artistName = null;
        $albumTitle = null;

        // Determine artist and album from path structure
        if (count($pathParts) >= 3) {
            // Format: collection/artist/album/file.mp3
            $artistName = $pathParts[1];
            $albumTitle = $pathParts[2];
        } elseif (count($pathParts) == 2) {
            // Format: collection/album/file.mp3 or collection/file.mp3
            $possibleAlbum = $pathParts[1];
            // If it's a directory name (not the file), treat as album
            if ($possibleAlbum !== $filename) {
                $albumTitle = dirname($relativePath);
            } else {
                $albumTitle = $pathParts[0]; // Use collection as album
            }
        } else {
            $albumTitle = $pathParts[0]; // Root level files
        }

        // Get or create artist
        $artistId = null;
        if ($artistName) {
            if (isset($artistCache[$artistName])) {
                $artistId = $artistCache[$artistName];
            } else {
                $artistStmt->bind_param('s', $artistName);
                $artistStmt->execute();
                $artistId = $mysqli->insert_id ?: $artistStmt->get_result();
                $artistCache[$artistName] = $artistId;
                $totalArtists++;
            }
        }

        // Get or create album
        $albumKey = ($artistId ?? 'noartist') . '::' . $albumTitle;
        if (isset($albumCache[$albumKey])) {
            $albumId = $albumCache[$albumKey];
        } else {
            $albumStmt->bind_param('iss', $artistId, $albumTitle, $collectionType);
            $albumStmt->execute();
            $albumId = $mysqli->insert_id;
            $albumCache[$albumKey] = $albumId;
            $totalAlbums++;
        }

        // Create file URL with proper encoding
        $pathParts = explode('/', $relativePath);
        $encodedParts = array_map('rawurlencode', $pathParts);
        $fileUrl = BASE_URL . implode('/', $encodedParts);

        // Determine file type
        $fileType = determineFileType($extension);

        // Get title from filename (remove extension)
        $title = pathinfo($filename, PATHINFO_FILENAME);

        // Insert file
        $fileStmt->bind_param('iisssssi', $albumId, $artistId, $title, $filename, $fileUrl, $extension, $fileType, $fileSize);
        $fileStmt->execute();
        $totalFiles++;

        // Progress indicator
        if ($totalFiles % 100 == 0) {
            echo "  Indexed {$totalFiles} files...\n";
        }
    }

    // Update metadata
    echo "\n\nUpdating metadata...\n";
    $mysqli->query("UPDATE metadata SET meta_value = '" . $totalFiles . "' WHERE meta_key = 'total_files'");
    $mysqli->query("UPDATE metadata SET meta_value = NOW() WHERE meta_key = 'last_updated'");

    // Commit transaction
    $mysqli->commit();

    echo "✓ Metadata updated\n\n";
    echo "=== Indexing Complete ===\n";
    echo "Total Artists: {$totalArtists}\n";
    echo "Total Albums: {$totalAlbums}\n";
    echo "Total Files: {$totalFiles}\n";

} catch (Exception $e) {
    $mysqli->rollback();
    die("ERROR: Indexing failed: " . $e->getMessage() . "\n");
}

// Close connection
$mysqli->close();

echo "\n✓ Database indexing successful!\n";
echo "\nIMPORTANT: Delete this file for security!\n";

/**
 * Determine collection type from path
 */
function determineCollectionType($pathSegment) {
    $pathSegment = strtolower($pathSegment);

    if (strpos($pathSegment, 'music') !== false) return 'music_collection';
    if (strpos($pathSegment, 'video') !== false) return 'video_collection';
    if (strpos($pathSegment, 'photo') !== false || strpos($pathSegment, 'image') !== false) return 'photos';
    if (strpos($pathSegment, 'interview') !== false) return 'interviews';

    return 'misc';
}

/**
 * Determine file type from extension
 */
function determineFileType($extension) {
    $extension = strtolower($extension);

    $audioFormats = ['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma', 'opus'];
    $videoFormats = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'ts', 'webm', 'm4v'];
    $imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'psd'];
    $documentFormats = ['txt', 'md', 'pdf', 'doc', 'docx', 'rtf', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp'];
    $fontFormats = ['otf', 'ttf', 'woff', 'woff2'];
    $modelFormats = ['obj', 'fbx', 'blend', 'blend1', 'mtl', 'dae', 'stl', 'gltf', 'glb', '3ds', 'max', 'c4d'];
    $archiveFormats = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

    if (in_array($extension, $audioFormats)) return 'audio';
    if (in_array($extension, $videoFormats)) return 'video';
    if (in_array($extension, $imageFormats)) return 'image';
    if (in_array($extension, $documentFormats)) return 'document';
    if (in_array($extension, $fontFormats)) return 'font';
    if (in_array($extension, $modelFormats)) return 'model';
    if (in_array($extension, $archiveFormats)) return 'archive';

    return 'other';
}
