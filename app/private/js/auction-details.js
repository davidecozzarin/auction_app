document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const auctionId = params.get("id");

    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
    const auctionDetails = document.getElementById("auction-details");
    auctionDetails.innerHTML = "Caricamento...";
    
    try {
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (!response.ok) throw new Error("Errore durante il caricamento dell'asta.");
        const auction = await response.json();
        const endDate = new Date(auction.endDate).toLocaleString();
        const isAuctionExpired = new Date(auction.endDate) <= new Date();
        auctionDetails.innerHTML = `
            <h2>${auction.title}</h2>
            <p>${auction.description}</p>
            <p><strong>Prezzo di partenza:</strong> €${auction.startPrice}</p>
            <p><strong>Offerta corrente:</strong> €${auction.currentBid}</p>
            <p><strong>Categoria:</strong> ${auction.category}</p>
            <p><strong>Data di fine:</strong> ${endDate}</p>
            ${
                isAuctionExpired
                    ? `<p class="expired-message" style="color: red">L'asta è terminata</p>`
                    : ""
            }`;
        if (!isAuctionExpired) {
            const bidForm = document.createElement("form");
            bidForm.id = "bid-form";
            bidForm.innerHTML = `
                <div class="bid-input-container">
                    <input type="number" id="bid-amount" class="styled-input" placeholder="Inserisci la tua offerta" required>
                    <button type="submit" class="styled-button">Effettua Offerta</button>
                </div>
            `;
            auctionDetails.appendChild(bidForm);
            bidForm.addEventListener("submit", async e => {
                e.preventDefault();
                const amount = document.getElementById("bid-amount").value;

                try {
                    const bidResponse = await fetch(`/api/auctions/${auctionId}/bids`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ amount }),
                    });

                    if (bidResponse.ok) {
                        alert("Offerta effettuata con successo!");
                        location.reload();
                    } else {
                        const error = await bidResponse.json();
                        alert(`Errore: ${error.msg}`);
                        location.reload();
                    }
                } catch (err) {
                    console.error("Errore durante l'offerta:", err);
                }
            });
        }

        const bidsResponse = await fetch(`/api/auctions/${auctionId}/bids`);
        if (!bidsResponse.ok) throw new Error("Errore durante il caricamento delle offerte.");
        const bids = await bidsResponse.json();
        const bidsList = document.getElementById("bids-list");
        bidsList.innerHTML += bids.length
            ? `<ul>${bids
                  .map(
                      bid => `
                <li>
                    <strong>${bid.userName}</strong>: €${bid.amount} - ${new Date(bid.date).toLocaleString()}
                </li>
            `
                  )
                  .join("")}</ul>`
            : "<p>Nessuna offerta disponibile.</p>";
    } catch (error) {
        console.error(error);
        auctionDetails.innerHTML = "Errore durante il caricamento dei dettagli.";
    }
});
