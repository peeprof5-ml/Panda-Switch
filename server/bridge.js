const http = require('http');
const WebSocket = require('ws');

// Render assigns a dynamic port via process.env.PORT, default to 8080 locally
const PORT = process.env.PORT || 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('PANDA Switch Bridge is running!\n');
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('⚡ Client Connected to Bridge');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📍 Location Received: Lat ${data.lat}, Lng ${data.lng}`);
      
      // Broadcast location to all other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('Invalid message format:', message);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client Disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 PANDA Switch Bridge listening on port ${PORT}`);
});
