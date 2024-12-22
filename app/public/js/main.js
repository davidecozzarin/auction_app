// Bottone "Signup"
document.getElementById("auth-button").addEventListener("click", () => {
  window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctions-list");
    const categoryButtons = document.querySelectorAll(".category-icon");

    // Aggiorna il bottone di autenticazione
    function updateAuthButton() {
        const authButton = document.getElementById("auth-button");
        const token = document.cookie
            .split("; ")
            .find(row => row.startsWith("token="))
            ?.split("=")[1];

        if (token) {
            authButton.textContent = "Vai alla Dashboard";
            authButton.onclick = () => {
                window.location.href = "/private/dashboard.html";
            };
        } else {
            authButton.textContent = "Login";
            authButton.onclick = () => {
                window.location.href = "/login.html";
            };
        }
    }

    // Funzione per caricare le aste
    async function loadAuctions(category = "") {
        auctionsList.innerHTML = "Caricamento...";
        try {
            const response = await fetch(`/api/auctions?category=${category}`);
            const auctions = await response.json();
            auctionsList.innerHTML = auctions
                .map(
                    auction => `
                    <div class="auction">
                        <h2>${auction.title}</h2>
                        <p>${auction.description}</p>
                        <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                        <p><strong>Categoria:</strong> ${auction.category}</p>
                        <p><strong>Data di fine:</strong> ${new Date(auction.endDate).toLocaleDateString()}</p>
                    </div>`
                )
                .join("");
        } catch (error) {
            auctionsList.innerHTML = "Errore durante il caricamento delle aste.";
            console.error("Error fetching auctions:", error);
        }
    }

    // Funzione per aggiornare lo stato attivo dei pulsanti
    function updateActiveButton(activeButton) {
        categoryButtons.forEach(button => {
            button.classList.remove("active");
        });
        activeButton.classList.add("active");
    }

    // Event listener per i pulsanti delle categorie
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.textContent === "Tutte" ? "" : button.textContent;
            updateActiveButton(button);
            loadAuctions(category);
        });
    });

    // Inizializzazione
    updateAuthButton();
    const defaultButton = document.querySelector(".category-icon:first-child");
    defaultButton.click(); // Simula il clic sul pulsante "Tutte" all'avvio
});
