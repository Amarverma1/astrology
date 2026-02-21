const express = require("express");
const router = express.Router();
const { getPanchang,getDailyHoroscope } = require("../controllers/astrologyController");

// Panchang Route
router.post("/panchang", getPanchang);
// Daily Horoscope
router.post("/daily-horoscope", getDailyHoroscope);

module.exports = router;
