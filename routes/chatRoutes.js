const express = require("express");
const chatController = require("../Controllers/chatController");

const router = express.Router();


// ✅ Route to Send Messages
router.post("/send", chatController.saveMessage);
// ✅ Route to fetch chat history
router.get("/history", chatController.getChatHistory);


module.exports = router;
