// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ====================================
// // CREATE UPLOAD FOLDER
// // ====================================
// const uploadDir = path.join(__dirname, '..', 'uploads', 'products');

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

//   db.query("SHOW COLUMNS FROM product_images LIKE 'sort_order'", (colErr, columns) => {
//     const hasSortOrder = columns && columns.length > 0;
    
//     if (hasSortOrder) {
//       const values = files.map((file, index) => [
//         productId,
//         `uploads/products/${file.filename}`,
//         index,
//       ]);

//       db.query(
//         `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?`,
//         [values],
//         callback
//       );
//     } else {
//       const values = files.map((file) => [
//         productId,
//         `uploads/products/${file.filename}`,
//       ]);

//       db.query(
//         `INSERT INTO product_images (product_id, image_url) VALUES ?`,
//         [values],
//         callback
//       );
//     }
//   });
// }

// // ====================================
// // HELPER: GET PRODUCT IMAGES
// // ====================================
// function getProductImages(productId, callback) {
//   db.query(
//     `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC`,
//     [productId],
//     (err, results) => {
//       if (err) {
//         if (err.code === 'ER_BAD_FIELD_ERROR') {
//           db.query(
//             `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY id ASC`,
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
//       if (product.product_images && typeof product.product_images === 'string') {
//         try {
//           product.images = JSON.parse(product.product_images);
//         } catch (e) {
//           product.images = [];
//         }
//       } else if (product.product_images && Array.isArray(product.product_images)) {
//         product.images = product.product_images;
//       } else {
//         product.images = [];
//       }

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

//     if (!product_category_id) {
//       return res.status(400).json({ error: "Category is required" });
//     }
//     if (!product_name || product_name.trim() === '') {
//       return res.status(400).json({ error: "Product name is required" });
//     }

//     const sql = `
//       INSERT INTO products (
//         product_category_id, product_name, product_code, product_brand,
//         price, available_stock, dimensions, specifications,
//         weight, color, discount, product_description,
//         warranty, material, care_instructions, is_active
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         product_category_id || null,
//         product_name.trim(),
//         product_code || null,
//         product_brand || null,
//         parseFloat(price) || 0,
//         parseInt(available_stock) || 0,
//         dimensions || null,
//         specifications || null,
//         weight || null,
//         color || null,
//         parseFloat(discount) || 0,
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
//   console.log("GET /api/products - Fetching all products");
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
//     console.log(`Found ${results.length} products`);
//     res.json(results);
//   });
// });

// // ====================================
// // GET PRODUCTS BY CATEGORY
// // IMPORTANT: This MUST come before /:id route
// // ====================================
// router.get("/category/:categoryId", (req, res) => {
//   const { categoryId } = req.params;
//   console.log(`GET /api/products/category/${categoryId} - Fetching products by category`);

//   // Validate categoryId
//   if (!categoryId) {
//     return res.status(400).json({ error: "Category ID is required" });
//   }

//   // Check if it's a number
//   if (isNaN(categoryId)) {
//     console.log("Invalid category ID:", categoryId);
//     return res.status(400).json({ error: "Invalid category ID" });
//   }

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

//   console.log("SQL Query:", sql);
//   console.log("SQL Params:", [categoryId]);

//   getProductsWithImages(sql, [categoryId], (err, results) => {
//     if (err) {
//       console.error("Error fetching products by category:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log(`Found ${results.length} products for category ${categoryId}`);
//     res.json(results);
//   });
// });

// // ====================================
// // GET TRENDING PRODUCTS
// // ====================================
// router.get("/trending", (req, res) => {
//   console.log("GET /api/products/trending - Fetching trending products");
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
//   console.log("GET /api/products/best-sellers - Fetching best sellers");
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
//   console.log("GET /api/products/new-arrivals - Fetching new arrivals");
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
//   console.log(`GET /api/products/search?q=${q} - Searching products`);

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
// // IMPORTANT: This MUST come AFTER /category/:categoryId route
// // ====================================
// router.get("/:id", (req, res) => {
//   const productId = req.params.id;
//   console.log(`GET /api/products/${productId} - Fetching single product`);

//   // Check if the ID is a number
//   if (!productId || isNaN(productId)) {
//     console.log("Invalid product ID:", productId);
//     return res.status(400).json({ error: "Invalid product ID" });
//   }

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

//       if (product.product_images && typeof product.product_images === 'string') {
//         try {
//           product.images = JSON.parse(product.product_images);
//         } catch (e) {
//           product.images = [];
//         }
//       } else if (product.product_images && Array.isArray(product.product_images)) {
//         product.images = product.product_images;
//       } else {
//         product.images = [];
//       }

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

