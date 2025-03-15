const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const sequelize = require("./utils/database.js"); // Import Sequelize connection
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { WebSocketServer, WebSocket } = require("ws"); // Import WebSocket
const chatController = require("./Controllers/chatController"); // Import chat controller

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET; // Secret key for JWT

const app = express();

// ✅ Secure CORS setup (Frontend at 3000, Backend at 5000)
const corsOptions = {
    origin: ["http://localhost:3000", "https://your-production-domain.com"], // Allow frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public")); // Serve frontend files

// ✅ Define Routes
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Start Express Server
const server = app.listen(5000, () => {
    console.log(`🚀 Server running on port 5000`);
});

// ✅ Initialize WebSocket Server
const wss = new WebSocketServer({ server });
let onlineUsers = []; // Store active users

/// ✅ WebSocket Connection Handling
wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const token = urlParams.get("token");

    if (!token) {
        console.log("❌ No token provided, closing connection.");
        ws.close();
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        ws.userId = Number(decoded.id); // Ensure it's a number
        ws.username = decoded.username; // Store username in ws object

        if (!onlineUsers.includes(ws.username)) {
            onlineUsers.push(ws.username);
        }
        console.log(`✅ User connected: ${ws.username}`);

        // ✅ Update user list
        broadcast({ type: "userList", users: onlineUsers });

        // ✅ Handle incoming messages
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
        
                if (data.type === "message") {
                    console.log(`📩 Message from ${ws.username}: ${data.text}`);
                    
                    // Log userId before saving the message
                    console.log("🧐 Debug: userId before saveMessage:", ws.userId);
        
                    // Call saveMessage and log the call
                    console.log("🧐 Debug: Calling saveMessage with userId:", ws.userId);
                    const savedMessage = await chatController.saveMessage(ws.userId, data.text);
                    
                    if (savedMessage) {
                        // ✅ Broadcast message to all clients
                        const chatMessage = {
                            type: "message",
                            username: ws.username,
                            text: data.text
                        };
        
                        broadcast(chatMessage);
                    } else {
                        console.error("❌ Failed to save message to the database.");
                    }
                }
            } catch (error) {
                console.error("⚠️ Error processing message:", error);
            }
        });
        
        ws.on("close", () => {
            console.log(`🔴 User disconnected: ${ws.username}`);
            onlineUsers = onlineUsers.filter(user => user !== ws.username);
            broadcast({ type: "userList", users: onlineUsers });
        });

    } catch (error) {
        console.log("❌ Invalid token, closing connection.");
        ws.close();
    }
});

// ✅ Function to Broadcast messages to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) { // ✅ Use WebSocket.OPEN constant
            client.send(JSON.stringify(data));
        }
    });
}

// ✅ Graceful Shutdown
process.on("SIGINT", () => {
    console.log("⚠️ Shutting down WebSocket server...");
    wss.close();
    process.exit();
});
