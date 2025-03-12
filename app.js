const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./utils/database.js"); // Import Sequelize connection
const userRoutes = require("./routes/userRoutes");
const { WebSocketServer } = require("ws"); // ✅ Import WebSocket

dotenv.config();
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

// Routes
app.use("/api/auth", userRoutes);

// ✅ Start Express Server
const server = app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});

// ✅ Initialize WebSocket Server
const wss = new WebSocketServer({ server });
let onlineUsers = []; // Store active users

// ✅ WebSocket Connection Handling
wss.on("connection", (ws) => {
    console.log("New WebSocket connection established!");

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "newUser") {
            if (!onlineUsers.includes(data.username)) {
                onlineUsers.push(data.username);
            }
            broadcast({ type: "userList", users: onlineUsers });
        } else if (data.type === "message") {
            broadcast({ type: "message", username: data.username, text: data.text });
        }
    });

    ws.on("close", () => {
        console.log("User disconnected");
        onlineUsers = onlineUsers.filter(user => user !== ws.username);
        broadcast({ type: "userList", users: onlineUsers });
    });
});

// ✅ Broadcast messages to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
}
