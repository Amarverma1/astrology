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

module.exports = { getOrderDetails };

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails
};