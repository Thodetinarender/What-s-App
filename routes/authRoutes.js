const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // ✅ JWT for authentication
const User = require("../models/user");

const router = express.Router();

const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

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

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required!" });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
});


module.exports = router;
