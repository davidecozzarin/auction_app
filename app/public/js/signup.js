// Reindirizzamento al login
document.getElementById("signup-button").addEventListener("click", () => {
    window.location.href = "login.html"; 
})

// Signup Form Handler
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
        username: document.getElementById("signup-username").value.trim(),
        password: document.getElementById("signup-password").value.trim(),
        name: document.getElementById("signup-name").value.trim(),
        surname: document.getElementById("signup-surname").value.trim(),
        bio: document.getElementById("signup-bio").value.trim(),
    };

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        const messageBanner = document.getElementById("message-banner");

        if (response.ok) {
            messageBanner.style.display = "block";
            messageBanner.style.backgroundColor = "#d4edda"; // Verde per successo
            messageBanner.style.color = "#155724";
            messageBanner.innerText = "Signup successful! Redirecting to login...";

            setTimeout(() => {
                window.location.href = "login.html"; // Reindirizza al login
            }, 2000);
        } else {
            messageBanner.style.display = "block";
            messageBanner.style.backgroundColor = "#f8d7da"; // Rosso per errore
            messageBanner.style.color = "#721c24";
            messageBanner.innerText = data.msg || "Signup failed. Try again.";
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("An error occurred while signing up.");
    }
});
