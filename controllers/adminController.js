const bcrypt = require("bcrypt");
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

module.exports = { registerAdmin, loginAdmin };
