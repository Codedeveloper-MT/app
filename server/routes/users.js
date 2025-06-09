const express = require("express");
const router = express.Router();
const db = require("../db");

// Register user
router.post("/", (req, res) => {
  const { username, phone, gender } = req.body;
  if (!username || !phone || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO users (username, phone, gender) VALUES (?, ?, ?)";
  db.query(sql, [username, phone, gender], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({
      message: "User created",
      user: { id: result.insertId, username, phone, gender },
    });
  });
});

// Login by phone
router.get("/login", (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  const sql = "SELECT * FROM users WHERE phone = ?";
  db.query(sql, [phone], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Login successful", user: results[0] });
  });
});

module.exports = router;
