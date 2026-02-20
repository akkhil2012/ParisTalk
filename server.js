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
    if (typeof username !== 'string') return;
    const name = username.trim().slice(0, 24);
    if (!name) return;
    users[socket.id] = name;
    socket.broadcast.emit('system', `${name} joined the chat`);
    io.emit('userCount', Object.keys(users).length);
  });

  socket.on('message', (msg) => {
    if (typeof msg !== 'string') return;
    const text = msg.trim().slice(0, 500);
    if (!text) return;
    const username = users[socket.id] || 'Anonymous';
    io.emit('message', { username, text, time: new Date().toLocaleTimeString() });
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
