const pool = require("../config/db");

// ---------------------- CREATE USER ----------------------
const createUser = async (name, mobile, password, role) => {
  const result = await pool.query(
    `INSERT INTO users (name, mobile, password, role, otp_verified, is_active, is_blocked)
     VALUES ($1, $2, $3, $4, $5, true, false)
     RETURNING *`,
    [name, mobile, password, role, false]
  );
  return result.rows[0];
};

// ---------------------- GET USER BY MOBILE ----------------------
const getUserByMobile = async (mobile) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE mobile=$1`,
    [mobile]
  );
  return result.rows[0];
};

// ---------------------- UPDATE OTP ----------------------
const updateOtp = async (mobile, otp) => {
  await pool.query(
    `UPDATE users 
     SET otp=$1, otp_verified=false, otp_expires_at=NOW() + INTERVAL '10 minutes' 
     WHERE mobile=$2`,
    [otp, mobile]
  );
};

// ---------------------- VERIFY OTP ----------------------
const verifyOtp = async (mobile) => {
  await pool.query(
    `UPDATE users 
     SET otp_verified=true, otp=NULL, otp_expires_at=NULL 
     WHERE mobile=$1`,
    [mobile]
  );
};

module.exports = {
  createUser,
  getUserByMobile,
  updateOtp,
  verifyOtp,
};
