const express = require("express");
const router = express.Router();

const products = require("../controllers/productsController");

router.post("/add", products.createProduct);

router.get("/", products.getAllProducts);

router.get("/top", products.getTopProducts);

router.get("/category/:categoryId", products.getProductsByCategory);

router.get("/search", products.searchProducts);

router.get("/:id", products.getProductById);

router.put("/update/:id", products.updateProduct);

router.delete("/delete/:id", products.deleteProduct);

module.exports = router;