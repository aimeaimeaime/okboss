

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aime2004_Aime2004',
    database: 'chatroom'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

function insertMessage(username, message) {
    const sql = "INSERT INTO messages (user_id, message) VALUES ((SELECT id FROM users WHERE username = ?), ?)";
    connection.query(sql, [username, message], (err, result) => {
        if (err) throw err;
        console.log("Message inserted:", result);
    });
}

function deleteMessagesByUsername(username, callback) {
    const sql = "DELETE FROM messages WHERE user_id = (SELECT id FROM users WHERE username = ?)";
    connection.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Error deleting messages:", err);
            return callback(err);
        }
        console.log("Messages deleted for user:", username);
        callback(null, result);
    });
}

function getMessages(callback) {
    const sql = `
        SELECT messages.id, users.username, messages.message 
        FROM messages 
        JOIN users ON messages.user_id = users.id
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return callback(err);
        }
        callback(null, results);
    });
}

function createUser(username, callback) {
    const sql = "INSERT INTO users (username) VALUES (?) ON DUPLICATE KEY UPDATE username = username";
    connection.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Error creating user:", err);
            return callback(err);
        }
        callback(null, result);
    });
}

module.exports = { connection, insertMessage, deleteMessagesByUsername, getMessages, createUser };
