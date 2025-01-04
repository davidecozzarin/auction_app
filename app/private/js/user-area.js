document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadUserAuctions();

    // Torna alla dashboard
    document.getElementById("back-to-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html"; // Percorso della dashboard principale
    });

    // Salva le modifiche al profilo
    document.getElementById("update-profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("user-name").value.trim();
        const surname = document.getElementById("user-surname").value.trim();
        const bio = document.getElementById("user-bio").value.trim();

        console.log({ name, surname, bio });

        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${document.cookie.split('token=')[1]}`
                 },
                body: JSON.stringify({ name, surname, bio }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.ok) {
                alert("Profilo aggiornato con successo!");
            } else {
                alert(data.msg || "Errore durante l'aggiornamento del profilo.");
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento del profilo:", error);
        }
    });
});

// Carica le informazioni del profilo utente
async function loadUserProfile() {
    try {
        const response = await fetch("/api/whoami");
        if (response.ok) {
            const user = await response.json();
            document.getElementById("user-name").value = user.name || "";
            document.getElementById("user-surname").value = user.surname || "";
            document.getElementById("user-bio").value = user.bio || "";
        } else {
            alert("Errore durante il caricamento del profilo.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento del profilo:", error);
    }
}

// Carica le aste personali con layout simile alla dashboard
async function loadUserAuctions() {
    console.log("Caricamento aste...");
    try {
        // Recupera l'ID dell'utente autenticato
        const userResponse = await fetch("/api/whoami");
        if (!userResponse.ok) {
            alert("Errore nel recupero dell'utente.");
            return;
        }
        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch("/api/auctions");
        if (response.ok) {
            const auctions = await response.json();
            const filteredAuctions = auctions.filter(auction => auction.createdBy === userId); 
            const userAuctionsList = document.getElementById("user-auctions-list");

            // Aggiorna l'HTML con un layout simile alla dashboard
            userAuctionsList.innerHTML = filteredAuctions
                .map((auction) => {
                    const endDate = new Date(auction.endDate);
                    const formattedDate = endDate.toLocaleDateString();
                    const formattedTime = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return `
                        <div class="auction" data-auction-id="${auction._id}">
                            <h2>${auction.title}</h2>
                            <p>${auction.description}</p>
                            <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
                            <p><strong>Categoria:</strong> ${auction.category}</p>
                            <p><strong>Data di fine:</strong> ${formattedDate} alle ${formattedTime}</p>
                            <div class="actions">
                                <button class="edit-auction-button" data-auction-id="${auction._id}">Modifica</button>
                                <button class="delete-auction-button" data-auction-id="${auction._id}">Elimina</button>
                            </div>
                        </div>
                    `;
                })
                .join("");

            // Aggiungi gli event listener per i pulsanti
            addAuctionListeners();  
        } else {
            alert("Errore durante il caricamento delle aste dell'utente.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle aste dell'utente:", error);
    }
}


function addAuctionListeners() {
    console.log("Aggiunta dei listener per le aste...");

    document.querySelectorAll(".edit-auction-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const auctionId = e.target.getAttribute("data-auction-id");
            console.log("Clic su modifica per l'asta ID:", auctionId);
            openEditAuctionModal(auctionId);
        });
    });

    // Listener per il pulsante "Elimina"
    document.querySelectorAll(".delete-auction-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const auctionId = e.target.getAttribute("data-auction-id");
            if (confirm("Sei sicuro di voler eliminare questa asta?")) {
                try {
                    const response = await fetch(`/api/auctions/${auctionId}`, {
                        method: "DELETE",
                    });
                    if (response.ok) {
                        alert("Asta eliminata con successo!");
                        loadUserAuctions(); // Ricarica le aste
                    } else {
                        alert("Errore durante l'eliminazione dell'asta.");
                    }
                } catch (error) {
                    console.error("Errore durante l'eliminazione:", error);
                }
            }
        });
    });
}

function openEditAuctionModal(auctionId) {
    const auctionElement = document.querySelector(`.auction[data-auction-id="${auctionId}"]`);
    const title = auctionElement.querySelector("h2").textContent;
    const description = auctionElement.querySelector("p").textContent;

    const modal = document.getElementById("auction-modal");
    document.getElementById("modal-auction-title").value = title;
    document.getElementById("modal-auction-description").value = description;

    modal.classList.remove("hidden");

    // Rimuovi eventuali listener precedenti
    const form = document.getElementById("auction-modal-form");
    const newForm = form.cloneNode(true); // Crea un clone del form per rimuovere tutti i listener
    form.parentNode.replaceChild(newForm, form); // Sostituisci il vecchio form con il clone

    // Aggiungi il nuovo listener
    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedTitle = document.getElementById("modal-auction-title").value.trim();
        const updatedDescription = document.getElementById("modal-auction-description").value.trim();
        console.log("Dati aggiornati:", updatedTitle, updatedDescription);
        try {
            const response = await fetch(`/api/auctions/${auctionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: updatedTitle, description: updatedDescription }),
            });
            console.log("Stato della risposta:", response.status); // Log dello status code
            if (response.ok) {
                console.log("if ok");
                alert("Asta aggiornata con successo!");
                await loadUserAuctions();
                closeEditAuctionModal();
            } else {
                alert("Errore durante l'aggiornamento dell'asta.");
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento dell'asta:", error);
        }
    });

    document.getElementById("close-auction-modal").addEventListener("click", closeEditAuctionModal);
}

