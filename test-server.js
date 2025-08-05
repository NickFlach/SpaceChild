import http from 'http';
import path from 'path';
import fs from 'fs';

console.log('Starting minimal test server...');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve a simple test page
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Space Child - Test Server</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #0a0f1c 0%, #000000 100%);
            color: #ffffff;
            padding: 40px;
            text-align: center;
          }
          .title {
            font-size: 3rem;
            color: #00d4ff;
            margin-bottom: 30px;
            text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          }
          .status {
            background: rgba(0, 212, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            margin: 20px auto;
            max-width: 600px;
          }
          .success { color: #00ff00; }
        </style>
      </head>
      <body>
        <h1 class="title">🚀 Space Child</h1>
        <div class="status">
          <h2 class="success">✅ Server is Working!</h2>
          <p>Your Space Child application server is running successfully.</p>
          <p>Port: ${server.address()?.port || 'Unknown'}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
        <div class="status">
          <h3>Next Steps:</h3>
          <p>The main application should now be accessible through Replit's preview system.</p>
        </div>
      </body>
      </html>
    `);
  } else if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'working', 
      message: 'API endpoint is functional',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1><p>Test server is running but this path was not found.</p>');
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log('Port 5000 is in use, trying port 5001...');
    server.listen(5001, '0.0.0.0', () => {
      console.log('✅ Server running on http://0.0.0.0:5001');
    });
  }
});

server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server running on http://0.0.0.0:5000');
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});