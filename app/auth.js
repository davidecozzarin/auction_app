const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db.js");

const SALT_ROUNDS = 10;

// POST api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password, name, surname } = req.body;
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user) {
      return res.status(409).json({ msg: "Utente già esistente" });
    }

    const lastUser = await mongo
      .collection("users")
      .findOne({}, { sort: { id: -1 } });
    let id = lastUser?.id !== undefined ? lastUser.id : 0;
    id++;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = { id, username, password: hashedPassword, name, surname };
    await mongo.collection("users").insertOne(newUser);

    res.status(201).json({ msg: "Utente creato con successo" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Errore Server Interno" });
  }
});

// POST api/auth/signin
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ msg: "Username e password errati" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Username e password errati" });
    }
    const tokenData = { id: user._id.toString() };
    const token = jwt.sign(tokenData, "my cats are better", { expiresIn: "1h" }); 
     res.cookie("token", token, { httpOnly: true });
     return res.status(200).json({ msg: "Autenticazione avvenuta con successo", token });
 } catch (error) {
     console.error("Errore durante il login:", error.message);
     res.status(500).json({ msg: "Errore Server Interno" });
 }
});

module.exports = router;
