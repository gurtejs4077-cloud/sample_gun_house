<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Base directory where images will be saved
$baseDir = "uploads/";

// Get the requested subfolder, default to 'general'
$folder = isset($_POST['folder']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $_POST['folder']) : 'general';
$targetDir = $baseDir . $folder . "/";

// Create directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_FILES['image']) || isset($_FILES['file']))) {
    $file = isset($_FILES['image']) ? $_FILES['image'] : $_FILES['file'];
    
    // Clean filename
    $originalName = basename($file['name']);
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    $fileName = time() . '_' . $cleanName . '.' . $extension;
    
    $targetFilePath = $targetDir . $fileName;
    $fileType = strtolower($extension);

    // Allow certain file formats
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp', 'pdf');
    if (in_array($fileType, $allowTypes)) {
        // Upload file to server
        if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            echo json_encode([
                "status" => "success",
                "url" => $targetFilePath,
                "name" => $fileName
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Only JPG, JPEG, PNG, GIF, WEBP & PDF files are allowed."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request. No file received."]);
}
?>
