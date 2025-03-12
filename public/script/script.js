// Handle Signup
document.getElementById("signupForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !phone || !password) {
        alert("All fields are required! ❌");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Successfully signed up! ✅");
            window.location.href = "/html/login.html"; // Redirect to login
        } else {
            alert(data.error || "Something went wrong! ❌");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Server error! Please try again later.");
    }
});

// Handle Login
document.getElementById("loginForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Email and Password are required! ❌");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful! ✅");

             // ✅ Store JWT token & username in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username); // Save username

             // ✅ Redirect to chat page
            window.location.href = "/html/chat.html";
 
        } else {
            alert(data.error || "Invalid credentials! ❌");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server error! Please try again later.");
    }
});
