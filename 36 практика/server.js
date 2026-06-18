const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const users = new Map();
const messages = [];

wss.on('connection', (ws) => {
  let username = 'Аноним';

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    if (msg.type === 'join') {
      username = msg.username || 'Аноним';
      users.set(ws, username);
      broadcast({ type: 'system', text: `✅ ${username} вошёл в чат` });
      broadcast({ type: 'history', data: messages });
    }
    
    if (msg.type === 'message') {
      const message = { 
        username, 
        text: msg.text, 
        time: new Date().toLocaleTimeString() 
      };
      messages.push(message);
      broadcast({ type: 'message', data: message });
    }
  });

  ws.on('close', () => {
    if (users.has(ws)) {
      broadcast({ type: 'system', text: `❌ ${users.get(ws)} покинул чат` });
      users.delete(ws);
    }
  });
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(3000, () => console.log('🚀 http://localhost:3000'));