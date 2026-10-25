const { Server } = require("socket.io");

const io = new Server(3000, { cors: "http://localhost:5173" });

let onlineUsers = [];

io.on("connection", (socket) => {
    // console.log("The Connected Sockets are: ", Object.keys(io.sockets.sockets));
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId != socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });

    // add Message
    socket.on("addMessage", (message) => {

        const user = onlineUsers.find(t1 => t1.userId === message.recipientId);

        if (user) {
            io.to(user.socketId).emit("getMessage", message);

            console.log("--------------------------------------------------------");
            console.log("The sender ID is: ", message.sender?._id);
            console.log("--------------------------------------------------------");

            io.to(user.socketId).emit("getNotification", {
                senderId: message.sender?._id,
                isRead: false,
                date: new Date(),
            });

            // io.emit("generalMessage", message);
        } else {
            console.log("--------------------------------------------------------");
            console.log("The User is Not Online");
            console.log("--------------------------------------------------------");
        }
    });

    socket.on("addNewUser", (userId) => {  
        // TODO: We should handle the case when the user has multiple devices.          
        onlineUsers.push({
            userId,
            socketId: socket.id,
        });

        io.emit("getOnlineUsers", onlineUsers);
    });
});

// app.get('/get-all-sockets', (req, res) => {
//     return res.json({
//         sockets: io.sockets.sockets.keys(),
//     });
// });

// app.listen(5001, (req, res)=>{
//     console.log(`Server Running ON PORT: 5001`);
// });

/// !The Wrong Way
// io.on("disconnect", (args)=>{
//     console.log("Socket Has Been Disconnected");
//     console.log("The Arguments Are: ", args);
// })

// console.log("Listen ON Port: 3000");