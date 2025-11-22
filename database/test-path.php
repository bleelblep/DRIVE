<?php
/**
 * Path Finder Script
 * This helps you find the correct absolute path for your drive folder
 */

echo "=== DirectAdmin Path Finder ===\n\n";

// Test different possible paths
$possiblePaths = [
    '/domains/soapyscloud.com/public_html/drive/',
    '/domains/soapyscloud.com/public_html/',
    '/home/soapyscloud/public_html/drive/',
    '/home/soapyscloud/public_html/',
    '/home/soapyscl/public_html/drive/',
    '/home/soapyscl/public_html/',
    __DIR__ . '/../drive/',
    $_SERVER['DOCUMENT_ROOT'] . '/drive/',
    $_SERVER['DOCUMENT_ROOT'] . '/',
];

echo "Testing possible paths...\n\n";

foreach ($possiblePaths as $path) {
    $exists = is_dir($path);
    $readable = $exists ? is_readable($path) : false;

    echo ($exists ? "✓" : "✗") . " " . $path;

    if ($exists) {
        echo " (readable: " . ($readable ? "yes" : "NO") . ")";

        // Count files
        if ($readable) {
            $count = count(glob($path . '*'));
            echo " - {$count} items found";
        }
    }

    echo "\n";
}

echo "\n=== Server Information ===\n";
echo "DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'not set') . "\n";
echo "Current script dir: " . __DIR__ . "\n";
echo "Current working dir: " . getcwd() . "\n";

echo "\n=== Recommendation ===\n";
echo "Upload this file to: /public_html/database/test-path.php\n";
echo "Run it via: https://soapyscloud.com/database/test-path.php\n";
echo "Or via SSH: php /path/to/test-path.php\n";
?>
