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
const { execFile } = require('child_process');

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
    // Fetch peers from broker, then enrich with CPU-based activity detection
    const options = {
      hostname: BROKER_HOST,
      port: BROKER_PORT,
      path: '/list-peers',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => { body += chunk; });
      proxyRes.on('end', () => {
        try {
          const peers = JSON.parse(body);
          if (!Array.isArray(peers)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(body);
            return;
          }
          // The broker registers the MCP server (bun) PID.
          // The actual claude process is the parent. Check activity on parent PIDs.
          // We use /proc-style cputime sampling: read cputime, wait, read again.
          // On macOS, use `ps -o cputime` which gives cumulative CPU time.
          const pids = peers.map(p => p.pid);
          if (pids.length === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
            return;
          }
          // Get PPIDs for all registered PIDs
          execFile('ps', ['-p', pids.join(','), '-o', 'pid=,ppid='], (err, stdout) => {
            const ppidMap = {};
            if (!err && stdout) {
              stdout.trim().split('\n').forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) ppidMap[parts[0]] = parts[1];
              });
            }
            const parentPids = [...new Set(Object.values(ppidMap).filter(p => p !== '1' && p !== '0'))];
            if (parentPids.length === 0) {
              const enriched = peers.map(p => ({ ...p, cpu: 0, isActive: false }));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(enriched));
              return;
            }
            // Sample 1: get cumulative CPU time (in seconds)
            const parseTimes = (out) => {
              const m = {};
              if (!out) return m;
              out.trim().split('\n').forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                  const pid = parts[0];
                  // cputime format: HH:MM:SS or MM:SS.xx
                  const t = parts[1];
                  const segs = t.split(':');
                  let secs = 0;
                  if (segs.length === 3) secs = parseInt(segs[0])*3600 + parseInt(segs[1])*60 + parseFloat(segs[2]);
                  else if (segs.length === 2) secs = parseInt(segs[0])*60 + parseFloat(segs[1]);
                  m[pid] = secs;
                }
              });
              return m;
            };
            execFile('ps', ['-p', parentPids.join(','), '-o', 'pid=,cputime='], (e1, s1) => {
              const t1 = parseTimes(s1);
              const now1 = Date.now();
              // Sample 2 after 200ms
              setTimeout(() => {
                execFile('ps', ['-p', parentPids.join(','), '-o', 'pid=,cputime='], (e2, s2) => {
                  const t2 = parseTimes(s2);
                  const elapsed = (Date.now() - now1) / 1000;
                  const cpuMap = {};
                  for (const pid of parentPids) {
                    if (t1[pid] !== undefined && t2[pid] !== undefined) {
                      cpuMap[pid] = ((t2[pid] - t1[pid]) / elapsed) * 100;
                    }
                  }
                  const enriched = peers.map(p => {
                    const ppid = ppidMap[String(p.pid)];
                    const cpu = ppid ? (cpuMap[ppid] || 0) : 0;
                    return { ...p, cpu: Math.round(cpu * 10) / 10, parentPid: ppid ? parseInt(ppid) : null, isActive: cpu > 5 };
                  });
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(enriched));
                });
              }, 200);
            });
          });
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(body);
        }
      });
    });
    proxyReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Broker unavailable', detail: e.message }));
    });
    proxyReq.write(JSON.stringify({ scope: 'machine' }));
    proxyReq.end();
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
