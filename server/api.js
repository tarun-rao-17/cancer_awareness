#!/usr/bin/env node
/* Simple local API server for development
   - POST /send-message    accepts { name, email, message } and appends to server/messages.json
   - POST /track           accepts { event, details } and appends to server/analytics.log

   Run: node server/api.js
*/
import http from 'http';
import { writeFileSync, existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, 'data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const MESSAGES_FILE = join(DATA_DIR, 'messages.json');
const ANALYTICS_LOG = join(DATA_DIR, 'analytics.log');

// ensure messages file exists
if (!existsSync(MESSAGES_FILE)) writeFileSync(MESSAGES_FILE, '[]', 'utf8');

const port = process.env.PORT || 5174;

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  if (req.url === '/send-message' && req.method === 'POST') {
    collectRequestData(req, (err, data) => {
      if (err) return json(res, 400, { error: 'Invalid JSON' });
      const { name, email, message } = data || {};
      if (!name || !email || !message) return json(res, 422, { error: 'Missing fields' });

      const messages = JSON.parse(readFileSync(MESSAGES_FILE, 'utf8') || '[]');
      const entry = { id: Date.now(), name, email, message, receivedAt: new Date().toISOString() };
      messages.push(entry);
      writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
      console.log('Saved message from', name);
      return json(res, 200, { ok: true, id: entry.id });
    });
    return;
  }

  if (req.url === '/track' && req.method === 'POST') {
    collectRequestData(req, (err, data) => {
      if (err) return json(res, 400, { error: 'Invalid JSON' });
      const logLine = `${new Date().toISOString()} ${JSON.stringify(data)}\n`;
      appendFileSync(ANALYTICS_LOG, logLine, 'utf8');
      console.log('Tracked event', data?.event || 'unknown');
      return json(res, 200, { ok: true });
    });
    return;
  }

  // default: simple health
  if (req.url === '/health') return json(res, 200, { ok: true, now: new Date().toISOString() });

  res.writeHead(404, corsHeaders());
  res.end('Not found');
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function json(res, status, obj) {
  res.writeHead(status, corsHeaders());
  res.end(JSON.stringify(obj));
}

function collectRequestData(request, callback) {
  try {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', () => {
      if (!body) return callback(null, {});
      try { callback(null, JSON.parse(body)); }
      catch (e) { callback(e); }
    });
  } catch (e) { callback(e); }
}

server.listen(port, () => {
  console.log(`Local API listening on http://localhost:${port}`);
  console.log(`Messages: ${MESSAGES_FILE}`);
  console.log(`Analytics: ${ANALYTICS_LOG}`);
});
