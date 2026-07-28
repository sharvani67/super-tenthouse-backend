// routes/addons.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ====================================
// GET ALL ADD-ONS
// ====================================
router.get("/", (req, res) => {
  const sql = `
    SELECT * FROM addons
    WHERE is_active = 1
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching add-ons:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET SINGLE ADD-ON
// ====================================
router.get("/:id", (req, res) => {
  const sql = `
    SELECT * FROM addons
    WHERE id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching add-on:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Add-on not found" });
    }
    res.json(result[0]);
  });
});

module.exports = router;