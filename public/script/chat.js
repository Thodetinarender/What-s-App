const token = localStorage.getItem("token"); // Get token from local storage
const socket = new WebSocket(`ws://localhost:5000?token=${token}`); // Send token in the URL

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

        if (data.type === "userList") {
            updateUserList(data.users);
        } else if (data.type === "message") {
            displayMessage(data.username, data.text);
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
        socket.send(JSON.stringify({ type: "message", username, text: message }));

        // ✅ Store message in database via API
        try {
            const response = await fetch("http://localhost:5000/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Send token in API requests
                },
                body: JSON.stringify({ username, message }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error("Error saving chat message");
            }
        } catch (error) {
            console.error("❌ Error saving chat message:", error);
        }

        messageInput.value = ""; // Clear input field after sending
    } else {
        console.warn("⚠️ WebSocket not connected");
    }
}

// ✅ Load Chat History from API
async function loadChatHistory() {
    try {
        const response = await fetch("http://localhost:5000/api/chat/history", {
            headers: { "Authorization": `Bearer ${token}` } // Send token in API requests
        });

        const data = await response.json();

        if (!data.success || !Array.isArray(data.chats)) {
            throw new Error("Invalid chat history response");
        }

        data.chats.forEach(chat => {
            displayMessage(chat.user.name, chat.message);
        });
    } catch (error) {
        console.error("❌ Error loading chat history:", error);
    }
}

// ✅ Function to Display Messages in Chat Window
function displayMessage(sender, message) {
    const chatWindow = document.getElementById("messages");
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatWindow.appendChild(msgDiv);
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
