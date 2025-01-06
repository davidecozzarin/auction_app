document.addEventListener("DOMContentLoaded", () => {
    const userListContainer = document.getElementById("user-list-container");
    const userWonAuctionsContainer = document.getElementById("user-won-auctions");
    const selectedUserName = document.getElementById("selected-user-name");
    const searchBar = document.getElementById("search-user-bar");

    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    async function loadUsersAndAuctions(query = "") {
        try {
            const usersResponse = await fetch(`/api/users?q=${query}`);
            const users = await usersResponse.json();
            renderUserList(users);
        } catch (error) {
            console.error("Errore durante il caricamento di utenti:", error);
        }
    }

    function renderUserList(users) {
        userListContainer.innerHTML = users
            .map(user => `
                <div class="user">
                    <span>${user.username} (${user.name} ${user.surname})</span>
                    <button data-user-id="${user._id}" class="view-auctions-button">Visualizza</button>
                </div>
            `)
            .join("");

        document.querySelectorAll(".view-auctions-button").forEach(button => {
            button.addEventListener("click", () => {
                const userId = button.getAttribute("data-user-id");
                console.log(`Visualizza aste per utente ID: ${userId}`);
                loadUserAuctions(userId);
            });
        });
    }

    async function loadUserAuctions(userId) {
        try {
            const auctionsResponse = await fetch(`/api/auctions`);
            const auctions = await auctionsResponse.json();
            const userResponse = await fetch(`/api/users/${userId}`);
            const user = await userResponse.json();
            const wonAuctions = auctions.filter(auction => auction.winner === userId);
            selectedUserName.textContent = `Aste vinte da: ${user.name} ${user.surname}`;

            function truncateText(text, maxLength = 25) {
                if (text.length > maxLength) {
                    return text.substring(0, maxLength) + "...";
                }
                return text;
            }

            userWonAuctionsContainer.innerHTML = wonAuctions.length
                ? wonAuctions
                      .map(
                          auction => `
                        <div class="auction">
                            <h4>${auction.title}</h4>
                            <p>${truncateText(auction.description)}</p>
                            <p><strong>Prezzo finale:</strong> €${auction.currentBid}</p>
                        </div>
                    `
                      )
                      .join("")
                : "<p>Nessuna asta vinta</p>";

            document.getElementById("user-auctions").classList.remove("hidden");
        } catch (error) {
            console.error("Errore durante il caricamento delle aste:", error);
        }
    }
    searchBar.addEventListener("input", e => {
        const query = e.target.value.trim();
        loadUsersAndAuctions(query);
    });
    loadUsersAndAuctions();
});
