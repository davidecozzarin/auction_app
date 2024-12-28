const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db.js");
const User = require("./models/User");
const Auction = require("./models/Auction");
const verifyToken = require("./middleware/authMiddleware");
const bcrypt = require("bcrypt");
const { connectToDatabase, ObjectId } = require("./db.js");


const SALT_ROUNDS = 10; // Numero di round per l'hashing (più alto, più sicuro ma lento)

// POST /signup: Registrazione di un nuovo utente con hashing della password
router.post("/auth/signup", async (req, res) => {
  try {
    const { username, password, name, surname, bio } = req.body;

    // Connessione al database
    const mongo = await db.connectToDatabase();

    // Controlla se l'utente esiste già
    const user = await mongo.collection("users").findOne({ username });
    if (user) {
      return res.status(409).json({ msg: "User already exists" });
    }

    // Trova l'ultimo ID e incrementalo
    const lastUser = await mongo
      .collection("users")
      .findOne({}, { sort: { id: -1 } });
    let id = lastUser?.id !== undefined ? lastUser.id : 0;
    id++;

    // Hash della password con bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crea il nuovo utente con password criptata
    const newUser = { id, username, password: hashedPassword, name, surname, bio };
    await mongo.collection("users").insertOne(newUser);

    res.status(201).json({ msg: "User successfully created" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// POST /signin: Login utente con verifica sicura della password
router.post("/auth/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Connessione al database
    const mongo = await db.connectToDatabase();

    // Trova l'utente nel database
    const user = await mongo.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Confronta la password fornita con quella criptata salvata nel DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

     // Genera un nuovo token
     const tokenData = { id: user._id.toString() };
     const token = jwt.sign(tokenData, "my cats are better", { expiresIn: "1h" }); // Token valido per 1 ora
     console.log("[/signin] Nuovo token generato:", token);

     // Imposta il cookie
     res.cookie("token", token, { httpOnly: true });
     return res.status(200).json({ msg: "Successfully authenticated", token });
 } catch (error) {
     console.error("[/signin] Errore durante il login:", error.message);
     res.status(500).json({ msg: "Internal Server Error" });
 }
});

// GET /api/users/?q=query
router.get("/users", async (req, res) => {
  try {
    const query = req.query.q || "";
    
    // Connessione al database
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");

    // Ricerca degli utenti con `username` che corrisponde alla query
    const users = await usersCollection.find({ username: { $regex: query, $options: "i" } }).toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    // Connessione al database
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");

    // Cerca l'utente per ID
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

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

    // Enrich auctions with expiration status and winner name
    const enrichedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const isExpired = new Date(auction.endDate) <= now;
        let winner = null;
        let winnerName = null;

        if (isExpired && auction.bids?.length > 0) {
          // Find the highest bid
          const highestBid = auction.bids.reduce((highest, bid) =>
            bid.amount > highest.amount ? bid : highest, auction.bids[0]
          );
          winner = highestBid.user;

          // Find the username of the winner
          const user = await usersCollection.findOne({ _id: new db.ObjectId(winner) });
          winnerName = user ? user.username : "Sconosciuto";
        }

        return {
          ...auction,
          isExpired,
          winner,
          winnerName, // Add the winner's username
        };
      })
    );

    res.json(enrichedAuctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// POST /auctions: Crea una nuova asta
router.post("/auctions", verifyToken, async (req, res) => {
  try {
    const { title, description, startPrice, endDate, category } = req.body;

    // Controlla che la data di fine sia valida
    const endDateTime = new Date(endDate);
    if (endDateTime <= new Date()) {
      return res.status(400).json({ msg: "End date must be in the future" });
    }

    // Connessione alla collezione aste
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");

    // Crea la nuova asta
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

    res.status(201).json({ msg: "Auction created successfully", auction: newAuction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/auctions/:id", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");

    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) return res.status(404).json({ msg: "Auction not found" });

    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// PUT /api/auctions/:id
router.put("/auctions/:id", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");

    const result = await auctionsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), createdBy: req.userId },
      { $set: { title, description } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(403).json({ msg: "Not authorized to modify this auction or auction not found" });
    }

    res.json(result.value);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ msg: "Internal Server Error" });
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
      return res.status(403).json({ msg: "Not authorized to delete this auction or auction not found" });
    }

    res.json({ msg: "Auction deleted" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// GET /api/auctions/:id/bids
router.get("/auctions/:id/bids", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");

    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) return res.status(404).json({ msg: "Auction not found" });

    res.json(auction.bids || []);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// POST /api/auctions/:id/bids
router.post("/auctions/:id/bids", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const mongo = await db.connectToDatabase();
    const auctionsCollection = mongo.collection("auctions");

    const auction = await auctionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!auction) {
      return res.status(404).json({ msg: "Auction not found" });
    }

    if (new Date() > auction.endDate) {
      return res.status(400).json({ msg: "Auction is closed" });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ msg: "Bid must be higher than the current bid" });
    }

    // Aggiungi l'offerta
    const updatedAuction = await auctionsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { bids: { user: req.userId, amount, date: new Date() } },
        $set: { currentBid: amount },
      },
      { returnDocument: "after" }
    );

    res.json({ msg: "Bid placed successfully", auction: updatedAuction.value });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// GET /api/whoami
router.get("/whoami", verifyToken, async (req, res) => {
  try {
    // Connessione al database
    const mongo = await db.connectToDatabase();
    const usersCollection = mongo.collection("users");

    // Trova l'utente in base all'ID decodificato dal token
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Rispondi con i dati dell'utente
    res.json({ id: user._id, username: user.username, name: user.name, surname: user.surname, bio: user.bio });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
