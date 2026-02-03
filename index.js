const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/admin");
const app = express();
app.use(cors());
app.use(express.json());
const serviceRoutes = require("./routes/service");
const usersRoutes = require("./routes/users");







app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", usersRoutes);
app.use("/uploads", express.static("uploads"));


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
