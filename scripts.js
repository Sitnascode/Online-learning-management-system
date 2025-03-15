document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      let formData = new FormData(this);

      fetch("register.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          if (data.success) {
            window.location.href = "login.html";
          }
        });
    });

  document
    .getElementById("loginForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      let formData = new FormData(this);

      fetch("login.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            if (data.role === "student") {
              window.location.href = "student_dashboard.html";
            } else if (data.role === "instructor") {
              window.location.href = "instructor_dashboard.html";
            } else {
              window.location.href = "admin_dashboard.html";
            }
          } else {
            alert(data.message);
          }
        });
    });
});

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    if (email && password && role) {
      switch (role) {
        case "student":
          window.location.href = "student_dashboard.html";
          break;
        case "instructor":
          window.location.href = "instructor_dashboard.html";
          break;
        case "admin":
          window.location.href = "admin_dashboard.html";
          break;
        default:
          document.getElementById("message").textContent =
            "Invalid role selected";
      }
    } else {
      document.getElementById("message").textContent =
        "Please fill out all fields";
    }
  });
document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    if (email && password && role) {
      switch (role) {
        case "student":
          window.location.href = "student_dashboard.html";
          break;
        case "instructor":
          window.location.href = "instructor_dashboard.html";
          break;
        case "admin":
          window.location.href = "admin_dashboard.html";
          break;
        default:
          document.getElementById("message").textContent =
            "Invalid role selected";
      }
    } else {
      document.getElementById("message").textContent =
        "Please fill out all fields";
    }
  });
