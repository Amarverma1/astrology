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

  const userId = req.user.id;

  const orders = await pool.query(
    `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
    [userId]
  );

  res.json(orders.rows);

};

const getOrderDetails = async (req, res) => {

  const orderId = req.params.id;

  const order = await pool.query(
    `SELECT * FROM orders WHERE id=$1`,
    [orderId]
  );

  const items = await pool.query(
    `SELECT * FROM order_items WHERE order_id=$1`,
    [orderId]
  );

  res.json({
    order: order.rows[0],
    items: items.rows
  });

};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails
};