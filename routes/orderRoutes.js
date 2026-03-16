const express = require("express");

const {
  createOrder,
  getUserOrders,
  getOrderDetails
} = require("../controllers/ordersController");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/orders", authMiddleware(), createOrder);
router.get("/orders", authMiddleware(), getUserOrders);
router.get("/orders/:id", authMiddleware(), getOrderDetails);

module.exports = router;