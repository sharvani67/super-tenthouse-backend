const express = require("express");
const router = express.Router();
const db = require("../db");

// ==============================
// CREATE CATEGORY
// ==============================
router.post("/", (req, res) => {
  const { category_name } = req.body;

  const sql = `
    INSERT INTO product_categories (category_name)
    VALUES (?)
  `;

  db.query(sql, [category_name], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category added successfully",
      id: result.insertId,
    });
  });
});

// ==============================
// GET ALL CATEGORIES
// ==============================
router.get("/", (req, res) => {
  const sql = `
    SELECT * FROM product_categories
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ==============================
// GET SINGLE CATEGORY
// ==============================
router.get("/:id", (req, res) => {
  const sql = `
    SELECT * FROM product_categories
    WHERE id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result[0]);
  });
});

// ==============================
// UPDATE CATEGORY
// ==============================
router.put("/:id", (req, res) => {
  const { category_name } = req.body;

  const sql = `
    UPDATE product_categories
    SET category_name = ?
    WHERE id = ?
  `;

  db.query(sql, [category_name, req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category updated successfully",
    });
  });
});

// ==============================
// DELETE CATEGORY
// ==============================
router.delete("/:id", (req, res) => {
  const sql = `
    DELETE FROM product_categories
    WHERE id = ?
  `;

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category deleted successfully",
    });
  });
});

module.exports = router;