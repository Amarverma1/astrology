// routes/cartRoutes.js
const express = require("express");
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require("../controllers/cartController");
const auth = require("../middleware/auth");

const router = express.Router();



router.post("/add", auth(), addToCart);
router.get("/", auth(), getCart);
router.delete("/:cart_id", auth(), removeFromCart);
router.put("/update/:cart_id", auth(), updateCartQuantity);

module.exports = router;