const token = localStorage.getItem("token");
const socket = new WebSocket(`ws://localhost:5000?token=${token}`);

function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id;
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return null;
    }
}

const userId = getUserIdFromToken(token);

if (!userId) {
    alert("⚠️ User ID not found! Please log in again.");
    window.location.href = "/login";
}

let username = localStorage.getItem("username");

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

socket.onopen = () => {
    console.log("✅ Connected to WebSocket!");
    socket.send(JSON.stringify({ type: "newUser", username }));
};

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
            displayMessage(data.username, data.text);
        } else if (data.type === "groupMessage") {
            displayGroupMessage(data.username, data.text, data.groupId);
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

async function sendGroupMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const groupId = document.getElementById("selectedGroupId").value;

    if (!message) {
        alert("❌ Please enter a message!");
        return;
    }

    if (!groupId) {
        alert("❌ Please select a group!");
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "groupMessage", userId, username, text: message, groupId }));

        messageInput.value = "";
        try {
            const response = await fetch("http://localhost:5000/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, message, groupId }),
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

async function createGroup() {
    const groupName = document.getElementById("groupNameInput").value.trim();

    if (!groupName) {
        alert("❌ Please enter a group name!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/group/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: groupName }),
        });

        const data = await response.json();
        if (data.success) {
            alert("✅ Group created successfully!");
            loadGroups(); // Load the updated group list
        } else {
            throw new Error(data.error || "Error creating group");
        }
    } catch (error) {
        console.error("❌ Error creating group:", error);
        alert("⚠️ Failed to create group. Please try again.");
    }
}

async function addMember() {
    const userId = document.getElementById("memberIdInput").value.trim();
    const groupId = document.getElementById("selectedGroupId").value;

    if (!userId) {
        alert("❌ Please enter User ID!");
        return;
    }

    if (!groupId) {
        alert("❌ Please select a group!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/group/check-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId }),
        });

        const userData = await response.json();
        if (!userData.success) {
            alert("❌ User not found!");
            return;
        }

        const addMemberResponse = await fetch("http://localhost:5000/api/group/add-member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ groupId, userId }),
        });

        const data = await addMemberResponse.json();
        if (data.success) {
            alert("✅ Member added successfully!");
            // Optionally update the group member list
        } else {
            throw new Error(data.error || "Error adding member");
        }
    } catch (error) {
        console.error("❌ Error adding member:", error);
        alert("⚠️ Failed to add member. Please try again.");
    }
}

