const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./utils/database.js"); // Import Sequelize connection
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve frontend files

// Routes
app.use("/api/auth", authRoutes);

// Start Server after DB sync
sequelize.sync().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error("DB Sync Error:", err));
