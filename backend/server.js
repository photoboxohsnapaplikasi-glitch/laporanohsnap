#!/usr/bin/env node
/**
 * HTTP & REST API Server — Oh Snap! Photobox 5 Cabang
 * Melayani file statis (index.html, admin.html, laporan_keuangan_harian.html)
 * serta endpoint API (/api/health, /api/config, /api/webhook, /api/logs, DELETE /api/logs/:id)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { handleApiRequest } = require('./routes/api');
const db = require('./config/database');

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        const params = new URLSearchParams(raw);
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        resolve(obj);
      }
    });
  });
}

function createAppServer() {
  db.ensureDatabaseInitialized();
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (parsedUrl.pathname.startsWith('/api/')) {
      const bodyObj = await parseRequestBody(req);
      return handleApiRequest(req, res, parsedUrl, bodyObj);
    }

    let relPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    let filePath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(ROOT_DIR, 'frontend', relPath);
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  });
}

if (require.main === module) {
  const server = createAppServer();
  server.listen(PORT, () => {
    console.log(`🚀 Server Oh Snap! Photobox 5 Cabang aktif di http://localhost:${PORT}`);
  });
}

module.exports = { createAppServer };
