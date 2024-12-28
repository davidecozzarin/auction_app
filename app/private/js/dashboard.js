const auctionsList = document.getElementById("auctions-list"); // Sposta questa dichiarazione fuori

async function loadAuctions(category = "", filter = "all") {
    console.log("Ricarico le aste...");
    auctionsList.innerHTML = "Caricamento...";
    try {
        const response = await fetch(`/api/auctions?category=${category}`);
        const auctions = await response.json();

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
                const formattedTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                    <div class="auction">
                        <h2>${auction.title}</h2>
                        <p>${auction.description}</p>
                        <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                        <p><strong>Categoria:</strong> ${auction.category}</p>
                        <p><strong>Data di fine:</strong> ${formattedDate} alle ${formattedTime}</p>
                        ${winnerMessage}
                        ${bidForm}
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
                        loadAuctions(category); // Ricarica le aste
                    } else {
                        const error = await response.json();
                        alert(`Errore: ${error.msg}`);
                        loadAuctions(category);
                        
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
    const auctionsList = document.getElementById("auctions-list");
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
    loadAuctions(""); // Carica tutte le aste
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