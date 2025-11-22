<?php
/**
 * SoapysCloud Database API
 * Handles MySQL queries and returns JSON responses
 *
 * Usage:
 * - /api/soapyscloud-api.php?action=all - Get all files
 * - /api/soapyscloud-api.php?action=search&q=query - Search files
 * - /api/soapyscloud-api.php?action=filter&collection=music - Filter by collection
 * - /api/soapyscloud-api.php?action=stats - Get database statistics
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to user
ini_set('log_errors', 1);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Adjust in production

// Database configuration (UPDATE THESE VALUES)
define('DB_HOST', 'localhost');
define('DB_USER', 'soapyscl_db');
define('DB_PASS', 'VLnU7nNTt2WkEVnFsvft');
define('DB_NAME', 'soapyscl_db');

// Connect to database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed'
    ]);
    exit;
}

// Set charset to UTF-8
$mysqli->set_charset('utf8mb4');

// Get action parameter
$action = $_GET['action'] ?? 'all';

// Route to appropriate handler
switch ($action) {
    case 'all':
        getAllFiles($mysqli);
        break;

    case 'search':
        searchFiles($mysqli);
        break;

    case 'filter':
        filterFiles($mysqli);
        break;

    case 'stats':
        getStats($mysqli);
        break;

    case 'metadata':
        getMetadata($mysqli);
        break;

    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
        break;
}

// Close database connection
$mysqli->close();

/**
 * Get all files with artist and album information
 */
function getAllFiles($mysqli) {
    $query = "SELECT * FROM file_details ORDER BY artist_name, album_year, album_title, title";

    $result = $mysqli->query($query);

    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Query failed'
        ]);
        return;
    }

    $files = [];
    while ($row = $result->fetch_assoc()) {
        $files[] = formatFileRow($row);
    }

    echo json_encode([
        'success' => true,
        'total' => count($files),
        'files' => $files
    ]);
}

/**
 * Search files by title or filename using FULLTEXT search
 */
function searchFiles($mysqli) {
    $query = $_GET['q'] ?? '';

    if (empty($query)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Search query required'
        ]);
        return;
    }

    // Prepare statement to prevent SQL injection
    $stmt = $mysqli->prepare("
        SELECT * FROM file_details
        WHERE MATCH(title, filename) AGAINST(? IN NATURAL LANGUAGE MODE)
        OR title LIKE ? OR filename LIKE ?
        ORDER BY artist_name, album_title, title
        LIMIT 500
    ");

    $likeQuery = '%' . $query . '%';
    $stmt->bind_param('sss', $query, $likeQuery, $likeQuery);
    $stmt->execute();
    $result = $stmt->get_result();

    $files = [];
    while ($row = $result->fetch_assoc()) {
        $files[] = formatFileRow($row);
    }

    echo json_encode([
        'success' => true,
        'query' => $query,
        'total' => count($files),
        'files' => $files
    ]);
}

/**
 * Filter files by collection, format, type, artist, etc.
 */
function filterFiles($mysqli) {
    $conditions = [];
    $params = [];
    $types = '';

    // Build WHERE clause based on parameters
    if (isset($_GET['collection'])) {
        $conditions[] = 'collection_type = ?';
        $params[] = $_GET['collection'];
        $types .= 's';
    }

    if (isset($_GET['format'])) {
        $conditions[] = 'format = ?';
        $params[] = $_GET['format'];
        $types .= 's';
    }

    if (isset($_GET['file_type'])) {
        $conditions[] = 'file_type = ?';
        $params[] = $_GET['file_type'];
        $types .= 's';
    }

    if (isset($_GET['artist'])) {
        $conditions[] = 'artist_name = ?';
        $params[] = $_GET['artist'];
        $types .= 's';
    }

    if (isset($_GET['year'])) {
        $conditions[] = 'album_year = ?';
        $params[] = intval($_GET['year']);
        $types .= 'i';
    }

    // Build query
    $query = "SELECT * FROM file_details";

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }

    $query .= " ORDER BY artist_name, album_year, album_title, title LIMIT 1000";

    // Execute prepared statement
    if (!empty($params)) {
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $mysqli->query($query);
    }

    $files = [];
    while ($row = $result->fetch_assoc()) {
        $files[] = formatFileRow($row);
    }

    echo json_encode([
        'success' => true,
        'filters' => $_GET,
        'total' => count($files),
        'files' => $files
    ]);
}

/**
 * Get database statistics
 */
function getStats($mysqli) {
    // Get counts by type
    $stats = [
        'total_files' => 0,
        'total_artists' => 0,
        'total_albums' => 0,
        'by_format' => [],
        'by_type' => [],
        'by_artist' => []
    ];

    // Total files
    $result = $mysqli->query("SELECT COUNT(*) as count FROM files");
    $stats['total_files'] = $result->fetch_assoc()['count'];

    // Total artists
    $result = $mysqli->query("SELECT COUNT(*) as count FROM artists");
    $stats['total_artists'] = $result->fetch_assoc()['count'];

    // Total albums
    $result = $mysqli->query("SELECT COUNT(*) as count FROM albums");
    $stats['total_albums'] = $result->fetch_assoc()['count'];

    // By format
    $result = $mysqli->query("SELECT format, COUNT(*) as count FROM files GROUP BY format");
    while ($row = $result->fetch_assoc()) {
        $stats['by_format'][$row['format']] = intval($row['count']);
    }

    // By type
    $result = $mysqli->query("SELECT file_type, COUNT(*) as count FROM files GROUP BY file_type");
    while ($row = $result->fetch_assoc()) {
        $stats['by_type'][$row['file_type']] = intval($row['count']);
    }

    // By artist
    $result = $mysqli->query("
        SELECT artist_name, COUNT(*) as file_count
        FROM file_details
        WHERE artist_name IS NOT NULL
        GROUP BY artist_name
    ");
    while ($row = $result->fetch_assoc()) {
        $stats['by_artist'][$row['artist_name']] = intval($row['file_count']);
    }

    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);
}

/**
 * Get database metadata
 */
function getMetadata($mysqli) {
    $result = $mysqli->query("SELECT meta_key, meta_value FROM metadata");

    $metadata = [];
    while ($row = $result->fetch_assoc()) {
        $metadata[$row['meta_key']] = $row['meta_value'];
    }

    echo json_encode([
        'success' => true,
        'metadata' => $metadata
    ]);
}

/**
 * Format database row for consistent output
 */
function formatFileRow($row) {
    return [
        'id' => intval($row['id']),
        'title' => $row['title'],
        'filename' => $row['filename'],
        'url' => $row['url'],
        'format' => $row['format'],
        'file_type' => $row['file_type'],
        'quality' => $row['quality'],
        'file_size' => $row['file_size'] ? intval($row['file_size']) : null,
        'duration' => $row['duration'] ? intval($row['duration']) : null,
        'album' => [
            'title' => $row['album_title'],
            'year' => $row['album_year'] ? intval($row['album_year']) : null,
            'type' => $row['album_type'],
            'collection_type' => $row['collection_type']
        ],
        'artist' => $row['artist_name'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
}
