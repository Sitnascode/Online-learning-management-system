<?php
include 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    die("You need to be logged in to enroll.");
}

if (isset($_GET['course_id'])) {
    $user_id = $_SESSION['user_id'];
    $course_id = $_GET['course_id'];

    // Insert enrollment into the database
    $sql = "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$user_id, $course_id])) {
        echo "Enrolled in the course!";
    } else {
        echo "Error enrolling in course.";
    }
}
?>