// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ====================================
// // CREATE FOLDER
// // ====================================

// const uploadDir = "uploads/products";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ====================================
// // MULTER STORAGE
// // ====================================

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     const unique =
//       Date.now() +
//       "-" +
//       Math.round(Math.random() * 1e9);

//     cb(
//       null,
//       unique + path.extname(file.originalname)
//     );
//   },
// });

// // ====================================
// // MULTER
// // ====================================

// const upload = multer({
//   storage,

//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },

//   fileFilter: (req, file, cb) => {
//     const allowed =
//       /jpeg|jpg|png|webp|gif/;

//     const ext = path
//       .extname(file.originalname)
//       .toLowerCase();

//     if (
//       allowed.test(ext) &&
//       allowed.test(file.mimetype)
//     ) {
//       return cb(null, true);
//     }

//     cb(
//       new Error(
//         "Only image files are allowed"
//       )
//     );
//   },
// });

// // ====================================
// // SAVE PRODUCT IMAGES
// // ====================================

// function saveImages(productId, files, callback) {
//   if (!files || files.length === 0) {
//     return callback(null);
//   }

//   const values = files.map(
//     (file, index) => [
//       productId,
//       `/uploads/products/${file.filename}`,
//       index,
//     ]
//   );

//   db.query(
//     `
//       INSERT INTO product_images
//       (
//         product_id,
//         image_url,
//         sort_order
//       )
//       VALUES ?
//     `,
//     [values],
//     callback
//   );
// }

// // ====================================
// // CREATE PRODUCT
// // ====================================

// router.post(
//   "/",
//   upload.array("images", 10),
//   (req, res) => {
//     try {
//       const {
//         category_id,
//         product_name,
//         material,
//         color,
//         available_stock,
//         rating,
//         original_price,
//         discount,
//         description,
//         dimensions,
//       } = req.body;

