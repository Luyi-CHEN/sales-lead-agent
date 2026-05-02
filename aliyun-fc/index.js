'use strict';

/**
 * Analytics API - Alibaba Cloud Function Compute FC 3.0
 * Built-in Node.js 18 Runtime — Event-driven handler
 * 
 * FC 3.0 passes HTTP requests as JSON events, handler returns response object.
 * Stores analytics data (chat logs + click paths) as JSON files in OSS.
 * 
 * Environment variables required:
 *   OSS_REGION            - e.g. "oss-cn-beijing"
 *   OSS_BUCKET            - e.g. "sales-lead-app"
 *   OSS_ACCESS_KEY_ID     - Alibaba Cloud AccessKey ID
 *   OSS_ACCESS_KEY_SECRET - Alibaba Cloud AccessKey Secret
 */

const OSS = require('ali-oss');

const MAX_ENTRIES = 5000;
const CHAT_FILE = 'analytics-data/chat-logs.json';
const CLICKS_FILE = 'analytics-data/click-paths.json';

// NOTE: Do NOT set Access-Control-Allow-Origin here!
// Alibaba Cloud FC trigger automatically adds it based on the request Origin.
// Adding it here causes DUPLICATE headers, which browsers reject.
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json; charset=utf-8',
};

let ossClient = null;

function getOSSClient() {
  if (!ossClient) {
    ossClient = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
  }
  return ossClient;
}

async function readData(filePath) {
  try {
    const result = await getOSSClient().get(filePath);
    return JSON.parse(result.content.toString('utf-8'));
  } catch (e) {
    if (e.code === 'NoSuchKey') return [];
    console.error('readData error:', e.code, e.message);
    throw e;
  }
}

async function writeData(filePath, data) {
  const trimmed = data.length > MAX_ENTRIES ? data.slice(-MAX_ENTRIES) : data;
  await getOSSClient().put(filePath, Buffer.from(JSON.stringify(trimmed), 'utf-8'), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function getDataFile(path) {
  if (!path) return null;
  if (path === '/chat' || path.endsWith('/chat')) return CHAT_FILE;
  if (path === '/clicks' || path.endsWith('/clicks')) return CLICKS_FILE;
  return null;
}

function parseRequestBody(event) {
  let raw = event.body || '';
  if (event.isBase64Encoded && raw) {
    raw = Buffer.from(raw, 'base64').toString('utf-8');
  }
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * FC 3.0 Built-in Runtime Handler
 * Receives: event (JSON string or object), context
 * Returns: { statusCode, headers, body }
 */
module.exports.handler = async function(event, context) {
  // Parse event - may be string, Buffer, or object
  let evt = event;
  if (typeof event === 'string') {
    try { evt = JSON.parse(event); } catch { evt = {}; }
  }
  if (Buffer.isBuffer(event)) {
    try { evt = JSON.parse(event.toString('utf-8')); } catch { evt = {}; }
  }

  // Extract method and path from various possible FC 3.0 event structures
  const method = evt.httpMethod || evt.method
    || (evt.requestContext && evt.requestContext.http && evt.requestContext.http.method)
    || 'GET';
  const path = evt.rawPath || evt.path || evt.url
    || (evt.requestContext && evt.requestContext.http && evt.requestContext.http.path)
    || '/';

  console.log('Request:', method, path);

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const dataFile = getDataFile(path);

  if (!dataFile) {
    return makeResponse(200, {
      status: 'ok',
      message: 'Analytics API running. Use /chat or /clicks.',
    });
  }

  try {
    if (method === 'GET') {
      const data = await readData(dataFile);
      return makeResponse(200, data);

    } else if (method === 'POST') {
      const body = parseRequestBody(evt);
      if (!body) {
        return makeResponse(400, { error: 'Invalid or empty JSON body' });
      }
      const data = await readData(dataFile);
      data.push(body);
      await writeData(dataFile, data);
      return makeResponse(200, { ok: true, total: data.length });

    } else if (method === 'DELETE') {
      await writeData(dataFile, []);
      return makeResponse(200, { ok: true });

    } else {
      return makeResponse(405, { error: 'Method not allowed' });
    }

  } catch (e) {
    console.error('Analytics API error:', e);
    return makeResponse(500, { error: e.message || 'Internal server error' });
  }
};
