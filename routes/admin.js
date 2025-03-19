const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();

router.post("/signup", adminController.signUp);
router.post("/login", adminController.logIn);

module.exports = router;
