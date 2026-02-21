const express = require("express");
const router = express.Router();
const { getKundli,getHoroscope,getKundliMatch } = require("../controllers/astroController");

// GET /api/kundli
router.get("/kundli", getKundli);

// Horoscope API
router.get("/horoscope", getHoroscope);

// Kundli Match
router.get("/kundli/match", getKundliMatch);

module.exports = router;