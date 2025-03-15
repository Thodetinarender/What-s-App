const token = localStorage.getItem("token"); // Get token from local storage
const socket = new WebSocket(`ws://localhost:5000?token=${token}`); // Send token in the URL


// ✅ Decode JWT to extract userId
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        return payload.id; // Extract user ID
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return null;
    }
}

const userId = getUserIdFromToken(token); // Get userId from token

if (!userId) {
    alert("⚠️ User ID not found! Please log in again.");
    window.location.href = "/login";
}

let username = localStorage.getItem("username");

// If no username, prompt the user to enter one
if (!username) {
    username = prompt("Enter your username:");
    if (username) {
        localStorage.setItem("username", username);
    } else {
        alert("You must enter a username!");
        window.location.reload();
    }
}

document.getElementById("currentUser").innerText = `You are logged in as: ${username}`;

// ✅ Ensure WebSocket is open before sending data
socket.onopen = () => {
    console.log("✅ Connected to WebSocket!");
    socket.send(JSON.stringify({ type: "newUser", username }));
};

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
            // ✅ Immediately display new messages without refresh
            displayMessage(data.username, data.text);
        } else if (data.type === "userList") {
            updateUserList(data.users);
        }
    } catch (error) {
        console.error("❌ Error parsing message:", error);
    }
};

socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
};

socket.onclose = () => {
    console.warn("⚠️ WebSocket connection closed.");
};

// ✅ Function to Send Messages
async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) {
        alert("❌ Please enter a message!");
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "message", userId, username, text: message }));

        messageInput.value = "";
        // Store message in database via API
        try {
            const response = await fetch("http://localhost:5000/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, message }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error("Error saving chat message");
            }
        } catch (error) {
            console.error("❌ Error saving chat message:", error);
            alert("⚠️ Failed to send message. Please try again.");
        }
    } else {
        console.warn("⚠️ WebSocket not connected");
        alert("⚠️ Unable to send message. Please check your connection.");
    }
}


async function loadChatHistory() {
    try {
        let chatWindow = document.getElementById("messages");
        chatWindow.innerHTML = ""; // Clear chat window

        // ✅ Load messages from local storage first
        let storedChats = JSON.parse(localStorage.getItem("chatMessages")) || [];
        storedChats.forEach(chat => displayMessage(chat.sender, chat.message));

        // ✅ Get the latest stored message timestamp (if exists)
        let lastMessageTime = storedChats.length > 0 ? storedChats[storedChats.length - 1].timestamp : null;

        // ✅ Fetch only new messages from backend
        let url = "http://localhost:5000/api/chat/history";
        if (lastMessageTime) {
            url += `?after=${encodeURIComponent(lastMessageTime)}`;
        }

        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!data.success || !Array.isArray(data.chats)) {
            throw new Error("Invalid chat history response");
        }

        // ✅ Display new messages & update local storage
        data.chats.forEach(chat => {
            displayMessage(chat.user.name, chat.message);
            storeMessageLocally(chat.user.name, chat.message, chat.createdAt);
        });

    } catch (error) {
        console.error("❌ Error loading chat history:", error);
    }
}

// // ✅ Call API every 1 second to fetch new messages
// setInterval(() => {
//     loadChatHistory();
// }, 1000); // ✅ Polling every 1 second


function storeMessageLocally(sender, message, timestamp) {
    let storedChats = JSON.parse(localStorage.getItem("chatMessages")) || [];

    // ✅ Keep only the last 10 messages
    if (storedChats.length >= 10) {
        storedChats.shift(); // Remove oldest message
    }

    storedChats.push({ sender, message, timestamp });

    localStorage.setItem("chatMessages", JSON.stringify(storedChats));
}



function displayMessage(sender, message) {
    const chatWindow = document.getElementById("messages");

    // ✅ Create a chat container (right for sender, left for receiver)
    const chatContainer = document.createElement("div");
    chatContainer.classList.add("chat-message");

    // ✅ Check if the message is from the logged-in user (align right)
    const isSender = sender === username;
    chatContainer.classList.add(isSender ? "sent" : "received");

    // ✅ Profile circle with first letter of sender
    const profileCircle = document.createElement("div");
    profileCircle.classList.add("profile-circle");
    profileCircle.textContent = sender.charAt(0).toUpperCase(); // First letter

    // ✅ Message bubble
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message-bubble");
    msgDiv.textContent = message;

    // ✅ Append elements (left for received, right for sent)
    if (isSender) {
        chatContainer.appendChild(msgDiv);
        chatContainer.appendChild(profileCircle);
    } else {
        chatContainer.appendChild(profileCircle);
        chatContainer.appendChild(msgDiv);
    }

    chatWindow.appendChild(chatContainer);

    // ✅ Scroll chat to latest message
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// ✅ Function to Update User List
function updateUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });
}

// ✅ Ensure chat history loads on page load
window.onload = () => {
    loadChatHistory();
};
