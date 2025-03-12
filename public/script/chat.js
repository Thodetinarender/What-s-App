const socket = new WebSocket("ws://localhost:5000"); // ✅ WebSocket connection

const username = localStorage.getItem("username"); // Get username from localStorage

document.getElementById("currentUser").innerText = `You are logged in as: ${username}`;

// ✅ Send user details to the server after connecting
socket.onopen = () => {
    socket.send(JSON.stringify({ type: "newUser", username }));
};

// ✅ Receive messages from server
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "userList") {
        updateUserList(data.users);
    } else if (data.type === "message") {
        displayMessage(data.username, data.text);
    }
};

// ✅ Update online user list
function updateUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; // Clear previous list
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });
}

// ✅ Display chat messages
function displayMessage(sender, message) {
    const chatWindow = document.getElementById("messages");
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatWindow.appendChild(msgDiv);
}

// ✅ Send chat message
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    
    if (message) {
        socket.send(JSON.stringify({ type: "message", username, text: message }));
        messageInput.value = "";
    }
}
