const pool = require("../config/db");

const createAdmin = async (name, email, password) => {
  const result = await pool.query(
    "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0];
};

const getAdminByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);
  return result.rows[0];
};

module.exports = { createAdmin, getAdminByEmail };
