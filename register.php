<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Collect and sanitize the input
    $username = htmlspecialchars($_POST['username']);
    $email = htmlspecialchars($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT); // Hash password

    // SQL query to insert user into the database
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$username, $email, $password])) {
        echo "User registered successfully!";
    } else {
        echo "Error registering user.";
    }
}
?>

