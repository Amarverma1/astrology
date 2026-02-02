const express = require("express");
const router = express.Router();

const {
  requestOtp,
  verifyOtpController,
  resendOtp,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/auth");

/**
 * ========================
 * AUTH ROUTES
 * ========================
 */

// Step 1 → Request OTP (new or existing user)
router.post("/request-otp", requestOtp);

// Step 2 → Verify OTP & auto-login
router.post("/verify-otp", verifyOtpController);

// Step 3 → Resend OTP
router.post("/resend-otp", resendOtp);

/**
 * ========================
 * PROTECTED DASHBOARD ROUTES
 * ========================
 */

// Astrologer dashboard
router.get(
  "/astrologer/dashboard",
  authMiddleware(["astrologer"]),
  (req, res) => {
    res.json({
      message: "Welcome astrologer!",
      user: req.user,
    });
  }
);



module.exports = router;
