const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Хранение сообщений
const messages = [];
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Отправить историю новому клиенту
    ws.send(JSON.stringify({ type: 'history', data: messages }));
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'message') {
            const msg = {
                id: Date.now(),
                username: data.username || 'Аноним',
                text: data.text,
                time: new Date().toLocaleTimeString()
            };
            messages.push(msg);
            // Отправить всем клиентам
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', data: msg }));
                }
            });
        }
    });
    
    ws.on('close', () => {
        clients.delete(ws);
    });
});

server.listen(3000, () => console.log('Чат на http://localhost:3000'));