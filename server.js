const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('system', `${username} joined the chat`);
    io.emit('userCount', Object.keys(users).length);
  });

  socket.on('message', (msg) => {
    const username = users[socket.id] || 'Anonymous';
    io.emit('message', { username, text: msg, time: new Date().toLocaleTimeString() });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('system', `${username} left the chat`);
      io.emit('userCount', Object.keys(users).length);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`ParisTalk server running on port ${PORT}`);
});

module.exports = { app, server };
