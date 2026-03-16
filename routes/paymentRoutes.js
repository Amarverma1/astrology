const express = require("express");
const router = express.Router();

const { createRazorpayOrder } = require("../controllers/paymentController");

router.post("/create-razorpay-order", createRazorpayOrder);

module.exports = router;