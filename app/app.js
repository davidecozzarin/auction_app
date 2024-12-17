const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth.js");
const auctionRoutes = require("./route.js");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// Rotte
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);

// Avvio server
app.listen(3000, () => {
    console.log("Web server started on http://localhost:3000");
});
