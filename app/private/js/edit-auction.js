document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const auctionId = params.get("id");
    const auctionDetails = document.getElementById("auction-details");
    const auctionTitle = document.getElementById("auction-title");
    const auctionDescription = document.getElementById("auction-description");
    

    // Torna all'area utente
    document.getElementById("back-to-user-area").addEventListener("click", () => {
        window.location.href = "user-area.html";
    });

    // Carica i dettagli dell'asta
    try {
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (response.ok) {
            const auction = await response.json();
            
            // Popola i dettagli statici
            auctionDetails.innerHTML = `
                <p><strong>Titolo:</strong> ${auction.title}</p>
                <p><strong>Descrizione:</strong> ${auction.description}</p>
                <p><strong>Prezzo di Partenza:</strong> €${auction.startPrice}</p>
                <p><strong>Categoria:</strong> ${auction.category}</p>
                <p><strong>Data di Fine:</strong> ${new Date(auction.endDate).toLocaleString()}</p>
            `;

            // Prepopola il form
            auctionTitle.value = auction.title;
            auctionDescription.value = auction.description;
        } else {
            throw new Error("Errore nel caricamento dei dettagli dell'asta.");
        }
    } catch (error) {
        alert("Errore durante il caricamento dei dettagli dell'asta.");
        console.error(error);
    }

    // Salva le modifiche all'asta
    document.getElementById("edit-auction-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/auctions/${auctionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: auctionTitle.value.trim(),
                    description: auctionDescription.value.trim(),
                }),
            });

            if (response.ok) {
                alert("Asta aggiornata con successo!");
                window.location.href = "user-area.html";
            } else {
                const errorData = await response.json(); // Leggi i dettagli dell'errore dal backend
                alert(`Errore: ${errorData.msg}`);
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento:", error);
        }
    });

    // Elimina l'asta
    document.getElementById("delete-auction-button").addEventListener("click", async () => {
        if (confirm("Sei sicuro di voler eliminare questa asta?")) {
            try {
                const response = await fetch(`/api/auctions/${auctionId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    alert("Asta eliminata con successo!");
                    window.location.href = "user-area.html";
                } else {
                    alert("Errore durante l'eliminazione dell'asta.");
                }
            } catch (error) {
                console.error("Errore durante l'eliminazione:", error);
            }
        }
    });
});
