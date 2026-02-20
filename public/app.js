const socket = io();

let myUsername = '';

// ── Join screen ────────────────────────────────────
const joinScreen  = document.getElementById('join-screen');
const chatScreen  = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn     = document.getElementById('join-btn');

function joinChat() {
  const name = usernameInput.value.trim();
  if (!name) return;
  myUsername = name;
  socket.emit('join', name);
  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') joinChat(); });

// ── Chat screen ────────────────────────────────────
const messagesEl  = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn     = document.getElementById('send-btn');
const userCountEl = document.getElementById('user-count');

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('message', text);
  messageInput.value = '';
  messageInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

// ── Socket events ──────────────────────────────────
socket.on('message', ({ username, text, time }) => {
  const isOwn = username === myUsername;
  const div = document.createElement('div');
  div.className = `message ${isOwn ? 'own' : 'other'}`;
  div.innerHTML = `
    ${!isOwn ? `<div class="sender">${escapeHtml(username)}</div>` : ''}
    <div class="text">${escapeHtml(text)}</div>
    <div class="time">${escapeHtml(time)}</div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on('system', (msg) => {
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.textContent = msg;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on('userCount', (count) => {
  userCountEl.textContent = `${count} online`;
});

// ── Helpers ────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
