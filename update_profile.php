<?php

$host = "localhost"; 
$dbUsername = "root"; 
$dbPassword = ""; 
$dbName = "lms"; 


$conn = new mysqli($host, $dbUsername, $dbPassword, $dbName);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
 
    $username = $conn->real_escape_string($_POST["username"]);
    $email = $conn->real_escape_string($_POST["email"]);
    $bio = $conn->real_escape_string($_POST["bio"]);

    
    $userId = 1; 

    
    $sql = "UPDATE users SET username = '$username', email = '$email', bio = '$bio' WHERE id = $userId";

    if ($conn->query($sql) === TRUE) {
        echo "Profile updated successfully!";
    } else {
        echo "Error updating profile: " . $conn->error;
    }
}


$conn->close();
?>
