const express = require("express");
const router = express.Router();
const db = require("../db");

// Save assistant session
router.post("/", (req, res) => {
  const { sessionId, userId, startedAt } = req.body;
  if (!sessionId || !userId || !startedAt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = "INSERT INTO vapi_sessions (session_id, user_id, started_at) VALUES (?, ?, ?)";
  db.query(sql, [sessionId, userId, startedAt], (err, result) => {
    if (err) {
      console.error("Error saving vapi session:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Session saved", id: result.insertId });
  });
});

module.exports = router;
