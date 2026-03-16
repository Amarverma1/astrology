const pool = require("../config/db");

// ---------------------- CREATE USER ----------------------
const createUser = async (name, mobile, password, role, email = null) => {
  const result = await pool.query(
    `INSERT INTO users 
      (name, mobile, email, password, role, otp_verified, is_active, is_blocked)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, mobile, email, password, role, false, true, false]
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

// ---------------------- GET USER BY EMAIL ----------------------
const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  return result.rows[0];
};

// ---------------------- UPDATE OTP ----------------------
const updateOtp = async (mobileOrEmail, otp) => {
  let query = "";
  let params = [];

  if (mobileOrEmail.includes("@")) {
    // Update by email
    query = `UPDATE users 
             SET otp=$1, otp_verified=false, otp_expires_at=NOW() + INTERVAL '10 minutes' 
             WHERE email=$2`;
    params = [otp, mobileOrEmail];
  } else {
    // Update by mobile
    query = `UPDATE users 
             SET otp=$1, otp_verified=false, otp_expires_at=NOW() + INTERVAL '10 minutes' 
             WHERE mobile=$2`;
    params = [otp, mobileOrEmail];
  }

  await pool.query(query, params);
};

// ---------------------- VERIFY OTP ----------------------
const verifyOtp = async (mobileOrEmail) => {
  let query = "";
  let params = [];

  if (mobileOrEmail.includes("@")) {
    query = `UPDATE users 
             SET otp_verified=true, otp=NULL, otp_expires_at=NULL 
             WHERE email=$1`;
    params = [mobileOrEmail];
  } else {
    query = `UPDATE users 
             SET otp_verified=true, otp=NULL, otp_expires_at=NULL 
             WHERE mobile=$1`;
    params = [mobileOrEmail];
  }

  await pool.query(query, params);
};

module.exports = {
  createUser,
  getUserByMobile,
  getUserByEmail,
  updateOtp,
  verifyOtp,
};