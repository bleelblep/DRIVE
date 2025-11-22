<?php
/**
 * Debug Script - Check JSON File Loading
 * Run this first to diagnose migration issues
 */

define('JSON_FILE', '../search-db-soapyscloud.json');

echo "=== SoapysCloud Migration Debug ===\n\n";

// Check if file exists
echo "1. Checking if JSON file exists...\n";
echo "   Looking for: " . JSON_FILE . "\n";
echo "   Absolute path: " . realpath(JSON_FILE) . "\n";

if (!file_exists(JSON_FILE)) {
    echo "   ❌ FILE NOT FOUND!\n\n";
    echo "Possible fixes:\n";
    echo "- Make sure search-db-soapyscloud.json is in the parent directory\n";
    echo "- Or change JSON_FILE path to the correct location\n";
    die();
} else {
    echo "   ✓ File exists\n\n";
}

// Check file size
$fileSize = filesize(JSON_FILE);
echo "2. File size: " . number_format($fileSize) . " bytes\n\n";

if ($fileSize == 0) {
    echo "   ❌ FILE IS EMPTY!\n";
    die();
}

// Load JSON
echo "3. Loading JSON...\n";
$jsonContent = file_get_contents(JSON_FILE);
$jsonData = json_decode($jsonContent, true);

if (!$jsonData) {
    echo "   ❌ Failed to parse JSON\n";
    echo "   JSON Error: " . json_last_error_msg() . "\n";
    die();
}

echo "   ✓ JSON parsed successfully\n\n";

// Check structure
echo "4. JSON Structure:\n";
echo "   Top-level keys: " . implode(', ', array_keys($jsonData)) . "\n\n";

// Check metadata
if (isset($jsonData['metadata'])) {
    echo "5. Metadata:\n";
    foreach ($jsonData['metadata'] as $key => $value) {
        echo "   - $key: $value\n";
    }
    echo "\n";
}

// Check collections
echo "6. Collections:\n";
if (isset($jsonData['collections'])) {
    $collections = $jsonData['collections'];
    echo "   Total collections: " . count($collections) . "\n";

    if (count($collections) == 0) {
        echo "   ❌ Collections array is EMPTY!\n";
        echo "   This is why migration imported 0 files.\n\n";
    } else {
        echo "   Collection keys: " . implode(', ', array_keys($collections)) . "\n\n";

        // Show details of each collection
        foreach ($collections as $key => $collection) {
            echo "   Collection: $key\n";
            if (isset($collection['albums'])) {
                echo "     - Albums: " . count($collection['albums']) . "\n";
            }
            if (isset($collection['videos'])) {
                echo "     - Videos: " . count($collection['videos']) . "\n";
            }
            if (isset($collection['artist'])) {
                echo "     - Artist: " . $collection['artist'] . "\n";
            }
        }
    }
} else {
    echo "   ❌ No 'collections' key found in JSON!\n";
}

echo "\n=== Debug Complete ===\n";
