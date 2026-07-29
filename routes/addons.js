// routes/addons.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ====================================
// GET ALL ADD-ONS
// ====================================
router.get("/", (req, res) => {
  const sql = `
    SELECT * FROM addons WHERE is_active = 1 ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching add-ons:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET SINGLE ADD-ON
// ====================================
router.get("/:id", (req, res) => {
  const sql = `SELECT * FROM addons WHERE id = ?`;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching add-on:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Add-on not found" });
    }
    res.json(results[0]);
  });
});

// ====================================
// CREATE ADD-ON
// ====================================
router.post("/", (req, res) => {
  try {
    const { name, price, icon, description, category, is_active } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const sql = `
      INSERT INTO addons (name, price, icon, description, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name.trim(),
        parseFloat(price) || 0,
        icon || '📦',
        description || null,
        category || 'General',
        is_active !== undefined ? parseInt(is_active) : 1,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating add-on:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: "Add-on created successfully",
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error in add-on creation:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// UPDATE ADD-ON
// ====================================
router.put("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, icon, description, category, is_active } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const sql = `
      UPDATE addons
      SET
        name = ?,
        price = ?,
        icon = ?,
        description = ?,
        category = ?,
        is_active = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        name.trim(),
        parseFloat(price) || 0,
        icon || '📦',
        description || null,
        category || 'General',
        is_active !== undefined ? parseInt(is_active) : 1,
        id,
      ],
      (err) => {
        if (err) {
          console.error("Error updating add-on:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: "Add-on updated successfully",
        });
      }
    );
  } catch (error) {
    console.error("Error in add-on update:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// DELETE ADD-ON
// ====================================
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM addons WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting add-on:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Add-on deleted successfully",
    });
  });
});

module.exports = router;