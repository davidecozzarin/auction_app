// modal.js
export function setupModals() {
    const loginModal = document.getElementById("login-modal");
    const signupModal = document.getElementById("signup-modal");
    const authButton = document.getElementById("auth-button");
    const closeButtons = document.querySelectorAll(".close-button");

    // Apertura del login modal
    authButton.addEventListener("click", () => {
        loginModal.classList.remove("hidden");
    });

    // Chiudi i modali
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            loginModal.classList.add("hidden");
            signupModal.classList.add("hidden");
        });
    });

    // Passa al signup modal
    document.getElementById("open-signup-modal").addEventListener("click", () => {
        loginModal.classList.add("hidden");
        signupModal.classList.remove("hidden");
    });

    // Passa al login modal
    document.getElementById("open-login-modal").addEventListener("click", () => {
        signupModal.classList.add("hidden");
        loginModal.classList.remove("hidden");
    });

    // Gestione del login
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

            if (response.ok) {
                const data = await response.json();
                alert("Login effettuato con successo!");
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = "/private/dashboard.html";
            } else {
                alert("Errore nel login. Verifica le credenziali.");
            }
        } catch (error) {
            console.error("Errore durante il login:", error);
            alert("Si è verificato un errore durante il login.");
        }
    });

    // Gestione del signup
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
            username: document.getElementById("signup-username").value.trim(),
            password: document.getElementById("signup-password").value.trim(),
            name: document.getElementById("signup-name").value.trim(),
            surname: document.getElementById("signup-surname").value.trim(),
        };

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Registrazione effettuata con successo! Esegui il login.");
                signupModal.classList.add("hidden");
                loginModal.classList.remove("hidden");
            } else {
                alert("Errore durante la registrazione.");
            }
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            alert("Si è verificato un errore durante la registrazione.");
        }
    });
}
