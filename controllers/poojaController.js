const db = require("../config/db");


// =========================
// 🛕 POOJA CRUD (ADMIN)
// =========================

// ➕ Add Pooja
exports.addPooja = async (req, res) => {
  try {
    const { pooja_name, description, price, duration } = req.body;

    const imagePath = req.file
      ? `/assets/${req.file.filename}`
      : null;

    const result = await db.query(
      `INSERT INTO poojas (pooja_name, description, price, duration, image)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [pooja_name, description, price, duration, imagePath]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Add pooja failed" });
  }
};


// 📄 Get All Poojas (USER + ADMIN)
exports.getAllPoojas = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM poojas ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch pooja failed" });
  }
};


// 🔍 Get Single Pooja
exports.getPoojaById = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM poojas WHERE id=$1",
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Fetch single pooja failed" });
  }
};


exports.updatePooja = async (req, res) => {
  try {
    const { pooja_name, description, price, duration } = req.body;

    let imagePath;

    if (req.file) {
      imagePath = `/assets/${req.file.filename}`;
    } else {
      const old = await db.query(
        "SELECT image FROM poojas WHERE id=$1",
        [req.params.id]
      );
      imagePath = old.rows[0]?.image;
    }

    const result = await db.query(
      `UPDATE poojas 
       SET pooja_name=$1, description=$2, price=$3, duration=$4, image=$5
       WHERE id=$6 RETURNING *`,
      [pooja_name, description, price, duration, imagePath, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};


// ❌ Delete Pooja (ADMIN)
exports.deletePooja = async (req, res) => {
  try {
    await db.query("DELETE FROM poojas WHERE id=$1", [req.params.id]);

    res.json({ success: true, message: "Pooja deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};



// =========================
// 📿 BOOK POOJA (USER)
// =========================

exports.bookPooja = async (req, res) => {
  try {
    const {
      pooja_id,
      pandit_id,
      user_id,
      user_name,
      user_email,
      user_phone,
      address,
      city,
      state,
      pincode,
      pooja_date,
      pooja_time,
      special_requirements,
      amount,
    } = req.body;

    const result = await db.query(
      `INSERT INTO home_pooja_bookings
      (pooja_id, pandit_id, user_id, user_name, user_email, user_phone,
       address, city, state, pincode, pooja_date, pooja_time,
       special_requirements, amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        pooja_id,
        pandit_id,
        user_id || null,
        user_name,
        user_email,
        user_phone,
        address,
        city,
        state,
        pincode,
        pooja_date,
        pooja_time,
        special_requirements,
        amount,
      ]
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
};



// =========================
// 📊 BOOKINGS (ADMIN)
// =========================

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, p.pooja_name 
      FROM home_pooja_bookings b
      LEFT JOIN poojas p ON b.pooja_id = p.id
      ORDER BY b.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch bookings failed" });
  }
};


// 🔄 Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { booking_status, payment_status } = req.body;

    const result = await db.query(
      `UPDATE home_pooja_bookings
       SET booking_status=$1, payment_status=$2
       WHERE id=$3 RETURNING *`,
      [booking_status, payment_status, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Update booking failed" });
  }
};


// ❌ Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM home_pooja_bookings WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete booking failed" });
  }
};