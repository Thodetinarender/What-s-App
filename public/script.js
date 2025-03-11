document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !phone || !password) {
        alert("All fields are required! ❌");
        return;
    }

    try {
        const response = await fetch("/api/auth/signup", { // ✅ Use relative URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Successfully signed up! ✅");
            window.location.href = "/login.html"; // Redirect to login page
        } else {
            // ✅ Better error handling
            if (data.error.includes("User already exists")) {
                alert("User already exists, Please Login ❌");
            } else {
                alert(data.error || "Something went wrong! ❌");
            }
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Server error! Please try again later.");
    }
});
