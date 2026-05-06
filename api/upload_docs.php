<?php
/**
 * Sahibzada Gun House — Document Upload Handler
 * Saves base64 captured images to a local directory.
 */

header('Content-Type: application/json');

// 1. Define upload directory
$uploadDirBase = '../uploads/documents/';
if (!is_dir($uploadDirBase)) {
    mkdir($uploadDirBase, 0755, true);
}

// --- CLEANUP LOGIC (100 Days) ---
// Deletes files older than 100 days to comply with privacy/retention policies.
$expiryTime = time() - (100 * 24 * 60 * 60); // 100 days in seconds
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploadDirBase));

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getMTime() < $expiryTime) {
        @unlink($file->getPathname());
    }
}
// --------------------------------

// 2. Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['images']) || !is_array($data['images'])) {
    echo json_encode(['success' => false, 'message' => 'No images provided.']);
    exit;
}

// 3. Determine user-specific folder
$userName = isset($data['userName']) ? $data['userName'] : 'Unknown_User';
$sanitizedName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $userName);
$uploadDir = '../uploads/documents/' . $sanitizedName . '/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$images = $data['images'];
if (count($images) < 2) {
    echo json_encode(['success' => false, 'message' => 'Minimum 2 images required.']);
    exit;
}

$savedFiles = [];

try {
    foreach ($images as $index => $base64Data) {
        // Remove data:image/jpeg;base64, part
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc.

            if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
                continue; // Skip invalid types
            }

            $base64Data = base64_decode($base64Data);
            if ($base64Data === false) continue;

            // Generate unique filename
            $fileName = 'doc_' . time() . '_' . $index . '.' . $type;
            $filePath = $uploadDir . $fileName;

            if (file_put_contents($filePath, $base64Data)) {
                $savedFiles[] = $filePath;
            }
        }
    }

    if (count($savedFiles) > 0) {
        echo json_encode([
            'success' => true, 
            'message' => count($savedFiles) . ' images saved successfully.',
            'files' => $savedFiles
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save images.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
