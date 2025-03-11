const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists, Please Login" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({ name, email, phone, password: hashedPassword });

        res.status(201).json({ message: "Signup successful!" }); // ✅ Don't send user data
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
});

module.exports = router;
