const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/navigation - Save navigation history entry
router.post("/", (req, res) => {
  const {
    userId,    // assuming you send userId to link history
    origin,
    destination,
    startTime,
    endTime,
    startCoords,
    endCoords,
    timestamp,
  } = req.body;

  if (!userId || !origin || !destination) {
    return res.status(400).json({ message: "userId, origin, and destination are required" });
  }

  const sql = `
    INSERT INTO navigation_history 
    (user_id, origin, destination, start_time, end_time, start_lat, start_lon, end_lat, end_lon, timestamp) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    userId,
    origin,
    destination,
    startTime ? new Date(startTime) : null,
    endTime ? new Date(endTime) : null,
    startCoords ? startCoords.lat : null,
    startCoords ? startCoords.lon : null,
    endCoords ? endCoords.lat : null,
    endCoords ? endCoords.lon : null,
    timestamp ? new Date(timestamp) : new Date()
  ], (err, result) => {
    if (err) {
      console.error("❌ Failed to insert navigation entry:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
      message: "Navigation history saved",
      id: result.insertId,
    });
  });
});

// GET /api/navigation/:userId - Get navigation history for a user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT * FROM navigation_history WHERE user_id = ? ORDER BY timestamp DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch navigation history:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});

module.exports = router;
