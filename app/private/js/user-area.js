document.addEventListener("DOMContentLoaded", () => {
    setupProfilePopup();
    loadUserAuctions();

    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
});

function truncateTitle(text, maxLength = 18) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function setupProfilePopup() {
    const profileModal = document.getElementById("profile-modal");
    const editProfileButton = document.getElementById("edit-profile-button");
    const closeButton = document.querySelector(".close-button");
    const profileForm = document.getElementById("popup-edit-profile-form");

    editProfileButton.addEventListener("click", async () => {
        profileModal.classList.remove("hidden");
        try {
            const response = await fetch("/api/whoami");
            if (response.ok) {
                const user = await response.json();
                document.getElementById("popup-user-name").value = user.name || "";
                document.getElementById("popup-user-surname").value = user.surname || "";
            } else {
                alert("Errore durante il caricamento del profilo.");
            }
        } catch (error) {
            console.error("Errore durante il caricamento del profilo:", error);
        }
    });
    closeButton.addEventListener("click", () => {
        profileModal.classList.add("hidden");
    });

    profileModal.addEventListener("click", (e) => {
        if (e.target === profileModal) {
            profileModal.classList.add("hidden");
        }
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("popup-user-name").value.trim();
        const surname = document.getElementById("popup-user-surname").value.trim();
        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${document.cookie.split('token=')[1]}`
                },
                body: JSON.stringify({ name, surname }),
            });

            if (response.ok) {
                alert("Profilo aggiornato con successo!");
                profileModal.classList.add("hidden");
            } else {
                const data = await response.json();
                alert(data.msg || "Errore durante l'aggiornamento del profilo.");
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento del profilo:", error);
        }
    });
}

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
                .map((auction) => {
                    const endDate = new Date(auction.endDate);
                    const now = new Date();
                    const isExpired = auction.isExpired || endDate <= now;
                    let timeRemaining = '';
                    if (!isExpired) {
                        const totalMinutes = Math.max(0, Math.ceil((endDate - now) / 1000 / 60));
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        const days = Math.floor(hours / 24);
                        const remainingHours = hours % 24;
                    
                        if (hours >= 24) {
                            timeRemaining = `<span class="time-remaining">Rimangono ${days} ${days === 1 ? 'giorno' : 'giorni'} e ${remainingHours} ${remainingHours === 1 ? 'ora' : 'ore'}</span>`;
                        } else if (hours > 0) {
                            timeRemaining = `<span class="time-remaining">Rimangono ${hours} ${hours === 1 ? 'ora' : 'ore'} e ${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}</span>`;
                        } else {
                            timeRemaining = `<span class="time-remaining">Rimangono ${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}</span>`;
                        }
                    } else {
                        timeRemaining = '<span class="expired-message">Asta Terminata</span>';
                    }
                                                            
                    return `
                        <div class="auction" data-auction-id="${auction._id}">
                            <h3>${truncateTitle(auction.title)}</h3>
                            <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                            <p>${timeRemaining}</p>
                            <button class="view-details" onclick="window.location.href='edit-auction.html?id=${auction._id}'">Modifica</button>
                        </div>
                    `;
                })
                .join("");
                
        } else {
            alert("Errore durante il caricamento delle aste.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle aste:", error);
    }
}
