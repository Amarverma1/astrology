const express = require("express");

const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatus
} = require("../controllers/ordersController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

/* USER ROUTES */
router.post("/orders", authMiddleware(), createOrder);
router.get("/orders", authMiddleware(), getUserOrders);
router.get("/orders/:id", authMiddleware(), getOrderDetails);

/* ADMIN ROUTES */
router.get("/admin/orders", authMiddleware(), adminMiddleware(), getAllOrdersAdmin);
router.put("/admin/orders/:id/status", authMiddleware(), adminMiddleware(), updateOrderStatus);

module.exports = router;