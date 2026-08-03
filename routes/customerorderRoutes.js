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

// ==============================
// UPDATE CUSTOMER ORDER STATUS AND PAYMENT STATUS
// ==============================
router.put("/:id/status-payment", async (req, res) => {
  const { status, payment_status } = req.body;

  console.log('Received update request for customer order:', { 
    id: req.params.id, 
    status, 
    payment_status 
  });

  // Valid statuses - including 'approved' and 'rejected'
  const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'];
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'blocked', 'paid'];

  let updates = [];
  let params = [];

  // Update the 'status' field (not 'order_status')
  if (status && validStatuses.includes(status.toLowerCase())) {
    updates.push("status = ?");
    params.push(status.toLowerCase());
  } else if (status) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Valid values: ${validStatuses.join(', ')}`
    });
  }

  if (payment_status && validPaymentStatuses.includes(payment_status.toLowerCase())) {
    updates.push("payment_status = ?");
    params.push(payment_status.toLowerCase());
  } else if (payment_status) {
    return res.status(400).json({
      success: false,
      error: `Invalid payment_status. Valid values: ${validPaymentStatuses.join(', ')}`
    });
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field (status or payment_status) is required"
    });
  }

  // Add updated_at timestamp
  updates.push("updated_at = NOW()");

  try {
    const query = `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`;
    const values = [...params, req.params.id];
    
    console.log('Executing query:', query);
    console.log('With values:', values);

    const [result] = await db.promise().query(query, values);

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Fetch the updated order
    const [updatedOrder] = await db.promise().query(
      "SELECT * FROM orders WHERE id = ?",
      [req.params.id]
    );

    if (!updatedOrder || updatedOrder.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found after update"
      });
    }

    // Parse items JSON if needed
    if (updatedOrder[0].items && typeof updatedOrder[0].items === 'string') {
      try {
        updatedOrder[0].items = JSON.parse(updatedOrder[0].items);
      } catch (e) {
        updatedOrder[0].items = [];
      }
    }

    console.log('Updated order:', updatedOrder[0]);

    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder[0]
    });
  } catch (err) {
    console.error("Error updating customer order:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update order",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;