// Bottone "Signup"
document.getElementById("signup-button").addEventListener("click", () => {
    window.location.href = "signup.html";
});

// Login Form Handler
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        const response = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            const messageBanner = document.getElementById("message-banner");
            messageBanner.style.display = "block";
            messageBanner.style.backgroundColor = "#d4edda"; // Verde per successo
            messageBanner.style.color = "#155724";
            messageBanner.innerText = "Login successful! Redirecting...";

            document.cookie = `token=${data.token}; path=/`; // Salva il token
            setTimeout(() => {
                window.location.href = "../private/dashboard.html"; // Reindirizza alla dashboard
            }, 2000);
        } else {
            const messageBanner = document.getElementById("message-banner");
            messageBanner.style.display = "block";
            messageBanner.style.backgroundColor = "#f8d7da"; // Rosso per errore
            messageBanner.style.color = "#721c24";
            messageBanner.innerText = data.msg || "Login failed. Try again.";
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("An error occurred while logging in.");
    }
});
