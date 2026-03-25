const express = require("express");
const router = express.Router();
const uploadProduct = require("../middleware/uploadProduct");


const products = require("../controllers/productsController");

router.post("/add", uploadProduct.single("image"), products.createProduct);



router.get("/", products.getAllProducts);

router.get("/top", products.getTopProducts);

router.get("/category/:categoryId", products.getProductsByCategory);

router.get("/search", products.searchProducts);

router.get("/:id", products.getProductById);

router.put("/update/:id", uploadProduct.single("image"), products.updateProduct);

router.delete("/delete/:id", products.deleteProduct);
router.put("/toggle-status/:id", products.toggleStatus);

module.exports = router;