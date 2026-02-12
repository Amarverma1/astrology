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


const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await getAdminByEmail(email);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ message: "Admin login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getAllAstrologers = async (req, res) => {
  try {
    // 📌 Query parameters from frontend
    const {
      search = "",
      page = 1,
      limit = 2,
      is_active,
      is_blocked,
      is_verified,
      is_online,
      min_rating,
      max_rating,
      min_experience,
      max_experience,
    } = req.query;

    // Convert page/limit to numbers
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 🧠 Base WHERE conditions
    const conditions = [`u.role = 'astrologer'`];
    const values = [];

    // 🔍 Search filter
    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      conditions.push(
        `(LOWER(u.name) LIKE $${values.length} OR LOWER(u.email) LIKE $${values.length} OR u.mobile LIKE $${values.length})`
      );
    }

    // ✅ Status filters
    if (is_active !== undefined) {
      values.push(is_active === "true");
      conditions.push(`u.is_active = $${values.length}`);
    }

    if (is_blocked !== undefined) {
      values.push(is_blocked === "true");
      conditions.push(`u.is_blocked = $${values.length}`);
    }

    if (is_verified !== undefined) {
      values.push(is_verified === "true");
      conditions.push(`ap.is_verified = $${values.length}`);
    }

    if (is_online !== undefined) {
      values.push(is_online === "true");
      conditions.push(`ap.is_online = $${values.length}`);
    }

    // ⭐ Rating range
    if (min_rating) {
      values.push(parseFloat(min_rating));
      conditions.push(`ap.rating >= $${values.length}`);
    }
    if (max_rating) {
      values.push(parseFloat(max_rating));
      conditions.push(`ap.rating <= $${values.length}`);
    }

    // 🧭 Experience range
    if (min_experience) {
      values.push(parseInt(min_experience));
      conditions.push(`ap.experience_years >= $${values.length}`);
    }
    if (max_experience) {
      values.push(parseInt(max_experience));
      conditions.push(`ap.experience_years <= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // ===============================
    // 🧮 Query to get paginated result
    // ===============================
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

        pr.chat_price_per_min,
        pr.call_price_per_min,
        pr.video_price_per_min,
        pr.currency,

        COALESCE(STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name), '') AS specializations

      FROM users u
      LEFT JOIN astrologer_profiles ap ON ap.user_id = u.id
      LEFT JOIN astrologer_pricing pr ON pr.astrologer_id = ap.id
      LEFT JOIN astrologer_specialization_map asm ON asm.astrologer_id = ap.id
      LEFT JOIN astrology_specializations s ON s.id = asm.specialization_id

      ${whereClause}
      GROUP BY 
        u.id, ap.id, pr.chat_price_per_min, pr.call_price_per_min, pr.video_price_per_min, pr.currency
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const result = await pool.query(query, values);

    // 🧮 Get total count for pagination
    // Correct count query for pagination
    const countQuery = `
  SELECT COUNT(DISTINCT u.id) AS total
  FROM users u
  LEFT JOIN astrologer_profiles ap ON ap.user_id = u.id
  ${whereClause};
`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);


    // ✅ Response
    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
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



const addAstrologer = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    // 🧩 Validate input
    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and mobile are required",
      });
    }

    // 🧩 Check duplicate (email or mobile)
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR mobile = $2`,
      [email, mobile]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile already exists",
      });
    }

    // 🔐 Generate a default password (hashed)
    const defaultPassword = "astro@123"; // or generate random if you want
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 🧩 Insert new astrologer user
    const result = await pool.query(
      `
      INSERT INTO users (name, email, mobile, password, role, otp_verified, is_active)
      VALUES ($1, $2, $3, $4, 'astrologer', true, true)
      RETURNING id, name, email, mobile, role, created_at
      `,
      [name, email, mobile, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Astrologer added successfully",
      astrologer: result.rows[0],
      default_password: defaultPassword, // (optional: remove in prod)
    });
  } catch (err) {
    console.error("Add astrologer error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ========================================================
// 🚫 5. Delete Astrologer
// ========================================================
const deleteAstrologer = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if the user exists and is an astrologer
    const existing = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'astrologer'`,
      [userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found",
      });
    }

    // Delete the astrologer
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.status(200).json({
      success: true,
      message: "Astrologer deleted successfully",
    });
  } catch (err) {
    console.error("deleteAstrologer error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = { registerAdmin, loginAdmin, getAllAstrologers,deleteAstrologer, toggleUserBlocked, toggleUserActive, addAstrologer };
