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
            const winnerMessage = auction.isExpired
                ? auction.winnerName
                    ? `<p><strong>Vincitore:</strong> ${auction.winnerName}</p>`
                    : `<p><strong>Vincitore:</strong> Nessuna offerta</p>`
                : "";

            const bidForm = auction.isExpired
                ? `<p class="expired-message" style="color: red">L'asta è terminata</p>`
                : `
                    <form class="bid-form" data-auction-id="${auction._id}">
                        <input type="number" class="bid-amount" placeholder="Inserisci la tua offerta" required>
                        <button type="submit" class="bid-button">Effettua Offerta</button>
                    </form>
                `;

            const endDate = new Date(auction.endDate);
            const formattedDate = endDate.toLocaleDateString();
            const formattedTime = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            // Aggiungi data-auction-id al contenitore principale
            return `
                <div class="auction" data-auction-id="${auction._id}">
                    <h2>${auction.title}</h2>
                    <p>${auction.description}</p>
                    <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                    <p><strong>Categoria:</strong> ${auction.category}</p>
                    <p><strong>Data di fine:</strong> ${formattedDate} alle ${formattedTime}</p>
                    ${winnerMessage}
                    ${bidForm}
                    <button class="view-bids-button" data-auction-id="${auction._id}">Visualizza Offerte</button>
                </div>
            `;
        })
        .join("");


        // Aggiungi event listener ai form delle offerte
        const bidForms = document.querySelectorAll(".bid-form");
        bidForms.forEach(form => {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const auctionId = form.getAttribute("data-auction-id");
                const bidAmount = parseFloat(form.querySelector(".bid-amount").value);

                try {
                    const response = await fetch(`/api/auctions/${auctionId}/bids`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ amount: bidAmount }),
                    });

                    if (response.ok) {
                        alert("Offerta effettuata con successo!");
                        loadAuctions(); // Ricarica le aste
                    } else {
                        const error = await response.json();
                        alert(`Errore: ${error.msg}`);
                        loadAuctions();
                    }
                } catch (error) {
                    console.error("Errore durante l'offerta:", error);
                    alert("Errore durante l'offerta. Riprova.");
                }
            });
        });
    } catch (error) {
        auctionsList.innerHTML = "Errore durante il caricamento delle aste.";
        console.error("Error fetching auctions:", error);
    }
}

async function loadBids(auctionId) {
    try {
        const response = await fetch(`/api/auctions/${auctionId}/bids`);
        if (!response.ok) {
            throw new Error("Errore durante il caricamento delle offerte.");
        }

        const bids = await response.json();

        // Trova la casellina dell'asta nel DOM
        const auctionElement = document.querySelector(`[data-auction-id="${auctionId}"]`);
        if (!auctionElement) {
            console.error("Elemento asta non trovato per ID:", auctionId);
            return;
        }

        // Trova il bottone "Visualizza Offerte"
        const viewButton = auctionElement.querySelector(".view-bids-button");
        if (!viewButton) {
            console.error("Bottone 'Visualizza Offerte' non trovato.");
            return;
        }

        // Nascondi il bottone "Visualizza Offerte"
        viewButton.style.display = "none";

        // Controlla se la sezione esiste già
        const existingBidsSection = auctionElement.querySelector(".bids-section");
        if (existingBidsSection) {
            console.warn("La sezione delle offerte è già visualizzata.");
            return;
        }

        // Genera l'elenco delle offerte in formato tabella
        const bidsTable = `
            <table class="bids-table">
                <thead>
                    <tr>
                        <th>Utente</th>
                        <th>Offerta</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        bids.length > 0
                            ? bids
                                .map(
                                    (bid) => `
                                <tr>
                                    <td>${bid.userName || "Anonimo"}</td>
                                    <td>€${bid.amount}</td>
                                    <td>${new Date(bid.date).toLocaleDateString()} ${new Date(bid.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                                </tr>
                            `
                                )
                                .join("")
                            : `<tr><td colspan="3" class="no-bids">Nessuna offerta disponibile.</td></tr>`
                    }
                </tbody>
            </table>
        `;

        // Aggiungi lo storico delle offerte alla casellina dell'asta
        const bidsSection = document.createElement("div");
        bidsSection.classList.add("bids-section");
        bidsSection.innerHTML = `
            <h3>Storico Offerte</h3>
            ${bidsTable}
            <button class="close-bids-button">Chiudi</button>
        `;
        auctionElement.appendChild(bidsSection);

        // Aggiungi l'event listener per il bottone di chiusura
        const closeButton = bidsSection.querySelector(".close-bids-button");
        closeButton.addEventListener("click", () => {
            bidsSection.remove();
            viewButton.style.display = "inline-block"; // Mostra di nuovo il bottone "Visualizza Offerte"
        });
    } catch (error) {
        console.error(error.message);
        if (error.message.includes("Errore durante il caricamento delle offerte")) {
            alert("Errore durante il caricamento delle offerte.");
        }
    }
}


document.getElementById("logout-button").addEventListener("click", () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    alert("Logout effettuato con successo!");
    window.location.href = "/index.html";
});

// Gestione del form per aggiungere un'asta
document.getElementById("add-auction-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("auction-title").value.trim();
    const description = document.getElementById("auction-description").value.trim();
    const startPrice = parseFloat(document.getElementById("auction-start-price").value);
    const category = document.getElementById("filter-category").value.trim();
    const endDate = document.getElementById("auction-end-date").value;
    const endTime = document.getElementById("auction-end-time").value;

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
            loadAuctions(""); 
            document.getElementById("add-auction-form").reset();
        } else {
            alert("Errore durante l'aggiunta dell'asta.");
        }
    } catch (error) {
        console.error("Errore durante l'aggiunta:", error);
    }
});

// Aggiungi una nuova asta
document.getElementById("add-auction-button").addEventListener("click", () => {
    const form = document.getElementById("add-auction-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
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
