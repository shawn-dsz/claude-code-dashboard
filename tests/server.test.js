import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { execFile } from 'child_process';
import path from 'path';

let serverProcess;
const PORT = 18765;
const BASE = `http://localhost:${PORT}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

beforeAll(async () => {
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProcess = execFile('node', [serverPath, String(PORT)]);

  // Wait for the server to start
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(`${BASE}/`);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  throw new Error('Server did not start');
});

afterAll(() => {
  if (serverProcess) serverProcess.kill();
});

describe('static file serving', () => {
  it('serves home.html at root', async () => {
    const res = await fetch(`${BASE}/`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.body).toContain('<');
  });

  it('serves JS files with correct MIME type', async () => {
    const res = await fetch(`${BASE}/dashboard-common.js`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/javascript');
  });

  it('returns 404 for missing files', async () => {
    const res = await fetch(`${BASE}/nonexistent.xyz`);
    expect(res.status).toBe(404);
  });

  it('strips query params from file path', async () => {
    const res = await fetch(`${BASE}/dashboard-common.js?v=123`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/javascript');
  });
});

describe('API proxy', () => {
  it('returns valid JSON for /api/peers', async () => {
    const res = await fetch(`${BASE}/api/peers`);
    // 200 if broker running, 502 if not - both are valid
    expect([200, 502]).toContain(res.status);
    const data = JSON.parse(res.body);
    if (res.status === 502) {
      expect(data.error).toBe('Broker unavailable');
    } else {
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    }
  });

  it('returns valid JSON for /api/health', async () => {
    const res = await fetch(`${BASE}/api/health`);
    expect([200, 502]).toContain(res.status);
    const data = JSON.parse(res.body);
    if (res.status === 502) {
      expect(data.error).toBe('Broker unavailable');
    }
  });
});
