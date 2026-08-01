const express = require("express");
const router = express.Router();
const db = require("../db");

// ==============================
// GET ALL CUSTOMER ORDERS
// ==============================
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        o.*
      FROM orders o
      ORDER BY o.id DESC
    `;

    const [orders] = await db.promise().query(sql);

    // Parse items JSON for each order
    for (let order of orders) {
      // Parse items if it's a string
      if (order.items && typeof order.items === 'string') {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          order.items = [];
        }
      }
      
      // If items is already an object/array, keep it as is
      if (!order.items) {
        order.items = [];
      }
    }

    res.json({
      success: true,
      message: "Customer orders fetched successfully",
      count: orders.length,
      data: orders
    });

  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      message: err.message
    });
  }
});

// ==============================
// GET CUSTOMER ORDER BY ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const [order] = await db.promise().query(
      `
      SELECT * FROM orders
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Parse items JSON
    if (order[0].items && typeof order[0].items === 'string') {
      try {
        order[0].items = JSON.parse(order[0].items);
      } catch (e) {
        order[0].items = [];
      }
    }
    
    if (!order[0].items) {
      order[0].items = [];
    }

    res.json({
      success: true,
      message: "Order details fetched successfully",
      data: order[0]
    });

  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order details",
      message: err.message
    });
  }
});

module.exports = router;