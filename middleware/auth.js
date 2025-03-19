const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid token. User not found." });
        }

        req.user = user; // Attach user to the request
        next(); // Continue to the next middleware
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token." });
    }
};










// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// exports.authenticate = (req, res, next) => {
//     try {
//         const token = req.header("Authorization");
//         const user = jwt.verify(token, process.env.JWT_SECRET);
//         User.findByPk(user.userId).then((user) => {
//             req.user = user;
//             next();
//         });
//     } catch (error) {
//         return res.status(401).json({ success: false });
//     }
// };
