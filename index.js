const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/admin");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
const serviceRoutes = require("./routes/service");
const usersRoutes = require("./routes/users");
const prokeralaRoutes = require("./routes/astrologyRoutes");
const astroRoutes = require("./routes/astroRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes.js"); 
const paymentRoutes = require("./routes/paymentRoutes");
const poojaRoutes = require("./routes/poojaRoutes");
const templeRoutes = require("./routes/templeRoutes");
















app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", usersRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/astrology", prokeralaRoutes);
app.use("/api/mangalam", astroRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/assets", express.static("assets"));
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payments", paymentRoutes); 
app.use("/api/pooja", poojaRoutes);
app.use("/api/temple", templeRoutes);



app.use("/api/admin", adminRoutes);
// Root / Health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Sri Mangalm API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime().toFixed(2) + "s"
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
