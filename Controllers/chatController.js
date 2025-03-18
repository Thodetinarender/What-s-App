const Chat = require("../models/chat");
const GroupChat = require("../models/groupChat");
const User = require("../models/user");
const { Op } = require("sequelize");

// ✅ Save Chat Message (updated to work with WebSockets)
exports.saveMessage = async (userId, message) => {
    try {
        console.log("🧐 Debug: Received userId in saveMessage:", userId);

        if (!userId || isNaN(Number(userId))) { 
            console.error("❌ Invalid userId in saveMessage()"); 
            return null; 
        }
        const user = await User.findByPk(Number(userId)); // ✅ Convert to number
        if (!user) {
            console.error("❌ User not found in saveMessage()");
            return null;
        }

        // Save message to DB
        const chat = await Chat.create({ userId: user.id, message });

        console.log("✅ Message saved:", chat.message, user.id);
        return chat;
    } catch (error) {
        console.error("❌ Error saving message:", error);
        return null;
    }
};

// ✅ Save Group Chat Message
exports.saveGroupMessage = async (userId, groupId, message) => {
    try {
        console.log("🧐 Debug: Received userId and groupId in saveGroupMessage:", userId, groupId);

        if (!userId || isNaN(Number(userId)) || !groupId || isNaN(Number(groupId))) { 
            console.error("❌ Invalid userId or groupId in saveGroupMessage()"); 
            return null; 
        }
        const user = await User.findByPk(Number(userId)); // ✅ Convert to number
        if (!user) {
            console.error("❌ User not found in saveGroupMessage()");
            return null;
        }

        // Save group message to DB
        const groupChat = await GroupChat.create({ userId: user.id, groupId: Number(groupId), message });

        console.log("✅ Group message saved:", groupChat.message, user.id, groupId);
        return groupChat;
    } catch (error) {
        console.error("❌ Error saving group message:", error);
        return null;
    }
};

// ✅ Get Chat History
exports.getChatHistory = async (req, res) => {
    try {
        const afterTimestamp = req.query.after;

        const whereCondition = afterTimestamp
            ? { createdAt: { [Op.gt]: new Date(afterTimestamp) } }
            : {};

        const chats = await Chat.findAll({
            where: whereCondition,
            include: { model: User, attributes: ["name"] },
            order: [["createdAt", "ASC"]],
        });

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Save Group Chat Message
exports.saveGroupMessage = async (userId, groupId, message) => {
    try {
        console.log("🧐 Debug: Received userId and groupId in saveGroupMessage:", userId, groupId);

        if (!userId || isNaN(Number(userId)) || !groupId || isNaN(Number(groupId))) { 
            console.error("❌ Invalid userId or groupId in saveGroupMessage()"); 
            return null; 
        }
        const user = await User.findByPk(Number(userId)); // ✅ Convert to number
        if (!user) {
            console.error("❌ User not found in saveGroupMessage()");
            return null;
        }

        // Save group message to DB
        const groupChat = await GroupChat.create({ userId: user.id, groupId: Number(groupId), message });

        console.log("✅ Group message saved:", groupChat.message, user.id, groupId);
        return groupChat;
    } catch (error) {
        console.error("❌ Error saving group message:", error);
        return null;
    }
};


exports.getGroupChatHistory = async (req, res) => {
    const { groupId } = req.params;
    try {
        const afterTimestamp = req.query.after;

        const whereCondition = {
            groupId: Number(groupId),
            ...(afterTimestamp && { createdAt: { [Op.gt]: new Date(afterTimestamp) } })
        };

        const groupChats = await GroupChat.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ["id", "name"] }], // ✅ Ensure User is included
            order: [["createdAt", "ASC"]],
        });

        res.status(200).json({ success: true, groupChats });
    } catch (error) {
        console.error("❌ Error fetching group chat history:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};














// const Chat = require("../models/chat");
// const User = require("../models/user");
// const { Op } = require("sequelize");


// // ✅ Save Chat Message (updated to work with WebSockets)
// exports.saveMessage = async (userId, message) => {
//     try {
//         console.log("🧐 Debug: Received userId in saveMessage:");

//         if (!userId || isNaN(Number(userId))) { 
//             console.error("❌ Invalid userId in saveMessage():",); 
//             return null; 
//         }
//         const user = await User.findByPk(Number(userId)); // ✅ Convert to number
//         if (!user) {
//             console.error("❌ User not found in saveMessage()");
//             return null;
//         }

//         // Save message to DB
//         const chat = await Chat.create({ userId: user.id, message });

//         console.log("✅ Message saved:", chat.message, user.id,);
//         return chat;
//     } catch (error) {
//         console.error("❌ Error saving message:", error);
//         return null;
//     }
// };


// exports.getChatHistory = async (req, res) => {
//     try {
//         const afterTimestamp = req.query.after;

//         const whereCondition = afterTimestamp
//             ? { createdAt: { [Op.gt]: new Date(afterTimestamp) } }
//             : {};

//         const chats = await Chat.findAll({
//             where: whereCondition,
//             include: { model: User, attributes: ["name"] },
//             order: [["createdAt", "ASC"]],
//         });

//         res.status(200).json({ success: true, chats });
//     } catch (error) {
//         console.error("❌ Error fetching chat history:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

