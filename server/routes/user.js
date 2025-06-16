const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ✅ Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    console.warn("❌ No token provided");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ GET /api/users → List all users except the logged-in one
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }).select("name email");
    console.log(`✅ Returning ${users.length} users (excluding self)`);
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
