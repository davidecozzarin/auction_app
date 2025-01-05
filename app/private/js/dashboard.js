const auctionsList = document.getElementById("auctions-list"); // Sposta questa dichiarazione fuori

async function loadAuctions() {
    console.log("Ricarico le aste...");

    // Trova la categoria selezionata
    const activeCategoryButton = document.querySelector(".category-icon.active");
    const category = activeCategoryButton ? activeCategoryButton.textContent.trim() : "";

    // Trova il filtro selezionato
    const activeFilterButton = document.querySelector(".filter-button.active");
    const filter = activeFilterButton ? activeFilterButton.getAttribute("data-filter") : "all";

    auctionsList.innerHTML = "Caricamento...";
    try {
        const response = await fetch(`/api/auctions?category=${category === "Tutte" ? "" : category}`);
        const auctions = await response.json();

        // Filtra le aste in base al filtro attivo
        let filteredAuctions = auctions;
        if (filter === "active") {
            filteredAuctions = auctions.filter(auction => !auction.isExpired);
        } else if (filter === "expired") {
            filteredAuctions = auctions.filter(auction => auction.isExpired);
        }

        auctionsList.innerHTML = filteredAuctions
            .map(auction => {
                const endDate = new Date(auction.endDate);
                const now = new Date();
                const isExpired = auction.isExpired || endDate <= now;

                // Calcola il tempo rimanente in ore e minuti o mostra che è terminata
                let timeRemaining = '';
                if (!isExpired) {
                    const totalMinutes = Math.max(0, Math.ceil((endDate - now) / 1000 / 60));
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    timeRemaining = `<span class="time-remaining">Tempo Rimanente: ${hours} ore e ${minutes} minuti</span>`;
                } else {
                    timeRemaining = '<span class="expired-message">Asta Terminata</span>';
                }

                return `
                    <div class="auction" data-auction-id="${auction._id}">
                        <h3>${auction.title}</h3>
                        <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                        <p>${timeRemaining}</p>
                        <button class="view-details" data-auction-id="${auction._id}">Vedi Dettagli</button>
                    </div>
                `;
            })
            .join("");

        // Aggiungi event listener per il pulsante "Vedi Dettagli"
        document.querySelectorAll(".view-details").forEach(button => {
            button.addEventListener("click", () => {
                const auctionId = button.getAttribute("data-auction-id");
                window.location.href = `auction-details.html?id=${auctionId}`;
            });
        });
    } catch (error) {
        auctionsList.innerHTML = "Errore durante il caricamento delle aste.";
        console.error("Error fetching auctions:", error);
    }
}

document.getElementById("logout-button").addEventListener("click", () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    alert("Logout effettuato con successo!");
    window.location.href = "/index.html";
});

// Gestione lista aste
document.addEventListener("DOMContentLoaded", () => {
    const categoryButtons = document.querySelectorAll(".category-icon");

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

    // Imposta il pulsante "Tutte" come attivo e carica le aste di default
    const defaultButton = document.querySelector(".category-icon:first-child");
    updateActiveButton(defaultButton);
    loadAuctions(); // Carica tutte le aste
});

document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-button");
    let currentFilter = "all";

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentFilter = button.getAttribute("data-filter");
            loadAuctions("", currentFilter); // Ricarica le aste con il filtro attivo
        });
    });

    // Imposta il filtro "Tutte" come attivo di default
    const defaultFilterButton = document.querySelector('.filter-button[data-filter="all"]');
    defaultFilterButton.classList.add("active");
    loadAuctions(); // Carica tutte le aste all'avvio
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("view-bids-button")) {
        const auctionId = e.target.getAttribute("data-auction-id");
        await loadBids(auctionId); // Mostra o nasconde lo storico delle offerte
    }
});

document.getElementById("user-area-button").addEventListener("click", () => {
    window.location.href = "user-area.html";
});

document.getElementById("user-list-button").addEventListener("click", () => {
    window.location.href = "user-list.html";
});

document.addEventListener("DOMContentLoaded", async () => {
    const userGreeting = document.getElementById("user-greeting");

    try {
        // Ottieni i dettagli dell'utente tramite l'API
        const response = await fetch("/api/whoami", {
            headers: {
                "Authorization": `Bearer ${document.cookie.split('token=')[1]}` // Usa il token JWT salvato nei cookie
            }
        });

        if (!response.ok) {
            throw new Error("Errore nel recupero dei dettagli dell'utente");
        }

        const userData = await response.json();

        // Aggiungi il saluto con il nome o lo userId dell'utente
        userGreeting.textContent = `- Ciao ${userData.username}`;
    } catch (error) {
        console.error("Errore nel caricamento dei dati utente:", error);
        userGreeting.textContent = "- Ciao Ospite";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const popupModal = document.getElementById("popup-modal");
    const addAuctionButton = document.getElementById("add-auction-button");
    const closeButton = document.querySelector(".close-button");
    const popupForm = document.getElementById("popup-add-auction-form");

    // Apri il popup
    addAuctionButton.addEventListener("click", () => {
        popupModal.classList.remove("hidden");
    });

    // Chiudi il popup
    closeButton.addEventListener("click", () => {
        popupModal.classList.add("hidden");
    });

    // Chiudi il popup cliccando fuori dal contenuto
    popupModal.addEventListener("click", (e) => {
        if (e.target === popupModal) {
            popupModal.classList.add("hidden");
        }
    });

    // Gestisci il submit del form nel popup
    popupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("popup-auction-title").value.trim();
        const description = document.getElementById("popup-auction-description").value.trim();
        const startPrice = parseFloat(document.getElementById("popup-auction-start-price").value);
        const category = document.getElementById("popup-filter-category").value.trim();
        const endDate = document.getElementById("popup-auction-end-date").value;
        const endTime = document.getElementById("popup-auction-end-time").value;

        const endDateTime = new Date(`${endDate}T${endTime}`);
        if (endDateTime <= new Date()) {
            alert("La data e l'ora di fine non possono essere nel passato!");
            return;
        }

        try {
            const response = await fetch("/api/auctions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    startPrice,
                    category,
                    endDate: endDateTime.toISOString(),
                }),
            });

            if (response.ok) {
                alert("Asta aggiunta con successo!");
                popupModal.classList.add("hidden");
                popupForm.reset(); // Reset dei campi del form
                loadAuctions(""); // Ricarica le aste
            } else {
                alert("Errore durante l'aggiunta dell'asta.");
            }
        } catch (error) {
            console.error("Errore durante l'aggiunta:", error);
        }
    });
});
