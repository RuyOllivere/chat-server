const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('user info', ({ nickname, color }) => {
    connectedUsers.set(socket.id, { nickname, color });
    io.emit('users update', Array.from(connectedUsers.values()));
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    connectedUsers.delete(socket.id);
    io.emit('users update', Array.from(connectedUsers.values()));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
