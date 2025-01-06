const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const verifyToken = (req, res, next) => {
    const token = req.cookies["token"];
    console.log("Token ricevuto:", token);
    if (!token) {
        console.log("Nessun token fornito");
        return res.status(403).send("Nessun token fornito");
    }
    try {
        const decoded = jwt.verify(token, "my cats are better"); 
        console.log("Token decodificato con successo:", decoded);
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            throw new Error("ObjectId non valido nel token");
        }
        req.userId = new mongoose.Types.ObjectId(decoded.id); 
        next(); 
    } catch (err) {
        console.error("Errore nella verifica del token:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).send("Accesso negato: token scaduto");
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).send("Accesso negato: token scaduto");
        }
        return res.status(500).send("Errore Server Interno");
    }
};

module.exports = verifyToken;
