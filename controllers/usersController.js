const pool = require("../config/db");

/**
 * =========================
 * USER APIs
 * =========================
 */

// GET /api/users/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, mobile, email, role,
              date_of_birth, city, state, country,
              gender, profile_image
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      date_of_birth,
      city,
      state,
      country,
      gender,
    } = req.body;

    // If file uploaded, build image path
    const profile_image = req.file
      ? `/uploads/profile/${req.file.filename}`
      : null;

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        date_of_birth = COALESCE($3, date_of_birth),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        country = COALESCE($6, country),
        gender = COALESCE($7, gender),
        profile_image = COALESCE($8, profile_image),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, name, mobile, email, city, state, country, gender, profile_image`,
      [
        name,
        email,
        date_of_birth,
        city,
        state,
        country,
        gender,
        profile_image,
        userId,
      ]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * =========================
 * ADMIN APIs
 * =========================
 */

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, mobile, email, role, is_active, city
       FROM users
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, mobile, email, role,
              date_of_birth, city, state, country,
              gender, is_active
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        role = COALESCE($1, role),
        is_active = COALESCE($2, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, role, is_active`,
      [role, is_active, req.params.id]
    );

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("updateUserByAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
