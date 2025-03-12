const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./utils/database.js"); // Import Sequelize connection
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();

// ✅ Secure CORS setup (Frontend at 3000, Backend at 5000)
const corsOptions = {
    origin: ["http://localhost:3000", "https://your-production-domain.com"], // Allow frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static("public")); // Serve frontend files

// Routes
app.use("/api/auth", userRoutes);

// Start Server after DB sync
sequelize.sync()
    .then(() => {
        const PORT = process.env.PORT || 5000; // ✅ Your backend runs on 5000
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error("DB Sync Error:", err));
