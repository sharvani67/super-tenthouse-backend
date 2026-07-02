const express = require("express");
const router = express.Router();
const db = require("../db");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ====================================
// CREATE FOLDER
// ====================================

const uploadDir = "uploads/products";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ====================================
// MULTER STORAGE
// ====================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      unique + path.extname(file.originalname)
    );
  },
});

// ====================================
// MULTER
// ====================================

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed =
      /jpeg|jpg|png|webp|gif/;

    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      allowed.test(ext) &&
      allowed.test(file.mimetype)
    ) {
      return cb(null, true);
    }

    cb(
      new Error(
        "Only image files are allowed"
      )
    );
  },
});

// ====================================
// SAVE PRODUCT IMAGES
// ====================================

function saveImages(productId, files, callback) {
  if (!files || files.length === 0) {
    return callback(null);
  }

  const values = files.map(
    (file, index) => [
      productId,
      `/uploads/products/${file.filename}`,
      index,
    ]
  );

  db.query(
    `
      INSERT INTO product_images
      (
        product_id,
        image_url,
        sort_order
      )
      VALUES ?
    `,
    [values],
    callback
  );
}

// ====================================
// CREATE PRODUCT
// ====================================

router.post(
  "/",
  upload.array("images", 10),
  (req, res) => {
    try {
      const {
        category_id,
        product_name,
        material,
        color,
        available_stock,
        rating,
        original_price,
        discount,
        description,
        dimensions,
      } = req.body;

      const sql = `
        INSERT INTO products
        (
          category_id,
          product_name,
          material,
          color,
          available_stock,
          rating,
          original_price,
          discount,
          description,
          dimensions
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          category_id,
          product_name,
          material,
          color,
          available_stock,
          rating,
          original_price,
          discount,
          description,
          dimensions,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          saveImages(
            result.insertId,
            req.files,
            (imgErr) => {
              if (imgErr) {
                return res
                  .status(500)
                  .json(imgErr);
              }

              res.json({
                message:
                  "Product created successfully",
                id: result.insertId,
              });
            }
          );
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// ====================================
// GET ALL PRODUCTS
// ====================================

router.get("/", (req, res) => {
  const sql = 
  `SELECT
  p.*,
  c.category_name
FROM products p
LEFT JOIN product_categories c
  ON p.category_id = c.id
ORDER BY p.id DESC`;
   

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

// ====================================
// GET SINGLE PRODUCT
// ====================================

router.get("/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    `SELECT * FROM products WHERE id = ?`,
    [productId],
    (err, productResult) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (productResult.length === 0) {
        return res
          .status(404)
          .json({ message: "Not Found" });
      }

      db.query(
        `
        SELECT *
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order
      `,
        [productId],
        (imgErr, images) => {
          if (imgErr) {
            return res
              .status(500)
              .json(imgErr);
          }

          res.json({
            ...productResult[0],
            images,
          });
        }
      );
    }
  );
});

// ====================================
// UPDATE PRODUCT
// ====================================

router.put("/:id", (req, res) => {
  const id = req.params.id;

  const {
    category_id,
    product_name,
    material,
    color,
    available_stock,
    rating,
    original_price,
    discount,
    description,
    dimensions,
  } = req.body;

  const sql = `
    UPDATE products
    SET
      category_id = ?,
      product_name = ?,
      material = ?,
      color = ?,
      available_stock = ?,
      rating = ?,
      original_price = ?,
      discount = ?,
      description = ?,
      dimensions = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      category_id,
      product_name,
      material,
      color,
      available_stock,
      rating,
      original_price,
      discount,
      description,
      dimensions,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message:
          "Product updated successfully",
      });
    }
  );
});

// ====================================
// DELETE PRODUCT
// ====================================

router.delete("/:id", (req, res) => {
  db.query(
    `
      DELETE FROM products
      WHERE id = ?
    `,
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message:
          "Product deleted successfully",
      });
    }
  );
});

module.exports = router;