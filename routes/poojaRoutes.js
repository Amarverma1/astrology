const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/poojaController");
const upload = require("../middleware/upload");

// ===== POOJA =====
router.post("/add", upload.single("image"), ctrl.addPooja);
router.get("/", ctrl.getAllPoojas);
router.get("/:id", ctrl.getPoojaById);
router.put("/:id", upload.single("image"), ctrl.updatePooja);
router.delete("/:id", ctrl.deletePooja);

// ===== BOOKINGS =====
router.post("/book", ctrl.bookPooja);
router.get("/bookings/all", ctrl.getAllBookings);
router.put("/booking/:id", ctrl.updateBookingStatus);
router.delete("/booking/:id", ctrl.deleteBooking);

module.exports = router;