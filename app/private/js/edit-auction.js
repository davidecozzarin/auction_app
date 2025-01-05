document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const auctionId = params.get("id");

    // Torna all'area utente
    document.getElementById("back-to-user-area").addEventListener("click", () => {
        window.location.href = "user-area.html";
    });

    // Carica i dettagli dell'asta
    const auctionTitle = document.getElementById("auction-title");
    const auctionDescription = document.getElementById("auction-description");

    try {
        const response = await fetch(`/api/auctions/${auctionId}`);
        const auction = await response.json();
        auctionTitle.value = auction.title;
        auctionDescription.value = auction.description;
    } catch (error) {
        alert("Errore durante il caricamento dell'asta.");
        console.error("Errore:", error);
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
                alert("Errore durante l'aggiornamento dell'asta.");
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
