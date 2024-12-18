const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies["token"];
    if (!token) {
        return res.status(403).json({ msg: "Accesso negato! Autenticazione richiesta." });
    }

    try {
        const decoded = jwt.verify(token, "my cats are better"); // Chiave JWT
        req.userId = decoded.id; // Assegna l'ID utente al request
        next(); // Passa al prossimo middleware o handler
    } catch (err) {
        res.status(401).json({ msg: "Token non valido" });
    }
};

module.exports = verifyToken;
