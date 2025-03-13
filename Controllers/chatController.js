const Chat = require("../models/chat");
const User = require("../models/user");

// ✅ Save Chat Message (updated to work with WebSockets)
exports.saveMessage = async (userId, message) => {
    try {
        // Ensure userId is valid
        const user = await User.findByPk(userId);
        if (!user) {
            console.error("❌ User not found in saveMessage()");
            return null;
        }

        // Save message to DB
        const chat = await Chat.create({ userId: user.id, message });

        console.log("✅ Message saved:", chat.message);
        return chat;
    } catch (error) {
        console.error("❌ Error saving message:", error);
        return null;
    }
};

// ✅ Get Chat History
exports.getChatHistory = async (req, res) => {
    try {
        const chats = await Chat.findAll({
            include: { model: User, attributes: ["name"] },
            order: [["createdAt", "ASC"]], // Oldest messages first
        });

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
