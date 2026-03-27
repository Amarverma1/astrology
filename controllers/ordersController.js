const pool = require("../config/db");

/* CREATE ORDER */
const createOrder = async (req, res) => {
  try {

    const userId = req.user.id;

    const { items, address, paymentMethod, paymentId, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart items required"
      });
    }

    await pool.query("BEGIN");

    const addressResult = await pool.query(
      `INSERT INTO user_addresses
      (user_id, full_name, phone, address, city, pincode)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id`,
      [
        userId,
        address.name,
        address.phone,
        address.address,
        address.city,
        address.pincode
      ]
    );

    const addressId = addressResult.rows[0].id;

    const orderResult = await pool.query(
      `INSERT INTO orders
      (user_id, address_id, total_amount, payment_method, razorpay_payment_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id`,
      [
        userId,
        addressId,
        total,
        paymentMethod,
        paymentId || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {

      await pool.query(
        `INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES ($1,$2,$3,$4)`,
        [
          orderId,
          item.id,
          item.quantity,
          item.price
        ]
      );

    }

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      orderId
    });

  } catch (error) {

    await pool.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Order failed"
    });

  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        o.*,

        -- total items
        COUNT(oi.id) AS total_items,

        -- total quantity
        COALESCE(SUM(oi.quantity), 0) AS total_quantity,

        -- preview image
        MIN(p.image) AS preview_image,

        -- preview product name
        MIN(p.name) AS product_name

      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id

      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    // 1️⃣ Fetch order info
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];

    // 2️⃣ Fetch order items with product info
    const itemsResult = await pool.query(
      `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [orderId]
    );

    const items = itemsResult.rows.map((item) => ({
      ...item,
      name: item.product_name,
      image: item.product_image,
    }));

    res.json({ order, items });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllOrdersAdmin = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        o.*,
        u.name AS user_name,
        u.email,

        COUNT(oi.id) AS total_items,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity,

        MIN(p.image) AS preview_image,
        MIN(p.name) AS product_name

      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id

      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Admin fetch orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {

    const orderId = req.params.id;
    const { status } = req.body;

    const validStatus = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order: result.rows[0]
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE ORDER (ADMIN) */
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    await pool.query("BEGIN");

    // Check if order exists
    const check = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (check.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 1️⃣ Delete order items first (important)
    await pool.query(
      `DELETE FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    // 2️⃣ Delete order
    await pool.query(
      `DELETE FROM orders WHERE id = $1`,
      [orderId]
    );

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Order deleted successfully",
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Delete order error:", error);

    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder
};