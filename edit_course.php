<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "lms");

// Fetch course details if editing
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "SELECT * FROM courses WHERE id = $id";
    $result = $conn->query($sql);
    $course = $result->fetch_assoc();
}

// Handle form submission to update course details
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['id'];
    $title = $conn->real_escape_string($_POST['title']);
    $description = $conn->real_escape_string($_POST['description']);

    $sql = "UPDATE courses SET title = '$title', description = '$description' WHERE id = $id";
    if ($conn->query($sql) === TRUE) {
        echo "Course updated successfully!";
    } else {
        echo "Error updating course: " . $conn->error;
    }
    header("Location: manage-courses.php"); // Redirect after update
    exit;
}
?>
<form action="edit-course.php" method="POST">
    <input type="hidden" name="id" value="<?= $course['id'] ?>">
    <label for="title">Title:</label>
    <input type="text" name="title" value="<?= $course['title'] ?>" required>
    <label for="description">Description:</label>
    <textarea name="description"><?= $course['description'] ?></textarea>
    <button type="submit">Update</button>
</form>
