const db = require("../config/db");

/* ================= TEMPLE ================= */

// ➕ Add Temple
exports.addTemple = async (req, res) => {
  try {
    const { name, description, location } = req.body;

    const image = req.file ? `/assets/${req.file.filename}` : null;

    const result = await db.query(
      `INSERT INTO temples (name, description, location, main_image)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, description, location, image]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Add temple failed" });
  }
};

// 📄 Get All Temples WITH POOJAS
exports.getAllTemples = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        t.*,
        COALESCE(
          json_agg(p.*) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as poojas
      FROM temples t
      LEFT JOIN temple_poojas p ON t.id = p.temple_id
      GROUP BY t.id
      ORDER BY t.id DESC
    `);

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// 🔍 Single Temple WITH POOJAS
exports.getTempleById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        t.*,
        COALESCE(
          json_agg(p.*) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as poojas
      FROM temples t
      LEFT JOIN temple_poojas p ON t.id = p.temple_id
      WHERE t.id=$1
      GROUP BY t.id
    `, [req.params.id]);

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// ✏️ Update Temple (WITH IMAGE)
exports.updateTemple = async (req, res) => {
  try {
    const { name, description, location } = req.body;

    let imagePath;

    if (req.file) {
      imagePath = `/assets/${req.file.filename}`;
    } else {
      const old = await db.query(
        "SELECT main_image FROM temples WHERE id=$1",
        [req.params.id]
      );
      imagePath = old.rows[0]?.main_image;
    }

    const result = await db.query(
      `UPDATE temples 
       SET name=$1, description=$2, location=$3, main_image=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, description, location, imagePath, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

// ❌ Delete Temple
exports.deleteTemple = async (req, res) => {
  try {
    await db.query("DELETE FROM temples WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ================= TEMPLE POOJA ================= */

// ➕ Add
exports.addTemplePooja = async (req, res) => {
  try {
    const { temple_id, pooja_name, price, description } = req.body;

    const result = await db.query(
      `INSERT INTO temple_poojas (temple_id, pooja_name, price, description)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [temple_id, pooja_name, price, description]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Add pooja failed" });
  }
};

// ✏️ Update Pooja
exports.updateTemplePooja = async (req, res) => {
  try {
    const { pooja_name, price, description } = req.body;

    const result = await db.query(
      `UPDATE temple_poojas
       SET pooja_name=$1, price=$2, description=$3
       WHERE id=$4 RETURNING *`,
      [pooja_name, price, description, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Update pooja failed" });
  }
};

// 📄 Get by temple
exports.getTemplePoojas = async (req, res) => {
  const result = await db.query(
    "SELECT * FROM temple_poojas WHERE temple_id=$1",
    [req.params.temple_id]
  );

  res.json(result.rows);
};

// ❌ Delete
exports.deleteTemplePooja = async (req, res) => {
  await db.query("DELETE FROM temple_poojas WHERE id=$1", [
    req.params.id,
  ]);
  res.json({ success: true });
};

/* ================= BOOKINGS ================= */

// ➕ Book
exports.bookTemplePooja = async (req, res) => {
  try {
    const {
      temple_id,
      user_name,
      user_email,
      user_phone,
      pooja_name,
      pooja_date,
      pooja_time,
      amount,
    } = req.body;

    const result = await db.query(
      `INSERT INTO temple_pooja_bookings
       (temple_id, user_name, user_email, user_phone,
        pooja_name, pooja_date, pooja_time, amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        temple_id,
        user_name,
        user_email,
        user_phone,
        pooja_name,
        pooja_date,
        pooja_time,
        amount,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Booking failed" });
  }
};

exports.getTempleBookings = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.id,
        b.temple_id,
        b.user_id,
        b.user_name,
        b.user_email,
        b.user_phone,
        b.pooja_name,
        b.pooja_date,
        b.pooja_time,
        b.amount,
        b.payment_status,
        b.booking_status,
        b.created_at,
        t.name AS temple_name
      FROM temple_pooja_bookings b
      LEFT JOIN temples t ON b.temple_id = t.id
      ORDER BY b.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });

  } catch (err) {
    console.error("❌ BOOKINGS ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
};

// 🔄 Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { booking_status, payment_status } = req.body;

    const result = await db.query(
      `UPDATE temple_pooja_bookings
       SET booking_status=$1, payment_status=$2
       WHERE id=$3 RETURNING *`,
      [booking_status, payment_status, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Update booking failed" });
  }
};

// ❌ Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM temple_pooja_bookings WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete booking failed" });
  }
};