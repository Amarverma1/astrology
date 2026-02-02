const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/admin");
const app = express();
app.use(cors());
app.use(express.json());




app.use("/api/auth", authRoutes);


app.use("/api/admin", adminRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
