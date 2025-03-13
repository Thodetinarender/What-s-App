const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// ✅ Signup Controller
const signup = async (req, res) => {
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
        await User.create({ name, email, phone, password: hashedPassword });

        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
};

// ✅ Login Controller
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required!" });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found!" }); // 🔹 404 if user doesn't exist
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password!" }); // 🔹 401 for wrong password
        }

        // Generate JWT Token (encrypting user ID)
        const token = jwt.sign({ id: user.id, username: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
        //res.status(200).json({ message: "Login successful!", token });
        // ✅ Send username in the response
        res.status(200).json({
            success: true,
            token,
            username: user.name, // ✅ This will fix the issue
});
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
};

// Export the controllers
module.exports = { signup, login };
