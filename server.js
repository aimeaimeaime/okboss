




const express = require("express");
const path = require("path");
const { connection, insertMessage, deleteMessagesByUsername, getMessages, createUser } = require("./db");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
    socket.on("newuser", function(username) {
        createUser(username, (err) => {
            if (err) {
                console.error("Error creating user:", err);
                return;
            }
            getMessages((err, results) => {
                if (err) {
                    console.error("Error fetching messages:", err);
                    return;
                }
                socket.emit("loadMessages", results);
            });
            socket.broadcast.emit("update", username + " joined the conversation");
        });
    });

    socket.on("exituser", function(username) {
        socket.broadcast.emit("update", username + " left the conversation");
    });

    socket.on("chat", function(message) {
        insertMessage(message.username, message.text);
        socket.broadcast.emit("chat", message); // Broadcast to all other users
    });

    socket.on("deleteMessages", function(username) {
        deleteMessagesByUsername(username, (err, result) => {
            if (err) {
                console.error("Error deleting messages:", err);
                socket.emit("update", "Failed to delete messages");
            } else {
                console.log("All messages deleted for user:", username);
                socket.emit("update", "All your messages have been deleted");
                socket.emit("clearMessages");
            }
        });
    });
});

server.listen(5000, () => {
    console.log("Server is running on port 5000");
});
