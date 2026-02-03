const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");
const uploadProfile = require("../middleware/uploadProfile");




/**
 * USER ROUTES
 */
router.get("/me", auth(), usersController.getMyProfile);
router.put(
  "/me",
  auth(),                      // JWT auth
  uploadProfile.single("profile_image"),
  usersController.updateMyProfile
);

/**
 * ADMIN ROUTES
 */
router.get("/", auth(["admin"]), usersController.getAllUsers);
router.get("/:id", auth(["admin"]), usersController.getUserById);
router.put("/:id", auth(["admin"]), usersController.updateUserByAdmin);

module.exports = router;
