<?php
include 'config.php';
session_start();

// Check if the user is an admin or instructor (you can implement a more advanced role check)
if ($_SESSION['role'] != 'admin') {
    die("You do not have permission to access this page.");
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['file'])) {
    $course_id = $_POST['course_id'];
    $description = htmlspecialchars($_POST['description']);
    $file = $_FILES['file'];

    // Check if file was uploaded successfully
    if ($file['error'] == UPLOAD_ERR_OK) {
        $file_name = basename($file['name']);
        $file_tmp_path = $file['tmp_name'];
        $file_type = pathinfo($file_name, PATHINFO_EXTENSION);

        // Define allowed file types (e.g., pdf, mp4, etc.)
        $allowed_file_types = ['pdf', 'mp4', 'mp3', 'txt', 'jpg', 'jpeg', 'png'];

        if (in_array($file_type, $allowed_file_types)) {
            // Generate a unique file name to avoid overwriting
            $upload_dir = 'uploads/course_materials/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            $new_file_name = uniqid() . '.' . $file_type;
            $destination = $upload_dir . $new_file_name;

            // Move the uploaded file to the destination directory
            if (move_uploaded_file($file_tmp_path, $destination)) {
                // Insert the material details into the database
                $sql = "INSERT INTO course_materials (course_id, file_name, file_path, file_type, description) 
                        VALUES (?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                if ($stmt->execute([$course_id, $file_name, $destination, $file_type, $description])) {
                    echo "Material uploaded successfully!";
                } else {
                    echo "Error saving material details in the database.";
                }
            } else {
                echo "Error moving the uploaded file.";
            }
        } else {
            echo "Invalid file type. Only " . implode(', ', $allowed_file_types) . " files are allowed.";
        }
    } else {
        echo "File upload error: " . $file['error'];
    }
}
?>

