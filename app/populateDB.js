const { MongoClient } = require("mongodb");
const MONGODB_URI = "mongodb://localhost:27017"; 
const DB_NAME = "auctiondb";

const users = [
  { username: "user1", password: "password1", name: "Mario", surname: "Rossi" },
  { username: "user2", password: "password2", name: "Giulia", surname: "Bianchi" },
  { username: "user3", password: "password3", name: "Luca", surname: "Verdi" }
];

const auctions = [
    { title: "Dipinto antico", description: "Un capolavoro originale del Rinascimento.", startPrice: 5000, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), category: "Arte", createdBy: null },
    { title: "Collana preziosa", description: "Elegante collana con diamanti autentici.", startPrice: 3000, endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), category: "Gioielli", createdBy: null },
    { title: "Monete antiche", description: "Rara collezione di monete storiche.", startPrice: 800, endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), category: "Collezionismo", createdBy: null },
    { title: "Abito elegante", description: "Un abito elegante perfetto per eventi esclusivi.", startPrice: 200, endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), category: "Moda", createdBy: null },
    { title: "Mazza da golf", description: "Perfetto per i golfisti professionisti.", startPrice: 400, endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), category: "Sport", createdBy: null },
    { title: "Whisky raro", description: "Whisky d'annata per intenditori.", startPrice: 1200, endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), category: "Vini e whisky", createdBy: null },
    { title: "Orologio anni 50", description: "Un orologio classico degli anni '50.", startPrice: 2000, endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), category: "Orologi", createdBy: null },
    { title: "Libro antico", description: "Libro raro del XVIII secolo.", startPrice: 700, endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), category: "Libri", createdBy: null },
    { title: "Francobollo XIX", description: "Francobollo raro del XIX secolo.", startPrice: 1500, endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), category: "Monete e francobolli", createdBy: null },
    { title: "Auto restaurata", description: "Un'auto classica perfettamente funzionante.", startPrice: 20000, endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), category: "Auto e moto", createdBy: null },
    { title: "Anfora greca", description: "Reperto archeologico autentico della Grecia antica.", startPrice: 10000, endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), category: "Archeologia", createdBy: null }
];

async function populateDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const usersCollection = db.collection("users");
    const insertedUsers = await usersCollection.insertMany(users);
    console.log(`Inseriti ${insertedUsers.insertedCount} utenti.`);

    const userIds = Object.values(insertedUsers.insertedIds);
    auctions.forEach((auction, index) => {
      auction.createdBy = userIds[index % userIds.length]; 
    });

    const auctionsCollection = db.collection("auctions");
    const insertedAuctions = await auctionsCollection.insertMany(auctions);
    console.log(`Inserite ${insertedAuctions.insertedCount} aste.`);
  } catch (error) {
    console.error("Errore durante la popolazione del database:", error);
  } finally {
    await client.close();
  }
}

populateDatabase();
