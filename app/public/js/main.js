document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctions-list");
    const categoryFilter = document.getElementById("filter-category");
  
    // Funzione per caricare le aste
    async function loadAuctions(category = "") {
      const response = await fetch(`/api/auctions?category=${category}`);
      const auctions = await response.json();
      auctionsList.innerHTML = auctions
        .map(
          (auction) => `
          <div class="auction">
            <h2>${auction.title}</h2>
            <p>${auction.description}</p>
            <p><strong>Prezzo corrente:</strong> €${auction.currentBid}</p>
            <p><strong>Categoria:</strong> ${auction.category}</p>
          </div>`
        )
        .join("");
    }
  
    // Inizializza la pagina con tutte le aste
    loadAuctions();
  
    // Filtro per categoria
    categoryFilter.addEventListener("change", () => {
      const category = categoryFilter.value;
      loadAuctions(category);
    });
  });
  