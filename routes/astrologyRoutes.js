const express = require("express");
const router = express.Router();
const { getPanchang,getDailyHoroscope,getKundliMatching, getKundli } = require("../controllers/astrologyController");

// Panchang Route
router.post("/panchang", getPanchang);
// Daily Horoscope
router.post("/daily-horoscope", getDailyHoroscope);
router.post("/kundli-matching", getKundliMatching);
router.post("/kundli", getKundli);



module.exports = router;
