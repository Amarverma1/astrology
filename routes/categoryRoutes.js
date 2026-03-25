const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload"); // ✅ add this

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// ✅ use multer here
router.post("/", upload.single("image"), categoryController.createCategory);

// ✅ also for update
router.put("/:id", upload.single("image"), categoryController.updateCategory);

router.delete("/:id", categoryController.deleteCategory);

module.exports = router;