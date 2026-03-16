const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  getUserByMobile,
  getUserByEmail,
  createUser,
  updateOtp,
  verifyOtp,
} = require("../models/userModel");

require("dotenv").config();

// ---------------------- HELPER: SEND EMAIL OTP ----------------------



const sendEmailOtp = async (email, otp) => {
  try {

    const payload = {
      sender: { name: "AMAR", email: "vamar1435@yourdomain.com" },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    const headers = {
      "api-key": process.env.BREVO_API_KEY,
      "accept": "application/json",
      "content-type": "application/json",
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers }
    );

    console.log("Email sent successfully:", response.data);

    return response.data;

  } catch (err) {

    console.error("Error sending OTP email:", err.response?.data || err.message);

    throw new Error("Failed to send OTP email");

  }
}
// ---------------------- REQUEST OTP ----------------------
const requestOtp = async (req, res) => {
  const { mobile, email } = req.body;

  if (!mobile && !email) {
    return res.status(400).json({ message: "Mobile or email is required" });
  }

  try {
    let user = null;

    // Check by mobile first
    if (mobile) user = await getUserByMobile(mobile);

    // If not found by mobile, check by email
    if (!user && email) user = await getUserByEmail(email);

    // Generate OTP
    let otp = "";

    if (mobile) {
      otp = "1234"; // Fixed OTP for mobile login
    } else if (email) {
      otp = Math.floor(1000 + Math.random() * 9000).toString(); // Random OTP for email
    }

    if (user) {
      // User exists → update OTP
      await updateOtp(mobile || email, otp);
    } else {
      // New user → create
      const hashedPassword = await bcrypt.hash("dummy", 10);
      user = await createUser(
        "New User",
        mobile || null,
        hashedPassword,
        "user",
        email || null
      );
      await updateOtp(mobile || email, otp);
    }

    // Send OTP via email if email exists
    if (email) {
      await sendEmailOtp(email, otp); // Your Brevo/Sendinblue email logic
    }

    res.json({
      message: "OTP sent successfully",
      otp, // ⚠️ remove in production
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ---------------------- VERIFY OTP & LOGIN ----------------------
const verifyOtpController = async (req, res) => {
  const { mobile, email, otp } = req.body;

  if (!mobile && !email) {
    return res.status(400).json({ message: "Mobile or email is required" });
  }

  try {
    let user = null;

    if (mobile) user = await getUserByMobile(mobile);
    if (!user && email) user = await getUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_blocked) {
      return res.status(403).json({
        message:
          "Your account has been temporarily blocked. Please contact support.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await verifyOtp(mobile || user.mobile);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  const { mobile, email } = req.body;

  if (!mobile && !email) {
    return res.status(400).json({ message: "Mobile or email is required" });
  }

  try {
    let user = null;

    if (mobile) user = await getUserByMobile(mobile);
    if (!user && email) user = await getUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_blocked) {
      return res.status(403).json({
        message:
          "Your account has been temporarily blocked. Please contact support.",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await updateOtp(mobile || user.mobile, otp);

    if (email) {
      await sendEmailOtp(email, otp);
    }

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


