const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure folder exists
const dir = "assets/products";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/products"); // ✅ only products go here
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const uploadProduct = multer({ storage });

module.exports = uploadProduct;