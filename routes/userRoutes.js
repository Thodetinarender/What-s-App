const express = require("express");
const userController = require("../Controllers/userController"); // Import controllers

const router = express.Router();

// Define routes and link to controllers
router.post("/signup", userController.signup);
router.post("/login", userController.login);

module.exports = router;
