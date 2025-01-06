import { AuctionLoader, updateActiveButton } from "/js/filters.js";

document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctions-list");
    const categoryButtons = document.querySelectorAll(".category-icon");
    const filterButtons = document.querySelectorAll(".filter-button");

    // Template specifico per la dashboard
    const renderDashboardAuctionTemplate = auction => {
        const endDate = new Date(auction.endDate);
        const now = new Date();
        const isExpired = auction.isExpired || endDate <= now;

        let timeRemaining = isExpired
            ? '<span class="expired-message">Asta Terminata</span>'
            : `<span class="time-remaining">Tempo Rimanente: ${Math.floor((endDate - now) / (1000 * 60 * 60))} ore</span>`;

        return `
            <div class="auction" data-auction-id="${auction._id}">
                <h3>${auction.title}</h3>
                <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                <p>${timeRemaining}</p>
                <button class="view-details" data-auction-id="${auction._id}">Vedi Dettagli</button>
            </div>
        `;
    };

    const auctionLoader = new AuctionLoader(renderDashboardAuctionTemplate);

    const attachViewDetailsEventListeners = () => {
        document.querySelectorAll(".view-details").forEach(button => {
            button.addEventListener("click", () => {
                const auctionId = button.getAttribute("data-auction-id");
                window.location.href = `auction-details.html?id=${auctionId}`;
            });
        });
    };

    // Event listener per i pulsanti delle categorie
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(categoryButtons, button);
            const category = button.textContent === "Tutte" ? "" : button.textContent.trim();
            const activeFilterButton = document.querySelector(".filter-button.active");
            const filter = activeFilterButton ? activeFilterButton.getAttribute("data-filter") : "all";
            auctionLoader.load(category, filter, auctionsList).then(attachViewDetailsEventListeners);
        });
    });

    // Event listener per i pulsanti dei filtri
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(filterButtons, button);
            const activeCategoryButton = document.querySelector(".category-icon.active");
            const category = activeCategoryButton ? activeCategoryButton.textContent.trim() : "";
            const filter = button.getAttribute("data-filter");
            auctionLoader.load(category === "Tutte" ? "" : category, filter, auctionsList).then(attachViewDetailsEventListeners);
        });
    });

    // Imposta lo stato predefinito
    const defaultCategoryButton = document.querySelector(".category-icon:first-child");
    const defaultFilterButton = document.querySelector('.filter-button[data-filter="all"]');
    if (defaultCategoryButton) defaultCategoryButton.click();
    if (defaultFilterButton) defaultFilterButton.click();

    // Logout
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            alert("Logout effettuato con successo!");
            window.location.href = "/index.html";
        });
    }

    // Navigazione verso l'area utente
    const userAreaButton = document.getElementById("user-area-button");
    if (userAreaButton) {
        userAreaButton.addEventListener("click", () => {
            window.location.href = "user-area.html";
        });
    }

    const userListButton = document.getElementById("user-list-button");
    if (userListButton) {
        userListButton.addEventListener("click", () => {
            window.location.href = "user-list.html";
        });
    }

    // Aggiungi saluto per l'utente
    const userGreeting = document.getElementById("user-greeting");
    if (userGreeting) {
        fetch("/api/whoami", {
            headers: {
                "Authorization": `Bearer ${document.cookie.split("token=")[1]}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Errore nel recupero dei dettagli dell'utente");
                return response.json();
            })
            .then(userData => {
                userGreeting.textContent = `- Ciao ${userData.username}`;
            })
            .catch(error => {
                console.error("Errore nel caricamento dei dati utente:", error);
                userGreeting.textContent = "- Ciao Ospite";
            });
    }

    // Gestione del popup per l'aggiunta di nuove aste
    const popupModal = document.getElementById("popup-modal");
    const addAuctionButton = document.getElementById("add-auction-button");
    const closeButton = document.querySelector(".close-button");
    const popupForm = document.getElementById("popup-add-auction-form");

    if (addAuctionButton && popupModal && closeButton && popupForm) {
        addAuctionButton.addEventListener("click", () => {
            popupModal.classList.remove("hidden");
        });

        closeButton.addEventListener("click", () => {
            popupModal.classList.add("hidden");
        });

        popupModal.addEventListener("click", e => {
            if (e.target === popupModal) {
                popupModal.classList.add("hidden");
            }
        });

        popupForm.addEventListener("submit", async e => {
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
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        startPrice,
                        category,
                        endDate: endDateTime.toISOString()
                    })
                });

                if (response.ok) {
                    alert("Asta aggiunta con successo!");
                    popupModal.classList.add("hidden");
                    popupForm.reset();
                    auctionLoader.load("", "all", auctionsList).then(attachViewDetailsEventListeners);
                } else {
                    alert("Errore durante l'aggiunta dell'asta.");
                }
            } catch (error) {
                console.error("Errore durante l'aggiunta:", error);
            }
        });
    }
});
