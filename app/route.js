const express = require("express");
const router = express.Router();
const db = require("./db.js");
const verifyToken = require("./middleware/authMiddleware");
const { ObjectId } = require("./db.js");

// GET /api/users/?q=query
router.get("/users", async (req, res) => {
  try {
    const query = req.query.q || "";
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");
    const users = await usersCollection.find({ username: { $regex: query, $options: "i" } }).toArray();
    res.json(users);
  } catch (error) {
    console.error("Errore durante il recupero degli utenti:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// GET api/users/:id
router.get("/users/:id", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ msg: "Utente non trovato" });
    res.json(user);
  } catch (error) {
    console.error("Errore nel recupero del'utente con ID:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// PUT /api/users  (Modifica nome e cognome utente)
router.put("/users", verifyToken, async (req, res) => {
  try {
    const { name, surname } = req.body;
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");
  
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.userId) }, 
      { $set: { name, surname } },  
    );
    res.status(200).json({msg: "Profilo Utente modificato correttamente"})
  } catch (error) {
    console.error("Errore durante la modifica del profilo:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// GET /api/auctions
router.get("/auctions", async (req, res) => {
  try {
    const { category = "" } = req.query;
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const usersCollection = mongo.collection("users");

    const filter = {};
    if (category) {
      filter.category = category;
    }
    const auctions = await auctionsCollection.find(filter).toArray();
    const now = new Date();
    const enrichedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const isExpired = new Date(auction.endDate) <= now;
        let winner = null;
        let winnerName = null;

        if (isExpired && auction.bids?.length > 0) {
          const highestBid = auction.bids.reduce((highest, bid) =>
            bid.amount > highest.amount ? bid : highest, auction.bids[0]
          );
          winner = highestBid.user;
          const user = await usersCollection.findOne({ _id: new db.ObjectId(winner) });
          winnerName = user ? user.username : "Sconosciuto";
        }
         const detailedBids = await Promise.all(
          (auction.bids || []).map(async (bid) => {
            const user = await usersCollection.findOne({ _id: new db.ObjectId(bid.user) });
            return {
              ...bid,
              userName: user ? user.username : "Anonimo",
            };
          })
        );
        return {
          ...auction,
          isExpired,
          winner,
          winnerName,
          bids: detailedBids,
        };
      })
    );
    res.json(enrichedAuctions);
  } catch (error) {
    console.error("Errore durante il caricamento delle aste:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// POST /auctions
router.post("/auctions", verifyToken, async (req, res) => {
  try {
    const { title, description, startPrice, endDate, category } = req.body;
    const endDateTime = new Date(endDate);
    if (endDateTime <= new Date()) {
      return res.status(400).json({ msg: "La data di fine dev'essere futura!" });
    }
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const newAuction = {
      title,
      description,
      startPrice,
      currentBid: startPrice,
      endDate: endDateTime,
      category,
      createdBy: req.userId,
    };
    await auctionsCollection.insertOne(newAuction);
    res.status(201).json({ msg: "Asta creata correttamente", auction: newAuction });
  } catch (error) {
    console.error("Errore nella creazione dell'asta:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// GET /api/auctions/:id
router.get("/auctions/:id", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) return res.status(404).json({ msg: "Asta non trovata" });
    res.json(auction);
  } catch (error) {
    console.error("Errore nel caricamento dell'asta:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// PUT /api/auctions/:id
router.put("/auctions/:id", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) {
      return res.status(404).json({ msg: "Asta non trovata" });
    }
    const currentTime = new Date();
    if (new Date(auction.endDate) <= currentTime) {
      return res.status(403).json({ msg: "Non è posssibile modificare le aste terminate!" });
    }
    const result = await auctionsCollection.updateOne(
      { _id: new ObjectId(req.params.id), createdBy: new ObjectId(req.userId) },
      { $set: { title, description } }
    );
    if (result.matchedCount === 0) {
        return res.status(403).json({ msg: "Modifica non consentita!" });
    }
    res.status(200).json({ msg: "Asta modificata correttamente" });
  } catch (error) {
    console.error("Errore durante la modifica dell'asta:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// DELETE /api/auctions/:id
router.delete("/auctions/:id", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const result = await auctionsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.userId,
    });
    if (result.deletedCount === 0) {
      return res.status(403).json({ msg: "Modifica non consentita!" });
    }
    res.json({ msg: "Asta Eliminata" });
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// GET /api/auctions/:id/bids
router.get("/auctions/:id/bids", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) return res.status(404).json({ msg: "Asta non trovata" });
    res.json(auction.bids || []);
  } catch (error) {
    console.error("Errore durante il recupero delle offerte:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// POST /api/auctions/:id/bids
router.post("/auctions/:id/bids", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");
    const usersCollection = mongo.collection("users");
    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) {
      return res.status(404).json({ msg: "Asta non trovata" });
    }
    if (new Date() > auction.endDate) {
      return res.status(400).json({ msg: "L'asta è terminata" });
    }
    const bidAmount = parseFloat(amount); 
    const currentBid = parseFloat(auction.currentBid); 
    if (isNaN(bidAmount) || bidAmount <= currentBid) {
      return res.status(400).json({ msg: "La tua offerta dev'essere più alta di quella corrente!" });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ msg: "Utente non trovato" });
    }
    const newBid = {
      user: req.userId, 
      userName: user.username, 
      amount,
      date: new Date(),
    };
    const updatedAuction = await auctionsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { bids: newBid },
        $set: { currentBid: amount },
      },
      { returnDocument: "after" }
    );
    res.json({ msg: "Offerta effettuata correttamente", auction: updatedAuction.value });
  } catch (error) {
    console.error("Errore durante l'inserimento dell'offerta:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// GET /api/whoami
router.get("/whoami", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ msg: "Utente non trovato" });
    }
    res.json({ id: user._id, username: user.username, name: user.name, surname: user.surname });
  } catch (error) {
    console.error("Errore nel caricamento dati utente:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

module.exports = router;
