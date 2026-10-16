// Standalone Socket.IO Server for Zenvro Real-Time Notifications
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT, 10) : 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/emit') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(`[Socket.IO Server] Broadcasting notification (${data.type}): "${data.title}" to ${io.engine.clientsCount} client(s)`);
        io.emit('admin:notification', data);
        io.to('admin-notifications').emit('admin:notification', data);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: true, clients: io.engine.clientsCount }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO Server] Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

  socket.on('join:admin', () => {
    socket.join('admin-notifications');
    console.log(`[Socket.IO Server] Socket ${socket.id} joined admin-notifications room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO Server] Client disconnected: ${socket.id} (Remaining: ${io.engine.clientsCount})`);
  });
});

server.listen(PORT, () => {
  console.log(`[Socket.IO Server] Standalone Socket.IO notification server running on http://localhost:${PORT}`);
});
