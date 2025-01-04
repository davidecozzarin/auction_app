document.addEventListener("DOMContentLoaded", () => {
    const userListContainer = document.getElementById("user-list");
    const userWonAuctionsContainer = document.getElementById("user-auctions");
    const userWonAuctions = document.getElementById("user-won-auctions");
    const backToUserListButton = document.getElementById("back-to-user-list");
    const searchBar = document.getElementById("search-user-bar");

    // Torna all'elenco utenti
    backToUserListButton.addEventListener("click", () => {
        userWonAuctionsContainer.style.display = "none";
        userListContainer.style.display = "block";
    });

    // Torna alla dashboard
    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    // Carica gli utenti e le aste
    async function loadUsersAndAuctions(query = "") {
        try {
            // Ottieni l'elenco degli utenti
            const usersResponse = await fetch(`/api/users?q=${query}`);
            const users = await usersResponse.json();

            // Ottieni tutte le aste
            const auctionsResponse = await fetch(`/api/auctions`);
            const auctions = await auctionsResponse.json();

            // Genera l'elenco degli utenti con le aste vinte
            renderUsersWithWonAuctions(users, auctions);
        } catch (error) {
            console.error("Errore durante il caricamento di utenti o aste:", error);
        }
    }

    // Filtra le aste vinte e mostra gli utenti
    function renderUsersWithWonAuctions(users, auctions) {
        userListContainer.innerHTML = users
            .map(user => {
                // Filtra le aste vinte dall'utente
                const wonAuctions = auctions.filter(
                    auction => auction.winner === user._id
                );

                // Genera HTML per le aste vinte
                const wonAuctionsHtml = wonAuctions.length
                    ? wonAuctions
                          .map(
                              auction => `
                            <div class="auction">
                                <h4>${auction.title}</h4>
                                <p>${auction.description}</p>
                                <p><strong>Prezzo finale:</strong> €${auction.currentBid}</p>
                            </div>
                        `
                          )
                          .join("")
                    : "<p>Nessuna asta vinta</p>";

                // Genera HTML per l'utente
                return `
                    <div class="user">
                        <h3>${user.username} (${user.name} ${user.surname})</h3>
                        <div class="user-auctions">
                            <h4>Aste vinte:</h4>
                            ${wonAuctionsHtml}
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    // Cerca un utente
    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        loadUsersAndAuctions(query);
    });

    // Carica la lista utenti inizialmente
    loadUsersAndAuctions();
});

