const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ CREATE user (Register)
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

// ✅ READ (Login) by phone
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

// ✅ UPDATE user info by phone
router.put("/", (req, res) => {
  const { phone, username, gender } = req.body;
  if (!phone || (!username && !gender)) {
    return res.status(400).json({ message: "Phone and new data required" });
  }

  let updates = [];
  let values = [];

  if (username) {
    updates.push("username = ?");
    values.push(username);
  }

  if (gender) {
    updates.push("gender = ?");
    values.push(gender);
  }

  values.push(phone);

  const sql = `UPDATE users SET ${updates.join(", ")} WHERE phone = ?`;
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating user:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  });
});

// ✅ DELETE user by phone
router.delete("/", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  const sql = "DELETE FROM users WHERE phone = ?";
  db.query(sql, [phone], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;
