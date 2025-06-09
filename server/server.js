const express = require("express");
const router = express.Router();
const db = require("../db");

// Save navigation history event
router.post("/", (req, res) => {
  const { userId, page, eventTime, details } = req.body;
  if (!userId || !page || !eventTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = "INSERT INTO navigation_history (user_id, page, event_time, details) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, page, eventTime, details || null], (err, result) => {
    if (err) {
      console.error("Error saving navigation history:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Navigation event saved", id: result.insertId });
  });
});

module.exports = router;
