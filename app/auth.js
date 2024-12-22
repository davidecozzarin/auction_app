/*

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./db.js");
const router = express.Router();

const SALT_ROUNDS = 10; // Numero di round per l'hashing (più alto, più sicuro ma lento)

// POST /signup: Registrazione di un nuovo utente con hashing della password
router.post("/signup", async (req, res) => {
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
router.post("/signin", async (req, res) => {
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
     const tokenData = { id: user.id };
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

module.exports = router;
*/