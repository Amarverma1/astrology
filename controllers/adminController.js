const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { createAdmin, getAdminByEmail } = require("../models/adminModel");
require("dotenv").config();

// Admin Register
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await getAdminByEmail(email);
    if (existingAdmin) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await createAdmin(name, email, hashedPassword);
    res.status(201).json({ message: "Admin registered", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Fetch admin by email
    const admin = await getAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ Compare hashed passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set token as an HTTP-only cookie (secure in production)
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Exclude password before sending data
    const { password: _, ...adminData } = admin;

    // ✅ Send minimal safe data
    res.status(200).json({
      message: "Admin login successful",
      admin: {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        created_at: adminData.created_at,
      },
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ========================================================
// 🔮 1. Get All Astrologers with Profile + Pricing + Skills
// ========================================================
const getAllAstrologers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.mobile,
        u.is_active,
        u.is_blocked,
        u.created_at,
        u.updated_at,

        ap.id AS astrologer_profile_id,
        ap.bio,
        ap.experience_years,
        ap.languages,
        ap.education,
        ap.profile_photo,
        ap.rating,
        ap.total_reviews,
        ap.is_verified,
        ap.is_online,
        ap.last_seen,

        -- Pricing info
        pr.chat_price_per_min,
        pr.call_price_per_min,
        pr.video_price_per_min,
        pr.currency,

        -- Specializations (comma-separated string)
        COALESCE(
          STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name),
          ''
        ) AS specializations

      FROM users u
      JOIN astrologer_profiles ap ON ap.user_id = u.id
      LEFT JOIN astrologer_pricing pr ON pr.astrologer_id = ap.id
      LEFT JOIN astrologer_specialization_map asm ON asm.astrologer_id = ap.id
      LEFT JOIN astrology_specializations s ON s.id = asm.specialization_id

      WHERE u.role = 'astrologer'
      GROUP BY 
        u.id, ap.id, pr.chat_price_per_min, pr.call_price_per_min, pr.video_price_per_min, pr.currency
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      astrologers: result.rows,
    });
  } catch (error) {
    console.error("getAllAstrologers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching astrologers",
    });
  }
};

// ========================================================
// ✅ 2. Toggle User Active / Inactive
// ========================================================
const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_active;
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User active status updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("toggleUserActive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================================================
// 🚫 3. Toggle User Blocked / Unblocked
// ========================================================
const toggleUserBlocked = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET is_blocked = NOT is_blocked,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_blocked;
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User block status updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("toggleUserBlocked error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



module.exports = { registerAdmin, loginAdmin, getAllAstrologers,toggleUserBlocked,toggleUserActive };
