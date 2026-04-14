#!/usr/bin/env node
/**
 * Dashboard server — static files + API proxy to claude-peers broker.
 *
 * Usage: node server.js [port]
 *
 * Serves static files from the project directory and proxies
 * /api/peers to the broker at 127.0.0.1:7899.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || '8080', 10);
const BROKER_HOST = '127.0.0.1';
const BROKER_PORT = 7899;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function serveStatic(req, res) {
  let filePath = path.join(ROOT, req.url === '/' ? '/home.html' : req.url);
  // Strip query params
  filePath = filePath.split('?')[0];

  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function proxyToBroker(reqPath, postBody, res) {
  const options = {
    hostname: BROKER_HOST,
    port: BROKER_PORT,
    path: reqPath,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  });

  proxyReq.on('error', (e) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Broker unavailable', detail: e.message }));
  });

  proxyReq.write(postBody);
  proxyReq.end();
}

const server = http.createServer((req, res) => {
  // API proxy routes
  if (req.url === '/api/peers' && req.method === 'GET') {
    proxyToBroker('/list-peers', JSON.stringify({ scope: 'machine' }), res);
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    const options = {
      hostname: BROKER_HOST,
      port: BROKER_PORT,
      path: '/health',
      method: 'GET',
    };
    const proxyReq = http.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => { body += chunk; });
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(body);
      });
    });
    proxyReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Broker unavailable', detail: e.message }));
    });
    proxyReq.end();
    return;
  }

  // Static files
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Dashboard server listening on http://localhost:${PORT}`);
  console.log(`  Agents (home):    http://claude-agents:${PORT}/`);
  console.log(`  Activity stats:   http://claude-dashboard:${PORT}/index.html`);
  console.log(`  API proxy:        /api/peers -> broker:${BROKER_PORT}`);
});
