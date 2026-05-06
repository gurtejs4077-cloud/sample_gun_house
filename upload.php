<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Directory where images will be saved
$targetDir = "uploads/";

// Create directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $fileName = time() . '_' . basename($file['name']);
    $targetFilePath = $targetDir . $fileName;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

    // Allow certain file formats
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');
    if (in_array(strtolower($fileType), $allowTypes)) {
        // Upload file to server
        if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            echo json_encode([
                "status" => "success",
                "url" => $targetFilePath
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to upload file."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Only JPG, JPEG, PNG, GIF, & WEBP files are allowed."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
}
?>
