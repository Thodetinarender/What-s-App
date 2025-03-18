const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
require('./models');
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const { WebSocketServer, WebSocket } = require("ws");
const chatController = require("./Controllers/chatController");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("❌ JWT_SECRET is missing in .env");
    process.exit(1);
}

const app = express();

const corsOptions = {
    origin: ["http://localhost:3000", "https://your-production-domain.com"],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/group", groupRoutes);

const server = app.listen(5000, () => {
    console.log(`🚀 Server running on port 5000`);
});

// Initialize models and associations
const { sequelize, User, Group, GroupChat, GroupMember } = require('./models/index');

// Sync models
sequelize.sync().then(() => {
    console.log("Database synced!");
}).catch(err => {
    console.error("Error syncing database:", err);
});

const wss = new WebSocketServer({ server });
let onlineUsers = {};

wss.on("connection", (ws, req) => {
    const queryString = req.url ? req.url.split("?")[1] : null;
    const urlParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();
    const token = urlParams.get("token");

    if (!token) {
        console.log("❌ No token provided, closing connection.");
        ws.close();
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        ws.userId = Number(decoded.id);
        ws.username = decoded.username;

        onlineUsers[ws.username] = ws;
        console.log(`✅ User connected: ${ws.username}`);

        broadcast({ type: "userList", users: Object.keys(onlineUsers) });

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
                if (!ws.userId) return console.error("❌ Missing userId, ignoring message.");

                if (data.type === "message") {
                    console.log(`📩 Message from ${ws.username}: ${data.text}`);
                    const savedMessage = await chatController.saveMessage(ws.userId, data.text);
                    if (savedMessage) {
                        broadcast({
                            type: "message",
                            username: ws.username,
                            text: data.text
                        });
                    }
                } else if (data.type === "groupMessage") {
                    console.log(`📩 Group message from ${ws.username} in group ${data.groupId}: ${data.text}`);
                    const savedGroupMessage = await chatController.saveGroupMessage(ws.userId, data.groupId, data.text);
                    if (savedGroupMessage) {
                        broadcast({
                            type: "groupMessage",
                            username: ws.username,
                            text: data.text,
                            groupId: data.groupId
                        });
                    }
                }
            } catch (error) {
                console.error("⚠️ Error processing message:", error);
            }
        });

        ws.on("close", () => {
            setTimeout(() => {
                delete onlineUsers[ws.username];
                console.log(`🔴 User disconnected: ${ws.username}`);
                broadcast({ type: "userList", users: Object.keys(onlineUsers) });
            }, 5000);
        });

    } catch (error) {
        console.log("❌ Invalid token, closing connection.");
        ws.close();
    }
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

process.on("SIGINT", () => {
    console.log("⚠️ Shutting down WebSocket server...");
    wss.close();
    process.exit();
});





















// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const jwt = require("jsonwebtoken");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const groupRoutes = require("./routes/groupRoutes"); // Import group routes
// const { WebSocketServer, WebSocket } = require("ws");
// const chatController = require("./Controllers/chatController");

// dotenv.config();
// const SECRET_KEY = process.env.JWT_SECRET;
// if (!SECRET_KEY) {
//     console.error("❌ JWT_SECRET is missing in .env");
//     process.exit(1);
// }

// const app = express();

// const corsOptions = {
//     origin: ["http://localhost:3000", "https://your-production-domain.com"],
//     methods: "GET,POST,PUT,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.static("public"));

// app.use("/api/auth", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/group", groupRoutes); // Use group routes

// const server = app.listen(5000, () => {
//     console.log(`🚀 Server running on port 5000`);
// });

// const wss = new WebSocketServer({ server });
// let onlineUsers = {};

// wss.on("connection", (ws, req) => {
//     const queryString = req.url ? req.url.split("?")[1] : null;
//     const urlParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();
//     const token = urlParams.get("token");

//     if (!token) {
//         console.log("❌ No token provided, closing connection.");
//         ws.close();
//         return;
//     }

//     try {
//         const decoded = jwt.verify(token, SECRET_KEY);
//         ws.userId = Number(decoded.id);
//         ws.username = decoded.username;

//         onlineUsers[ws.username] = ws;
//         console.log(`✅ User connected: ${ws.username}`);

//         broadcast({ type: "userList", users: Object.keys(onlineUsers) });

//         ws.on("message", async (message) => {
//             try {
//                 const data = JSON.parse(message);
//                 if (!ws.userId) return console.error("❌ Missing userId, ignoring message.");

