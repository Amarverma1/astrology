const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  getUserByMobile,
  createUser,
  updateOtp,
  verifyOtp,
} = require("../models/userModel");

require("dotenv").config();

// ---------------------- REQUEST OTP ----------------------
const requestOtp = async (req, res) => {
  const { mobile } = req.body; // ❌ role removed

  try {
    let user = await getUserByMobile(mobile);

    // Dummy OTP for testing
    const otp = "1234";

    if (user) {
      // Mobile exists → resend OTP
      await updateOtp(mobile, otp);
    } else {
      // New user → ALWAYS role = 'user'
      const hashedPassword = await bcrypt.hash("dummy", 10);
      user = await createUser(
        "New User",
        mobile,
        hashedPassword,
        "user" // ✅ fixed role
      );
      await updateOtp(mobile, otp);
    }

    res.json({
      message: "OTP sent successfully",
      otp, // ⚠️ remove in production
      role: user.role, // optional, ok to send
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- VERIFY OTP & LOGIN ----------------------
const verifyOtpController = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const user = await getUserByMobile(mobile);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ If user is blocked
    if (user.is_blocked) {
      return res.status(403).json({
        message:
          "Your account has been temporarily blocked. Please contact support for assistance.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    await verifyOtp(mobile);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Safe user data (NO sensitive fields)
    const userData = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      otp_verified: true,
      is_active: user.is_active,
      created_at: user.created_at,
    };

    res.json({
      message: "OTP verified successfully, login successful",
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- RESEND OTP ----------------------
const resendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    const user = await getUserByMobile(mobile);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ If user is blocked
    if (user.is_blocked) {
      return res.status(403).json({
        message:
          "Your account has been temporarily blocked. Please contact support for assistance.",
      });
    }

    // Dummy OTP for testing
    const otp = "1234";

    await updateOtp(mobile, otp);

    res.json({
      message: "OTP resent successfully",
      otp, // ⚠️ remove in production
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  requestOtp,
  verifyOtpController,
  resendOtp,
};
