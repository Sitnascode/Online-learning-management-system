<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "lms");

// Handle course deletion
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "DELETE FROM courses WHERE id = $id";
    if ($conn->query($sql) === TRUE) {
        echo "Course deleted successfully!";
    } else {
        echo "Error deleting course: " . $conn->error;
    }
    header("Location: manage-courses.php"); // Redirect after deletion
    exit;
}
?>
