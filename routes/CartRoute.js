const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Promise wrapper
const query = (sql, values) => {
return new Promise((resolve, reject) => {
db.query(sql, values, (err, results) => {
if (err) return reject(err);
resolve(results);
});
});
};

// ✅ ADD TO CART (Optimized)
router.post("/cart", async (req, res) => {
try {
const { customerId, product } = req.body;

if (!customerId || !product) {
  return res.status(400).json({ success: false, message: "Missing data" });
}

await query(
  `INSERT INTO cart_items 
  (customer_id, product_id, product_name, price, quantity, image, created_at, updated_at)
  VALUES (?, ?, ?, ?, 1, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
    quantity = quantity + 1,
    product_name = VALUES(product_name),
    price = VALUES(price),
    image = VALUES(image),
    updated_at = NOW()`,
  [
    customerId,
    product.id,
    product.name,
    product.price,
    product.mainImage || product.image || ""
  ]
);

res.json({ success: true, message: "Item added to cart" });

} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Error adding to cart" });
}
});

// ✅ GET CART
router.get("/cart/:customerId", async (req, res) => {
try {
const { customerId } = req.params;

const items = await query(
  `SELECT * FROM cart_items 
   WHERE customer_id=? 
   ORDER BY updated_at DESC`,
  [customerId]
);

res.json({ success: true, data: items });


} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Error fetching cart" });
}
});

// ✅ UPDATE QUANTITY (Direct Set)
router.put("/cart", async (req, res) => {
try {
const { customerId, productId, quantity } = req.body;


if (!customerId || !productId || quantity == null) {
  return res.status(400).json({ success: false, message: "Missing data" });
}

if (quantity <= 0) {
  await query(
    `DELETE FROM cart_items 
     WHERE customer_id=? AND product_id=?`,
    [customerId, productId]
  );

  return res.json({ success: true, message: "Item removed" });
}

await query(
  `UPDATE cart_items 
   SET quantity=?, updated_at=NOW()
   WHERE customer_id=? AND product_id=?`,
  [quantity, customerId, productId]
);

res.json({ success: true, message: "Quantity updated" });


} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Error updating cart" });
}
});

// ✅ REMOVE SINGLE ITEM
router.delete("/cart/item", async (req, res) => {
try {
const { customerId, productId } = req.body;


if (!customerId || !productId) {
  return res.status(400).json({ success: false, message: "Missing data" });
}

await query(
  `DELETE FROM cart_items 
   WHERE customer_id=? AND product_id=?`,
  [customerId, productId]
);

res.json({ success: true, message: "Item removed" });


} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Error removing item" });
}
});

// ✅ CLEAR CART
router.delete("/cart/:customerId", async (req, res) => {
try {
const { customerId } = req.params;


await query(
  `DELETE FROM cart_items WHERE customer_id=?`,
  [customerId]
);

res.json({ success: true, message: "Cart cleared" });


} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Error clearing cart" });
}
});

module.exports = router;
