const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth.js"); 
const auctionRoutes = require("./route.js");
const path = require("path");
const verifyToken = require("./middleware/authMiddleware"); 

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api", auctionRoutes);

app.use("/private", verifyToken, express.static(path.join(__dirname, "private")));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Web server started on http://localhost:${PORT}`);
});
