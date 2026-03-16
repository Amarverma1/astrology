const express = require("express");
const router = express.Router();
const { getKundli,getHoroscope,getKundliMatch,getPanchang } = require("../controllers/astroController");

// GET /api/kundli
router.get("/kundli", getKundli);

// Horoscope API
router.get("/horoscope", getHoroscope);

// Kundli Match
router.get("/kundli/match", getKundliMatch);

// Panchnag
router.get("/panchang", getPanchang);

module.exports = router;