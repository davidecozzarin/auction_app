const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth.js");
const auctionRoutes = require("./route.js");
const path = require("path");

const app = express();

// Middleware generali
app.use(express.json());
app.use(cookieParser());

// Risorse pubbliche
app.use(express.static(path.join(__dirname, "public")));

// Rotte di autenticazione e API
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);

// Gestione risorse protette con controllo del token
app.use("/private", (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).send("Access Denied: No Token Provided");
    }
    try {
        const verified = jwt.verify(token, "my cats are better"); // Assicurati di usare la stessa chiave segreta
        req.user = verified; // Salva i dati decodificati del token nella richiesta
        next(); // Passa al middleware successivo
    } catch (error) {
        return res.status(403).send("Access Denied: Invalid Token");
    }
}, express.static(path.join(__dirname, "private")));

// Porta del server (default 3000, ma può essere configurata)
const PORT = process.env.PORT || 3000;

// Avvio del server
app.listen(PORT, () => {
    console.log(`Web server started on http://localhost:${PORT}`);
});
