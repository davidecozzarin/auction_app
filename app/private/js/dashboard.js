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
            loadUserAuctions(); // Ricarica le aste
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


// Carica le aste dell'utente
async function loadUserAuctions() {
    try {
        const response = await fetch("/api/auctions");
        const auctions = await response.json();
        const auctionsList = document.getElementById("auctions-list");
        auctionsList.innerHTML = auctions
            .map(
                (auction) => `
                <div class="auction">
                    <h4>${auction.title}</h4>
                    <p>${auction.description}</p>
                    <p>Prezzo di partenza: €${auction.startPrice}</p>
                    <p>Categoria: ${auction.category}</p>
                </div>`
            )
            .join("");
    } catch (error) {
        console.error("Errore durante il caricamento:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadUserAuctions);
