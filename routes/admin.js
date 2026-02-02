const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");

// Admin register (optional, you can seed first admin manually)
router.post("/register", registerAdmin);

// Admin login
router.post("/login", loginAdmin);

// Example protected admin route
router.get("/dashboard", authMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome admin!", user: req.user });
});

module.exports = router;