async function loadGroups() {
    try {
        const response = await fetch("http://localhost:5000/api/group/list", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const groupList = document.getElementById("groupList");
            groupList.innerHTML = "";
            data.groups.forEach(group => {
                const li = document.createElement("li");
                li.classList.add("group-item", "list-group-item");
                li.dataset.groupId = group.id;

                // Create Profile Circle
                const profileCircle = document.createElement("div");
                profileCircle.classList.add("profile-circle");
                profileCircle.textContent = group.name.charAt(0).toUpperCase();

                // Create Group Name
                const groupName = document.createElement("span");
                groupName.textContent = ` ${group.name}`;

                // Chat Preview Box
                const chatPreview = document.createElement("div");
                chatPreview.classList.add("chat-preview");
                chatPreview.id = `preview-${group.id}`;
                chatPreview.innerText = "Loading messages...";

                li.appendChild(profileCircle);
                li.appendChild(groupName);
                li.appendChild(chatPreview);

                li.addEventListener("click", () => selectGroup(group.id));
                li.addEventListener("mouseenter", () => loadGroupMessages(group.id));
                li.addEventListener("mouseleave", () => {
                    chatPreview.style.display = "none";
                });

                groupList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("❌ Error loading groups:", error);
    }
}


async function selectGroup(groupId) {
    document.getElementById("selectedGroupId").value = groupId;

    const addMemberSection = document.getElementById("addMemberSection");
    if (addMemberSection) { // ✅ Ensure addMemberSection exists
        addMemberSection.style.display = "block";
    } else {
        console.warn("⚠️ Warning: Element with ID 'addMemberSection' not found.");
    }

    const groupTitle = document.getElementById("groupTitle");
    if (groupTitle) { // ✅ Ensure groupTitle exists
        groupTitle.innerText = `Group Chat: ${groupId}`;
    } else {
        console.warn("⚠️ Warning: Element with ID 'groupTitle' not found.");
    }

    await loadGroupMessages(groupId);
}



async function loadGroupMessages(groupId) {
    try {
        const response = await fetch(`http://localhost:5000/api/group/${groupId}/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || "Error loading group messages");
        }

        // ✅ Update chat preview
        const chatPreview = document.getElementById(`preview-${groupId}`);
        const chatWindow = document.getElementById("messages");

        if (!chatPreview || !chatWindow) {
            console.warn("⚠️ Warning: chatPreview or chatWindow not found.");
            return;
        }

        chatPreview.innerHTML = "";
        chatWindow.innerHTML = ""; // Clear chat window

        const latestMessages = data.groupChats.slice(-10); // ✅ Get last 3 messages only

        latestMessages.forEach(chat => {
            const senderName = chat.User && chat.User.name ? chat.User.name : "Unknown User"; 

            // ✅ Update chat preview
            const msgDivPreview = document.createElement("div");
            msgDivPreview.textContent = `${senderName}: ${chat.message}`;
            chatPreview.appendChild(msgDivPreview);

            // ✅ Update chat window
            displayMessage(senderName, chat.message);
        });

        chatPreview.style.display = "block"; // Show chat preview
    } catch (error) {
        console.error("❌ Error loading group chat:", error);
        alert("❌ Error loading chat messages. Please try again.");
    }
}




// async function loadGroupMessages(groupId) {
//     try {
//         const response = await fetch(`http://localhost:5000/api/group/${groupId}/messages`, {
//             headers: { "Authorization": `Bearer ${token}` }
//         });

//         if (!response.ok) {
//             throw new Error(`Server returned ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.success) {
//             const chatWindow = document.getElementById("messages");
//             chatWindow.innerHTML = ""; // Clear previous messages

//             data.groupChats.forEach(chat => {
//                 if (chat.User && chat.User.name) {
//                     displayMessage(chat.User.name, chat.message);
//                 } else {
//                     console.warn("⚠️ Warning: chat.User is undefined.");
//                     displayMessage("Unknown User", chat.message); // ✅ Prevent crashes
//                 }
//             });
//         } else {
//             throw new Error(data.error || "Error loading group messages");
//         }
//     } catch (error) {
//         console.error("❌ Error loading group messages:", error);
//         alert("❌ Error loading group messages. Please try again.");
//     }
// }



function displayMessage(sender, message) {
    const chatWindow = document.getElementById("messages");

    const chatContainer = document.createElement("div");
    chatContainer.classList.add("chat-message");

    const isSender = sender === username;
    chatContainer.classList.add(isSender ? "sent" : "received");

    const profileCircle = document.createElement("div");
    profileCircle.classList.add("profile-circle");
    profileCircle.textContent = sender.charAt(0).toUpperCase();

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message-bubble");
    msgDiv.textContent = message;

    if (isSender) {
        chatContainer.appendChild(msgDiv);
        chatContainer.appendChild(profileCircle);
    } else {
        chatContainer.appendChild(profileCircle);
        chatContainer.appendChild(msgDiv);
    }

    chatWindow.appendChild(chatContainer);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function displayGroupMessage(sender, message, groupId) {
    const chatWindow = document.getElementById("messages");
    const selectedGroupId = document.getElementById("selectedGroupId").value;

    if (groupId === selectedGroupId) {
        displayMessage(sender, message);
    }
}

function updateUserList(users) {
    const userList = document.getElementById("userList");
    if (!userList) {
        console.error("Element with ID 'userList' not found.");
        return;
    }
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });
}

window.onload = () => {
    loadGroups();
};

















// const token = localStorage.getItem("token"); // Get token from local storage
// const socket = new WebSocket(`ws://localhost:5000?token=${token}`); // Send token in the URL


// // ✅ Decode JWT to extract userId
// function getUserIdFromToken(token) {
//     try {
//         const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
//         return payload.id; // Extract user ID
//     } catch (error) {
//         console.error("❌ Error decoding token:", error);
//         return null;
//     }
// }

// const userId = getUserIdFromToken(token); // Get userId from token

// if (!userId) {
//     alert("⚠️ User ID not found! Please log in again.");
//     window.location.href = "/login";
// }

// let username = localStorage.getItem("username");

// // If no username, prompt the user to enter one
// if (!username) {
//     username = prompt("Enter your username:");
//     if (username) {
//         localStorage.setItem("username", username);
//     } else {
//         alert("You must enter a username!");
//         window.location.reload();
//     }
// }

// document.getElementById("currentUser").innerText = `You are logged in as: ${username}`;

// // ✅ Ensure WebSocket is open before sending data
// socket.onopen = () => {
//     console.log("✅ Connected to WebSocket!");
//     socket.send(JSON.stringify({ type: "newUser", username }));
// };

// socket.onmessage = (event) => {
//     try {
//         const data = JSON.parse(event.data);
//         if (data.type === "message") {
//             // ✅ Immediately display new messages without refresh
//             displayMessage(data.username, data.text);
//         } else if (data.type === "userList") {
//             updateUserList(data.users);
//         }
//     } catch (error) {
//         console.error("❌ Error parsing message:", error);
//     }
// };

// socket.onerror = (error) => {
//     console.error("❌ WebSocket error:", error);
// };

// socket.onclose = () => {
//     console.warn("⚠️ WebSocket connection closed.");
// };

// // ✅ Function to Send Messages
// async function sendMessage() {
//     const messageInput = document.getElementById("messageInput");
//     const message = messageInput.value.trim();

//     if (!message) {
//         alert("❌ Please enter a message!");
//         return;
//     }

//     if (socket.readyState === WebSocket.OPEN) {
//         socket.send(JSON.stringify({ type: "message", userId, username, text: message }));

//         messageInput.value = "";
//         // Store message in database via API
//         try {
//             const response = await fetch("http://localhost:5000/api/chat/send", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ username, message }),
//             });

//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error("Error saving chat message");
//             }
//         } catch (error) {
//             console.error("❌ Error saving chat message:", error);
//             alert("⚠️ Failed to send message. Please try again.");
//         }
//     } else {
//         console.warn("⚠️ WebSocket not connected");
//         alert("⚠️ Unable to send message. Please check your connection.");
//     }
// }


// async function loadChatHistory() {
//     try {
//         let chatWindow = document.getElementById("messages");
//         chatWindow.innerHTML = ""; // Clear chat window

//         // ✅ Load messages from local storage first
//         let storedChats = JSON.parse(localStorage.getItem("chatMessages")) || [];
//         storedChats.forEach(chat => displayMessage(chat.sender, chat.message));

//         // ✅ Get the latest stored message timestamp (if exists)
//         let lastMessageTime = storedChats.length > 0 ? storedChats[storedChats.length - 1].timestamp : null;

//         // ✅ Fetch only new messages from backend
//         let url = "http://localhost:5000/api/chat/history";
//         if (lastMessageTime) {
//             url += `?after=${encodeURIComponent(lastMessageTime)}`;
//         }

//         const response = await fetch(url, {
//             headers: { "Authorization": `Bearer ${token}` }
//         });

//         const data = await response.json();

//         if (!data.success || !Array.isArray(data.chats)) {
//             throw new Error("Invalid chat history response");
//         }

//         // ✅ Display new messages & update local storage
//         data.chats.forEach(chat => {
//             displayMessage(chat.user.name, chat.message);
//             storeMessageLocally(chat.user.name, chat.message, chat.createdAt);
//         });

//     } catch (error) {
//         console.error("❌ Error loading chat history:", error);
//     }
// }

// // // ✅ Call API every 1 second to fetch new messages
// // setInterval(() => {
// //     loadChatHistory();
// // }, 1000); // ✅ Polling every 1 second


// function storeMessageLocally(sender, message, timestamp) {
//     let storedChats = JSON.parse(localStorage.getItem("chatMessages")) || [];

//     // ✅ Keep only the last 10 messages
//     if (storedChats.length >= 10) {
//         storedChats.shift(); // Remove oldest message
//     }

//     storedChats.push({ sender, message, timestamp });

//     localStorage.setItem("chatMessages", JSON.stringify(storedChats));
// }



// function displayMessage(sender, message) {
//     const chatWindow = document.getElementById("messages");

//     // ✅ Create a chat container (right for sender, left for receiver)
//     const chatContainer = document.createElement("div");
//     chatContainer.classList.add("chat-message");

//     // ✅ Check if the message is from the logged-in user (align right)
//     const isSender = sender === username;
//     chatContainer.classList.add(isSender ? "sent" : "received");

//     // ✅ Profile circle with first letter of sender
//     const profileCircle = document.createElement("div");
//     profileCircle.classList.add("profile-circle");
//     profileCircle.textContent = sender.charAt(0).toUpperCase(); // First letter

//     // ✅ Message bubble
//     const msgDiv = document.createElement("div");
//     msgDiv.classList.add("message-bubble");
//     msgDiv.textContent = message;

//     // ✅ Append elements (left for received, right for sent)
//     if (isSender) {
//         chatContainer.appendChild(msgDiv);
//         chatContainer.appendChild(profileCircle);
//     } else {
//         chatContainer.appendChild(profileCircle);
//         chatContainer.appendChild(msgDiv);
//     }

//     chatWindow.appendChild(chatContainer);

//     // ✅ Scroll chat to latest message
//     chatWindow.scrollTop = chatWindow.scrollHeight;
// }


// // ✅ Function to Update User List
// function updateUserList(users) {
//     const userList = document.getElementById("userList");
//     userList.innerHTML = "";
//     users.forEach(user => {
//         const li = document.createElement("li");
//         li.textContent = user;
//         userList.appendChild(li);
//     });
// }

// // ✅ Ensure chat history loads on page load
// window.onload = () => {
//     loadChatHistory();
// };
