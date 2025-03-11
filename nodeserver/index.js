const io = require("socket.io")(8000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
console.log("server is running on port 8000");

const users = {};

io.on('connection', socket => {
    // Handle new user joining
    socket.on('new-user-joined', userName => {
        console.log("New user:", userName);
        users[socket.id] = userName;
        socket.broadcast.emit('user-joined', userName);
    });

    //typing status dikhega
    socket.on('typing', () => {
        const userName = users[socket.id];
        if (userName) {
            socket.broadcast.emit('user-typing', userName);
        }
    });
    
    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stopped-typing');
    });
//receive file
socket.on('send-file', ({ fileName, fileContent }) => {
    socket.broadcast.emit('receive-file', { fileName, fileContent });
  });
  

    // Handle message sending
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, userName: users[socket.id] });
    });
    
    const users = {};

  
    // Handle user disconnecting
    socket.on('disconnect', () => {
        const userName = users[socket.id]; // Save user name before deleting
        if (userName) {
            socket.broadcast.emit('user-left', userName);
            delete users[socket.id]; // Delete user after emitting event
        }
    });
    
});
