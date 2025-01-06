const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth.js"); // Import delle rotte di autenticazione
const auctionRoutes = require("./route.js");
const path = require("path");
const verifyToken = require("./middleware/authMiddleware"); 

const app = express();

// Middleware generali
app.use(express.json());
app.use(cookieParser());

// Risorse pubbliche
app.use(express.static(path.join(__dirname, "public")));

// Rotte di autenticazione e API
app.use("/api/auth", authRoutes);
app.use("/api", auctionRoutes);

// Gestione risorse protette se serve qui
app.use("/private", verifyToken, express.static(path.join(__dirname, "private")));

// Porta del server (default 3000, ma può essere configurata)
const PORT = process.env.PORT || 3000;

// Avvio del server
app.listen(PORT, () => {
    console.log(`Web server started on http://localhost:${PORT}`);
});
