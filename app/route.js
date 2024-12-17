const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db.js");
//const verifyToken = require("./middleware/authMiddleware");
const User = require("./models/User");
const Auction = require("./models/Auction");

const verifyToken = (req, res, next) => {
    const token = req.cookies["token"];
    if(!token){
        res.status(403).json({"msg": "Autenticazione fallita"});
        return;
    }

    try {
        const decoded = jwt.verify(token, "my cats are better");
        req.userId = decoded.id;
        next();
    } catch (error){
        res.status(401).json({"msg": "Non autorizzato"});
    }

};

// GET /api/users/?q=query
router.get("/api/users", async (req, res) => {
  const query = req.query.q;
  const users = await User.find({ username: { $regex: query, $options: "i" } });
  res.json(users);
});

// GET /api/users/:id
router.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json(user);
});

// GET /api/auctions?q=query
router.get("/api/auctions", async (req, res) => {
  const query = req.query.q || "";
  const auctions = await Auction.find({ title: { $regex: query, $options: "i" } });
  res.json(auctions);
});

// POST /api/auctions
router.post("/api/auctions", verifyToken, async (req, res) => {
  const { title, description, startPrice, endDate } = req.body;
  const newAuction = new Auction({
    title,
    description,
    startPrice,
    currentBid: startPrice,
    endDate,
    createdBy: req.userId,
  });
  await newAuction.save();
  res.status(201).json(newAuction);
});

// GET /api/auctions/:id
router.get("/api/auctions/:id", async (req, res) => {
  const auction = await Auction.findById(req.params.id).populate("createdBy", "username");
  if (!auction) return res.status(404).json({ msg: "Auction not found" });
  res.json(auction);
});

// PUT /api/auctions/:id
router.put("/api/auctions/:id", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const auction = await Auction.findById(req.params.id);

  if (!auction || auction.createdBy.toString() !== req.userId)
    return res.status(403).json({ msg: "Not authorized to modify this auction" });

  auction.title = title || auction.title;
  auction.description = description || auction.description;
  await auction.save();
  res.json(auction);
});

// DELETE /api/auctions/:id
router.delete("/api/auctions/:id", verifyToken, async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction || auction.createdBy.toString() !== req.userId)
    return res.status(403).json({ msg: "Not authorized to delete this auction" });

  await auction.deleteOne();
  res.json({ msg: "Auction deleted" });
});

// GET /api/auctions/:id/bids
router.get("/api/auctions/:id/bids", async (req, res) => {
  const auction = await Auction.findById(req.params.id).populate("bids.user", "username");
  if (!auction) return res.status(404).json({ msg: "Auction not found" });
  res.json(auction.bids);
});

// POST /api/auctions/:id/bids
router.post("/api/auctions/:id/bids", verifyToken, async (req, res) => {
  const { amount } = req.body;
  const auction = await Auction.findById(req.params.id);

  if (!auction || new Date() > auction.endDate) {
    return res.status(400).json({ msg: "Auction is closed or does not exist" });
  }

  if (amount <= auction.currentBid) {
    return res.status(400).json({ msg: "Bid must be higher than the current bid" });
  }

  auction.bids.push({ user: req.userId, amount });
  auction.currentBid = amount;
  await auction.save();
  res.json({ msg: "Bid placed successfully", currentBid: auction.currentBid });
});

// GET /api/whoami
router.get("/api/whoami", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json({ id: user._id, username: user.username });
});

module.exports = router;
