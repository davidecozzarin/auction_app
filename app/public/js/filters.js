export class AuctionLoader {
    constructor(renderTemplate) {
        this.renderTemplate = renderTemplate;
    }

    async load(category = "", filter = "all", auctionsList) {
        console.log("Caricamento delle aste...");
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
                .map(auction => this.renderTemplate(auction))
                .join("");
        } catch (error) {
            auctionsList.innerHTML = "Errore durante il caricamento delle aste.";
            console.error("Errore:", error);
        }
    }
}

export function updateActiveButton(buttons, activeButton) {
    buttons.forEach(button => button.classList.remove("active"));
    activeButton.classList.add("active");
}
