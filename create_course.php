<?php
// Database configuration
$host = "localhost"; // Database host
$dbUsername = "root"; // Database username
$dbPassword = ""; // Database password
$dbName = "lms"; // Database name

// Create a database connection
$conn = new mysqli($host, $dbUsername, $dbPassword, $dbName);

// Check database connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve course title and description
    $title = $conn->real_escape_string($_POST['title']);
    $description = $conn->real_escape_string($_POST['description']);

    // Upload course materials
    $fileNames = [];
    if (!empty($_FILES['course-materials']['name'][0])) {
        foreach ($_FILES['course-materials']['tmp_name'] as $key => $tmpName) {
            $fileName = basename($_FILES['course-materials']['name'][$key]);
            $filePath = "uploads/" . $fileName; // Upload directory
            if (move_uploaded_file($tmpName, $filePath)) {
                $fileNames[] = $fileName;
            }
        }
    }

    // Join file names for storage in the database
    $uploadedFiles = implode(",", $fileNames);

    // Insert course data into the database
    $sql = "INSERT INTO courses (title, description, materials) VALUES ('$title', '$description', '$uploadedFiles')";

    if ($conn->query($sql) === TRUE) {
        echo "Course created successfully!";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

// Close database connection
$conn->close();
?>