//   if (!product_category_id) {
//     return res.status(400).json({ error: "Category is required" });
//   }
//   if (!product_name || product_name.trim() === '') {
//     return res.status(400).json({ error: "Product name is required" });
//   }

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
//       product_name.trim(),
//       product_code || null,
//       product_brand || null,
//       parseFloat(price) || 0,
//       parseInt(available_stock) || 0,
//       dimensions || null,
//       specifications || null,
//       weight || null,
//       color || null,
//       parseFloat(discount) || 0,
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
//     "SELECT image_url FROM product_images WHERE product_id = ?",
//     [productId],
//     (err, images) => {
//       if (err) {
//         console.error("Error fetching images for deletion:", err);
//       }

//       db.query(
//         `DELETE FROM product_images WHERE product_id = ?`,
//         [productId],
//         (err) => {
//           if (err) {
//             console.error("Error deleting product images:", err);
//             return res.status(500).json({ error: err.message });
//           }

//           db.query(
//             `DELETE FROM products WHERE id = ?`,
//             [productId],
//             (err) => {
//               if (err) {
//                 console.error("Error deleting product:", err);
//                 return res.status(500).json({ error: err.message });
//               }

//               if (images && images.length > 0) {
//                 images.forEach((img) => {
//                   const filePath = path.join(__dirname, "..", img.image_url);
//                   if (fs.existsSync(filePath)) {
//                     fs.unlink(filePath, (unlinkErr) => {
//                       if (unlinkErr) {
//                         console.error("Error deleting file:", unlinkErr);
//                       }
//                     });
//                   }
//                 });
//               }

//               res.json({
//                 message: "Product deleted successfully",
//               });
//             }
//           );
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

//       db.query("SHOW COLUMNS FROM product_images LIKE 'sort_order'", (colErr, columns) => {
//         const hasSortOrder = columns && columns.length > 0;
        
//         if (hasSortOrder) {
//           db.query(
//             "SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?",
//             [productId],
//             (orderErr, orderResult) => {
//               if (orderErr) {
//                 console.error("Error getting sort order:", orderErr);
//                 return res.status(500).json({ error: orderErr.message });
//               }
//               const startOrder = (orderResult[0].max_order || -1) + 1;
              
//               const values = req.files.map((file, index) => [
//                 productId,
//                 `uploads/products/${file.filename}`,
//                 startOrder + index,
//               ]);

//               const insertSql = `
//                 INSERT INTO product_images
//                 (product_id, image_url, sort_order)
//                 VALUES ?
//               `;

//               db.query(insertSql, [values], (err) => {
//                 if (err) {
//                   console.error("Error saving images:", err);
//                   return res.status(500).json({ error: err.message });
//                 }
//                 res.json({
//                   message: "Images uploaded successfully",
//                 });
//               });
//             }
//           );
//         } else {
//           const values = req.files.map((file) => [
//             productId,
//             `uploads/products/${file.filename}`,
//           ]);

//           const insertSql = `
//             INSERT INTO product_images
//             (product_id, image_url)
//             VALUES ?
//           `;

//           db.query(insertSql, [values], (err) => {
//             if (err) {
//               console.error("Error saving images:", err);
//               return res.status(500).json({ error: err.message });
//             }
//             res.json({
//               message: "Images uploaded successfully",
//             });
//           });
//         }
//       });
//     }
//   );
// });

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


// // Add this test endpoint at the top of your productRoute.js
// router.get("/test-category/:categoryId", (req, res) => {
//   const { categoryId } = req.params;
//   console.log(`TEST: Fetching products for category ${categoryId}`);
  
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

