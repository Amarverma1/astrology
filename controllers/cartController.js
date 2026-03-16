// controllers/cartController.js
const pool = require("../config/db");

// 1️⃣ Add to Cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure product_id and quantity are integers
    const product_id = parseInt(req.body.product_id, 10);
    const quantity = parseInt(req.body.quantity, 10);

    if (isNaN(product_id) || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    // Check if product exists
    const productQuery = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );

    if (productQuery.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product already exists in cart
    const existingCart = await pool.query(
      "SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );

    if (existingCart.rowCount > 0) {
      // Update quantity
      const newQuantity = existingCart.rows[0].quantity + quantity;
      await pool.query(
        "UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2",
        [newQuantity, existingCart.rows[0].id]
      );
    } else {
      // Insert new cart item
      await pool.query(
        `INSERT INTO cart (user_id, product_id, quantity, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [userId, product_id, quantity]
      );
    }

    return res.status(200).json({ message: "Product added to cart successfully" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Fetch Cart Products
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartQuery = await pool.query(
      `
      SELECT 
        c.id as cart_id,
        c.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.image,
        p.stock
      FROM cart c
      JOIN products p 
      ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    const cartItems = cartQuery.rows.map((item) => ({
      id: item.cart_id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        img: `http://localhost:5000${item.image}`,
        stock: item.stock
      }
    }));

    res.status(200).json({
      cart: cartItems
    });

  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart_id } = req.params;

    const delQuery = await pool.query(
      "DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *",
      [cart_id, userId]
    );

    if (delQuery.rowCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({ message: "Cart item removed successfully" });
  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 4️⃣ Update Cart Quantity
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart_id = parseInt(req.params.cart_id); // IMPORTANT
    const delta = parseInt(req.body.delta);

    if (!delta) {
      return res.status(400).json({ message: "Invalid quantity update" });
    }

    const cartItem = await pool.query(
      "SELECT quantity FROM cart WHERE id = $1 AND user_id = $2",
      [cart_id, userId]
    );

    if (cartItem.rowCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const currentQty = cartItem.rows[0].quantity;
    const newQty = currentQty + delta;

    if (newQty < 1) {
      return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    await pool.query(
      "UPDATE cart SET quantity=$1, updated_at=NOW() WHERE id=$2",
      [newQty, cart_id]
    );

    res.json({
      message: "Cart updated successfully",
      quantity: newQty
    });

  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addToCart, getCart, removeFromCart, updateCartQuantity };