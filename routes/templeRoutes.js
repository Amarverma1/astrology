const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/templeController");
const upload = require("../middleware/upload");

/* ================= BOOKINGS ================= */
router.post("/book", ctrl.bookTemplePooja);
router.get("/bookings", ctrl.getTempleBookings);
router.put("/booking/:id", ctrl.updateBookingStatus);
router.delete("/booking/:id", ctrl.deleteBooking);

/* ================= TEMPLE POOJAS ================= */
router.post("/pooja/add", ctrl.addTemplePooja);
router.get("/pooja/:temple_id", ctrl.getTemplePoojas);
router.put("/pooja/:id", ctrl.updateTemplePooja);
router.delete("/pooja/:id", ctrl.deleteTemplePooja);

/* ================= TEMPLES ================= */
router.post("/add", upload.single("image"), ctrl.addTemple);
router.get("/", ctrl.getAllTemples);

/* 🔥 ALWAYS KEEP THIS LAST */
router.get("/:id", ctrl.getTempleById);
router.put("/:id", upload.single("image"), ctrl.updateTemple);
router.delete("/:id", ctrl.deleteTemple);

module.exports = router;