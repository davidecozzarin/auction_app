document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadUserAuctions();

    // Torna alla dashboard
    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    // Salva le modifiche al profilo
    document.getElementById("update-profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("user-name").value.trim();
        const surname = document.getElementById("user-surname").value.trim();
        const bio = document.getElementById("user-bio").value.trim();

        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${document.cookie.split('token=')[1]}`
                },
                body: JSON.stringify({ name, surname, bio }),
            });

            if (response.ok) {
                alert("Profilo aggiornato con successo!");
            } else {
                const data = await response.json();
                alert(data.msg || "Errore durante l'aggiornamento del profilo.");
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento del profilo:", error);
        }
    });
});

// Carica le informazioni del profilo utente
async function loadUserProfile() {
    try {
        const response = await fetch("/api/whoami");
        if (response.ok) {
            const user = await response.json();
            document.getElementById("user-name").value = user.name || "";
            document.getElementById("user-surname").value = user.surname || "";
            document.getElementById("user-bio").value = user.bio || "";
        } else {
            alert("Errore durante il caricamento del profilo.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento del profilo:", error);
    }
}

// Carica le aste personali dell'utente autenticato
async function loadUserAuctions() {
    try {
        const userResponse = await fetch("/api/whoami");
        if (!userResponse.ok) {
            alert("Errore nel recupero dell'utente.");
            return;
        }

        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch("/api/auctions");
        if (response.ok) {
            const auctions = await response.json();
            const filteredAuctions = auctions.filter(auction => auction.createdBy === userId);

            const userAuctionsList = document.getElementById("user-auctions-list");
            userAuctionsList.innerHTML = filteredAuctions
                .map((auction) => `
                    <div class="auction" data-auction-id="${auction._id}">
                        <h2>${auction.title}</h2>
                        <p>${auction.description}</p>
                        <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                        <p><strong>Categoria:</strong> ${auction.category}</p>
                        <p><strong>Data di fine:</strong> ${new Date(auction.endDate).toLocaleString()}</p>
                        <div class="actions">
                            <button 
                                class="edit-auction-button" 
                                onclick="window.location.href='edit-auction.html?id=${auction._id}'">
                                Modifica
                            </button>
                        </div>
                    </div>
                `)
                .join("");
        } else {
            alert("Errore durante il caricamento delle aste dell'utente.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle aste dell'utente:", error);
    }
}
