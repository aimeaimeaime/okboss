


(function(){
    const app = document.querySelector(".app");
    const socket = io();
    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        if(username.length == 0){
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");

        // Add delete messages button
        let deleteBtn = document.createElement("button");
        deleteBtn.id = "delete-messages";
        deleteBtn.innerText = "Delete My Messages";
        app.querySelector(".header").appendChild(deleteBtn);

        deleteBtn.addEventListener("click", function(){
            socket.emit("deleteMessages", uname);
        });
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        let message = app.querySelector(".chat-screen #message-input").value;
        if(message.length == 0){
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update){
        renderMessage("update", update);
    });

    socket.on("chat", function(message){
        if (message.username !== uname) { // Ignore messages sent by this user
            renderMessage("other", message);
        }
    });

    socket.on("loadMessages", function(messages){
        for(let message of messages){
            renderMessage("other", message);
        }
    });

    socket.on("clearMessages", function() {
        app.querySelector(".chat-screen .messages").innerHTML = "";
    });

    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");
        el.classList.add("message");

        if(type === "my"){
            el.classList.add("my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if(type === "other"){
            el.classList.add("other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if(type === "update"){
            el.classList.add("update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