//       const sql = `
//         INSERT INTO products
//         (
//           category_id,
//           product_name,
//           material,
//           color,
//           available_stock,
//           rating,
//           original_price,
//           discount,
//           description,
//           dimensions
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       db.query(
//         sql,
//         [
//           category_id,
//           product_name,
//           material,
//           color,
//           available_stock,
//           rating,
//           original_price,
//           discount,
//           description,
//           dimensions,
//         ],
//         (err, result) => {
//           if (err) {
//             return res.status(500).json(err);
//           }

//           saveImages(
//             result.insertId,
//             req.files,
//             (imgErr) => {
//               if (imgErr) {
//                 return res
//                   .status(500)
//                   .json(imgErr);
//               }

//               res.json({
//                 message:
//                   "Product created successfully",
//                 id: result.insertId,
//               });
//             }
//           );
//         }
//       );
//     } catch (error) {
//       res.status(500).json(error);
//     }
//   }
// );

// // ====================================
// // GET ALL PRODUCTS
// // ====================================

// router.get("/", (req, res) => {
//   const sql = 
//   `SELECT
//   p.*,
//   c.category_name
// FROM products p
// LEFT JOIN product_categories c
//   ON p.category_id = c.id
// ORDER BY p.id DESC`;
   

//   db.query(sql, (err, results) => {
//     if (err) {
//       return res.status(500).json(err);
//     }

//     res.json(results);
//   });
// });

// // ====================================
// // GET SINGLE PRODUCT
// // ====================================

// router.get("/:id", (req, res) => {
//   const productId = req.params.id;

//   db.query(
//     `SELECT * FROM products WHERE id = ?`,
//     [productId],
//     (err, productResult) => {
//       if (err) {
//         return res.status(500).json(err);
//       }

//       if (productResult.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "Not Found" });
//       }

//       db.query(
//         `
//         SELECT *
//         FROM product_images
//         WHERE product_id = ?
//         ORDER BY sort_order
//       `,
//         [productId],
//         (imgErr, images) => {
//           if (imgErr) {
//             return res
//               .status(500)
//               .json(imgErr);
//           }

//           res.json({
//             ...productResult[0],
//             images,
//           });
//         }
//       );
//     }
//   );
// });

// // ====================================
// // UPDATE PRODUCT
// // ====================================

// router.put("/:id", (req, res) => {
//   const id = req.params.id;

//   const {
//     category_id,
//     product_name,
//     material,
//     color,
//     available_stock,
//     rating,
//     original_price,
//     discount,
//     description,
//     dimensions,
//   } = req.body;

//   const sql = `
//     UPDATE products
//     SET
//       category_id = ?,
//       product_name = ?,
//       material = ?,
//       color = ?,
//       available_stock = ?,
//       rating = ?,
//       original_price = ?,
//       discount = ?,
//       description = ?,
//       dimensions = ?
//     WHERE id = ?
//   `;

//   db.query(
//     sql,
//     [
//       category_id,
//       product_name,
//       material,
//       color,
//       available_stock,
//       rating,
//       original_price,
//       discount,
//       description,
//       dimensions,
//       id,
//     ],
//     (err) => {
//       if (err) {
//         return res.status(500).json(err);
//       }

//       res.json({
//         message:
//           "Product updated successfully",
//       });
//     }
//   );
// });

// // ====================================
// // DELETE PRODUCT
// // ====================================

// router.delete("/:id", (req, res) => {
//   db.query(
//     `
//       DELETE FROM products
//       WHERE id = ?
//     `,
//     [req.params.id],
//     (err) => {
//       if (err) {
//         return res.status(500).json(err);
//       }

//       res.json({
//         message:
//           "Product deleted successfully",
//       });
//     }
//   );
// });

// module.exports = router;



// // routes/products.js
// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ====================================
// // CREATE UPLOAD FOLDER
// // ====================================
// const uploadDir = "uploads/products";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ====================================
// // MULTER STORAGE CONFIGURATION
// // ====================================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// // ====================================
// // MULTER INSTANCE
// // ====================================
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|webp|gif/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.test(ext) && allowed.test(file.mimetype)) {
//       return cb(null, true);
//     }
//     cb(new Error("Only image files are allowed"));
//   },
// });

// // ====================================
// // SAVE PRODUCT IMAGES
// // ====================================
// function saveImages(productId, files, callback) {
//   if (!files || files.length === 0) {
//     return callback(null);
//   }

//   const values = files.map((file, index) => [
//     productId,
//     `/uploads/products/${file.filename}`,
//     index, // sort_order
//   ]);

//   db.query(
//     `
//       INSERT INTO product_images
//       (product_id, image_url, sort_order)
//       VALUES ?
//     `,
//     [values],
//     callback
//   );
// }

// // ====================================
// // HELPER: GET PRODUCT IMAGES (with fallback)
// // ====================================
// function getProductImages(productId, callback) {
//   // First try with sort_order
//   db.query(
//     `
//       SELECT image_url 
//       FROM product_images 
//       WHERE product_id = ? 
//       ORDER BY sort_order ASC, id ASC
//     `,
//     [productId],
//     (err, results) => {
//       if (err) {
//         // If sort_order doesn't exist, try without it
//         if (err.code === 'ER_BAD_FIELD_ERROR') {
//           db.query(
//             `
//               SELECT image_url 
//               FROM product_images 
//               WHERE product_id = ? 
//               ORDER BY id ASC
//             `,
//             [productId],
//             (err2, results2) => {
//               if (err2) {
//                 console.error("Error fetching images (fallback):", err2);
//                 return callback(err2, null);
//               }
//               const images = results2.map(row => row.image_url);
//               callback(null, images);
//             }
//           );
//         } else {
//           console.error("Error fetching images:", err);
//           callback(err, null);
//         }
//         return;
//       }
//       const images = results.map(row => row.image_url);
//       callback(null, images);
//     }
//   );
// }

// // ====================================
// // HELPER: GET PRODUCTS WITH IMAGES
// // ====================================
// function getProductsWithImages(sql, params, callback) {
//   db.query(sql, params, (err, products) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return callback(err, null);
//     }

//     if (!products || products.length === 0) {
//       return callback(null, []);
//     }

//     // Get images for each product
//     let completed = 0;
//     const results = [];

//     products.forEach((product, index) => {
//       getProductImages(product.id, (imgErr, images) => {
//         if (imgErr) {
//           console.error("Error fetching images for product:", product.id, imgErr.message);
//         }
//         product.images = images || [];
//         results[index] = product;
//         completed++;

//         if (completed === products.length) {
//           callback(null, results);
//         }
//       });
//     });
//   });
// }

// // ====================================
// // CREATE PRODUCT
// // ====================================
// router.post("/", upload.array("images", 10), (req, res) => {
//   try {
//     const {
//       category_id,
//       product_name,
//       material,
//       color,
//       available_stock,
//       rating,
//       original_price,
//       discount,
//       description,
//       dimensions,
//       brand,
//       weight,
//       care_instructions,
//       warranty,
//       return_policy,
//       shipping_info,
//       is_trending,
//       is_best_seller,
//       is_featured,
//     } = req.body;

//     const sql = `
//       INSERT INTO products (
//         category_id,
//         product_name,
//         material,
//         color,
//         available_stock,
//         rating,
//         original_price,
//         discount,
//         description,
//         dimensions,
//         brand,
//         weight,
//         care_instructions,
//         warranty,
//         return_policy,
//         shipping_info,
//         is_trending,
//         is_best_seller,
//         is_featured
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         category_id || null,
//         product_name,
//         material || null,
//         color || null,
//         available_stock || 0,
//         rating || 0,
//         original_price || 0,
//         discount || 0,
//         description || null,
//         dimensions || null,
//         brand || null,
//         weight || null,
//         care_instructions || null,
//         warranty || null,
//         return_policy || null,
//         shipping_info || null,
//         is_trending || 0,
//         is_best_seller || 0,
//         is_featured || 0,
//       ],
//       (err, result) => {
//         if (err) {
//           console.error("Error creating product:", err);
//           return res.status(500).json({ error: err.message });
//         }

//         saveImages(result.insertId, req.files, (imgErr) => {
//           if (imgErr) {
//             console.error("Error saving images:", imgErr);
//             return res.status(500).json({ error: imgErr.message });
//           }

//           res.json({
//             message: "Product created successfully",
//             id: result.insertId,
//           });
//         });
//       }
//     );
//   } catch (error) {
//     console.error("Error in product creation:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // ====================================
// // GET ALL PRODUCTS
// // ====================================
// router.get("/", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET PRODUCTS BY CATEGORY
// // ====================================
// router.get("/category/:categoryId", (req, res) => {
//   const { categoryId } = req.params;

//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     WHERE p.category_id = ?
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(sql, [categoryId], (err, results) => {
//     if (err) {
//       console.error("Error fetching products by category:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET TRENDING PRODUCTS
// // ====================================
// router.get("/trending", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     WHERE p.is_trending = 1 OR p.rating >= 4.0
//     ORDER BY p.rating DESC, p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching trending products:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET BEST SELLERS
// // ====================================
// router.get("/best-sellers", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     WHERE p.is_best_seller = 1 OR p.rating >= 4.0
//     ORDER BY p.rating DESC, p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching best sellers:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET NEW ARRIVALS
// // ====================================
// router.get("/new-arrivals", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     ORDER BY p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching new arrivals:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // SEARCH PRODUCTS
// // ====================================
// router.get("/search", (req, res) => {
//   const { q } = req.query;

//   if (!q || q.trim() === "") {
//     return res.json([]);
//   }

//   const searchTerm = `%${q.trim()}%`;

//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name
//     FROM products p
//     LEFT JOIN product_categories c ON p.category_id = c.id
//     WHERE p.product_name LIKE ? 
//     OR p.description LIKE ?
//     OR c.category_name LIKE ?
//     OR p.brand LIKE ?
//     OR p.material LIKE ?
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(
//     sql,
//     [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
//     (err, results) => {
//       if (err) {
//         console.error("Error searching products:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(results);
//     }
//   );
// });

// // ====================================
// // GET SINGLE PRODUCT
// // ====================================
// router.get("/:id", (req, res) => {
//   const productId = req.params.id;

//   // Get product details
//   db.query(
//     `
//       SELECT 
//         p.*,
//         c.category_name
//       FROM products p
//       LEFT JOIN product_categories c ON p.category_id = c.id
//       WHERE p.id = ?
//     `,
//     [productId],
//     (err, productResult) => {
//       if (err) {
//         console.error("Error fetching product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (productResult.length === 0) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       const product = productResult[0];

//       // Get product images
//       getProductImages(productId, (imgErr, images) => {
//         if (imgErr) {
//           console.error("Error fetching product images:", imgErr);
//           // Continue with empty images array
//           product.images = [];
//         } else {
//           product.images = images || [];
//         }

//         // Get product reviews (if you have a reviews table)
//         db.query(
//           `
//             SELECT 
//               r.*,
//               u.name as user_name,
//               u.avatar as user_avatar
//             FROM reviews r
//             LEFT JOIN users u ON r.user_id = u.id
//             WHERE r.product_id = ?
//             ORDER BY r.created_at DESC
//             LIMIT 10
//           `,
//           [productId],
//           (reviewErr, reviews) => {
//             if (reviewErr) {
//               console.error("Error fetching reviews:", reviewErr);
//               product.reviews = [];
//             } else {
//               product.reviews = reviews || [];
//             }

//             // Get related products (same category)
//             if (product.category_id) {
//               db.query(
//                 `
//                   SELECT 
//                     p.id
//                   FROM products p
//                   WHERE p.category_id = ? AND p.id != ?
//                   ORDER BY p.id DESC
//                   LIMIT 6
//                 `,
//                 [product.category_id, productId],
//                 (relatedErr, relatedProducts) => {
//                   if (relatedErr) {
//                     console.error("Error fetching related products:", relatedErr);
//                     product.related_ids = [];
//                   } else {
//                     product.related_ids = relatedProducts.map(p => p.id);
//                   }
//                   res.json(product);
//                 }
//               );
//             } else {
//               product.related_ids = [];
//               res.json(product);
//             }
//           }
//         );
//       });
//     }
//   );
// });

// // ====================================
// // UPDATE PRODUCT
// // ====================================
// router.put("/:id", (req, res) => {
//   const id = req.params.id;

//   const {
//     category_id,
//     product_name,
//     material,
//     color,
//     available_stock,
//     rating,
//     original_price,
//     discount,
//     description,
//     dimensions,
//     brand,
//     weight,
//     care_instructions,
//     warranty,
//     return_policy,
//     shipping_info,
//     is_trending,
//     is_best_seller,
//     is_featured,
//   } = req.body;

//   const sql = `
//     UPDATE products
//     SET
//       category_id = ?,
//       product_name = ?,
//       material = ?,
//       color = ?,
//       available_stock = ?,
//       rating = ?,
//       original_price = ?,
//       discount = ?,
//       description = ?,
//       dimensions = ?,
//       brand = ?,
//       weight = ?,
//       care_instructions = ?,
//       warranty = ?,
//       return_policy = ?,
//       shipping_info = ?,
//       is_trending = ?,
//       is_best_seller = ?,
//       is_featured = ?
//     WHERE id = ?
//   `;

//   db.query(
//     sql,
//     [
//       category_id || null,
//       product_name,
//       material || null,
//       color || null,
//       available_stock || 0,
//       rating || 0,
//       original_price || 0,
//       discount || 0,
//       description || null,
//       dimensions || null,
//       brand || null,
//       weight || null,
//       care_instructions || null,
//       warranty || null,
//       return_policy || null,
//       shipping_info || null,
//       is_trending || 0,
//       is_best_seller || 0,
//       is_featured || 0,
//       id,
//     ],
//     (err) => {
//       if (err) {
//         console.error("Error updating product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       res.json({
//         message: "Product updated successfully",
//       });
//     }
//   );
// });

// // ====================================
// // DELETE PRODUCT
// // ====================================
// router.delete("/:id", (req, res) => {
//   const productId = req.params.id;

//   // First delete product images
//   db.query(
//     `
//       DELETE FROM product_images
//       WHERE product_id = ?
//     `,
//     [productId],
//     (err) => {
//       if (err) {
//         console.error("Error deleting product images:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       // Then delete the product
//       db.query(
//         `
//           DELETE FROM products
//           WHERE id = ?
//         `,
//         [productId],
//         (err) => {
//           if (err) {
//             console.error("Error deleting product:", err);
//             return res.status(500).json({ error: err.message });
//           }

//           res.json({
//             message: "Product deleted successfully",
//           });
//         }
//       );
//     }
//   );
// });

// // ====================================
// // UPLOAD PRODUCT IMAGES
// // ====================================
// router.post("/:id/images", upload.array("images", 10), (req, res) => {
//   const productId = req.params.id;

//   // Check if product exists
//   db.query(
//     "SELECT id FROM products WHERE id = ?",
//     [productId],
//     (err, result) => {
//       if (err) {
//         console.error("Error checking product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       // Get current max sort order
//       db.query(
//         "SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?",
//         [productId],
//         (orderErr, orderResult) => {
//           if (orderErr) {
//             // If sort_order doesn't exist, use count
//             db.query(
//               "SELECT COUNT(*) as count FROM product_images WHERE product_id = ?",
//               [productId],
//               (countErr, countResult) => {
//                 if (countErr) {
//                   console.error("Error getting image count:", countErr);
//                   return res.status(500).json({ error: countErr.message });
//                 }
//                 const startOrder = countResult[0].count || 0;
//                 saveImagesWithStartOrder(productId, req.files, startOrder, res);
//               }
//             );
//           } else {
//             const startOrder = (orderResult[0].max_order || -1) + 1;
//             saveImagesWithStartOrder(productId, req.files, startOrder, res);
//           }
//         }
//       );
//     }
//   );
// });

// function saveImagesWithStartOrder(productId, files, startOrder, res) {
//   if (!files || files.length === 0) {
//     return res.json({ message: "No images to upload" });
//   }

//   const values = files.map((file, index) => [
//     productId,
//     `/uploads/products/${file.filename}`,
//     startOrder + index,
//   ]);

//   db.query(
//     `
//       INSERT INTO product_images
//       (product_id, image_url, sort_order)
//       VALUES ?
//     `,
//     [values],
//     (err) => {
//       if (err) {
//         console.error("Error saving images:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       res.json({
//         message: "Images uploaded successfully",
//       });
//     }
//   );
// }

// // ====================================
// // DELETE PRODUCT IMAGE
// // ====================================
// router.delete("/:productId/images/:imageId", (req, res) => {
//   const { productId, imageId } = req.params;

//   // Get image URL to delete file
//   db.query(
//     "SELECT image_url FROM product_images WHERE id = ? AND product_id = ?",
//     [imageId, productId],
//     (err, result) => {
//       if (err) {
//         console.error("Error fetching image:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "Image not found" });
//       }

//       // Delete from database
//       db.query(
//         "DELETE FROM product_images WHERE id = ?",
//         [imageId],
//         (err) => {
//           if (err) {
//             console.error("Error deleting image:", err);
//             return res.status(500).json({ error: err.message });
//           }

//           // Delete file from filesystem
//           const filePath = path.join(__dirname, "..", result[0].image_url);
//           if (fs.existsSync(filePath)) {
//             fs.unlink(filePath, (unlinkErr) => {
//               if (unlinkErr) {
//                 console.error("Error deleting file:", unlinkErr);
//               }
//             });
//           }

//           res.json({
//             message: "Image deleted successfully",
//           });
//         }
//       );
//     }
//   );
// });

// module.exports = router;





// routes/products.js
// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ====================================
// // CREATE UPLOAD FOLDER
// // ====================================
// const uploadDir = "uploads/products";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ====================================
// // MULTER STORAGE CONFIGURATION
// // ====================================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// // ====================================
// // MULTER INSTANCE
// // ====================================
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|webp|gif/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.test(ext) && allowed.test(file.mimetype)) {
//       return cb(null, true);
//     }
//     cb(new Error("Only image files are allowed"));
//   },
// });

// // ====================================
// // SAVE PRODUCT IMAGES
// // ====================================
// function saveImages(productId, files, callback) {
//   if (!files || files.length === 0) {
//     return callback(null);
//   }

//   const values = files.map((file, index) => [
//     productId,
//     `/uploads/products/${file.filename}`,
//     index,
//   ]);

//   db.query(
//     `
//       INSERT INTO product_images
//       (product_id, image_url, sort_order)
//       VALUES ?
//     `,
//     [values],
//     callback
//   );
// }

// // ====================================
// // HELPER: GET PRODUCT IMAGES
// // ====================================
// function getProductImages(productId, callback) {
//   db.query(
//     `
//       SELECT image_url 
//       FROM product_images 
//       WHERE product_id = ? 
//       ORDER BY sort_order ASC, id ASC
//     `,
//     [productId],
//     (err, results) => {
//       if (err) {
//         if (err.code === 'ER_BAD_FIELD_ERROR') {
//           db.query(
//             `
//               SELECT image_url 
//               FROM product_images 
//               WHERE product_id = ? 
//               ORDER BY id ASC
//             `,
//             [productId],
//             (err2, results2) => {
//               if (err2) {
//                 console.error("Error fetching images (fallback):", err2);
//                 return callback(err2, null);
//               }
//               const images = results2.map(row => row.image_url);
//               callback(null, images);
//             }
//           );
//         } else {
//           console.error("Error fetching images:", err);
//           callback(err, null);
//         }
//         return;
//       }
//       const images = results.map(row => row.image_url);
//       callback(null, images);
//     }
//   );
// }

// // ====================================
// // HELPER: GET PRODUCTS WITH IMAGES
// // ====================================
// function getProductsWithImages(sql, params, callback) {
//   db.query(sql, params, (err, products) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return callback(err, null);
//     }

//     if (!products || products.length === 0) {
//       return callback(null, []);
//     }

//     let completed = 0;
//     const results = [];

//     products.forEach((product, index) => {
//       // Parse images if stored as JSON string
//       if (product.product_images && typeof product.product_images === 'string') {
//         try {
//           product.images = JSON.parse(product.product_images);
//         } catch (e) {
//           product.images = [];
//         }
//       } else {
//         product.images = [];
//       }

//       // If no images, try to get from product_images table
//       if (!product.images || product.images.length === 0) {
//         getProductImages(product.id, (imgErr, images) => {
//           if (imgErr) {
//             console.error("Error fetching images for product:", product.id, imgErr.message);
//           }
//           product.images = images || [];
//           results[index] = product;
//           completed++;

//           if (completed === products.length) {
//             callback(null, results);
//           }
//         });
//       } else {
//         results[index] = product;
//         completed++;
//         if (completed === products.length) {
//           callback(null, results);
//         }
//       }
//     });
//   });
// }

// // ====================================
// // CREATE PRODUCT
// // ====================================
// router.post("/", upload.array("images", 10), (req, res) => {
//   try {
//     const {
//       product_category_id,
//       product_name,
//       product_code,
//       product_brand,
//       price,
//       available_stock,
//       dimensions,
//       specifications,
//       weight,
//       color,
//       discount,
//       product_description,
//       warranty,
//       material,
//       care_instructions,
//       is_active,
//     } = req.body;

//     const sql = `
//       INSERT INTO products (
//         product_category_id,
//         product_name,
//         product_code,
//         product_brand,
//         price,
//         available_stock,
//         dimensions,
//         specifications,
//         weight,
//         color,
//         discount,
//         product_description,
//         warranty,
//         material,
//         care_instructions,
//         is_active
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         product_category_id || null,
//         product_name,
//         product_code || null,
//         product_brand || null,
//         price || 0,
//         available_stock || 0,
//         dimensions || null,
//         specifications || null,
//         weight || null,
//         color || null,
//         discount || 0,
//         product_description || null,
//         warranty || null,
//         material || null,
//         care_instructions || null,
//         is_active || 1,
//       ],
//       (err, result) => {
//         if (err) {
//           console.error("Error creating product:", err);
//           return res.status(500).json({ error: err.message });
//         }

//         saveImages(result.insertId, req.files, (imgErr) => {
//           if (imgErr) {
//             console.error("Error saving images:", imgErr);
//             return res.status(500).json({ error: imgErr.message });
//           }

//           res.json({
//             message: "Product created successfully",
//             id: result.insertId,
//           });
//         });
//       }
//     );
//   } catch (error) {
//     console.error("Error in product creation:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // ====================================
// // GET ALL PRODUCTS
// // ====================================
// router.get("/", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET PRODUCTS BY CATEGORY
// // ====================================
// router.get("/category/:categoryId", (req, res) => {
//   const { categoryId } = req.params;

//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     WHERE p.product_category_id = ?
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(sql, [categoryId], (err, results) => {
//     if (err) {
//       console.error("Error fetching products by category:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET TRENDING PRODUCTS
// // ====================================
// router.get("/trending", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     ORDER BY p.rating DESC, p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching trending products:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET BEST SELLERS
// // ====================================
// router.get("/best-sellers", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     ORDER BY p.rating DESC, p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching best sellers:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET NEW ARRIVALS
// // ====================================
// router.get("/new-arrivals", (req, res) => {
//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     ORDER BY p.id DESC
//     LIMIT 10
//   `;

//   getProductsWithImages(sql, [], (err, results) => {
//     if (err) {
//       console.error("Error fetching new arrivals:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // SEARCH PRODUCTS
// // ====================================
// router.get("/search", (req, res) => {
//   const { q } = req.query;

//   if (!q || q.trim() === "") {
//     return res.json([]);
//   }

//   const searchTerm = `%${q.trim()}%`;

//   const sql = `
//     SELECT 
//       p.*,
//       c.category_name,
//       c.id as category_id
//     FROM products p
//     LEFT JOIN product_categories c ON p.product_category_id = c.id
//     WHERE p.product_name LIKE ? 
//     OR p.product_description LIKE ?
//     OR c.category_name LIKE ?
//     OR p.product_brand LIKE ?
//     OR p.material LIKE ?
//     ORDER BY p.id DESC
//   `;

//   getProductsWithImages(
//     sql,
//     [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
//     (err, results) => {
//       if (err) {
//         console.error("Error searching products:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(results);
//     }
//   );
// });

// // ====================================
// // GET SINGLE PRODUCT
// // ====================================
// router.get("/:id", (req, res) => {
//   const productId = req.params.id;

//   db.query(
//     `
//       SELECT 
//         p.*,
//         c.category_name,
//         c.id as category_id
//       FROM products p
//       LEFT JOIN product_categories c ON p.product_category_id = c.id
//       WHERE p.id = ?
//     `,
//     [productId],
//     (err, productResult) => {
//       if (err) {
//         console.error("Error fetching product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (productResult.length === 0) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       const product = productResult[0];

//       // Parse images if stored as JSON
//       if (product.product_images && typeof product.product_images === 'string') {
//         try {
//           product.images = JSON.parse(product.product_images);
//         } catch (e) {
//           product.images = [];
//         }
//       } else {
//         product.images = [];
//       }

//       // If no images, try to get from product_images table
//       if (!product.images || product.images.length === 0) {
//         getProductImages(productId, (imgErr, images) => {
//           if (imgErr) {
//             console.error("Error fetching product images:", imgErr);
//             product.images = [];
//           } else {
//             product.images = images || [];
//           }
//           res.json(product);
//         });
//       } else {
//         res.json(product);
//       }
//     }
//   );
// });

// // ====================================
// // UPDATE PRODUCT
// // ====================================
// router.put("/:id", (req, res) => {
//   const id = req.params.id;

//   const {
//     product_category_id,
//     product_name,
//     product_code,
//     product_brand,
//     price,
//     available_stock,
//     dimensions,
//     specifications,
//     weight,
//     color,
//     discount,
//     product_description,
//     warranty,
//     material,
//     care_instructions,
//     is_active,
//   } = req.body;

//   const sql = `
//     UPDATE products
//     SET
//       product_category_id = ?,
//       product_name = ?,
//       product_code = ?,
//       product_brand = ?,
//       price = ?,
//       available_stock = ?,
//       dimensions = ?,
//       specifications = ?,
//       weight = ?,
//       color = ?,
//       discount = ?,
//       product_description = ?,
//       warranty = ?,
//       material = ?,
//       care_instructions = ?,
//       is_active = ?
//     WHERE id = ?
//   `;

//   db.query(
//     sql,
//     [
//       product_category_id || null,
//       product_name,
//       product_code || null,
//       product_brand || null,
//       price || 0,
//       available_stock || 0,
//       dimensions || null,
//       specifications || null,
//       weight || null,
//       color || null,
//       discount || 0,
//       product_description || null,
//       warranty || null,
//       material || null,
//       care_instructions || null,
//       is_active || 1,
//       id,
//     ],
//     (err) => {
//       if (err) {
//         console.error("Error updating product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       res.json({
//         message: "Product updated successfully",
//       });
//     }
//   );
// });

// // ====================================
// // DELETE PRODUCT
// // ====================================
// router.delete("/:id", (req, res) => {
//   const productId = req.params.id;

//   db.query(
//     `
//       DELETE FROM product_images
//       WHERE product_id = ?
//     `,
//     [productId],
//     (err) => {
//       if (err) {
//         console.error("Error deleting product images:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       db.query(
//         `
//           DELETE FROM products
//           WHERE id = ?
//         `,
//         [productId],
//         (err) => {
//           if (err) {
//             console.error("Error deleting product:", err);
//             return res.status(500).json({ error: err.message });
//           }

//           res.json({
//             message: "Product deleted successfully",
//           });
//         }
//       );
//     }
//   );
// });

// // ====================================
// // UPLOAD PRODUCT IMAGES
// // ====================================
// router.post("/:id/images", upload.array("images", 10), (req, res) => {
//   const productId = req.params.id;

//   db.query(
//     "SELECT id FROM products WHERE id = ?",
//     [productId],
//     (err, result) => {
//       if (err) {
//         console.error("Error checking product:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       db.query(
//         "SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?",
//         [productId],
//         (orderErr, orderResult) => {
//           if (orderErr) {
//             db.query(
//               "SELECT COUNT(*) as count FROM product_images WHERE product_id = ?",
//               [productId],
//               (countErr, countResult) => {
//                 if (countErr) {
//                   console.error("Error getting image count:", countErr);
//                   return res.status(500).json({ error: countErr.message });
//                 }
//                 const startOrder = countResult[0].count || 0;
//                 saveImagesWithStartOrder(productId, req.files, startOrder, res);
//               }
//             );
//           } else {
//             const startOrder = (orderResult[0].max_order || -1) + 1;
//             saveImagesWithStartOrder(productId, req.files, startOrder, res);
//           }
//         }
//       );
//     }
//   );
// });

// function saveImagesWithStartOrder(productId, files, startOrder, res) {
//   if (!files || files.length === 0) {
//     return res.json({ message: "No images to upload" });
//   }

//   const values = files.map((file, index) => [
//     productId,
//     `/uploads/products/${file.filename}`,
//     startOrder + index,
//   ]);

//   db.query(
//     `
//       INSERT INTO product_images
//       (product_id, image_url, sort_order)
//       VALUES ?
//     `,
//     [values],
//     (err) => {
//       if (err) {
//         console.error("Error saving images:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       res.json({
//         message: "Images uploaded successfully",
//       });
//     }
//   );
// }

// // ====================================
// // DELETE PRODUCT IMAGE
// // ====================================
// router.delete("/:productId/images/:imageId", (req, res) => {
//   const { productId, imageId } = req.params;

//   db.query(
//     "SELECT image_url FROM product_images WHERE id = ? AND product_id = ?",
//     [imageId, productId],
//     (err, result) => {
//       if (err) {
//         console.error("Error fetching image:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "Image not found" });
//       }

//       db.query(
//         "DELETE FROM product_images WHERE id = ?",
//         [imageId],
//         (err) => {
//           if (err) {
//             console.error("Error deleting image:", err);
//             return res.status(500).json({ error: err.message });
//           }

//           const filePath = path.join(__dirname, "..", result[0].image_url);
//           if (fs.existsSync(filePath)) {
//             fs.unlink(filePath, (unlinkErr) => {
//               if (unlinkErr) {
//                 console.error("Error deleting file:", unlinkErr);
//               }
//             });
//           }

//           res.json({
//             message: "Image deleted successfully",
//           });
//         }
//       );
//     }
//   );
// });

// module.exports = router;




// routes/products.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ====================================
// CREATE UPLOAD FOLDER
// ====================================
const uploadDir = "uploads/products";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ====================================
// MULTER STORAGE CONFIGURATION
// ====================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// ====================================
// MULTER INSTANCE
// ====================================
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// ====================================
// SAVE PRODUCT IMAGES
// ====================================
function saveImages(productId, files, callback) {
  if (!files || files.length === 0) {
    return callback(null);
  }

  const values = files.map((file, index) => [
    productId,
    `/uploads/products/${file.filename}`,
    index,
  ]);

  db.query(
    `
      INSERT INTO product_images
      (product_id, image_url, sort_order)
      VALUES ?
    `,
    [values],
    callback
  );
}

// ====================================
// HELPER: GET PRODUCT IMAGES
// ====================================
function getProductImages(productId, callback) {
  // Try with sort_order first
  db.query(
    `
      SELECT image_url 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY sort_order ASC, id ASC
    `,
    [productId],
    (err, results) => {
      if (err) {
        // If sort_order doesn't exist, try without it
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          db.query(
            `
              SELECT image_url 
              FROM product_images 
              WHERE product_id = ? 
              ORDER BY id ASC
            `,
            [productId],
            (err2, results2) => {
              if (err2) {
                console.error("Error fetching images (fallback):", err2);
                return callback(err2, null);
              }
              const images = results2.map(row => row.image_url);
              callback(null, images);
            }
          );
        } else {
          console.error("Error fetching images:", err);
          callback(err, null);
        }
        return;
      }
      const images = results.map(row => row.image_url);
      callback(null, images);
    }
  );
}

// ====================================
// HELPER: GET PRODUCTS WITH IMAGES
// ====================================
function getProductsWithImages(sql, params, callback) {
  db.query(sql, params, (err, products) => {
    if (err) {
      console.error("Error fetching products:", err);
      return callback(err, null);
    }

    if (!products || products.length === 0) {
      return callback(null, []);
    }

    let completed = 0;
    const results = [];

    products.forEach((product, index) => {
      // Parse images if stored as JSON string
      if (product.product_images && typeof product.product_images === 'string') {
        try {
          product.images = JSON.parse(product.product_images);
        } catch (e) {
          product.images = [];
        }
      } else if (product.product_images && Array.isArray(product.product_images)) {
        product.images = product.product_images;
      } else {
        product.images = [];
      }

      // If no images, try to get from product_images table
      if (!product.images || product.images.length === 0) {
        getProductImages(product.id, (imgErr, images) => {
          if (imgErr) {
            console.error("Error fetching images for product:", product.id, imgErr.message);
          }
          product.images = images || [];
          results[index] = product;
          completed++;

          if (completed === products.length) {
            callback(null, results);
          }
        });
      } else {
        results[index] = product;
        completed++;
        if (completed === products.length) {
          callback(null, results);
        }
      }
    });
  });
}

// ====================================
// CREATE PRODUCT
// ====================================
router.post("/", upload.array("images", 10), (req, res) => {
  try {
    const {
      product_category_id,
      product_name,
      product_code,
      product_brand,
      price,
      available_stock,
      dimensions,
      specifications,
      weight,
      color,
      discount,
      product_description,
      warranty,
      material,
      care_instructions,
      is_active,
    } = req.body;

    const sql = `
      INSERT INTO products (
        product_category_id,
        product_name,
        product_code,
        product_brand,
        price,
        available_stock,
        dimensions,
        specifications,
        weight,
        color,
        discount,
        product_description,
        warranty,
        material,
        care_instructions,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        product_category_id || null,
        product_name,
        product_code || null,
        product_brand || null,
        price || 0,
        available_stock || 0,
        dimensions || null,
        specifications || null,
        weight || null,
        color || null,
        discount || 0,
        product_description || null,
        warranty || null,
        material || null,
        care_instructions || null,
        is_active || 1,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating product:", err);
          return res.status(500).json({ error: err.message });
        }

        saveImages(result.insertId, req.files, (imgErr) => {
          if (imgErr) {
            console.error("Error saving images:", imgErr);
            return res.status(500).json({ error: imgErr.message });
          }

          res.json({
            message: "Product created successfully",
            id: result.insertId,
          });
        });
      }
    );
  } catch (error) {
    console.error("Error in product creation:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// GET ALL PRODUCTS
// ====================================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.*,
      c.category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN product_categories c ON p.product_category_id = c.id
    ORDER BY p.id DESC
  `;

  getProductsWithImages(sql, [], (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET PRODUCTS BY CATEGORY
// ====================================
router.get("/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;

  const sql = `
    SELECT 
      p.*,
      c.category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN product_categories c ON p.product_category_id = c.id
    WHERE p.product_category_id = ?
    ORDER BY p.id DESC
  `;

  getProductsWithImages(sql, [categoryId], (err, results) => {
    if (err) {
      console.error("Error fetching products by category:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET TRENDING PRODUCTS
// ====================================
router.get("/trending", (req, res) => {
  // Check if rating column exists
  db.query("SHOW COLUMNS FROM products LIKE 'rating'", (err, columns) => {
    const hasRating = columns && columns.length > 0;
    
    let sql = `
      SELECT 
        p.*,
        c.category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN product_categories c ON p.product_category_id = c.id
    `;
    
    if (hasRating) {
      sql += ` ORDER BY p.rating DESC, p.id DESC LIMIT 10`;
    } else {
      sql += ` ORDER BY p.id DESC LIMIT 10`;
    }

    getProductsWithImages(sql, [], (err, results) => {
      if (err) {
        console.error("Error fetching trending products:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
});

// ====================================
// GET BEST SELLERS
// ====================================
router.get("/best-sellers", (req, res) => {
  // Check if rating column exists
  db.query("SHOW COLUMNS FROM products LIKE 'rating'", (err, columns) => {
    const hasRating = columns && columns.length > 0;
    
    let sql = `
      SELECT 
        p.*,
        c.category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN product_categories c ON p.product_category_id = c.id
    `;
    
    if (hasRating) {
      sql += ` ORDER BY p.rating DESC, p.id DESC LIMIT 10`;
    } else {
      sql += ` ORDER BY p.id DESC LIMIT 10`;
    }

    getProductsWithImages(sql, [], (err, results) => {
      if (err) {
        console.error("Error fetching best sellers:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
});

// ====================================
// GET NEW ARRIVALS
// ====================================
router.get("/new-arrivals", (req, res) => {
  const sql = `
    SELECT 
      p.*,
      c.category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN product_categories c ON p.product_category_id = c.id
    ORDER BY p.id DESC
    LIMIT 10
  `;

  getProductsWithImages(sql, [], (err, results) => {
    if (err) {
      console.error("Error fetching new arrivals:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// SEARCH PRODUCTS
// ====================================
router.get("/search", (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  const searchTerm = `%${q.trim()}%`;

  const sql = `
    SELECT 
      p.*,
      c.category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN product_categories c ON p.product_category_id = c.id
    WHERE p.product_name LIKE ? 
    OR p.product_description LIKE ?
    OR c.category_name LIKE ?
    OR p.product_brand LIKE ?
    OR p.material LIKE ?
    ORDER BY p.id DESC
  `;

  getProductsWithImages(
    sql,
    [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error searching products:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// ====================================
// GET SINGLE PRODUCT
// ====================================
router.get("/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    `
      SELECT 
        p.*,
        c.category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN product_categories c ON p.product_category_id = c.id
      WHERE p.id = ?
    `,
    [productId],
    (err, productResult) => {
      if (err) {
        console.error("Error fetching product:", err);
        return res.status(500).json({ error: err.message });
      }

      if (productResult.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = productResult[0];

      // Parse images if stored as JSON
      if (product.product_images && typeof product.product_images === 'string') {
        try {
          product.images = JSON.parse(product.product_images);
        } catch (e) {
          product.images = [];
        }
      } else if (product.product_images && Array.isArray(product.product_images)) {
        product.images = product.product_images;
      } else {
        product.images = [];
      }

      // If no images, try to get from product_images table
      if (!product.images || product.images.length === 0) {
        getProductImages(productId, (imgErr, images) => {
          if (imgErr) {
            console.error("Error fetching product images:", imgErr);
            product.images = [];
          } else {
            product.images = images || [];
          }
          res.json(product);
        });
      } else {
        res.json(product);
      }
    }
  );
});

// ====================================
// UPDATE PRODUCT
// ====================================
router.put("/:id", (req, res) => {
  const id = req.params.id;

  const {
    product_category_id,
    product_name,
    product_code,
    product_brand,
    price,
    available_stock,
    dimensions,
    specifications,
    weight,
    color,
    discount,
    product_description,
    warranty,
    material,
    care_instructions,
    is_active,
  } = req.body;

  const sql = `
    UPDATE products
    SET
      product_category_id = ?,
      product_name = ?,
      product_code = ?,
      product_brand = ?,
      price = ?,
      available_stock = ?,
      dimensions = ?,
      specifications = ?,
      weight = ?,
      color = ?,
      discount = ?,
      product_description = ?,
      warranty = ?,
      material = ?,
      care_instructions = ?,
      is_active = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      product_category_id || null,
      product_name,
      product_code || null,
      product_brand || null,
      price || 0,
      available_stock || 0,
      dimensions || null,
      specifications || null,
      weight || null,
      color || null,
      discount || 0,
      product_description || null,
      warranty || null,
      material || null,
      care_instructions || null,
      is_active || 1,
      id,
    ],
    (err) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Product updated successfully",
      });
    }
  );
});

// ====================================
// DELETE PRODUCT
// ====================================
router.delete("/:id", (req, res) => {
  const productId = req.params.id;

  // First get image URLs to delete files
  db.query(
    "SELECT image_url FROM product_images WHERE product_id = ?",
    [productId],
    (err, images) => {
      if (err) {
        console.error("Error fetching images for deletion:", err);
        // Continue with product deletion even if image fetch fails
      }

      // Delete product images from database
      db.query(
        `
          DELETE FROM product_images
          WHERE product_id = ?
        `,
        [productId],
        (err) => {
          if (err) {
            console.error("Error deleting product images:", err);
            return res.status(500).json({ error: err.message });
          }

          // Delete the product
          db.query(
            `
              DELETE FROM products
              WHERE id = ?
            `,
            [productId],
            (err) => {
              if (err) {
                console.error("Error deleting product:", err);
                return res.status(500).json({ error: err.message });
              }

              // Delete image files
              if (images && images.length > 0) {
                images.forEach((img) => {
                  const filePath = path.join(__dirname, "..", img.image_url);
                  if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (unlinkErr) => {
                      if (unlinkErr) {
                        console.error("Error deleting file:", unlinkErr);
                      }
                    });
                  }
                });
              }

              res.json({
                message: "Product deleted successfully",
              });
            }
          );
        }
      );
    }
  );
});

// ====================================
// UPLOAD PRODUCT IMAGES
// ====================================
router.post("/:id/images", upload.array("images", 10), (req, res) => {
  const productId = req.params.id;

  // Check if product exists
  db.query(
    "SELECT id FROM products WHERE id = ?",
    [productId],
    (err, result) => {
      if (err) {
        console.error("Error checking product:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if sort_order column exists
      db.query("SHOW COLUMNS FROM product_images LIKE 'sort_order'", (colErr, columns) => {
        const hasSortOrder = columns && columns.length > 0;
        
        if (hasSortOrder) {
          // Get current max sort order
          db.query(
            "SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?",
            [productId],
            (orderErr, orderResult) => {
              if (orderErr) {
                console.error("Error getting sort order:", orderErr);
                return res.status(500).json({ error: orderErr.message });
              }
              const startOrder = (orderResult[0].max_order || -1) + 1;
              
              // Save images with sort_order
              const values = req.files.map((file, index) => [
                productId,
                `/uploads/products/${file.filename}`,
                startOrder + index,
              ]);

              const insertSql = `
                INSERT INTO product_images
                (product_id, image_url, sort_order)
                VALUES ?
              `;

              db.query(insertSql, [values], (err) => {
                if (err) {
                  console.error("Error saving images:", err);
                  return res.status(500).json({ error: err.message });
                }
                res.json({
                  message: "Images uploaded successfully",
                });
              });
            }
          );
        } else {
          // If sort_order doesn't exist, insert without it
          const values = req.files.map((file) => [
            productId,
            `/uploads/products/${file.filename}`,
          ]);

          const insertSql = `
            INSERT INTO product_images
            (product_id, image_url)
            VALUES ?
          `;

          db.query(insertSql, [values], (err) => {
            if (err) {
              console.error("Error saving images:", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({
              message: "Images uploaded successfully",
            });
          });
        }
      });
    }
  );
});

// ====================================
// DELETE PRODUCT IMAGE
// ====================================
router.delete("/:productId/images/:imageId", (req, res) => {
  const { productId, imageId } = req.params;

  // Get image URL to delete file
  db.query(
    "SELECT image_url FROM product_images WHERE id = ? AND product_id = ?",
    [imageId, productId],
    (err, result) => {
      if (err) {
        console.error("Error fetching image:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete from database
      db.query(
        "DELETE FROM product_images WHERE id = ?",
        [imageId],
        (err) => {
          if (err) {
            console.error("Error deleting image:", err);
            return res.status(500).json({ error: err.message });
          }

          // Delete file from filesystem
          const filePath = path.join(__dirname, "..", result[0].image_url);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting file:", unlinkErr);
              }
            });
          }

          res.json({
            message: "Image deleted successfully",
          });
        }
      );
    }
  );
});

module.exports = router;