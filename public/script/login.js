document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const warningDiv = document.getElementById("warning");

    const user = { email, password };
    const baseUrl = "http://localhost:3000";
    const url = baseUrl + "/user/login";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        // Store token
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        // Redirect to home page
        window.location.href = "/chat";
    } catch (error) {
        warningDiv.textContent = error.message;
        warningDiv.classList.remove("d-none");
        setTimeout(() => warningDiv.classList.add("d-none"), 3000);
    }
});