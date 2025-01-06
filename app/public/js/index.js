import { AuctionLoader, updateActiveButton } from "./filters.js";
import { setupModals } from "./auth-modal.js";

document.addEventListener("DOMContentLoaded", () => {
    setupModals();

    const auctionsList = document.getElementById("auctions-list");
    const categoryButtons = document.querySelectorAll(".category-icon");
    const filterButtons = document.querySelectorAll(".filter-button");

    // Definiamo il template specifico per la homepage
    const renderHomeAuctionTemplate = auction => {
        const endDate = new Date(auction.endDate);
        const now = new Date();
        const isExpired = auction.isExpired || endDate <= now;
        let timeRemaining = '';
                    if (!isExpired) {
                        const totalMinutes = Math.max(0, Math.ceil((endDate - now) / 1000 / 60));
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        timeRemaining = `<span class="time-remaining">Rimangono ${hours} ore e ${minutes} minuti</span>`;
                    } else {
                        timeRemaining = '<span class="expired-message">Asta Terminata</span>';
                    }
           
        return `
            <div class="auction" data-auction-id="${auction._id}">
                <h3>${auction.title}</h3>
                <p>${timeRemaining}</p>
                <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
            </div>
        `;
    };

    const auctionLoader = new AuctionLoader(renderHomeAuctionTemplate);

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(categoryButtons, button);
            const category = button.textContent === "Tutte" ? "" : button.textContent.trim();
            const activeFilterButton = document.querySelector(".filter-button.active");
            const filter = activeFilterButton ? activeFilterButton.getAttribute("data-filter") : "all";
            auctionLoader.load(category, filter, auctionsList);
        });
    });

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(filterButtons, button);
            const activeCategoryButton = document.querySelector(".category-icon.active");
            const category = activeCategoryButton ? activeCategoryButton.textContent.trim() : "";
            const filter = button.getAttribute("data-filter");
            auctionLoader.load(category === "Tutte" ? "" : category, filter, auctionsList);
        });
    });

    const defaultCategoryButton = document.querySelector(".category-icon:first-child");
    const defaultFilterButton = document.querySelector('.filter-button[data-filter="all"]');
    if (defaultCategoryButton) defaultCategoryButton.click();
    if (defaultFilterButton) defaultFilterButton.click();
});
