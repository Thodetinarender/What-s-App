document.getElementById("signup-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const warningDiv = document.getElementById("warning");

    const user = { name, email, phone, password };
    const baseUrl = "http://localhost:3000";
    const url = baseUrl + "/user/signup";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (response.status !== 201) {
            throw new Error(data.message || "Signup failed");
        }

        // Redirect to login page after successful signup
        window.location.href = "/login";
    } catch (error) {
        warningDiv.textContent = error.message;
        warningDiv.classList.remove("d-none");
        setTimeout(() => warningDiv.classList.add("d-none"), 3000);
    }
});
