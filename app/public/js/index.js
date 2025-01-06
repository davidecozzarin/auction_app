document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctions-list");
    const categoryButtons = document.querySelectorAll(".category-icon");
    const filterButtons = document.querySelectorAll(".filter-button");

    /**
     * Aggiorna lo stato attivo di un pulsante
     */
    function updateActiveButton(buttons, activeButton) {
        buttons.forEach(button => {
            button.classList.remove("active");
        });
        activeButton.classList.add("active");
    }

    /**
     * Carica le aste in base alla categoria e al filtro attivi
     */
    async function loadAuctions() {
        console.log("Caricamento delle aste...");
        
        // Trova la categoria e il filtro attivi
        const activeCategoryButton = document.querySelector(".category-icon.active");
        const category = activeCategoryButton ? activeCategoryButton.textContent.trim() : "";

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

            // Renderizza le aste
            auctionsList.innerHTML = filteredAuctions
                .map(auction => {
                    const endDate = new Date(auction.endDate);
                    const now = new Date();
                    const isExpired = auction.isExpired || endDate <= now;

                    // Calcola il tempo rimanente
                    let timeRemaining = "";
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
                            <p>${auction.description}</p>
                            <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                            <p>${timeRemaining}</p>
                        </div>
                    `;
                })
                .join("");

            // Event listener per i pulsanti "Vedi Dettagli"
            document.querySelectorAll(".view-details").forEach(button => {
                button.addEventListener("click", () => {
                    const auctionId = button.getAttribute("data-auction-id");
                    window.location.href = `auction-details.html?id=${auctionId}`;
                });
            });
        } catch (error) {
            auctionsList.innerHTML = "Errore durante il caricamento delle aste.";
            console.error("Errore nel caricamento delle aste:", error);
        }
    }

    /**
     * Event listener per i bottoni delle categorie
     */
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(categoryButtons, button);
            loadAuctions();
        });
    });

    /**
     * Event listener per i bottoni dei filtri
     */
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(filterButtons, button);
            loadAuctions();
        });
    });

    // Inizializzazione
    const defaultCategoryButton = document.querySelector(".category-icon:first-child");
    const defaultFilterButton = document.querySelector('.filter-button[data-filter="all"]');

    if (defaultCategoryButton) {
        defaultCategoryButton.click(); // Imposta categoria predefinita
    }

    if (defaultFilterButton) {
        defaultFilterButton.click(); // Imposta filtro predefinito
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginModal = document.getElementById("login-modal");
    const signupModal = document.getElementById("signup-modal");
    const authButton = document.getElementById("auth-button");
    const closeButtons = document.querySelectorAll(".close-button");

    // Apertura del login modal
    authButton.addEventListener("click", () => {
        loginModal.classList.remove("hidden");
    });

    // Chiudi i modali
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            loginModal.classList.add("hidden");
            signupModal.classList.add("hidden");
        });
    });

    // Passa al signup modal
    document.getElementById("open-signup-modal").addEventListener("click", () => {
        loginModal.classList.add("hidden");
        signupModal.classList.remove("hidden");
    });

    // Passa al login modal
    document.getElementById("open-login-modal").addEventListener("click", () => {
        signupModal.classList.add("hidden");
        loginModal.classList.remove("hidden");
    });

    // Gestione del login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                alert("Login effettuato con successo!");
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = "/private/dashboard.html";
            } else {
                alert("Errore nel login. Verifica le credenziali.");
            }
        } catch (error) {
            console.error("Errore durante il login:", error);
            alert("Si è verificato un errore durante il login.");
        }
    });

    // Gestione del signup
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
            username: document.getElementById("signup-username").value.trim(),
            password: document.getElementById("signup-password").value.trim(),
            name: document.getElementById("signup-name").value.trim(),
            surname: document.getElementById("signup-surname").value.trim(),
        };

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Registrazione effettuata con successo! Esegui il login.");
                signupModal.classList.add("hidden");
                loginModal.classList.remove("hidden");
            } else {
                alert("Errore durante la registrazione.");
            }
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            alert("Si è verificato un errore durante la registrazione.");
        }
    });
});



/*
document.getElementById("auth-button").addEventListener("click", () => {
  window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctions-list");
    const categoryButtons = document.querySelectorAll(".category-icon");

    // Funzione per caricare le aste
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

    // Funzione per aggiornare lo stato attivo dei pulsanti
    function updateActiveButton(activeButton) {
        categoryButtons.forEach(button => {
            button.classList.remove("active");
        });
        activeButton.classList.add("active");
    }

    // Event listener per i pulsanti delle categorie
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateActiveButton(button); // Aggiorna lo stato attivo
            loadAuctions(); // Ricarica le aste con la nuova categoria
        });
    });
    

    // Inizializzazione
    const defaultButton = document.querySelector(".category-icon:first-child");
    defaultButton.click(); // Simula il clic sul pulsante "Tutte" all'avvio
});
*/