//   db.query(sql, [categoryId], (err, results) => {
//     if (err) {
//       console.error("Error:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json({
//       success: true,
//       categoryId: categoryId,
//       count: results.length,
//       products: results
//     });
//   });
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ====================================
// CREATE UPLOAD FOLDER
// ====================================
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');

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
    fileSize: 5 * 1024 * 1024,
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

  db.query("SHOW COLUMNS FROM product_images LIKE 'sort_order'", (colErr, columns) => {
    const hasSortOrder = columns && columns.length > 0;
    
    if (hasSortOrder) {
      const values = files.map((file, index) => [
        productId,
        `uploads/products/${file.filename}`,
        index,
      ]);

      db.query(
        `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?`,
        [values],
        callback
      );
    } else {
      const values = files.map((file) => [
        productId,
        `uploads/products/${file.filename}`,
      ]);

      db.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ?`,
        [values],
        callback
      );
    }
  });
}

// ====================================
// HELPER: GET PRODUCT IMAGES
// ====================================
function getProductImages(productId, callback) {
  db.query(
    `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC`,
    [productId],
    (err, results) => {
      if (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          db.query(
            `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY id ASC`,
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
// TEST ENDPOINT - ADD THIS
// ====================================
router.get("/test-category/:categoryId", (req, res) => {
  const { categoryId } = req.params;
  console.log(`TEST: Fetching products for category ${categoryId}`);
  
  if (!categoryId || isNaN(categoryId)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

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

  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`TEST: Found ${results.length} products for category ${categoryId}`);
    res.json({
      success: true,
      categoryId: categoryId,
      count: results.length,
      products: results
    });
  });
});

// ====================================
// GET PRODUCTS BY CATEGORY
// ====================================
router.get("/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;
  console.log(`GET /api/products/category/${categoryId} - Fetching products by category`);

  if (!categoryId) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  if (isNaN(categoryId)) {
    console.log("Invalid category ID:", categoryId);
    return res.status(400).json({ error: "Invalid category ID" });
  }

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

  console.log("SQL Query:", sql);
  console.log("SQL Params:", [categoryId]);

  getProductsWithImages(sql, [categoryId], (err, results) => {
    if (err) {
      console.error("Error fetching products by category:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Found ${results.length} products for category ${categoryId}`);
    res.json(results);
  });
});

// ====================================
// GET ALL PRODUCTS
// ====================================
router.get("/", (req, res) => {
  console.log("GET /api/products - Fetching all products");
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
    console.log(`Found ${results.length} products`);
    res.json(results);
  });
});

// ====================================
// GET SINGLE PRODUCT
// ====================================
router.get("/:id", (req, res) => {
  const productId = req.params.id;
  console.log(`GET /api/products/${productId} - Fetching single product`);

  if (!productId || isNaN(productId)) {
    console.log("Invalid product ID:", productId);
    return res.status(400).json({ error: "Invalid product ID" });
  }

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

    if (!product_category_id) {
      return res.status(400).json({ error: "Category is required" });
    }
    if (!product_name || product_name.trim() === '') {
      return res.status(400).json({ error: "Product name is required" });
    }

    const sql = `
      INSERT INTO products (
        product_category_id, product_name, product_code, product_brand,
        price, available_stock, dimensions, specifications,
        weight, color, discount, product_description,
        warranty, material, care_instructions, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        product_category_id || null,
        product_name.trim(),
        product_code || null,
        product_brand || null,
        parseFloat(price) || 0,
        parseInt(available_stock) || 0,
        dimensions || null,
        specifications || null,
        weight || null,
        color || null,
        parseFloat(discount) || 0,
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

  if (!product_category_id) {
    return res.status(400).json({ error: "Category is required" });
  }
  if (!product_name || product_name.trim() === '') {
    return res.status(400).json({ error: "Product name is required" });
  }

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
      product_name.trim(),
      product_code || null,
      product_brand || null,
      parseFloat(price) || 0,
      parseInt(available_stock) || 0,
      dimensions || null,
      specifications || null,
      weight || null,
      color || null,
      parseFloat(discount) || 0,
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

  db.query(
    "SELECT image_url FROM product_images WHERE product_id = ?",
    [productId],
    (err, images) => {
      if (err) {
        console.error("Error fetching images for deletion:", err);
      }

      db.query(
        `DELETE FROM product_images WHERE product_id = ?`,
        [productId],
        (err) => {
          if (err) {
            console.error("Error deleting product images:", err);
            return res.status(500).json({ error: err.message });
          }

          db.query(
            `DELETE FROM products WHERE id = ?`,
            [productId],
            (err) => {
              if (err) {
                console.error("Error deleting product:", err);
                return res.status(500).json({ error: err.message });
              }

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

      db.query("SHOW COLUMNS FROM product_images LIKE 'sort_order'", (colErr, columns) => {
        const hasSortOrder = columns && columns.length > 0;
        
        if (hasSortOrder) {
          db.query(
            "SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?",
            [productId],
            (orderErr, orderResult) => {
              if (orderErr) {
                console.error("Error getting sort order:", orderErr);
                return res.status(500).json({ error: orderErr.message });
              }
              const startOrder = (orderResult[0].max_order || -1) + 1;
              
              const values = req.files.map((file, index) => [
                productId,
                `uploads/products/${file.filename}`,
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
          const values = req.files.map((file) => [
            productId,
            `uploads/products/${file.filename}`,
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

      db.query(
        "DELETE FROM product_images WHERE id = ?",
        [imageId],
        (err) => {
          if (err) {
            console.error("Error deleting image:", err);
            return res.status(500).json({ error: err.message });
          }

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