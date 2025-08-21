const { createServer } = require('http');
const { readFileSync } = require('fs');
const { join } = require('path');

const port = 3001;

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/callback' || req.url === '/auth/callback') {
    try {
      const htmlPath = join(__dirname, '../assets/callback.html');
      const html = readFileSync(htmlPath, 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      console.error('Error serving callback page:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Callback server running on http://localhost:${port}`);
  console.log(`Callback URL: http://localhost:${port}/callback`);
});
