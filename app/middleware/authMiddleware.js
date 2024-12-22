const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const verifyToken = (req, res, next) => {
    const token = req.cookies["token"];
    console.log("[Middleware] Token ricevuto:", token);

    if (!token) {
        console.log("[Middleware] Nessun token fornito");
        return res.status(403).send("Access Denied: No Token Provided");
    }

    try {
        const decoded = jwt.verify(token, "my cats are better"); // Chiave JWT
        console.log("[Middleware] Token decodificato con successo:", decoded);

        // Convalida e converte l'id in ObjectId se necessario
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            throw new Error("Invalid ObjectId in token");
        }
        req.userId = new mongoose.Types.ObjectId(decoded.id); // Converte in ObjectId

        next(); // Procedi al prossimo middleware o route
    } catch (err) {
        console.error("[Middleware] Errore nella verifica del token:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).send("Access Denied: Token Expired");
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(401).send("Access Denied: Invalid Token");
        }

        // Qualsiasi altro errore
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = verifyToken;
