const express = require("express");
const router = express.Router();

const {
  requestOtp,
  verifyOtpController,
  resendOtp,
} = require("../controllers/authController");

/**
 * ========================
 * AUTH ROUTES (NO AUTH MIDDLEWARE)
 * ========================
 */

// Step 1 → Request OTP (new or existing user)
router.post("/request-otp", requestOtp);

// Step 2 → Verify OTP & auto-login (returns JWT)
router.post("/verify-otp", verifyOtpController);

// Step 3 → Resend OTP
router.post("/resend-otp", resendOtp);

module.exports = router;