//                 if (data.type === "message") {
//                     console.log(`📩 Message from ${ws.username}: ${data.text}`);
//                     const savedMessage = await chatController.saveMessage(ws.userId, data.text);
//                     if (savedMessage) {
//                         broadcast({
//                             type: "message",
//                             username: ws.username,
//                             text: data.text
//                         });
//                     }
//                 } else if (data.type === "groupMessage") {
//                     console.log(`📩 Group message from ${ws.username} in group ${data.groupId}: ${data.text}`);
//                     // Save group message logic
//                     // Broadcast group message logic
//                 }
//             } catch (error) {
//                 console.error("⚠️ Error processing message:", error);
//             }
//         });

//         ws.on("close", () => {
//             setTimeout(() => {
//                 delete onlineUsers[ws.username];
//                 console.log(`🔴 User disconnected: ${ws.username}`);
//                 broadcast({ type: "userList", users: Object.keys(onlineUsers) });
//             }, 5000);
//         });

//     } catch (error) {
//         console.log("❌ Invalid token, closing connection.");
//         ws.close();
//     }
// });

// function broadcast(data) {
//     wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(data));
//         }
//     });
// }

// process.on("SIGINT", () => {
//     console.log("⚠️ Shutting down WebSocket server...");
//     wss.close();
//     process.exit();
// });















// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const jwt = require("jsonwebtoken");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const groupRoutes = require("./routes/groupRoutes");
// const { WebSocketServer, WebSocket } = require("ws"); // Import WebSocket
// const chatController = require("./Controllers/chatController"); // Import chat controller

// dotenv.config();
// const SECRET_KEY = process.env.JWT_SECRET;
// if (!SECRET_KEY) {
//     console.error("❌ JWT_SECRET is missing in .env");
//     process.exit(1);
// }

// const app = express();

// // ✅ Secure CORS setup
// const corsOptions = {
//     origin: ["http://localhost:3000", "https://your-production-domain.com"],
//     methods: "GET,POST,PUT,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.static("public"));

// // ✅ Define Routes
// app.use("/api/auth", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/group", groupRoutes);

// const server = app.listen(5000, () => {
//     console.log(`🚀 Server running on port 5000`);
// });

// // ✅ Initialize WebSocket Server
// const wss = new WebSocketServer({ server });
// let onlineUsers = {}; // Use an object instead of an array

// /// ✅ WebSocket Connection Handling
// wss.on("connection", (ws, req) => {
//     const queryString = req.url ? req.url.split("?")[1] : null;
//     const urlParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();
//     const token = urlParams.get("token");

//     if (!token) {
//         console.log("❌ No token provided, closing connection.");
//         ws.close();
//         return;
//     }

//     try {
//         const decoded = jwt.verify(token, SECRET_KEY);
//         ws.userId = Number(decoded.id);
//         ws.username = decoded.username;

//         onlineUsers[ws.username] = ws;
//         console.log(`✅ User connected: ${ws.username}`);

//         broadcast({ type: "userList", users: Object.keys(onlineUsers) });

//         ws.on("message", async (message) => {
//             try {
//                 const data = JSON.parse(message);
//                 if (!ws.userId) return console.error("❌ Missing userId, ignoring message.");

//                 if (data.type === "message") {
//                     console.log(`📩 Message from ${ws.username}: ${data.text}`);
//                     const savedMessage = await chatController.saveMessage(ws.userId, data.text);
//                     if (savedMessage) {
//                         broadcast({
//                             type: "message",
//                             username: ws.username,
//                             text: data.text
//                         });
//                     }
//                 }
//             } catch (error) {
//                 console.error("⚠️ Error processing message:", error);
//             }
//         });

//         ws.on("close", () => {
//             setTimeout(() => {
//                 delete onlineUsers[ws.username];
//                 console.log(`🔴 User disconnected: ${ws.username}`);
//                 broadcast({ type: "userList", users: Object.keys(onlineUsers) });
//             }, 5000);
//         });

//     } catch (error) {
//         console.log("❌ Invalid token, closing connection.");
//         ws.close();
//     }
// });

// // ✅ Function to Broadcast messages to all clients
// function broadcast(data) {
//     wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(data));
//         }
//     });
// }

// // ✅ Graceful Shutdown
// process.on("SIGINT", () => {
//     console.log("⚠️ Shutting down WebSocket server...");
//     wss.close();
//     process.exit();
// });
